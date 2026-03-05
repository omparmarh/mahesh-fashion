import { useState, useEffect } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, PrinterIcon, ArrowDownTrayIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

export default function BillingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState(() => {
        const saved = localStorage.getItem('billingDraft');
        if (saved && !id) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {
            customerName: '', customerPhone: '', paymentMode: 'Cash',
            items: [{ description: 'Custom Tailoring - Shirt & Pant', hsn: '620590', qty: 1, rate: 0, discount: 0, gstRate: 5 }],
            amountPaid: 0, notes: ''
        };
    });

    useEffect(() => {
        if (!id) localStorage.setItem('billingDraft', JSON.stringify(invoice));
    }, [invoice, id]);

    useEffect(() => {
        if (id) {
            api.get(`/orders/${id}`).then(({ data }) => {
                if (data.customer) {
                    setInvoice(prev => ({
                        ...prev,
                        customerName: data.customer.Name,
                        customerPhone: data.customer.Phone,
                        items: data.items?.length > 0 ? data.items.map(i => ({ ...i, discount: 0, gstRate: 5 })) : prev.items,
                        amountPaid: data.amountPaid || 0,
                        orderRef: id
                    }));
                }
            });
        }
    }, [id]);

    const calcTotals = () => {
        let sub = 0, dist = 0, tax = 0, cgst = 0, sgst = 0, grand = 0;
        invoice.items.forEach(item => {
            const gross = (item.qty || 0) * (item.rate || 0);
            const rowDist = (gross * (item.discount || 0)) / 100;
            const rowTaxable = gross - rowDist;
            const rowCgst = parseFloat(((rowTaxable * (item.gstRate || 5)) / 200).toFixed(2));
            const rowSgst = rowCgst;
            sub += gross;
            dist += rowDist;
            tax += rowTaxable;
            cgst += rowCgst;
            sgst += rowSgst;
        });
        grand = tax + cgst + sgst;
        return { sub, dist, tax, cgst, sgst, grand };
    };

    const totals = calcTotals();

    const handleAddItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { description: '', hsn: '620590', qty: 1, rate: 0, discount: 0, gstRate: 5 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...invoice.items];
        newItems.splice(index, 1);
        setInvoice({ ...invoice, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = value;
        setInvoice({ ...invoice, items: newItems });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/billing', { ...invoice, customer: invoice.orderRef });

            if (invoice.orderRef) {
                await api.put(`/orders/${invoice.orderRef}`, {
                    amountPaid: invoice.amountPaid,
                    totalAmount: totals.grand,
                    status: 'Ready'
                });
            }

            if (!id) localStorage.removeItem('billingDraft');

            alert('Invoice saved successfully!');
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center border-b pb-4 border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-l-4 pl-4 border-mahesh-maroon">GST Invoice Generator</h1>
                    <p className="text-gray-500 text-sm mt-1 ml-5">Create bill and auto-export formatted Excel</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Invoice Header */}
                <div className="bg-mahesh-maroon p-8 text-white grid grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain rounded-lg bg-white p-1 border border-mahesh-gold mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-mahesh-gold tracking-widest leading-tight">MAHESH FASHION<br />&amp; TAILORS</h2>
                            <p className="text-sm mt-1 text-gray-200">Tailoring & Stitching</p>
                            <p className="text-xs mt-2 text-red-200 font-mono">GSTIN: 24ABCDE1234F1Z5</p>
                            <p className="text-xs text-red-200">Phone: +91-9898989898</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-300 uppercase tracking-widest mb-4">Tax Invoice</p>
                        <div className="flex justify-end items-center gap-4 text-sm mt-2">
                            <span className="text-red-200">Date:</span>
                            <span className="font-bold">{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex justify-end items-center gap-4 text-sm mt-2">
                            <span className="text-red-200">Due Date:</span>
                            <span className="font-bold">{new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Billed To (Customer)</label>
                            <input type="text" className="input-field border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:ring-0 focus:border-mahesh-maroon" placeholder="Customer Name" value={invoice.customerName} onChange={e => setInvoice({ ...invoice, customerName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                            <input type="text" className="input-field border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:ring-0 focus:border-mahesh-maroon" placeholder="Customer Phone" value={invoice.customerPhone} onChange={e => setInvoice({ ...invoice, customerPhone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Mode</label>
                            <select className="input-field border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:ring-0 focus:border-mahesh-maroon" value={invoice.paymentMode} onChange={e => setInvoice({ ...invoice, paymentMode: e.target.value })}>
                                <option>Cash</option><option>UPI</option><option>Card</option>
                            </select>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-3 w-10 text-center">#</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 w-20">HSN</th>
                                    <th className="p-3 w-16">Qty</th>
                                    <th className="p-3 w-28">Rate (₹)</th>
                                    <th className="p-3 w-20">Disc%</th>
                                    <th className="p-3 w-20">GST%</th>
                                    <th className="p-3 w-28 text-right">Total (₹)</th>
                                    <th className="p-3 w-12 text-center">Del</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoice.items.map((item, i) => {
                                    const itemGross = (item.qty || 0) * (item.rate || 0);
                                    const itemDist = (itemGross * (item.discount || 0)) / 100;
                                    const itemTaxable = itemGross - itemDist;
                                    const itemTax = (itemTaxable * (item.gstRate || 0)) / 100;
                                    const itemTotal = itemTaxable + itemTax;
                                    return (
                                        <tr key={i} className="hover:bg-gray-50 group">
                                            <td className="p-2 text-center text-gray-400 font-mono">{i + 1}</td>
                                            <td className="p-2"><input type="text" className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-1 py-1" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} placeholder="Item description..." /></td>
                                            <td className="p-2"><input type="text" className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-1 py-1 text-gray-500 font-mono text-xs" value={item.hsn} onChange={e => handleItemChange(i, 'hsn', e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-1 py-1" value={item.qty} onChange={e => handleItemChange(i, 'qty', Number(e.target.value))} /></td>
                                            <td className="p-2"><input type="number" className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-1 py-1 text-right" value={item.rate} onChange={e => handleItemChange(i, 'rate', Number(e.target.value))} /></td>
                                            <td className="p-2"><input type="number" className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-1 py-1 text-right" value={item.discount} onChange={e => handleItemChange(i, 'discount', Number(e.target.value))} /></td>
                                            <td className="p-2">
                                                <select className="w-full bg-transparent border-0 border-b border-transparent focus:border-mahesh-maroon outline-none px-0 py-1" value={item.gstRate} onChange={e => handleItemChange(i, 'gstRate', Number(e.target.value))}>
                                                    <option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-right font-medium text-gray-800">
                                                {itemTotal.toFixed(2)}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleRemoveItem(i)} className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="bg-gray-50 border-t p-3">
                            <button onClick={handleAddItem} className="text-sm font-medium text-mahesh-maroon hover:text-red-800 flex items-center transition-colors">
                                <PlusIcon className="w-4 h-4 mr-1" /> Add Item
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between pt-8 border-t border-gray-100">
                        <div className="w-full md:w-1/2 pr-0 md:pr-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Paid (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="number" className="input-field pl-10 text-lg font-bold text-green-700 bg-green-50" value={invoice.amountPaid} onChange={e => setInvoice({ ...invoice, amountPaid: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Notes</label>
                                <textarea className="input-field h-24 resize-none" placeholder="Thank you for your business!" value={invoice.notes} onChange={e => setInvoice({ ...invoice, notes: e.target.value })}></textarea>
                            </div>
                        </div>

                        <div className="w-full md:w-5/12 bg-gray-50 rounded-xl p-6 border border-gray-200 mt-6 md:mt-0 shadow-inner">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₹{totals.sub.toFixed(2)}</span>
                                </div>
                                {totals.dist > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Discount</span>
                                        <span className="font-mono">-₹{totals.dist.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium text-gray-800 pt-2 border-t border-dashed border-gray-300">
                                    <span>Taxable Amount</span>
                                    <span className="font-mono">₹{totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>CGST</span>
                                    <span className="font-mono">+₹{totals.cgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>SGST</span>
                                    <span className="font-mono">+₹{totals.sgst.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-lg font-bold text-mahesh-maroon border-t border-gray-300 pt-4 mt-4">
                                    <span>GRAND TOTAL</span>
                                    <span className="font-mono text-2xl">₹{totals.grand.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm font-bold text-gray-700 pt-2 mt-2">
                                    <span>Balance Due</span>
                                    <span className="font-mono text-lg text-red-600">
                                        ₹{Math.max(0, totals.grand - invoice.amountPaid).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8 print:hidden">
                        <button type="button" onClick={() => window.print()} className="btn-secondary flex items-center px-6">
                            <PrinterIcon className="w-5 h-5 mr-2" /> Print Preview
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !invoice.customerName}
                            className="btn-primary flex items-center px-8 shadow-md py-3 text-lg"
                        >
                            <ArrowDownTrayIcon className="w-6 h-6 mr-2 animate-bounce" />
                            {loading ? 'Processing...' : 'Generate Invoice & Excel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
