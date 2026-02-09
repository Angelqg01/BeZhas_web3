/**
 * ============================================================================
 * BEZHAS SDK - PAYMENTS MODULE
 * ============================================================================
 * 
 * Módulo para gestionar pagos con criptomonedas y Stripe
 * Integra con el servicio de pagos crypto del backend
 */

const axios = require('axios');

class PaymentsManager {
    /**
     * @param {Object} config - Configuración del SDK
     * @param {string} config.apiUrl - URL del backend API
     * @param {string} config.apiKey - API Key para autenticación
     */
    constructor(config) {
        this.apiUrl = config.apiUrl || 'http://localhost:3001';
        this.apiKey = config.apiKey;
        this.axios = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey && { 'X-API-Key': this.apiKey })
            }
        });
    }

    /**
     * Obtiene cotización para compra de BEZ-Coins
     * @param {number} amount - Cantidad a convertir
     * @param {string} fromCurrency - Moneda de origen (USD, USDT, USDC, MATIC, etc.)
     * @param {string} toCurrency - Moneda de destino (BEZ)
     * @returns {Promise<Object>} Cotización
     */
    async getQuote(amount, fromCurrency, toCurrency = 'BEZ') {
        try {
            const response = await this.axios.post('/api/crypto/quote', {
                amount,
                currency: fromCurrency
            });

            return {
                success: true,
                quote: response.data.quote
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Procesa pago con Stripe
     * @param {string} userId - ID del usuario
     * @param {string} walletAddress - Dirección de wallet
     * @param {number} amountFiat - Cantidad en fiat (USD)
     * @param {string} email - Email del usuario
     * @returns {Promise<Object>} URL de checkout
     */
    async processStripePayment(userId, walletAddress, amountFiat, email) {
        try {
            const response = await this.axios.post('/api/stripe/create-token-purchase-session', {
                tokenAmount: amountFiat / 0.10, // Asumiendo 1 BEZ = $0.10
                email,
                metadata: {
                    userId,
                    walletAddress
                }
            });

            return {
                success: true,
                checkoutUrl: response.data.url,
                sessionId: response.data.sessionId
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Verifica el estado de un pago
     * @param {string} sessionId - ID de la sesión de Stripe
     * @returns {Promise<Object>} Estado del pago
     */
    async checkPaymentStatus(sessionId) {
        try {
            const response = await this.axios.get(`/api/stripe/session/${sessionId}`);

            return {
                success: true,
                status: response.data.session.status,
                amount: response.data.session.amountTotal,
                currency: response.data.session.currency
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Obtiene balance de wallet
     * @param {string} walletAddress - Dirección de wallet
     * @returns {Promise<Object>} Balance de BEZ
     */
    async getWalletBalance(walletAddress) {
        try {
            const response = await this.axios.get(`/api/crypto/balance/${walletAddress}`);

            return {
                success: true,
                balance: response.data.balance,
                walletAddress: response.data.walletAddress
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Inicia pago con criptomonedas
     * @param {string} walletAddress - Dirección de wallet del usuario
     * @param {number} amount - Cantidad de crypto a pagar
     * @param {string} currency - Criptomoneda (USDT, USDC, MATIC)
     * @returns {Promise<Object>} Instrucciones de pago
     */
    async initiateCryptoPayment(walletAddress, amount, currency) {
        try {
            const response = await this.axios.post('/api/crypto/initiate', {
                walletAddress,
                amount,
                currency
            });

            return {
                success: true,
                paymentType: 'crypto',
                currency,
                amount,
                tokenAmount: response.data.tokenAmount,
                instructions: response.data.instructions || {},
                requiresApproval: response.data.requiresApproval || false,
                approvalData: response.data.approvalData
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Verifica estado de transacción crypto
     * @param {string} txHash - Hash de la transacción
     * @returns {Promise<Object>} Estado de la transacción
     */
    async checkTransactionStatus(txHash) {
        try {
            const response = await this.axios.get(`/api/crypto/status/${txHash}`);

            return {
                success: true,
                status: response.data.status,
                blockNumber: response.data.blockNumber,
                transactionHash: response.data.transactionHash
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Obtiene historial de pagos
     * @returns {Promise<Object>} Historial de pagos
     */
    async getPaymentHistory() {
        try {
            const response = await this.axios.get('/api/payments/history');

            return {
                success: true,
                payments: response.data.payments
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
}

module.exports = PaymentsManager;
