const router = require('express').Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Measurement = require('../models/Measurement');
const Order = require('../models/Order');
const generateOrderID = require('../utils/generateOrderID');

// GET all customers/measurements (from DB)
router.get('/list', auth, async (req, res) => {
    try {
        const measurements = await Measurement.find().lean();
        const enriched = await Promise.all(measurements.map(async (m) => {
            const customer = await Customer.findOne({ ID: m.CustomerID }).lean();
            return {
                ...m,
                customerName: customer ? customer.Name : 'Unknown',
                customerPhone: customer ? customer.Phone : ''
            };
        }));
        res.json({ measurements: enriched.reverse() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { Name: { $regex: search, $options: 'i' } },
                    { Phone: { $regex: search, $options: 'i' } },
                    { ID: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const data = await Customer.find(query).lean();

        // Reverse to show newest first
        const customers = [...data].reverse();
        res.json({ customers, total: customers.length, page: 1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single customer
router.get('/:id', auth, async (req, res) => {
    try {
        const customer = await Customer.findOne({ ID: req.params.id }).lean();
        if (!customer) return res.status(404).json({ message: 'Not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create measurement → Add to Customers, Measurements, Orders
router.post('/', auth, async (req, res) => {
    try {
        const payload = req.body;
        const customerID = `C${Date.now()}`;
        const orderID = await generateOrderID();

        const newCustomer = new Customer({
            ID: customerID,
            Name: payload.name,
            Phone: payload.phone,
            Email: payload.email || '',
            Address: payload.address || '',
            TotalOrders: 1,
            CreatedDate: new Date()
        });

        const newMeasurement = new Measurement({
            OrderID: orderID,
            CustomerID: customerID,
            DeliveryDate: payload.deliveryDate || null,
            Status: 'Pending',
            Top_C1: payload.shirt?.c1 || '',
            Top_C2: payload.shirt?.c2 || '',
            Top_C3: payload.shirt?.c3 || '',
            Top_F: payload.shirt?.f || '',
            Top_L: payload.shirt?.l || '',
            Top_So: payload.shirt?.so || '',
            Top_S1: payload.shirt?.s1 || '',
            Top_S2: payload.shirt?.s2 || '',
            Top_Ku1: payload.shirt?.ku1 || '',
            Top_Ku2: payload.shirt?.ku2 || '',
            Top_Ko1: payload.shirt?.ko1 || '',
            Top_Ko2: payload.shirt?.ko2 || '',
            Top_K: payload.shirt?.k || '',
            Bot_W: payload.pant?.w || '',
            Bot_H: payload.pant?.h || '',
            Bot_L1: payload.pant?.l1 || '',
            Bot_L2: payload.pant?.l2 || '',
            Bot_T: payload.pant?.t || '',
            Bot_K: payload.pant?.k || '',
            Bot_B: payload.pant?.b || '',
            Bot_R: payload.pant?.r || ''
        });

        const newOrder = new Order({
            OrderID: orderID,
            CustomerID: customerID,
            Items: 'Custom Tailoring',
            Rate: Number(payload.totalAmount) || 0,
            GST: '0',
            Total: Number(payload.totalAmount) || 0,
            Paid: Number(payload.advance) || 0,
            Balance: (Number(payload.totalAmount) || 0) - (Number(payload.advance) || 0),
            Status: 'Received',
            DeliveryDate: payload.deliveryDate || null,
            Created: new Date()
        });

        await Promise.all([newCustomer.save(), newMeasurement.save(), newOrder.save()]);

        res.status(201).json({ ...newCustomer.toObject(), orderId: orderID });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update measurement fields by OrderID
router.put('/update/:orderID', auth, async (req, res) => {
    try {
        const updatedMeasurement = await Measurement.findOneAndUpdate(
            { OrderID: req.params.orderID },
            req.body,
            { new: true }
        ).lean();

        if (!updatedMeasurement) return res.status(404).json({ message: 'Measurement not found' });
        res.json({ message: 'Measurement updated', measurement: updatedMeasurement });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update measurement/customer
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedCustomer = await Customer.findOneAndUpdate(
            { ID: req.params.id },
            req.body,
            { new: true }
        ).lean();

        if (!updatedCustomer) return res.status(404).json({ message: 'Not found' });
        res.json(updatedCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE customer
router.delete('/:id', auth, async (req, res) => {
    try {
        await Customer.findOneAndDelete({ ID: req.params.id });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
