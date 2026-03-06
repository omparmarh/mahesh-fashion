import { useState, useEffect } from 'react';
import api from '../api';
import { ArrowDownTrayIcon, HandThumbUpIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchHistory = async (query = '') => {
        try {
            const { data } = await api.get('/history', { params: { search: query } });
            setHistory(data.history);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(search);
    }, [search]);

    const handleDownload = async () => {
        try {
            const resp = await api.get('/download/history', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([resp.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'History.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download history');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this historical order? This action cannot be undone.')) {
            try {
                await api.delete(`/history/${id}`);
                setHistory(history.filter(item => item.OrderID !== id));
            } catch (err) {
                alert('Failed to delete history entry');
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 rounded-t-xl gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <p className="text-gray-500 text-sm mt-1">Archive of all delivered orders</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-maroon-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => fetchHistory(search)} className="btn-secondary flex items-center shadow-sm whitespace-nowrap">
                        ↻ Refresh
                    </button>
                    <button onClick={handleDownload} className="btn-secondary flex items-center shadow-sm whitespace-nowrap">
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Download Excel
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white text-gray-500 text-sm uppercase tracking-wide border-b">
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Total</th>
                            <th className="px-6 py-4 font-medium">Delivery Date</th>
                            <th className="px-6 py-4 font-medium">Status History</th>
                            <th className="px-6 py-4 font-medium text-center">Feedback</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && history.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading history...</td></tr>
                        ) : history.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center">
                                    <div className="text-gray-400 text-4xl mb-3">📦</div>
                                    <p className="text-gray-600 font-medium">No delivered orders yet</p>
                                    <p className="text-gray-400 text-sm mt-1">Orders will appear here once you mark them as "Delivered" on the Orders List page</p>
                                </td>
                            </tr>
                        ) : history.map(item => (
                            <tr key={item.OrderID} className="hover:bg-gray-50 align-top">
                                <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.OrderID}</td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-800">{item.CustomerName}</p>
                                    <p className="text-xs text-gray-500">{item.Phone}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono font-bold text-green-700">₹{item.Total}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.DeliveryDate).toLocaleDateString('en-GB')}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        {item.StatusChanges}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-gray-400 italic text-xs">{item.Feedback || 'No feedback'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(item.OrderID)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                        title="Delete Order History"
                                    >
                                        <TrashIcon className="w-5 h-5 mx-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

