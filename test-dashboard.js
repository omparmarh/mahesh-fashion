const ExcelDB = require('./backend/utils/excel-db');
global.db = {
  customers: new ExcelDB('Customers'),
  invoices: new ExcelDB('Invoices')
};
console.log('Invoices:', global.db.invoices.getAll());
const invoices = global.db.invoices.getAll();
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const thisMonthInvoices = invoices.filter(inv => {
    const d = new Date(inv.Date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
});
console.log('This month invoices:', thisMonthInvoices);

const monthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (Number(inv.Total) || 0), 0);
console.log('monthRevenue:', monthRevenue);
