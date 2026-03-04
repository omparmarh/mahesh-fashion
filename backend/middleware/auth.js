const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Simple validation for Excel-only backend
        if (decoded.id === 'EXCEL_ADMIN') {
            req.admin = { id: 'EXCEL_ADMIN', role: 'admin' };
            return next();
        }

        return res.status(401).json({ message: 'Unauthorized' });
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

