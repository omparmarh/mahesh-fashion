const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Color theme ──────────────────────────────────────────────────────
const MAROON = 'FF8B0000';
const GOLD = 'FFFFD700';
const WHITE = 'FFFFFFFF';
const LIGHT = 'FFFFF8F0';

function applyHeaderStyle(cell) {
    cell.font = { bold: true, color: { argb: WHITE }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MAROON } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
        top: { style: 'thin', color: { argb: GOLD } },
        bottom: { style: 'thin', color: { argb: GOLD } },
        left: { style: 'thin', color: { argb: GOLD } },
        right: { style: 'thin', color: { argb: GOLD } },
    };
}

function applyDataStyle(cell, isAlt) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? LIGHT : WHITE } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0C8A0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0C8A0' } },
        left: { style: 'thin', color: { argb: 'FFE0C8A0' } },
        right: { style: 'thin', color: { argb: 'FFE0C8A0' } },
    };
}

function addShopHeader(sheet, title) {
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🧵 MAHESH FASHION & TAILORS — Tailoring & Stitching, Ahmedabad, Gujarat';
    titleCell.font = { bold: true, size: 14, color: { argb: MAROON } };
    titleCell.alignment = { horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD } };

    sheet.mergeCells('A2:F2');
    const subCell = sheet.getCell('A2');
    subCell.value = `GSTIN: 24ABCDE1234F1Z5 | Ph: +91-9898989898 | maheshfashion@gmail.com | ${title}`;
    subCell.font = { size: 10, color: { argb: 'FF4A0000' } };
    subCell.alignment = { horizontal: 'center' };

    sheet.addRow([]); // spacer
}

