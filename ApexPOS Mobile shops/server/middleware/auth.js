const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceylonpos-secret-key-2026';

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Role guard middleware factory
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};

module.exports = { auth, requireRole };
