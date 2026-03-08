const router = require('express').Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Measurement = require('../models/Measurement');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const generateOrderID = require('../utils/generateOrderID');

// GET /api/new-order/next-id
router.get('/next-id', auth, async (req, res) => {
    try {
        const orderID = await generateOrderID();
        res.json({ orderID });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/new-order/complete
router.post('/complete', auth, async (req, res) => {
    try {
        const {
            customerName, customerPhone, deliveryDate,
            shirt, pant, articles,
            stitchingCost, fabricCost, extraCost,
            grandTotal, payAmount, totalDue,
            paymentMode, billNo
        } = req.body;

        const customerID = `C${Date.now()}`;
        const orderID = await generateOrderID();

        // 1. Create Customer
        const newCustomer = new Customer({
            ID: customerID,
            Name: customerName,
            Phone: customerPhone,
            TotalOrders: 1,
            CreatedDate: new Date()
        });

        // 2. Create Measurement
        const newMeasurement = new Measurement({
            OrderID: orderID,
            CustomerID: customerID,
            DeliveryDate: deliveryDate || null,
            Status: 'Pending',
            Top_C1: shirt?.c1 || '', Top_C2: shirt?.c2 || '', Top_C3: shirt?.c3 || '',
            Top_F: shirt?.f || '', Top_L: shirt?.l || '', Top_So: shirt?.so || '',
            Top_S1: shirt?.s1 || '',
            Top_Ku1: shirt?.ku1 || '', Top_Ku2: shirt?.ku2 || '',
            Top_Ko1: shirt?.ko1 || '', Top_Ko2: shirt?.ko2 || '',
            Top_K: shirt?.k || '',
            Top_Notes: shirt?.notes || '',
            Top_Options: shirt?.options || [],
            Bot_W: pant?.w || '', Bot_H: pant?.h || '',
            Bot_L1: pant?.l1 || '', Bot_L2: pant?.l2 || '',
            Bot_T: pant?.t || '', Bot_K: pant?.k || '',
            Bot_B: pant?.b || '', Bot_R: pant?.r || '',
            Bot_Notes: pant?.notes || '',
            Bot_Options: pant?.options || []
        });

        // 3. Create Order
        const articlesSummary = articles.map(a => a.article).join(', ');

        const newOrder = new Order({
            OrderID: orderID,
            CustomerID: customerID,
            Items: articlesSummary,
            Rate: grandTotal,
            GST: '0',
            Total: grandTotal,
            Paid: payAmount,
            Balance: totalDue,
            Status: 'Received',
            DeliveryDate: deliveryDate || null,
            Created: new Date()
        });

        // 4. Create Invoice
        const newInvoice = new Invoice({
            InvoiceNo: billNo,
            CustomerID: customerID,
            CustomerName: customerName,
            Phone: customerPhone,
            Total: grandTotal,
            Paid: payAmount,
            Balance: totalDue,
            Date: new Date(),
            Items: articlesSummary
        });

        await Promise.all([
            newCustomer.save(),
            newMeasurement.save(),
            newOrder.save(),
            newInvoice.save()
        ]);

        res.status(201).json({
            success: true,
            customerID,
            orderID,
            billNo,
            message: 'Order created successfully'
        });
    } catch (err) {
        console.error('New Order Error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