// ═══════════════════════════════════════════════════════════════════════
// 1. MEASUREMENT EXCEL  (4 sheets)
// ═══════════════════════════════════════════════════════════════════════
async function generateMeasurementExcel(customer) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mahesh Fashion & Tailors';
    wb.created = new Date();

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';

    // ── Sheet 1: Customer Details ──
    const s1 = wb.addWorksheet('Customer_Details');
    addShopHeader(s1, 'CUSTOMER DETAILS');
    s1.columns = [
        { key: 'field', width: 22 },
        { key: 'value', width: 28 },
        { key: 'f2', width: 22 },
        { key: 'v2', width: 28 },
    ];
    const custRows = [
        ['Order ID', customer.orderId || 'N/A', 'Order Date', fmt(customer.orderDate)],
        ['Customer Name', customer.name, 'Delivery Date', fmt(customer.deliveryDate)],
        ['Phone', customer.phone, 'Advance (₹)', `₹${customer.advance || 0}`],
        ['Email', customer.email || 'N/A', 'WhatsApp', customer.whatsapp || 'N/A'],
        ['Address', customer.address || 'N/A', 'Gender', customer.gender],
        ['Age Group', customer.ageGroup || 'Adult', 'Style Pref', customer.stylePreference],
        ['Fabric Notes', customer.fabricNotes || 'None', '', ''],
    ];
    custRows.forEach((r, i) => {
        const row = s1.addRow(r);
        row.height = 22;
        row.eachCell((cell, col) => {
            if (col % 2 === 1) applyHeaderStyle(cell); // field columns
            else applyDataStyle(cell, i % 2 === 0);    // value columns
        });
    });

    // ── Sheet 2: Shirt Measurements ──
    const s2 = wb.addWorksheet('Shirt_Measurements');
    addShopHeader(s2, 'SHIRT MEASUREMENTS');
    s2.columns = [
        { header: 'Measurement', key: 'field', width: 24 },
        { header: 'Value (inches)', key: 'value', width: 18 },
        { header: 'Standard Range', key: 'range', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
    ];
    s2.getRow(4).eachCell(applyHeaderStyle);
    const shirt = customer.shirt || {};
    const shirtFields = [
        ['Collar', shirt.collar, '14"–20"'],
        ['Shoulder', shirt.shoulder, '15"–22"'],
        ['Full Chest', shirt.fullChest, '36"–52"'],
        ['Waist', shirt.waist, '30"–44"'],
        ['Seat / Hips', shirt.seat, '36"–48"'],
        ['Sleeve Length', shirt.sleeveLength, '22"–28"'],
        ['Bicep', shirt.bicep, '12"–16"'],
        ['Cuff', shirt.cuff, '8"–10"'],
        ['Full Length', shirt.fullLength, '28"–32"'],
        ['Front Chest Width', shirt.frontChestWidth, '22"–30"'],
        ['Back Length', shirt.backLength, '16"–20"'],
        ['Yoke Width', shirt.yokeWidth, '18"–22"'],
        ['Armhole', shirt.armhole, '14"–18"'],
        ['Half Chest Back', shirt.halfChestBack, 'N/A'],
        ['Neck Depth', shirt.neckDepth, 'N/A'],
    ];
    shirtFields.forEach(([f, v, r], i) => {
        const row = s2.addRow([f, v ? `${v}"` : 'Not measured', r, v ? '✅ Recorded' : '—']);
        row.height = 20;
        row.eachCell((cell, col) => applyDataStyle(cell, i % 2 === 0));
    });

    // ── Sheet 3: Pant Measurements ──
    const s3 = wb.addWorksheet('Pant_Measurements');
    addShopHeader(s3, 'PANT MEASUREMENTS');
    s3.columns = [
        { header: 'Measurement', key: 'field', width: 24 },
        { header: 'Value (inches)', key: 'value', width: 18 },
        { header: 'Standard Range', key: 'range', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
    ];
    s3.getRow(4).eachCell(applyHeaderStyle);
    const pant = customer.pant || {};
    const pantFields = [
        ['Waist', pant.waist, '28"–42"'],
        ['Hips', pant.hips, '36"–48"'],
        ['Thigh', pant.thigh, '22"–28"'],
        ['Inseam', pant.inseam, '28"–34"'],
        ['Outseam', pant.outseam, '38"–44"'],
        ['Front Rise', pant.frontRise, '10"–13"'],
        ['Back Rise', pant.backRise, '14"–17"'],
        ['Knee', pant.knee, '14"–18"'],
        ['Bottom Opening', pant.bottom, '14"–16"'],
        ['Seat Depth', pant.seatDepth, '36"–48"'],
        ['Trouser Length', pant.trouserLength, 'N/A'],
        ['Calf', pant.calf, 'N/A'],
    ];
    pantFields.forEach(([f, v, r], i) => {
        const row = s3.addRow([f, v ? `${v}"` : 'Not measured', r, v ? '✅ Recorded' : '—']);
        row.height = 20;
        row.eachCell((cell, col) => applyDataStyle(cell, i % 2 === 0));
    });

    // ── Sheet 4: Summary ──
    const s4 = wb.addWorksheet('Summary');
    addShopHeader(s4, 'ORDER SUMMARY');
    const summaryData = [
        ['Order ID', customer.orderId],
        ['Customer', customer.name],
        ['Phone', customer.phone],
        ['Order Date', fmt(customer.orderDate)],
        ['Delivery Date', fmt(customer.deliveryDate)],
        ['Advance Paid', `₹${customer.advance || 0}`],
        ['Style Pref', customer.stylePreference],
        ['Fabric Notes', customer.fabricNotes || 'None'],
        ['Shirt Fields', `${Object.values(shirt).filter(Boolean).length} / 15 recorded`],
        ['Pant Fields', `${Object.values(pant).filter(Boolean).length} / 12 recorded`],
        ['Generated At', new Date().toLocaleString('en-IN')],
    ];
    summaryData.forEach(([f, v], i) => {
        const row = s4.addRow([f, v]);
        row.height = 22;
        row.getCell(1).font = { bold: true, color: { argb: MAROON } };
        applyDataStyle(row.getCell(2), i % 2 === 0);
    });
    s4.getColumn(1).width = 22;
    s4.getColumn(2).width = 30;

    const filename = `MaheshFashion_Measurements_${customer.orderId}_${Date.now()}.xlsx`;
    await wb.xlsx.writeFile(path.join(UPLOADS_DIR, filename));
    return filename;
}

// ═══════════════════════════════════════════════════════════════════════
// 2. INVOICE EXCEL  (3 sheets)
// ═══════════════════════════════════════════════════════════════════════
async function generateInvoiceExcel(invoice) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mahesh Fashion & Tailors';
    wb.created = new Date();

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';
    const currency = (n) => `₹${(n || 0).toFixed(2)}`;

    // ── Sheet 1: GST Invoice ──
    const s1 = wb.addWorksheet('GST_Invoice');
    addShopHeader(s1, 'TAX INVOICE');
    s1.getColumn(1).width = 6;
    s1.getColumn(2).width = 28;
    s1.getColumn(3).width = 12;
    s1.getColumn(4).width = 8;
    s1.getColumn(5).width = 12;
    s1.getColumn(6).width = 8;
    s1.getColumn(7).width = 8;
    s1.getColumn(8).width = 12;
    s1.getColumn(9).width = 12;
    s1.getColumn(10).width = 14;

    // Invoice meta
    s1.addRow(['Invoice No:', invoice.invoiceNo, '', 'Date:', fmt(invoice.invoiceDate), '', 'Due Date:', fmt(invoice.dueDate)]);
    s1.addRow(['Customer:', invoice.customerName, '', 'Phone:', invoice.customerPhone || '', '', 'Payment:', invoice.paymentMode]);
    s1.addRow([]);

    // Items header
    const hRow = s1.addRow(['Sr', 'Description', 'HSN', 'Qty', 'Rate(₹)', 'Disc%', 'GST%', 'CGST(₹)', 'SGST(₹)', 'Total(₹)']);
    hRow.height = 22;
    hRow.eachCell(applyHeaderStyle);

    // Item rows
    (invoice.items || []).forEach((item, i) => {
        const row = s1.addRow([
            i + 1, item.description, item.hsn, item.qty,
            currency(item.rate), `${item.discount || 0}%`, `${item.gstRate || 5}%`,
            currency(item.cgst), currency(item.sgst), currency(item.totalAmount),
        ]);
        row.height = 20;
        row.eachCell((cell, col) => applyDataStyle(cell, i % 2 === 0));
    });

    s1.addRow([]);
    const totRows = [
        ['', '', '', '', '', '', '', '', 'Subtotal:', currency(invoice.subtotal)],
        ['', '', '', '', '', '', '', '', 'Discount:', currency(invoice.totalDiscount)],
        ['', '', '', '', '', '', '', '', 'Taxable Amt:', currency(invoice.taxableAmount)],
        ['', '', '', '', '', '', '', '', 'CGST @2.5%:', currency(invoice.totalCgst)],
        ['', '', '', '', '', '', '', '', 'SGST @2.5%:', currency(invoice.totalSgst)],
        ['', '', '', '', '', '', '', '', 'GRAND TOTAL:', currency(invoice.grandTotal)],
        ['', '', '', '', '', '', '', '', 'Amount Paid:', currency(invoice.amountPaid)],
        ['', '', '', '', '', '', '', '', 'Balance Due:', currency(invoice.balance)],
    ];
    totRows.forEach((r, i) => {
        const row = s1.addRow(r);
        row.getCell(9).font = { bold: true, color: { argb: MAROON } };
        row.getCell(10).font = { bold: i >= 5, color: { argb: i === 5 ? MAROON : '00000000' } };
    });

    // ── Sheet 2: Payment Ledger ──
    const s2 = wb.addWorksheet('Payment_Ledger');
    addShopHeader(s2, 'PAYMENT LEDGER');
    s2.columns = [
        { header: 'Invoice No', key: 'inv', width: 16 },
        { header: 'Customer', key: 'cust', width: 24 },
        { header: 'Invoice Date', key: 'date', width: 16 },
        { header: 'Grand Total', key: 'total', width: 16 },
        { header: 'Amount Paid', key: 'paid', width: 16 },
        { header: 'Balance Due', key: 'bal', width: 16 },
        { header: 'Payment Mode', key: 'mode', width: 16 },
    ];
    s2.getRow(4).eachCell(applyHeaderStyle);
    const ledgerRow = s2.addRow([
        invoice.invoiceNo, invoice.customerName, fmt(invoice.invoiceDate),
        currency(invoice.grandTotal), currency(invoice.amountPaid), currency(invoice.balance), invoice.paymentMode,
    ]);
    ledgerRow.height = 22;
    ledgerRow.eachCell((cell) => applyDataStyle(cell, false));

    // ── Sheet 3: Tax Report ──
    const s3 = wb.addWorksheet('Tax_Report');
    addShopHeader(s3, 'GST TAX REPORT');
    s3.columns = [
        { header: 'Description', key: 'desc', width: 28 },
        { header: 'HSN Code', key: 'hsn', width: 14 },
        { header: 'Taxable Amt', key: 'taxable', width: 18 },
        { header: 'CGST @2.5%', key: 'cgst', width: 16 },
        { header: 'SGST @2.5%', key: 'sgst', width: 16 },
        { header: 'Total Tax', key: 'tax', width: 16 },
    ];
    s3.getRow(4).eachCell(applyHeaderStyle);
    (invoice.items || []).forEach((item, i) => {
        const gross = item.qty * item.rate;
        const disc = (gross * (item.discount || 0)) / 100;
        const taxable = gross - disc;
        const row = s3.addRow([
            item.description, item.hsn, currency(taxable),
            currency(item.cgst), currency(item.sgst), currency((item.cgst || 0) + (item.sgst || 0)),
        ]);
        row.height = 20;
        row.eachCell((cell) => applyDataStyle(cell, i % 2 === 0));
    });
    const totRow = s3.addRow(['TOTALS', '', currency(invoice.taxableAmount), currency(invoice.totalCgst), currency(invoice.totalSgst), currency((invoice.totalCgst || 0) + (invoice.totalSgst || 0))]);
    totRow.eachCell((cell) => { cell.font = { bold: true, color: { argb: WHITE } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MAROON } }; });

    const filename = `Invoice_${invoice.invoiceNo}_${Date.now()}.xlsx`;
    await wb.xlsx.writeFile(path.join(UPLOADS_DIR, filename));
    return filename;
}

