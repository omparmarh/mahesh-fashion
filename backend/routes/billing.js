const router = require('express').Router();
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

// Calculate GST on items helper
function calcInvoiceTotals(items = []) {
    let subtotal = 0, totalDiscount = 0, totalCgst = 0, totalSgst = 0;
    const calculated = items.map((item) => {
        const grossAmount = item.qty * item.rate;
        const discAmt = (grossAmount * (item.discount || 0)) / 100;
        const taxable = grossAmount - discAmt;
        const cgst = parseFloat(((taxable * (item.gstRate || 5)) / 200).toFixed(2));
        const sgst = cgst;
        const total = parseFloat((taxable + cgst + sgst).toFixed(2));
        subtotal += grossAmount;
        totalDiscount += discAmt;
        totalCgst += cgst;
        totalSgst += sgst;
        return { ...item, cgst, sgst, totalAmount: total };
    });
    const taxableAmount = parseFloat((subtotal - totalDiscount).toFixed(2));
    const grandTotal = parseFloat((taxableAmount + totalCgst + totalSgst).toFixed(2));
    return { calculated, subtotal, totalDiscount, taxableAmount, totalCgst, totalSgst, grandTotal };
}

// GET all invoices
router.get('/', auth, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { InvoiceNo: { $regex: search, $options: 'i' } },
                { CustomerName: { $regex: search, $options: 'i' } },
                { Phone: { $regex: search, $options: 'i' } }
            ];
        }

        const data = await Invoice.find(query).lean();
        res.json({ invoices: [...data].reverse(), total: data.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ InvoiceNo: req.params.id }).lean();
        if (!invoice) return res.status(404).json({ message: 'Not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create invoice
router.post('/', auth, async (req, res) => {
    try {
        const { items = [], amountPaid = 0, customer: orderRef, customerName, customerPhone, ...rest } = req.body;
        const { grandTotal } = calcInvoiceTotals(items);

        const invoiceNo = `INV${Date.now()}`;

        const newInvoice = new Invoice({
            InvoiceNo: invoiceNo,
            CustomerID: req.body.customerId || 'WALKIN',
            CustomerName: customerName,
            Phone: customerPhone,
            Total: grandTotal,
            Paid: amountPaid,
            Balance: grandTotal - amountPaid,
            Date: new Date(),
            Items: items.map(i => i.description).join(', ')
            // Note: Removed local excel file generation as it is incompatible with serverless environments.
        });

        await newInvoice.save();

        if (orderRef) {
            await Order.findOneAndUpdate(
                { OrderID: orderRef },
                {
                    Paid: amountPaid,
                    Total: grandTotal,
                    Balance: grandTotal - amountPaid,
                    Status: 'Ready'
                }
            );
        }

        res.status(201).json(newInvoice.toObject());
    } catch (err) {
        console.error('Billing POST Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE invoice
router.delete('/:id', auth, async (req, res) => {
    try {
        await Invoice.findOneAndDelete({ InvoiceNo: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

