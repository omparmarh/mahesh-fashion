const ExcelDB = require('./backend/utils/excel-db');
global.db = {
    invoices: new ExcelDB('Invoices')
};
const invoices = global.db.invoices.getAll();
const now = new Date();
const monthlyStats = [];
for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthLabel = d.toLocaleString('default', { month: 'short' });

    const monthInvoices = invoices.filter(inv => {
        const id = new Date(inv.Date);
        return id.getMonth() === m && id.getFullYear() === y;
    });

    monthlyStats.push({
        month: monthLabel,
        revenue: monthInvoices.reduce((sum, inv) => sum + (Number(inv.Total) || 0), 0)
    });
}
console.log('monthlyStats:', monthlyStats);
