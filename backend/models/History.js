const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    OrderID: { type: String, required: true },
    CustomerName: { type: String, required: true },
    Phone: { type: String, required: true },
    Total: { type: Number, default: 0 },
    Paid: { type: Number, default: 0 },
    Balance: { type: Number, default: 0 },
    Rate: { type: Number, default: 0 },
    GST: { type: String, default: '0' },
    Created: { type: Date },
    DeliveryDate: { type: Date },
    StatusChanges: { type: String, default: 'Created' },
    Feedback: { type: String, default: '' },
});

module.exports = mongoose.model('History', historySchema);
