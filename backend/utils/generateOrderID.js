const Order = require('../models/Order');

/**
 * Generates the next sequential OrderID in format 0001 → 9999 → 0001.
 * Finds the highest existing numeric order number and increments it.
 */
async function generateOrderID() {
    // Get all orders to find the highest number
    const orders = await Order.find({}, { OrderID: 1 }).lean();

    let maxNum = 0;
    for (const o of orders) {
        // Match exactly 4 digits (e.g., "0001")
        const match = o.OrderID && o.OrderID.match(/^(\d{4})$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    }

    // Increment and wrap: 9999 → 1
    const nextNum = maxNum >= 9999 ? 1 : maxNum + 1;
    return String(nextNum).padStart(4, '0');
}

module.exports = generateOrderID;
