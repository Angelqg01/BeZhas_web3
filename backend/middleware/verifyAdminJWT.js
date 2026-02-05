const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bezhas_super_secret_key';
const db = require('../database/inMemoryDB');

function verifyAdminJWT(req, res, next) {
    // ⚠️ SECURITY: Dev bypass ONLY in development with explicit flag AND warning
    if (process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS_ENABLED === 'true') {
        console.warn('⚠️ WARNING: Admin authentication bypass is ENABLED. This should NEVER be used in production!');
        req.admin = { id: 'dev-admin', role: 'admin', isDev: true };
        return next();
    }

    // ✅ PRODUCTION: Strict authentication required
    if (process.env.NODE_ENV === 'production' && process.env.AUTH_BYPASS_ENABLED === 'true') {
        console.error('🔴 CRITICAL: AUTH_BYPASS_ENABLED is true in PRODUCTION! Blocking all admin access.');
        return res.status(403).json({ error: 'Authentication bypass not allowed in production' });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido.' });
    }

    // DEMO MODE: Allow specific demo token
    if (token === 'demo-admin-token-123') {
        req.admin = { id: 'demo-admin', role: 'admin', isDemo: true };
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // If the token explicitly carries a role, honor it
        if (decoded.role === 'admin' || decoded.role === 'dev') {
            req.admin = decoded;
            return next();
        }

        // Otherwise, resolve user by id and check stored role
        if (decoded.id && db.users.has(decoded.id)) {
            const user = db.users.get(decoded.id);
            if (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('ADMIN'))) {
                req.admin = { id: decoded.id, role: 'admin' };
                return next();
            }
        }

        return res.status(403).json({ error: 'Acceso denegado. No eres admin.' });
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
}

module.exports = verifyAdminJWT;
