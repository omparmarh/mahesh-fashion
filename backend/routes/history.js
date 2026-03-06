const router = require('express').Router();
const auth = require('../middleware/auth');
const History = require('../models/History');
const Measurement = require('../models/Measurement');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

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

// DELETE history entry
router.delete('/:id', auth, async (req, res) => {
    try {
        await History.findOneAndDelete({ OrderID: req.params.id });

        const measurement = await Measurement.findOneAndDelete({ OrderID: req.params.id });
        if (measurement && measurement.CustomerID) {
            await Customer.findOneAndDelete({ ID: measurement.CustomerID });
        }
        await Order.findOneAndDelete({ OrderID: req.params.id });

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