// ═══════════════════════════════════════════════════════════════════════
// 3. ORDERS EXCEL  (Orders List)
// ═══════════════════════════════════════════════════════════════════════
async function generateOrdersExcel(orders, label) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mahesh Fashion & Tailors';
    wb.created = new Date();

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';
    const currency = (n) => `₹${(n || 0).toFixed(2)}`;

    const s1 = wb.addWorksheet('Orders');
    addShopHeader(s1, `ORDERS REPORT — ${new Date().toLocaleDateString('en-IN')}`);
    s1.columns = [
        { header: 'Order ID', key: 'id', width: 12 },
        { header: 'Customer', key: 'customer', width: 22 },
        { header: 'Phone', key: 'phone', width: 14 },
        { header: 'Items', key: 'items', width: 24 },
        { header: 'Total (₹)', key: 'total', width: 14 },
        { header: 'Paid (₹)', key: 'paid', width: 12 },
        { header: 'Balance', key: 'balance', width: 12 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Order Date', key: 'orderDate', width: 14 },
        { header: 'Delivery Date', key: 'delDate', width: 14 },
        { header: 'History', key: 'history', width: 28 },
    ];
    s1.getRow(4).eachCell(applyHeaderStyle);

    orders.forEach((order, i) => {
        const custName = order.customer?.name || 'N/A';
        const custPhone = order.customer?.phone || 'N/A';
        const itemsStr = (order.items || []).map((it) => it.description).join(', ') || 'N/A';
        const historyStr = (order.statusHistory || []).map((h) => `${h.status}(${fmt(h.changedAt)})`).join(' → ');
        const row = s1.addRow([
            order.orderId, custName, custPhone, itemsStr,
            currency(order.totalAmount), currency(order.amountPaid), currency(order.balance),
            order.status, fmt(order.orderDate), fmt(order.deliveryDate), historyStr,
        ]);
        row.height = 20;
        row.eachCell((cell) => applyDataStyle(cell, i % 2 === 0));
    });

    const filename = `Orders_${label}_${Date.now()}.xlsx`;
    await wb.xlsx.writeFile(path.join(UPLOADS_DIR, filename));
    return filename;
}

