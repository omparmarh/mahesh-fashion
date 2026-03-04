const router = require('express').Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const History = require('../models/History');

function parseDateValid(dateVal) {
    if (!dateVal) return new Date("");
    if (typeof dateVal === 'number') return new Date((dateVal - (25567 + 2)) * 86400 * 1000);
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
    if (typeof dateVal === 'string') {
        const parts = dateVal.split(/[-/]/);
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date("");
}

// GET dashboard stats
router.get('/', auth, async (req, res) => {
    try {
        const customers = await Customer.find().lean();
        const orders = await Order.find().lean();
        const invoices = await Invoice.find().lean();
        const history = await History.find().lean();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthInvoices = invoices.filter(inv => {
            const d = parseDateValid(inv.Date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const allOrders = [...orders, ...history];

        const thisMonthOrders = allOrders.filter(o => {
            const d = parseDateValid(o.Created || o.CreatedDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const todayDateStr = now.toISOString().split('T')[0];
        const todayOrders = orders.filter(o => {
            if (!o.Created) return false;
            if (typeof o.Created === 'string' && o.Created.startsWith(todayDateStr)) return true;
            const d = parseDateValid(o.Created);
            return d.toISOString().split('T')[0] === todayDateStr;
        }).length;

        const stats = {
            totalCustomers: customers.length,
            totalOrders: orders.length,
            todayOrders: todayOrders,
            pendingOrders: orders.filter(o => o.Status === 'Pending' || o.Status === 'Received').length,
            stitchingOrders: orders.filter(o => o.Status === 'Stitching').length,
            readyOrders: orders.filter(o => o.Status === 'Ready').length,
            deliveredOrders: history.length,
            monthRevenue: thisMonthOrders.reduce((sum, o) => sum + (Number(o.Total) || 0), 0),
            monthCollected: thisMonthOrders.reduce((sum, o) => sum + (Number(o.Paid) || 0), 0) +
                thisMonthInvoices.reduce((sum, inv) => sum + (Number(inv.Paid) || 0), 0), // fallback if they do use invoices
        };

        // Monthly stats for chart (Last 6 months)
        const monthlyStats = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            const monthLabel = d.toLocaleString('default', { month: 'short' });

            const monthData = allOrders.filter(o => {
                const od = parseDateValid(o.Created || o.CreatedDate);
                return od.getMonth() === m && od.getFullYear() === y;
            });

            monthlyStats.push({
                month: monthLabel,
                revenue: monthData.reduce((sum, o) => sum + (Number(o.Total) || 0), 0)
            });
        }

        // Upcoming deliveries
        const upcomingDeliveries = orders
            .filter(o => o.DeliveryDate && ['Received', 'Stitching', 'Pending'].includes(o.Status))
            .sort((a, b) => new Date(a.DeliveryDate) - new Date(b.DeliveryDate))
            .slice(0, 5)
            .map(o => {
                const customer = customers.find(c => c.ID === o.CustomerID);
                return { ...o, customer: { Name: customer?.Name, Phone: customer?.Phone } };
            });

        res.json({
            ...stats,
            upcomingDeliveries,
            monthlyStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

