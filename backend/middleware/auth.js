/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set in environment. Using a random key (sessions will not persist across restarts).');
}
const EFFECTIVE_SECRET = JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
const JWT_EXPIRY = '7d';

function generateToken(userId) {
    return jwt.sign({ userId }, EFFECTIVE_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token) {
    return jwt.verify(token, EFFECTIVE_SECRET);
}

/**
 * Middleware: Require authentication
 * Sets req.userId if token is valid
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
}

/**
 * Middleware: Optional authentication
 * Sets req.userId if token is present and valid, but doesn't block
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;
        } catch {
            // Token invalid, continue without auth
        }
    }
    next();
}

module.exports = { generateToken, verifyToken, requireAuth, optionalAuth, JWT_SECRET: EFFECTIVE_SECRET };
