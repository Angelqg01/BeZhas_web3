/**
 * ============================================================================
 * BEZHAS SDK - MCP INTEGRATION MODULE
 * ============================================================================
 * 
 * Cliente para conectar con el MCP Server de BeZhas
 * Permite usar herramientas de IA para automatización
 */

const axios = require('axios');

class MCPClient {
    /**
     * @param {Object} config - Configuración del MCP client
     * @param {string} config.serverUrl - URL del MCP server
     * @param {string} config.apiKey - API Key para autenticación
     */
    constructor(config) {
        this.serverUrl = config.serverUrl || 'http://localhost:3002';
        this.apiKey = config.apiKey;
        this.connected = false;

        this.axios = axios.create({
            baseURL: this.serverUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
        });
    }

    /**
     * Conecta con el MCP server
     * @returns {Promise<Object>} Resultado de la conexión
     */
    async connect() {
        try {
            const response = await this.axios.get('/health');

            if (response.status === 200) {
                this.connected = true;
                return {
                    success: true,
                    message: 'Connected to MCP server',
                    serverInfo: response.data
                };
            }
        } catch (error) {
            this.connected = false;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Lista herramientas disponibles en el MCP server
     * @returns {Promise<Object>} Lista de herramientas
     */
    async listAvailableTools() {
        try {
            const response = await this.axios.get('/tools/list');

            return {
                success: true,
                tools: response.data.tools,
                count: response.data.tools.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Llama a una herramienta del MCP server
     * @param {string} toolName - Nombre de la herramienta
     * @param {Object} args - Argumentos para la herramienta
     * @returns {Promise<Object>} Resultado de la herramienta
     */
    async callTool(toolName, args = {}) {
        try {
            const response = await this.axios.post('/tools/call', {
                tool: toolName,
                arguments: args
            });

            return {
                success: true,
                toolName,
                result: response.data.result,
                executionTime: response.data.executionTime
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Desconecta del MCP server
     */
    disconnect() {
        this.connected = false;
        return {
            success: true,
            message: 'Disconnected from MCP server'
        };
    }

    /**
     * Verifica si está conectado
     * @returns {boolean} Estado de conexión
     */
    isConnected() {
        return this.connected;
    }

    // ========================================
    // PAYMENT TOOLS
    // ========================================

    /**
     * Obtiene cotización de pago
     * @param {number} amount - Cantidad
     * @param {string} fromCurrency - Moneda origen
     * @param {string} toCurrency - Moneda destino
     * @returns {Promise<Object>} Cotización
     */
    async getPaymentQuote(amount, fromCurrency, toCurrency) {
        return this.callTool('get_payment_quote', {
            amount,
            fromCurrency,
            toCurrency
        });
    }

    /**
     * Procesa pago con Stripe
     * @param {string} userId - ID del usuario
     * @param {string} walletAddress - Dirección de wallet
     * @param {number} amount - Cantidad
     * @param {string} email - Email
     * @returns {Promise<Object>} Resultado del pago
     */
    async processStripePayment(userId, walletAddress, amount, email) {
        return this.callTool('process_stripe_payment', {
            userId,
            walletAddress,
            amount,
            email
        });
    }

    /**
     * Verifica estado de pago
     * @param {string} sessionId - ID de sesión
     * @returns {Promise<Object>} Estado del pago
     */
    async checkPaymentStatus(sessionId) {
        return this.callTool('check_payment_status', { sessionId });
    }

    /**
     * Obtiene balance de wallet
     * @param {string} walletAddress - Dirección de wallet
     * @returns {Promise<Object>} Balance
     */
    async getWalletBalance(walletAddress) {
        return this.callTool('get_wallet_balance', { walletAddress });
    }

    /**
     * Inicia pago crypto
     * @param {string} walletAddress - Dirección de wallet
     * @param {number} amount - Cantidad
     * @param {string} currency - Moneda
     * @returns {Promise<Object>} Instrucciones de pago
     */
    async initiateCryptoPayment(walletAddress, amount, currency) {
        return this.callTool('initiate_crypto_payment', {
            walletAddress,
            amount,
            currency
        });
    }
}

module.exports = MCPClient;
