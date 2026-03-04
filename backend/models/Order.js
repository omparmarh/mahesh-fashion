const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    OrderID: { type: String, required: true, unique: true },
    CustomerID: { type: String, required: true },
    Items: { type: String, default: '1' },
    Rate: { type: Number, default: 0 },
    GST: { type: String, default: '0' },
    Total: { type: Number, default: 0 },
    Paid: { type: Number, default: 0 },
    Balance: { type: Number, default: 0 },
    Status: { type: String, default: 'Pending' },
    DeliveryDate: { type: Date },
    Created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
