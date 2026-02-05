// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/PluginManager.sol";
import "../interfaces/IPlugin.sol";

/**
 * @title Advertising Plugin (DePub Protocol)
 * @notice Tokeniza el inventario publicitario como NFTs y automatiza distribución de ingresos
 * @dev Implementa el modelo de revenue sharing: Publisher 50%, Usuario 30%, DAO 20%
 * Referencia: Sección IV - Sistema de Publicidad Descentralizada
 */
contract AdvertisingPlugin is IAdvertisingPlugin, ERC721URIStorage, ReentrancyGuard {
    PluginManager public pluginManager;
    address public treasuryPlugin;
    IERC20 public paymentToken; // USDC/USDT para pagos

    struct AdCard {
        uint256 id;
        address publisher;        // Dueño del inventario
        uint256 pricePerDay;     // Precio de renta diario
        uint256 totalImpressions; // Impresiones totales servidas
        uint256 totalClicks;      // Clicks registrados
        uint256 totalRevenue;     // Revenue total generado
        address currentRenter;    // Anunciante actual
        uint256 rentExpiry;       // Timestamp de expiración de renta
        bool isActive;            // Estado del ad card
        string location;          // Ubicación del ad (ej: "Header Banner")
        string dimensions;        // Dimensiones (ej: "728x90")
    }

    struct RevenueDistribution {
        uint256 publisherShare;  // 50%
        uint256 userShare;       // 30%
        uint256 daoShare;        // 20%
        uint256 timestamp;
    }

    // Storage
    mapping(uint256 => AdCard) public adCards;
    mapping(uint256 => RevenueDistribution[]) public revenueHistory;
    uint256 public nextTokenId;

    // Revenue split percentages (en basis points: 10000 = 100%)
    uint256 public constant PUBLISHER_SHARE = 5000;  // 50%
    uint256 public constant USER_SHARE = 3000;       // 30%
    uint256 public constant DAO_SHARE = 2000;        // 20%
    uint256 public constant BASIS_POINTS = 10000;

    // Eventos
    event AdCardMinted(
        uint256 indexed tokenId,
        address indexed publisher,
        string location,
        uint256 pricePerDay
    );

    event AdSpaceRented(
        uint256 indexed tokenId,
        address indexed renter,
        uint256 daysRented,
        uint256 totalCost
    );

    event ImpressionRecorded(
        uint256 indexed tokenId,
        uint256 totalImpressions
    );

    event ClickRecorded(
        uint256 indexed tokenId,
        uint256 totalClicks
    );

    event RevenueDistributed(
        uint256 indexed tokenId,
        uint256 totalAmount,
        uint256 publisherAmount,
        uint256 userAmount,
        uint256 daoAmount
    );

    modifier onlyGovernance() {
        require(
            pluginManager.hasRole(pluginManager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "AdPlugin: Only governance"
        );
        _;
    }

    constructor(
        address _pluginManager,
        address _treasuryPlugin,
        address _paymentToken
    ) ERC721("DAO Ad Inventory", "AD-CARD") {
        require(_pluginManager != address(0), "Invalid plugin manager");
        require(_treasuryPlugin != address(0), "Invalid treasury");
        require(_paymentToken != address(0), "Invalid payment token");

        pluginManager = PluginManager(_pluginManager);
        treasuryPlugin = _treasuryPlugin;
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @notice Inicializa el plugin (IPlugin interface)
     */
    function initialize(address _manager) external override {
        require(address(pluginManager) == address(0), "Already initialized");
        pluginManager = PluginManager(_manager);
    }

    function getPluginType() external pure override returns (string memory) {
        return "ADVERTISING";
    }

    function getVersion() external pure override returns (string memory) {
        return "1.0.0";
    }

    /**
     * @notice Crea un nuevo espacio publicitario (Ad Card NFT)
     * @dev Convierte un espacio publicitario en un activo tokenizado
     * @param _publisher Dueño del inventario publicitario
     * @param _metadata URI con metadata del NFT (IPFS)
     * @param _impressions Impresiones mensuales estimadas
     * @return tokenId ID del NFT creado
     */
    function mintAdCard(
        address _publisher,
        string memory _metadata,
        uint256 _impressions
    ) external override onlyGovernance returns (uint256 tokenId) {
        require(_publisher != address(0), "Invalid publisher");

        tokenId = nextTokenId++;

        // Mint NFT
        _mint(_publisher, tokenId);
        _setTokenURI(tokenId, _metadata);

        // Calcular precio base en función de impresiones
        // Fórmula simple: $1 CPM (Cost Per Mille)
        uint256 pricePerDay = (_impressions / 30) * 1e6 / 1000; // En USDC (6 decimales)

        adCards[tokenId] = AdCard({
            id: tokenId,
            publisher: _publisher,
            pricePerDay: pricePerDay,
            totalImpressions: 0,
            totalClicks: 0,
            totalRevenue: 0,
            currentRenter: address(0),
            rentExpiry: 0,
            isActive: true,
            location: "",
            dimensions: ""
        });

        emit AdCardMinted(tokenId, _publisher, "", pricePerDay);

        return tokenId;
    }

    /**
     * @notice Renta un espacio publicitario
     * @dev Ejecuta la distribución automática de ingresos según el modelo 50/30/20
     * @param _tokenId ID del Ad Card
     * @param _days Número de días de renta
     */
    function rentAdSpace(uint256 _tokenId, uint256 _days) external nonReentrant {
        AdCard storage card = adCards[_tokenId];
        require(card.isActive, "Ad Card inactive");
        require(block.timestamp > card.rentExpiry, "Currently rented");
        require(_days > 0 && _days <= 365, "Invalid rental period");

        uint256 totalCost = card.pricePerDay * _days;

        // Calcular distribución
        uint256 daoAmount = (totalCost * DAO_SHARE) / BASIS_POINTS;
        uint256 userAmount = (totalCost * USER_SHARE) / BASIS_POINTS;
        uint256 publisherAmount = totalCost - daoAmount - userAmount;

        // 1. Cobrar al anunciante
        require(
            paymentToken.transferFrom(msg.sender, address(this), totalCost),
            "Payment failed"
        );

        // 2. Distribuir fondos
        paymentToken.transfer(treasuryPlugin, daoAmount);
        paymentToken.transfer(card.publisher, publisherAmount);
        // userAmount se queda en el contrato para distribuir a usuarios que vean el ad

        // 3. Actualizar estado
        card.currentRenter = msg.sender;
        card.rentExpiry = block.timestamp + (_days * 1 days);
        card.totalRevenue += totalCost;

        // 4. Registrar en historial
        revenueHistory[_tokenId].push(RevenueDistribution({
            publisherShare: publisherAmount,
            userShare: userAmount,
            daoShare: daoAmount,
            timestamp: block.timestamp
        }));

        emit AdSpaceRented(_tokenId, msg.sender, _days, totalCost);
        emit RevenueDistributed(
            _tokenId,
            totalCost,
            publisherAmount,
            userAmount,
            daoAmount
        );
    }

    /**
     * @notice Registra una impresión de ad
     * @dev En producción, esto sería llamado por un oráculo off-chain
     * @param _tokenId ID del Ad Card
     */
    function recordImpression(uint256 _tokenId) external override {
        AdCard storage card = adCards[_tokenId];
        require(card.isActive, "Ad Card inactive");
        require(block.timestamp <= card.rentExpiry, "Rental expired");

        card.totalImpressions++;

        emit ImpressionRecorded(_tokenId, card.totalImpressions);
    }

    /**
     * @notice Distribuye revenue a los stakeholders
     * @dev Implementa el modelo de revenue sharing automatizado
     * @param _tokenId ID del Ad Card
     * @param _amount Cantidad a distribuir
     */
    function distributeRevenue(uint256 _tokenId, uint256 _amount) external override nonReentrant {
        AdCard storage card = adCards[_tokenId];
        require(card.isActive, "Ad Card inactive");

        // Calcular shares
        uint256 daoAmount = (_amount * DAO_SHARE) / BASIS_POINTS;
        uint256 userAmount = (_amount * USER_SHARE) / BASIS_POINTS;
        uint256 publisherAmount = _amount - daoAmount - userAmount;

        // Ejecutar transferencias
        paymentToken.transfer(treasuryPlugin, daoAmount);
        paymentToken.transfer(card.publisher, publisherAmount);
        // userAmount distribuido proporcionalmente a usuarios activos

        card.totalRevenue += _amount;

        revenueHistory[_tokenId].push(RevenueDistribution({
            publisherShare: publisherAmount,
            userShare: userAmount,
            daoShare: daoAmount,
            timestamp: block.timestamp
        }));

        emit RevenueDistributed(
            _tokenId,
            _amount,
            publisherAmount,
            userAmount,
            daoAmount
        );
    }

    /**
     * @notice Obtiene las métricas de un Ad Card
     * @param _tokenId ID del Ad Card
     * @return impressions Total de impresiones
     * @return clicks Total de clicks
     * @return revenue Revenue total generado
     */
    function getAdCardMetrics(uint256 _tokenId)
        external
        view
        override
        returns (uint256 impressions, uint256 clicks, uint256 revenue)
    {
        AdCard memory card = adCards[_tokenId];
        return (card.totalImpressions, card.totalClicks, card.totalRevenue);
    }

    /**
     * @notice Actualiza el precio de un Ad Card
     */
    function updatePrice(uint256 _tokenId, uint256 _newPrice) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        adCards[_tokenId].pricePerDay = _newPrice;
    }

    /**
     * @notice Pausa/activa un Ad Card
     */
    function toggleAdCard(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        adCards[_tokenId].isActive = !adCards[_tokenId].isActive;
    }

    /**
     * @notice Obtiene el historial de revenue de un Ad Card
     */
    function getRevenueHistory(uint256 _tokenId)
        external
        view
        returns (RevenueDistribution[] memory)
    {
        return revenueHistory[_tokenId];
    }

    /**
     * @notice Verifica si un Ad Card está actualmente rentado
     */
    function isRented(uint256 _tokenId) external view returns (bool) {
        return block.timestamp <= adCards[_tokenId].rentExpiry;
    }
}