// ═══════════════════════════════════════════════════════════════════════
// 4. HISTORY EXCEL  (Monthly Archive)
// ═══════════════════════════════════════════════════════════════════════
async function generateHistoryExcel(orders, month) {
    return generateOrdersExcel(orders, `History_${month}`);
}

// ═══════════════════════════════════════════════════════════════════════
// 5. MASTER EXCEL DATABASE APPEND
// ═══════════════════════════════════════════════════════════════════════
async function appendToMasterExcel(data, type) {
    const masterPath = path.join(UPLOADS_DIR, 'MaheshFashion_Master_Database.xlsx');
    const wb = new ExcelJS.Workbook();

    if (fs.existsSync(masterPath)) {
        await wb.xlsx.readFile(masterPath);
    } else {
        wb.creator = 'Mahesh Fashion & Tailors';
        const invSheet = wb.addWorksheet('Invoices');
        invSheet.addRow(['Date', 'Invoice No', 'Customer Name', 'Phone', 'Total Amount', 'Amount Paid', 'Balance', 'Items']);
        invSheet.getRow(1).eachCell(applyHeaderStyle);

        const measSheet = wb.addWorksheet('Measurements');
        measSheet.addRow([
            'Date', 'Order ID', 'Customer Name', 'Phone', 'Advance',
            'Shirt Collar', 'Shirt Shoulder', 'Shirt Chest', 'Shirt Waist', 'Shirt Length',
            'Pant Waist', 'Pant Hips', 'Pant Inseam', 'Pant Length'
        ]);
        measSheet.getRow(1).eachCell(applyHeaderStyle);
    }

    if (type === 'invoice') {
        let invSheet = wb.getWorksheet('Invoices');
        if (!invSheet) {
            invSheet = wb.addWorksheet('Invoices');
            invSheet.addRow(['Date', 'Invoice No', 'Customer Name', 'Phone', 'Total Amount', 'Amount Paid', 'Balance', 'Items']).eachCell(applyHeaderStyle);
        }
        const itemsStr = (data.items || []).map(i => i.description).join(', ');
        const row = invSheet.addRow([
            new Date().toLocaleDateString('en-IN'),
            data.invoiceNo || 'N/A',
            data.customerName || 'N/A',
            data.customerPhone || 'N/A',
            data.grandTotal || 0,
            data.amountPaid || 0,
            (data.grandTotal || 0) - (data.amountPaid || 0),
            itemsStr
        ]);
        row.eachCell((c) => applyDataStyle(c, invSheet.rowCount % 2 === 0));
    } else if (type === 'measurement') {
        let measSheet = wb.getWorksheet('Measurements');
        if (!measSheet) {
            measSheet = wb.addWorksheet('Measurements');
            measSheet.addRow([
                'Date', 'Order ID', 'Customer Name', 'Phone', 'Advance',
                'Shirt Collar', 'Shirt Shoulder', 'Shirt Chest', 'Shirt Waist', 'Shirt Length',
                'Pant Waist', 'Pant Hips', 'Pant Inseam', 'Pant Length'
            ]).eachCell(applyHeaderStyle);
        }
        const shirt = data.shirt || {};
        const pant = data.pant || {};
        const row = measSheet.addRow([
            new Date().toLocaleDateString('en-IN'),
            data.orderId || 'N/A',
            data.name || 'N/A',
            data.phone || 'N/A',
            data.advance || 0,
            shirt.collar || '', shirt.shoulder || '', shirt.fullChest || '', shirt.waist || '', shirt.fullLength || '',
            pant.waist || '', pant.hips || '', pant.inseam || '', pant.trouserLength || ''
        ]);
        row.eachCell((c) => applyDataStyle(c, measSheet.rowCount % 2 === 0));
    }

    await wb.xlsx.writeFile(masterPath);
}

module.exports = {
    generateMeasurementExcel,
    generateInvoiceExcel,
    generateOrdersExcel,
    generateHistoryExcel,
    appendToMasterExcel
};

