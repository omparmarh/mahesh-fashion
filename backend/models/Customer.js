const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  ID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Phone: { type: String, required: true },
  Email: { type: String, default: '' },
  Address: { type: String, default: '' },
  TotalOrders: { type: Number, default: 0 },
  CreatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
