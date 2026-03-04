const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    InvoiceNo: { type: String, required: true, unique: true },
    CustomerID: { type: String, required: true },
    CustomerName: { type: String, required: true },
    Phone: { type: String },
    Total: { type: Number, default: 0 },
    Paid: { type: Number, default: 0 },
    Balance: { type: Number, default: 0 },
    Date: { type: Date, default: Date.now },
    Items: { type: String, default: '' },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
