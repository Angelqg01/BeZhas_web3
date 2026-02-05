const express = require('express');
const router = express.Router();
const {
    createApiKey,
    getApiKeys,
    getApiKeyById,
    updateApiKey,
    deleteApiKey,
    rotateApiKey,
    getApiKeyUsageStats,
    testApiKey,
    addWebhook,
    deleteWebhook,
    getWebhooks,
    getUsageStats
} = require('../controllers/developerConsole.controller');
const { protect } = require('../middleware/auth.middleware');

// Proteger todas las rutas (requiere autenticación)
router.use(protect);

/**
 * @route   POST /api/developer/keys
 * @desc    Crear nueva API Key
 * @access  Private
 */
router.post('/keys', createApiKey);

/**
 * @route   GET /api/developer/keys
 * @desc    Obtener todas las API Keys del usuario
 * @access  Private
 */
router.get('/keys', getApiKeys);

/**
 * @route   GET /api/developer/keys/:id
 * @desc    Obtener detalles de una API Key específica
 * @access  Private
 */
router.get('/keys/:id', getApiKeyById);

/**
 * @route   PUT /api/developer/keys/:id
 * @desc    Actualizar API Key (permisos, nombre, etc)
 * @access  Private
 */
router.put('/keys/:id', updateApiKey);

/**
 * @route   DELETE /api/developer/keys/:id
 * @desc    Eliminar/Revocar API Key
 * @access  Private
 */
router.delete('/keys/:id', deleteApiKey);

/**
 * @route   POST /api/developer/keys/:id/rotate
 * @desc    Rotar API Key (generar nueva clave)
 * @access  Private
 */
router.post('/keys/:id/rotate', rotateApiKey);

/**
 * @route   GET /api/developer/keys/:id/usage
 * @desc    Obtener estadísticas de uso de una API Key
 * @access  Private
 */
router.get('/keys/:id/usage', getApiKeyUsageStats);

/**
 * @route   POST /api/developer/keys/:id/test
 * @desc    Probar API Key (hacer request de prueba)
 * @access  Private
 */
router.post('/keys/:id/test', testApiKey);

/**
 * @route   GET /api/developer/keys/:id/webhooks
 * @desc    Obtener webhooks de una API Key
 * @access  Private
 */
router.get('/keys/:id/webhooks', getWebhooks);

/**
 * @route   POST /api/developer/keys/:id/webhooks
 * @desc    Agregar webhook a una API Key
 * @access  Private
 */
router.post('/keys/:id/webhooks', addWebhook);

/**
 * @route   DELETE /api/developer/keys/:keyId/webhooks/:webhookId
 * @desc    Eliminar webhook de una API Key
 * @access  Private
 */
router.delete('/keys/:keyId/webhooks/:webhookId', deleteWebhook);

/**
 * @route   GET /api/developer/usage-stats/:address
 * @desc    Obtener estadísticas agregadas de uso por wallet address
 * @access  Public
 */
router.get('/usage-stats/:address', getUsageStats);

module.exports = router;
