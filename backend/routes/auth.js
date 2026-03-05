const router = require('express').Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@maheshfashion.com';
        res.json({
            admin: { id: 'EXCEL_ADMIN', name: 'Mahesh Admin', email: adminEmail, role: 'admin' },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@maheshfashion.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign({ id: 'EXCEL_ADMIN', role: 'admin' }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });

            return res.json({
                token,
                admin: { id: 'EXCEL_ADMIN', name: 'Mahesh Admin', email: adminEmail, role: 'admin' },
            });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

