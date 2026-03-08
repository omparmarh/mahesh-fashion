const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    OrderID: { type: String, required: true },
    CustomerID: { type: String, required: true },
    DeliveryDate: { type: Date },
    Status: { type: String, default: 'Pending' },

    // Top Measurements
    Top_C1: { type: String, default: '' },
    Top_C2: { type: String, default: '' },
    Top_C3: { type: String, default: '' },
    Top_F: { type: String, default: '' },
    Top_L: { type: String, default: '' },
    Top_So: { type: String, default: '' },
    Top_S1: { type: String, default: '' },
    Top_Ku1: { type: String, default: '' },
    Top_Ku2: { type: String, default: '' },
    Top_Ko1: { type: String, default: '' },
    Top_Ko2: { type: String, default: '' },
    Top_K: { type: String, default: '' },
    Top_Notes: { type: String, default: '' },
    Top_Options: { type: [String], default: [] },

    // Bottom Measurements
    Bot_W: { type: String, default: '' },
    Bot_H: { type: String, default: '' },
    Bot_L1: { type: String, default: '' },
    Bot_L2: { type: String, default: '' },
    Bot_T: { type: String, default: '' },
    Bot_K: { type: String, default: '' },
    Bot_B: { type: String, default: '' },
    Bot_R: { type: String, default: '' },
    Bot_Notes: { type: String, default: '' },
    Bot_Options: { type: [String], default: [] },
});

module.exports = mongoose.model('Measurement', measurementSchema);
