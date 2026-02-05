// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../core/PluginManager.sol";
import "../interfaces/IPlugin.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Human Resources Plugin
 * @notice Gestiona compensación, vesting con cliff/lock-up y pagos por hitos
 * @dev Implementa sistema de verificación por oráculo para milestones
 * Referencia: Sección III - Sistema de Recursos Humanos
 */
contract HumanResourcesPlugin is IHRPlugin, ReentrancyGuard {
    PluginManager public pluginManager;
    IERC20 public governanceToken;

    struct VestingSchedule {
        uint256 totalAmount;        // Total de tokens asignados
        uint256 amountReleased;     // Tokens ya reclamados
        uint256 startTime;          // Timestamp de inicio
        uint256 cliffDuration;      // Período de carencia (Cliff)
        uint256 vestingDuration;    // Duración total hasta 100% liberación
        bool isRevoked;             // Flag de revocación
        string contractType;        // Tipo: "FULL_TIME", "CONTRACTOR", "GRANT"
    }

    struct Milestone {
        address contributor;
        string ipfsHash;           // Hash IPFS de la evidencia
        uint256 paymentAmount;
        bool isPaid;
        bool isVerified;
        uint256 submittedAt;
        uint256 verifiedAt;
        string description;
    }

    // Mapeos
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(uint256 => Milestone) public milestones;
    uint256 public milestoneCounter;

    // Configuración de oráculo
    address public oracleVerifier; // Dirección autorizada para verificar milestones
    
    // Eventos para dashboard y auditoría
    event VestingCreated(
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        string contractType,
        uint256 timestamp
    );

    event TokensReleased(
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    event VestingRevoked(
        address indexed beneficiary,
        uint256 tokensReturned,
        uint256 timestamp
    );

    event MilestoneSubmitted(
        uint256 indexed milestoneId,
        address indexed contributor,
        string ipfsHash,
        uint256 paymentAmount,
        uint256 timestamp
    );

    event MilestoneVerified(
        uint256 indexed milestoneId,
        address indexed verifier,
        bool approved,
        uint256 timestamp
    );

    event MilestonePaid(
        uint256 indexed milestoneId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyGovernance() {
        require(
            pluginManager.hasRole(pluginManager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "HRPlugin: Only governance"
        );
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleVerifier, "HRPlugin: Only oracle");
        _;
    }

    constructor(
        address _pluginManager,
        address _governanceToken,
        address _oracleVerifier
    ) {
        require(_pluginManager != address(0), "Invalid plugin manager");
        require(_governanceToken != address(0), "Invalid governance token");
        
        pluginManager = PluginManager(_pluginManager);
        governanceToken = IERC20(_governanceToken);
        oracleVerifier = _oracleVerifier;
    }

    /**
     * @notice Inicializa el plugin
     */
    function initialize(address _manager) external override {
        require(address(pluginManager) == address(0), "Already initialized");
        pluginManager = PluginManager(_manager);
    }

    function getPluginType() external pure override returns (string memory) {
        return "HUMAN_RESOURCES";
    }

    function getVersion() external pure override returns (string memory) {
        return "1.0.0";
    }

    /**
     * @notice Crea un nuevo schedule de vesting
     * @dev Implementa las cláusulas Cliff (carencia) y Lock-up (bloqueo gradual)
     * @param _beneficiary Dirección del colaborador
     * @param _amount Total de tokens a vestir
     * @param _cliffDuration Duración del cliff en segundos (ej: 90 días = 7776000)
     * @param _vestingDuration Duración total del vesting (ej: 2 años = 63072000)
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _amount,
        uint256 _cliffDuration,
        uint256 _vestingDuration
    ) external override onlyGovernance {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_amount > 0, "Amount must be > 0");
        require(_vestingDuration > _cliffDuration, "Vesting must be > cliff");
        require(
            vestingSchedules[_beneficiary].totalAmount == 0,
            "Vesting already exists"
        );

        // Verificar que la tesorería tiene suficientes fondos
        require(
            governanceToken.balanceOf(address(this)) >= _amount,
            "Insufficient plugin balance"
        );

        vestingSchedules[_beneficiary] = VestingSchedule({
            totalAmount: _amount,
            amountReleased: 0,
            startTime: block.timestamp,
            cliffDuration: _cliffDuration,
            vestingDuration: _vestingDuration,
            isRevoked: false,
            contractType: "FULL_TIME"
        });

        emit VestingCreated(
            _beneficiary,
            _amount,
            _cliffDuration,
            _vestingDuration,
            "FULL_TIME",
            block.timestamp
        );
    }

    /**
     * @notice Calcula la cantidad de tokens que un beneficiario puede reclamar
     * @dev Implementa liberación lineal post-cliff
     * Formula: (totalAmount * tiempoTranscurrido) / vestingDuration
     * @param _beneficiary Dirección a consultar
     * @return Cantidad de tokens reclamables
     */
    function calculateReleasableAmount(address _beneficiary)
        public
        view
        override
        returns (uint256)
    {
        VestingSchedule memory schedule = vestingSchedules[_beneficiary];
        
        if (schedule.isRevoked) return 0;
        if (schedule.totalAmount == 0) return 0;

        // Durante el Cliff, no se puede reclamar nada
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        // Después del período total, todo está disponible
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount - schedule.amountReleased;
        }

        // Cálculo de liberación lineal
        uint256 timeFromStart = block.timestamp - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * timeFromStart) / schedule.vestingDuration;
        
        return vestedAmount - schedule.amountReleased;
    }

    /**
     * @notice El beneficiario reclama sus tokens disponibles
     * @dev Solo puede reclamar lo que calculateReleasableAmount() retorne
     */
    function release() external override nonReentrant {
        uint256 unreleased = calculateReleasableAmount(msg.sender);
        require(unreleased > 0, "No tokens available to release");

        vestingSchedules[msg.sender].amountReleased += unreleased;
        
        governanceToken.transfer(msg.sender, unreleased);

        emit TokensReleased(msg.sender, unreleased, block.timestamp);
    }

    /**
     * @notice Revoca un vesting (en caso de despido, incumplimiento, etc.)
     * @dev Los tokens no liberados regresan a la tesorería
     * @param _beneficiary Dirección cuyo vesting será revocado
     */
    function revokevesting(address _beneficiary) external override onlyGovernance {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary];
        require(!schedule.isRevoked, "Vesting already revoked");
        require(schedule.totalAmount > 0, "No vesting found");

        uint256 releasable = calculateReleasableAmount(_beneficiary);
        uint256 tokensToReturn = schedule.totalAmount - schedule.amountReleased - releasable;

        schedule.isRevoked = true;

        // Transferir tokens no liberados de vuelta a la tesorería/gobernanza
        if (tokensToReturn > 0) {
            // Los tokens ya están en el contrato, solo marcamos como revocado
            emit VestingRevoked(_beneficiary, tokensToReturn, block.timestamp);
        }
    }

    /**
     * @notice Envía prueba de completitud de un hito
     * @dev El hash IPFS debe contener: código, capturas, documentación, etc.
     * @param _ipfsHash Hash de IPFS con la evidencia (ej: "QmXx...")
     */
    function submitMilestoneProof(string memory _ipfsHash) external override {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        uint256 milestoneId = milestoneCounter++;
        
        milestones[milestoneId] = Milestone({
            contributor: msg.sender,
            ipfsHash: _ipfsHash,
            paymentAmount: 0, // Se asigna durante la verificación
            isPaid: false,
            isVerified: false,
            submittedAt: block.timestamp,
            verifiedAt: 0,
            description: ""
        });

        emit MilestoneSubmitted(
            milestoneId,
            msg.sender,
            _ipfsHash,
            0,
            block.timestamp
        );
    }

    /**
     * @notice El oráculo verifica el milestone y autoriza el pago
     * @dev Solo callable por el oracleVerifier (puede ser Chainlink Function o validador off-chain)
     * @param _milestoneId ID del milestone a verificar
     * @param _approved Si la evidencia es válida
     * @param _paymentAmount Cantidad a pagar si se aprueba
     */
    function verifyMilestone(
        uint256 _milestoneId,
        bool _approved,
        uint256 _paymentAmount
    ) external onlyOracle {
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.isVerified, "Already verified");
        require(milestone.contributor != address(0), "Milestone not found");

        milestone.isVerified = true;
        milestone.verifiedAt = block.timestamp;

        if (_approved) {
            milestone.paymentAmount = _paymentAmount;
            
            emit MilestoneVerified(_milestoneId, msg.sender, true, block.timestamp);
            
            // Auto-pago si está aprobado
            _payMilestone(_milestoneId);
        } else {
            emit MilestoneVerified(_milestoneId, msg.sender, false, block.timestamp);
        }
    }

    /**
     * @notice Ejecuta el pago de un milestone verificado
     * @param _milestoneId ID del milestone
     */
    function _payMilestone(uint256 _milestoneId) internal {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.isVerified, "Not verified");
        require(!milestone.isPaid, "Already paid");
        require(milestone.paymentAmount > 0, "No payment amount");

        milestone.isPaid = true;
        
        governanceToken.transfer(milestone.contributor, milestone.paymentAmount);

        emit MilestonePaid(
            _milestoneId,
            milestone.contributor,
            milestone.paymentAmount,
            block.timestamp
        );
    }

    /**
     * @notice Actualiza la dirección del oráculo verificador
     */
    function updateOracle(address _newOracle) external onlyGovernance {
        require(_newOracle != address(0), "Invalid oracle address");
        oracleVerifier = _newOracle;
    }

    /**
     * @notice Obtiene información completa de un vesting
     */
    function getVestingInfo(address _beneficiary)
        external
        view
        returns (
            uint256 total,
            uint256 released,
            uint256 releasable,
            uint256 startTime,
            uint256 cliffEnd,
            uint256 vestingEnd,
            bool revoked
        )
    {
        VestingSchedule memory schedule = vestingSchedules[_beneficiary];
        return (
            schedule.totalAmount,
            schedule.amountReleased,
            calculateReleasableAmount(_beneficiary),
            schedule.startTime,
            schedule.startTime + schedule.cliffDuration,
            schedule.startTime + schedule.vestingDuration,
            schedule.isRevoked
        );
    }

    /**
     * @notice Obtiene información de un milestone
     */
    function getMilestoneInfo(uint256 _milestoneId)
        external
        view
        returns (Milestone memory)
    {
        return milestones[_milestoneId];
    }

    /**
     * @notice Permite recibir tokens para financiar vesting/milestones
     */
    function fundPlugin(uint256 _amount) external {
        governanceToken.transferFrom(msg.sender, address(this), _amount);
    }
}
