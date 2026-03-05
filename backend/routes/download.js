const router = require('express').Router();
const auth = require('../middleware/auth');
const History = require('../models/History');
const ExcelJS = require('exceljs');

// GET /api/download/history
router.get('/history', auth, async (req, res) => {
    try {
        const data = await History.find().lean();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('History');
        sheet.columns = [
            { header: 'Order ID', key: 'OrderID', width: 18 },
            { header: 'Customer Name', key: 'CustomerName', width: 22 },
            { header: 'Phone', key: 'Phone', width: 15 },
            { header: 'Total (₹)', key: 'Total', width: 12 },
            { header: 'Paid (₹)', key: 'Paid', width: 12 },
            { header: 'Balance (₹)', key: 'Balance', width: 12 },
            { header: 'Delivery Date', key: 'DeliveryDate', width: 16 },
            { header: 'Status Changes', key: 'StatusChanges', width: 30 },
            { header: 'Feedback', key: 'Feedback', width: 25 },
        ];
        data.forEach(h => sheet.addRow({
            ...h,
            DeliveryDate: h.DeliveryDate ? new Date(h.DeliveryDate).toLocaleDateString('en-IN') : ''
        }));
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=History.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
