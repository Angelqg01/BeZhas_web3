// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Plugin Manager
 * @notice Actúa como el guardián de seguridad de la DAO.
 * @dev Basado en el patrón Core-Plugin de Aragon OSx.
 * Solo los contratos registrados aquí pueden ejecutar acciones críticas.
 * Implementa el principio de "Seguridad Aislada" con Kill Switch.
 */
contract PluginManager is AccessControl, ReentrancyGuard {
    
    bytes32 public constant PLUGIN_ADMIN_ROLE = keccak256("PLUGIN_ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    struct PluginMetadata {
        address pluginAddress;
        string name;
        string version;
        bool isActive;
        uint256 authorizedAt;
        uint256 revokedAt;
        string revokeReason;
    }

    // Mapeo de dirección del plugin a metadata
    mapping(address => PluginMetadata) public plugins;
    
    // Array de direcciones de plugins para iteración
    address[] public pluginList;
    
    // Eventos para auditoría completa en el dashboard
    event PluginAuthorized(
        address indexed pluginAddress, 
        string name, 
        string version,
        uint256 timestamp
    );
    
    event PluginRevoked(
        address indexed pluginAddress, 
        string reason,
        uint256 timestamp
    );
    
    event PluginUpgraded(
        address indexed oldPlugin,
        address indexed newPlugin,
        string name
    );

    event EmergencyShutdown(address indexed initiator, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLUGIN_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }

    /**
     * @notice Autoriza un nuevo módulo (Tesorería, HR, Gobernanza, Publicidad)
     * @dev Solo ejecutable por direcciones con PLUGIN_ADMIN_ROLE
     * @param _plugin Dirección del contrato del plugin
     * @param _name Nombre descriptivo del plugin
     * @param _version Versión semántica (ej: "1.0.0")
     */
    function authorizePlugin(
        address _plugin,
        string memory _name,
        string memory _version
    ) external onlyRole(PLUGIN_ADMIN_ROLE) {
        require(_plugin != address(0), "PluginManager: Invalid address");
        require(!plugins[_plugin].isActive, "PluginManager: Plugin already active");

        plugins[_plugin] = PluginMetadata({
            pluginAddress: _plugin,
            name: _name,
            version: _version,
            isActive: true,
            authorizedAt: block.timestamp,
            revokedAt: 0,
            revokeReason: ""
        });

        pluginList.push(_plugin);

        emit PluginAuthorized(_plugin, _name, _version, block.timestamp);
    }

    /**
     * @notice "Kill Switch": Revoca permisos inmediatamente
     * @dev Esencial para aislar fallos de seguridad en plugins comprometidos
     * @param _plugin Dirección del plugin a revocar
     * @param _reason Razón de la revocación (para auditoría)
     */
    function revokePlugin(
        address _plugin,
        string memory _reason
    ) external onlyRole(EMERGENCY_ROLE) {
        require(plugins[_plugin].isActive, "PluginManager: Plugin not active");

        plugins[_plugin].isActive = false;
        plugins[_plugin].revokedAt = block.timestamp;
        plugins[_plugin].revokeReason = _reason;

        emit PluginRevoked(_plugin, _reason, block.timestamp);
    }

    /**
     * @notice Actualiza un plugin a una nueva versión
     * @dev Útil para upgrades sin perder el estado de la DAO
     */
    function upgradePlugin(
        address _oldPlugin,
        address _newPlugin,
        string memory _version
    ) external onlyRole(PLUGIN_ADMIN_ROLE) {
        require(plugins[_oldPlugin].isActive, "PluginManager: Old plugin not active");
        require(_newPlugin != address(0), "PluginManager: Invalid new address");

        string memory pluginName = plugins[_oldPlugin].name;

        // Revocar el antiguo
        plugins[_oldPlugin].isActive = false;
        plugins[_oldPlugin].revokedAt = block.timestamp;
        plugins[_oldPlugin].revokeReason = "Upgraded to new version";

        // Autorizar el nuevo
        plugins[_newPlugin] = PluginMetadata({
            pluginAddress: _newPlugin,
            name: pluginName,
            version: _version,
            isActive: true,
            authorizedAt: block.timestamp,
            revokedAt: 0,
            revokeReason: ""
        });

        pluginList.push(_newPlugin);

        emit PluginUpgraded(_oldPlugin, _newPlugin, pluginName);
    }

    /**
     * @notice Verificador público para otros contratos
     * @return bool True si el plugin está autorizado y activo
     */
    function isPluginAuthorized(address _plugin) external view returns (bool) {
        return plugins[_plugin].isActive;
    }

    /**
     * @notice Obtiene metadata completa de un plugin
     */
    function getPluginInfo(address _plugin) external view returns (PluginMetadata memory) {
        return plugins[_plugin];
    }

    /**
     * @notice Obtiene la lista de todos los plugins registrados
     */
    function getAllPlugins() external view returns (address[] memory) {
        return pluginList;
    }

    /**
     * @notice Emergency Pause: Detiene TODOS los plugins activos
     * @dev Solo para situaciones críticas (exploit detectado, ataque en curso)
     */
    function emergencyShutdownAll() external onlyRole(EMERGENCY_ROLE) {
        for (uint256 i = 0; i < pluginList.length; i++) {
            if (plugins[pluginList[i]].isActive) {
                plugins[pluginList[i]].isActive = false;
                plugins[pluginList[i]].revokedAt = block.timestamp;
                plugins[pluginList[i]].revokeReason = "Emergency Shutdown";
            }
        }
        emit EmergencyShutdown(msg.sender, block.timestamp);
    }

    /**
     * @dev Modificador que otros contratos usarán para proteger sus funciones
     */
    modifier onlyAuthorizedPlugin() {
        require(
            plugins[msg.sender].isActive,
            "PluginManager: Caller is not an authorized plugin"
        );
        _;
    }
}
