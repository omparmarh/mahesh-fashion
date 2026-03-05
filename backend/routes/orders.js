const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Measurement = require('../models/Measurement');
const History = require('../models/History');
const generateOrderID = require('../utils/generateOrderID');

// GET all orders
router.get('/', auth, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.Status = status;
        }

        if (search) {
            query.$or = [
                { OrderID: { $regex: search, $options: 'i' } },
                { CustomerID: { $regex: search, $options: 'i' } }
            ];
        }

        const data = await Order.find(query).lean();

        // Add customer details to each order for the frontend
        const enrichedOrders = await Promise.all(data.map(async (order) => {
            const customer = await Customer.findOne({ ID: order.CustomerID }).lean();
            const measurement = await Measurement.findOne({ OrderID: order.OrderID }).lean();
            return { ...order, customer, measurement };
        }));

        res.json({ orders: enrichedOrders.reverse(), total: enrichedOrders.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/export/excel  ← must be BEFORE /:id
router.get('/export/excel', auth, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'All') query.Status = status;

        const orders = await Order.find(query).lean();
        const enriched = await Promise.all(orders.map(async (order) => {
            const customer = await Customer.findOne({ ID: order.CustomerID }).lean();
            return { ...order, customerName: customer?.Name || '', customerPhone: customer?.Phone || '' };
        }));

        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Orders');

        sheet.columns = [
            { header: 'Order ID', key: 'OrderID', width: 18 },
            { header: 'Customer Name', key: 'customerName', width: 22 },
            { header: 'Phone', key: 'customerPhone', width: 15 },
            { header: 'Items', key: 'Items', width: 25 },
            { header: 'Total (₹)', key: 'Total', width: 12 },
            { header: 'Paid (₹)', key: 'Paid', width: 12 },
            { header: 'Balance (₹)', key: 'Balance', width: 12 },
            { header: 'Status', key: 'Status', width: 14 },
            { header: 'Delivery Date', key: 'DeliveryDate', width: 16 },
            { header: 'Created', key: 'Created', width: 16 },
        ];

        enriched.forEach(o => {
            sheet.addRow({
                ...o,
                DeliveryDate: o.DeliveryDate ? new Date(o.DeliveryDate).toLocaleDateString('en-IN') : '',
                Created: o.Created ? new Date(o.Created).toLocaleDateString('en-IN') : '',
            });
        });

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Orders_${status || 'All'}_${Date.now()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ OrderID: req.params.id }).lean();
        if (!order) return res.status(404).json({ message: 'Not found' });

        const customer = await Customer.findOne({ ID: order.CustomerID }).lean();
        res.json({ ...order, customer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create order
router.post('/', auth, async (req, res) => {
    try {
        const payload = req.body;
        const orderID = await generateOrderID();

        const newOrder = new Order({
            OrderID: orderID,
            CustomerID: payload.customer, // This is often the ID from frontend
            Items: Array.isArray(payload.items) ? payload.items.map(i => i.description).join(', ') : (payload.items || ''),
            Rate: payload.totalAmount || 0,
            GST: ((payload.totalAmount * 0.05) || 0).toString(),
            Total: payload.totalAmount || 0,
            Paid: payload.amountPaid || 0,
            Balance: (payload.totalAmount - (payload.amountPaid || 0)),
            Status: payload.status || 'Received',
            DeliveryDate: payload.deliveryDate || null,
            Created: new Date()
        });

        await newOrder.save();
        res.status(201).json(newOrder.toObject());
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update order status → Move to History if Delivered
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findOne({ OrderID: req.params.id });
        if (!order) return res.status(404).json({ message: 'Not found' });

        if (status === 'Delivered') {
            const customer = await Customer.findOne({ ID: order.CustomerID }).lean();
            const historyEntry = new History({
                OrderID: order.OrderID,
                CustomerName: customer ? customer.Name : 'Unknown',
                Phone: customer ? customer.Phone : 'Unknown',
                Total: order.Total,
                Paid: order.Paid,
                Balance: order.Balance,
                Rate: order.Rate,
                GST: order.GST,
                Created: order.Created,
                DeliveryDate: new Date(),
                StatusChanges: `Received > Delivered (${note || ''})`,
                Feedback: ''
            });
            await historyEntry.save();
            await Order.findOneAndDelete({ OrderID: req.params.id });
            return res.json({ message: 'Order delivered and moved to history', status: 'Delivered' });
        }

        order.Status = status;
        await order.save();
        res.json({ ...order.toObject(), Status: status });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE order
router.delete('/:id', auth, async (req, res) => {
    try {
        await Order.findOneAndDelete({ OrderID: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update order
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { OrderID: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Order updated' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

