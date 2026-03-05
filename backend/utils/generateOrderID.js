const Order = require('../models/Order');

/**
 * Generates the next sequential OrderID in format ORD0001 → ORD9999 → ORD0001.
 * Finds the highest existing numeric order number and increments it.
 */
async function generateOrderID() {
    // Get all orders, extract the numeric part of ORDxxxx IDs
    const orders = await Order.find({}, { OrderID: 1 }).lean();

    let maxNum = 0;
    for (const o of orders) {
        // Match ORD followed by exactly 4 digits
        const match = o.OrderID && o.OrderID.match(/^ORD(\d{4})$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    }

    // Increment and wrap: 9999 → 1
    const nextNum = maxNum >= 9999 ? 1 : maxNum + 1;
    return `ORD${String(nextNum).padStart(4, '0')}`;
}

module.exports = generateOrderID;
