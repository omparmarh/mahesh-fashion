const router = require('express').Router();
const auth = require('../middleware/auth');
const History = require('../models/History');

// GET history entries from DB
router.get('/', auth, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { CustomerName: { $regex: search, $options: 'i' } },
                { Phone: { $regex: search, $options: 'i' } },
                { OrderID: { $regex: search, $options: 'i' } }
            ];
        }

        const data = await History.find(query).lean();
        res.json({ history: [...data].reverse(), total: data.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
