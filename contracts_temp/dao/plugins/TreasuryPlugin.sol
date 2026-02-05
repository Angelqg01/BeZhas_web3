// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../core/PluginManager.sol";
import "../interfaces/IPlugin.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Treasury Plugin
 * @notice Gestiona fondos y ejecuta rebalanceo automático según umbrales de riesgo
 * @dev Implementa la lógica de Diversificación y gestión de activos
 * Referencia: Sección 2.2 - Diversificación de Activos
 */
contract TreasuryPlugin is ITreasuryPlugin, ReentrancyGuard, Pausable {
    PluginManager public pluginManager;
    IERC20 public governanceToken;
    
    // Umbrales de riesgo (según especificación: 65% máximo en token nativo)
    uint256 public constant RISK_THRESHOLD = 65; // 65%
    uint256 public constant SAFE_THRESHOLD = 50;  // 50% target después de rebalanceo
    uint256 public constant PRECISION = 100;
    
    // Asset tracking
    uint256 public totalNativeTokens;
    uint256 public totalStablecoins;
    uint256 public totalRWA; // Real World Assets (Bonos tokenizados)
    
    // Direcciones de tokens soportados
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenBalances;
    
    // Registro de transacciones para auditoría
    struct Transaction {
        address to;
        uint256 amount;
        string reason;
        uint256 timestamp;
        address token;
        bool executed;
    }
    
    Transaction[] public transactions;
    
    // Configuración de Gnosis Safe (para ejecución de transacciones grandes)
    address public gnosisSafe;
    uint256 public gnosisThreshold; // Monto mínimo que requiere multi-sig
    
    // Eventos para el dashboard
    event FundsReleased(
        address indexed to,
        uint256 amount,
        address token,
        string reason,
        uint256 timestamp
    );
    
    event RiskAlertTriggered(
        uint256 currentExposure,
        uint256 threshold,
        uint256 timestamp
    );
    
    event RebalanceExecuted(
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 timestamp
    );
    
    event AssetAdded(address indexed token, uint256 amount);
    event GnosisSafeUpdated(address indexed newSafe, uint256 threshold);

    modifier onlyGovernance() {
        require(
            pluginManager.hasRole(pluginManager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "TreasuryPlugin: Only governance"
        );
        _;
    }

    constructor(
        address _pluginManager,
        address _governanceToken,
        address _gnosisSafe
    ) {
        require(_pluginManager != address(0), "Invalid plugin manager");
        require(_governanceToken != address(0), "Invalid governance token");
        
        pluginManager = PluginManager(_pluginManager);
        governanceToken = IERC20(_governanceToken);
        gnosisSafe = _gnosisSafe;
        gnosisThreshold = 50000 ether; // Por defecto, 50k tokens requieren multi-sig
        
        supportedTokens[_governanceToken] = true;
    }

    /**
     * @notice Inicializa el plugin (llamado por el PluginManager)
     */
    function initialize(address _manager) external override {
        require(address(pluginManager) == address(0), "Already initialized");
        pluginManager = PluginManager(_manager);
    }

    /**
     * @notice Retorna el tipo de plugin
     */
    function getPluginType() external pure override returns (string memory) {
        return "TREASURY";
    }

    /**
     * @notice Retorna la versión del plugin
     */
    function getVersion() external pure override returns (string memory) {
        return "1.0.0";
    }

    /**
     * @notice Verifica la exposición al riesgo del portfolio
     * @dev Calcula si el token nativo supera el umbral del 65%
     * @return needsRebalance True si se necesita rebalancear
     * @return currentExposure Porcentaje actual de exposición
     */
    function checkRiskExposure() 
        external 
        override 
        returns (bool needsRebalance, uint256 currentExposure) 
    {
        uint256 totalValue = getTotalValue();
        if (totalValue == 0) return (false, 0);
        
        uint256 nativeValue = governanceToken.balanceOf(address(this));
        currentExposure = (nativeValue * PRECISION) / totalValue;
        
        needsRebalance = currentExposure > RISK_THRESHOLD;
        
        if (needsRebalance) {
            emit RiskAlertTriggered(currentExposure, RISK_THRESHOLD, block.timestamp);
        }
        
        return (needsRebalance, currentExposure);
    }

    /**
     * @notice Ejecuta el rebalanceo automático
     * @dev Convierte tokens nativos a stablecoins cuando se excede el umbral
     * @param _targetToken Token al que se convertirá (típicamente USDC)
     * @param _amount Cantidad a rebalancear
     */
    function executeRebalance(
        address _targetToken,
        uint256 _amount
    ) external override onlyGovernance nonReentrant whenNotPaused {
        require(supportedTokens[_targetToken], "Target token not supported");
        
        uint256 currentBalance = governanceToken.balanceOf(address(this));
        require(_amount <= currentBalance, "Insufficient balance");
        
        // En producción, aquí iría la integración con DEX (Uniswap/Curve)
        // Por ahora, simulamos el swap
        governanceToken.transfer(msg.sender, _amount);
        
        emit RebalanceExecuted(
            address(governanceToken),
            _targetToken,
            _amount,
            block.timestamp
        );
    }

    /**
     * @notice Libera fondos para pagos operacionales (HR, Grants, etc.)
     * @dev Requiere aprobación de gobernanza. Montos grandes requieren Gnosis Safe
     * @param _to Destinatario de los fondos
     * @param _amount Cantidad a transferir
     * @param _reason Justificación del pago (para auditoría)
     */
    function releaseFunds(
        address _to,
        uint256 _amount,
        string memory _reason
    ) external override onlyGovernance nonReentrant whenNotPaused {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        
        uint256 balance = governanceToken.balanceOf(address(this));
        require(balance >= _amount, "Insufficient treasury balance");
        
        // Si el monto supera el umbral, requiere ejecución vía Gnosis Safe
        if (_amount >= gnosisThreshold) {
            require(msg.sender == gnosisSafe, "Large amounts require multi-sig");
        }
        
        // Registrar transacción
        transactions.push(Transaction({
            to: _to,
            amount: _amount,
            reason: _reason,
            timestamp: block.timestamp,
            token: address(governanceToken),
            executed: true
        }));
        
        // Ejecutar transferencia
        governanceToken.transfer(_to, _amount);
        
        emit FundsReleased(_to, _amount, address(governanceToken), _reason, block.timestamp);
    }

    /**
     * @notice Calcula el valor total de la tesorería
     * @dev En producción, usaría oráculos Chainlink para precios en USD
     * @return Total value in wei
     */
    function getTotalValue() public view override returns (uint256) {
        // Simplificado: suma todos los balances
        // En producción: multiplicar cada balance por su precio en USD desde oráculo
        return governanceToken.balanceOf(address(this)) + totalStablecoins + totalRWA;
    }

    /**
     * @notice Obtiene la composición de activos del portfolio
     * @return nativeTokens Balance en tokens nativos
     * @return stablecoins Balance en stablecoins
     * @return rwa Balance en Real World Assets
     */
    function getAssetComposition() 
        external 
        view 
        override 
        returns (uint256 nativeTokens, uint256 stablecoins, uint256 rwa) 
    {
        return (
            governanceToken.balanceOf(address(this)),
            totalStablecoins,
            totalRWA
        );
    }

    /**
     * @notice Añade un nuevo token soportado
     */
    function addSupportedToken(address _token) external onlyGovernance {
        require(_token != address(0), "Invalid token");
        supportedTokens[_token] = true;
    }

    /**
     * @notice Actualiza la configuración de Gnosis Safe
     */
    function updateGnosisSafe(address _newSafe, uint256 _threshold) external onlyGovernance {
        require(_newSafe != address(0), "Invalid address");
        gnosisSafe = _newSafe;
        gnosisThreshold = _threshold;
        emit GnosisSafeUpdated(_newSafe, _threshold);
    }

    /**
     * @notice Obtiene el historial de transacciones
     */
    function getTransactionHistory() external view returns (Transaction[] memory) {
        return transactions;
    }

    /**
     * @notice Pausa el plugin en caso de emergencia
     */
    function pause() external onlyGovernance {
        _pause();
    }

    /**
     * @notice Reanuda el plugin
     */
    function unpause() external onlyGovernance {
        _unpause();
    }

    /**
     * @notice Permite recibir ETH
     */
    receive() external payable {
        emit AssetAdded(address(0), msg.value);
    }
}
