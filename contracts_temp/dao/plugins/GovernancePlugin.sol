// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../core/PluginManager.sol";
import "../interfaces/IPlugin.sol";

/**
 * @title Governance Plugin (The Political Brain)
 * @notice Sistema de gobernanza híbrido On-Chain/Off-Chain con mecanismos anti-spam
 * @dev Implementa votación ponderada por tokens + barrera económica (staking de propuestas)
 * Referencia: Sección V - Mecanismos Criptoeconómicos
 */
contract GovernancePlugin is IGovernancePlugin, ReentrancyGuard, Pausable {
    PluginManager public pluginManager;
    IERC20 public governanceToken;
    address public treasury;

    // Parámetros de gobernanza
    uint256 public constant PROPOSAL_DEPOSIT = 1000 * 10**18; // 1000 tokens como stake
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant EXECUTION_DELAY = 2 days; // Timelock
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10% de supply total
    uint256 public constant APPROVAL_THRESHOLD = 51; // 51% de votos a favor

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string ipfsHash;        // Documentación completa en IPFS
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;  // Cuando puede ejecutarse (después del timelock)
        ProposalState state;
        bool isOnChain;         // true = ejecutable on-chain, false = señalización (Snapshot)
        bytes callData;         // Datos para ejecutar si es on-chain
        address targetContract; // Contrato objetivo para ejecución
    }

    struct Vote {
        bool hasVoted;
        bool support;   // true = a favor, false = en contra
        bool abstain;   // true = abstención
        uint256 weight; // Peso del voto (balance de tokens)
    }

    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes; // proposalId => voter => vote
    mapping(address => uint256) public stakedDeposits; // Stake activo de cada proposer
    uint256 public nextProposalId;
    uint256 public totalSupply; // Total de governance tokens en circulación

    // Eventos
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        bool isOnChain,
        uint256 depositAmount
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        bool abstain,
        uint256 weight
    );

    event ProposalStateChanged(
        uint256 indexed proposalId,
        ProposalState newState
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        address executor
    );

    event ProposerSlashed(
        uint256 indexed proposalId,
        address indexed proposer,
        uint256 amount,
        string reason
    );

    event DepositReturned(
        uint256 indexed proposalId,
        address indexed proposer,
        uint256 amount
    );

    modifier onlyGovernance() {
        require(
            pluginManager.hasRole(pluginManager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "GovPlugin: Only governance"
        );
        _;
    }

    constructor(
        address _pluginManager,
        address _governanceToken,
        address _treasury
    ) {
        require(_pluginManager != address(0), "Invalid plugin manager");
        require(_governanceToken != address(0), "Invalid governance token");
        require(_treasury != address(0), "Invalid treasury");

        pluginManager = PluginManager(_pluginManager);
        governanceToken = IERC20(_governanceToken);
        treasury = _treasury;
        totalSupply = governanceToken.totalSupply();
    }

    /**
     * @notice Inicializa el plugin (IPlugin interface)
     */
    function initialize(address _manager) external override {
        require(address(pluginManager) == address(0), "Already initialized");
        pluginManager = PluginManager(_manager);
    }

    function getPluginType() external pure override returns (string memory) {
        return "GOVERNANCE";
    }

    function getVersion() external pure override returns (string memory) {
        return "1.0.0";
    }

    /**
     * @notice Crea una nueva propuesta con stake de seguridad
     * @dev Implementa la "Barrera Económica" para prevenir spam
     * @param _title Título de la propuesta
     * @param _description Descripción detallada
     * @param _ipfsHash Hash IPFS con documentación completa
     * @param _isOnChain Si es ejecutable on-chain o solo señalización
     * @param _targetContract Contrato objetivo (si es on-chain)
     * @param _callData Datos de ejecución (si es on-chain)
     * @return proposalId ID de la propuesta creada
     */
    function createProposal(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        bool _isOnChain,
        address _targetContract,
        bytes memory _callData
    ) external override nonReentrant whenNotPaused returns (uint256 proposalId) {
        // Cobrar el stake de seguridad
        require(
            governanceToken.transferFrom(msg.sender, address(this), PROPOSAL_DEPOSIT),
            "Stake transfer failed"
        );

        proposalId = nextProposalId++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            ipfsHash: _ipfsHash,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            executionTime: 0,
            state: ProposalState.Active,
            isOnChain: _isOnChain,
            callData: _callData,
            targetContract: _targetContract
        });

        stakedDeposits[msg.sender] += PROPOSAL_DEPOSIT;

        emit ProposalCreated(proposalId, msg.sender, _title, _isOnChain, PROPOSAL_DEPOSIT);

        return proposalId;
    }

    /**
     * @notice Vota en una propuesta activa
     * @dev Peso del voto = balance de governance tokens del votante
     * @param _proposalId ID de la propuesta
     * @param _support true = a favor, false = en contra
     * @param _abstain true = abstención (no cuenta para quorum)
     */
    function vote(
        uint256 _proposalId,
        bool _support,
        bool _abstain
    ) external override nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting ended");

        Vote storage voterData = votes[_proposalId][msg.sender];
        require(!voterData.hasVoted, "Already voted");

        // Obtener peso del voto (snapshot del balance)
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        voterData.hasVoted = true;
        voterData.support = _support;
        voterData.abstain = _abstain;
        voterData.weight = weight;

        // Actualizar contadores
        if (_abstain) {
            proposal.abstainVotes += weight;
        } else if (_support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(_proposalId, msg.sender, _support, _abstain, weight);
    }

    /**
     * @notice Finaliza la votación y determina el resultado
     * @dev Verifica quorum y threshold
     */
    function finalizeProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state == ProposalState.Active, "Not active");
        require(block.timestamp > proposal.endTime, "Voting still active");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 quorumRequired = (totalSupply * QUORUM_PERCENTAGE) / 100;

        // Verificar quorum
        if (totalVotes < quorumRequired) {
            proposal.state = ProposalState.Defeated;
            emit ProposalStateChanged(_proposalId, ProposalState.Defeated);
            return;
        }

        // Verificar threshold de aprobación
        uint256 approvalPercentage = (proposal.forVotes * 100) / totalVotes;
        if (approvalPercentage >= APPROVAL_THRESHOLD) {
            if (proposal.isOnChain) {
                // On-chain: pasar a cola con timelock
                proposal.state = ProposalState.Queued;
                proposal.executionTime = block.timestamp + EXECUTION_DELAY;
                emit ProposalStateChanged(_proposalId, ProposalState.Queued);
            } else {
                // Off-chain: marcar como exitosa (señalización)
                proposal.state = ProposalState.Succeeded;
                emit ProposalStateChanged(_proposalId, ProposalState.Succeeded);
                _returnDeposit(_proposalId);
            }
        } else {
            proposal.state = ProposalState.Defeated;
            emit ProposalStateChanged(_proposalId, ProposalState.Defeated);
        }
    }

    /**
     * @notice Ejecuta una propuesta aprobada (solo on-chain)
     * @dev Solo ejecutable después del timelock
     */
    function execute(uint256 _proposalId) external override nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state == ProposalState.Queued, "Not queued");
        require(block.timestamp >= proposal.executionTime, "Timelock active");
        require(proposal.isOnChain, "Not executable");

        proposal.state = ProposalState.Executed;

        // Ejecutar la llamada al contrato objetivo
        (bool success, ) = proposal.targetContract.call(proposal.callData);
        require(success, "Execution failed");

        // Devolver el stake al proposer
        _returnDeposit(_proposalId);

        emit ProposalExecuted(_proposalId, msg.sender);
        emit ProposalStateChanged(_proposalId, ProposalState.Executed);
    }

    /**
     * @notice Mecanismo de Slashing para propuestas spam/maliciosas
     * @dev Confisca el stake y lo envía a la tesorería
     * @param _proposalId ID de la propuesta
     * @param _reason Razón del slashing
     */
    function slashProposal(
        uint256 _proposalId,
        string memory _reason
    ) external onlyGovernance {
        Proposal storage proposal = proposals[_proposalId];
        require(
            proposal.state != ProposalState.Executed &&
            proposal.state != ProposalState.Slashed,
            "Cannot slash"
        );

        address proposer = proposal.proposer;
        uint256 slashAmount = stakedDeposits[proposer];

        proposal.state = ProposalState.Slashed;
        stakedDeposits[proposer] = 0;

        // Enviar stake confiscado a la tesorería
        governanceToken.transfer(treasury, slashAmount);

        emit ProposerSlashed(_proposalId, proposer, slashAmount, _reason);
        emit ProposalStateChanged(_proposalId, ProposalState.Slashed);
    }

    /**
     * @notice Cancela una propuesta (solo el proposer, antes de que termine)
     */
    function cancelProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(msg.sender == proposal.proposer, "Not proposer");
        require(proposal.state == ProposalState.Active, "Cannot cancel");
        require(block.timestamp < proposal.endTime, "Voting ended");

        proposal.state = ProposalState.Canceled;

        // Devolver el stake (penalización: solo 50%)
        uint256 returnAmount = PROPOSAL_DEPOSIT / 2;
        uint256 penalty = PROPOSAL_DEPOSIT - returnAmount;

        stakedDeposits[msg.sender] -= PROPOSAL_DEPOSIT;

        governanceToken.transfer(msg.sender, returnAmount);
        governanceToken.transfer(treasury, penalty); // Penalización a tesorería

        emit ProposalStateChanged(_proposalId, ProposalState.Canceled);
    }

    /**
     * @notice Obtiene el estado actual de una propuesta
     */
    function getProposalState(uint256 _proposalId)
        external
        view
        override
        returns (ProposalState)
    {
        return proposals[_proposalId].state;
    }

    /**
     * @notice Verifica si un usuario ha votado en una propuesta
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return votes[_proposalId][_voter].hasVoted;
    }

    /**
     * @notice Obtiene los detalles del voto de un usuario
     */
    function getVote(uint256 _proposalId, address _voter)
        external
        view
        returns (bool hasVoted, bool support, bool abstain, uint256 weight)
    {
        Vote memory v = votes[_proposalId][_voter];
        return (v.hasVoted, v.support, v.abstain, v.weight);
    }

    /**
     * @dev Función interna para devolver el stake al proposer
     */
    function _returnDeposit(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        address proposer = proposal.proposer;
        uint256 amount = stakedDeposits[proposer];

        if (amount > 0) {
            stakedDeposits[proposer] = 0;
            governanceToken.transfer(proposer, amount);
            emit DepositReturned(_proposalId, proposer, amount);
        }
    }

    /**
     * @notice Actualiza el total supply (para cálculo de quorum)
     */
    function updateTotalSupply() external {
        totalSupply = governanceToken.totalSupply();
    }

    /**
     * @notice Pausa el sistema de votación (emergencia)
     */
    function pause() external onlyGovernance {
        _pause();
    }

    /**
     * @notice Reanuda el sistema de votación
     */
    function unpause() external onlyGovernance {
        _unpause();
    }
}
