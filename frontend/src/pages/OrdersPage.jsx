import { useState, useEffect } from 'react';
import api from '../api';
import { PencilSquareIcon, ArrowDownTrayIcon, ChatBubbleLeftEllipsisIcon, EyeIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null);

    const statuses = ['All', 'Received', 'Cutting', 'Stitching', 'Ready', 'Delivered'];

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders', { params: { status: statusFilter, search } });
            setOrders(data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, statusFilter]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: newStatus });

            // Auto-notify on Ready
            if (newStatus === 'Ready') {
                const order = orders.find(o => o.OrderID === id);
                if (order?.customer?.Phone) {
                    const msg = encodeURIComponent("tamaro order ready thai gayo chhe mahesh fashion par aavi ne collect karo . Thank you ");
                    window.open(`https://wa.me/91${order.customer.Phone}?text=${msg}`, '_blank');
                }
            }

            fetchOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleExport = async () => {
        try {
            const resp = await api.get('/orders/export/excel', {
                params: { status: statusFilter },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([resp.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Orders_${statusFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to export Excel');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            try {
                await api.delete(`/orders/${id}`);
                setOrders(orders.filter(item => item.OrderID !== id));
            } catch (err) {
                alert('Failed to delete order');
            }
        }
    };

    const statusColors = {
        'Received': 'bg-gray-100 text-gray-800',
        'Cutting': 'bg-blue-100 text-blue-800',
        'Stitching': 'bg-amber-100 text-amber-800',
        'Ready': 'bg-purple-100 text-purple-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all production and tailoring statuses</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Search Order ID..."
                        className="input-field w-auto sm:w-64"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button onClick={handleExport} className="btn-secondary flex items-center shadow-sm">
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50 overflow-x-auto">
                <ul className="flex space-x-2 w-max">
                    {statuses.map(s => (
                        <li key={s}>
                            <button
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === s
                                    ? 'bg-mahesh-maroon text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                    }`}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Items & Rate</th>
                            <th className="px-6 py-4 font-medium">Delivery</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders found matching criteria.</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.OrderID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{order.OrderID}</span>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(order.Created).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <p className="font-medium text-gray-800">{order.customer?.Name}</p>
                                    <p className="text-gray-500">{order.customer?.Phone}</p>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <p className="text-gray-800">{order.Items}</p>
                                    <p className="font-medium text-mahesh-maroon font-mono mt-1">₹{order.Total}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-800">
                                        {order.DeliveryDate ? new Date(order.DeliveryDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.Status}
                                        onChange={(e) => updateStatus(order.OrderID, e.target.value)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-mahesh-maroon focus:ring-opacity-50 appearance-none bg-no-repeat bg-right ${statusColors[order.Status] || 'bg-gray-100 text-gray-800'}`}
                                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundSize: '1em', backgroundPosition: 'calc(100% - 8px) center', paddingRight: '28px' }}
                                    >
                                        <option value="Received">Received</option>
                                        <option value="Cutting">Cutting</option>
                                        <option value="Stitching">Stitching</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end space-x-3">
                                    {order.customer?.Phone && (
                                        <a href={`https://wa.me/91${order.customer.Phone}?text=Hello ${order.customer.Name}, your order ${order.OrderID} status is: ${order.Status}.`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-800 transition-colors" title="WhatsApp Update">
                                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                        </a>
                                    )}

                                    {order.measurement && (
                                        <button onClick={() => setSelectedMeasurement(order.measurement)} className="text-purple-600 hover:text-purple-800 transition-colors" title="View Measurements">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <Link to={`/billing/${order.OrderID}`} title="Create/Edit Bill" className="text-gray-600 hover:text-mahesh-maroon transition-colors">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(order.OrderID)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete Order"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedMeasurement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white shadow-sm z-10">
                            <h2 className="text-xl font-bold text-gray-900">Measurement Details</h2>
                            <button onClick={() => setSelectedMeasurement(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-md font-bold text-mahesh-maroon border-b pb-2 mb-4">Top (SHIRT)</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="flex"><span className="font-bold w-12">C:</span><span>{selectedMeasurement.Top_C1}, {selectedMeasurement.Top_C2}, {selectedMeasurement.Top_C3}</span></div>
                                    <div className="flex"><span className="font-bold w-12">F:</span><span>{selectedMeasurement.Top_F}</span></div>
                                    <div className="flex"><span className="font-bold w-12">L:</span><span>{selectedMeasurement.Top_L}</span></div>
                                    <div className="flex"><span className="font-bold w-12">So:</span><span>{selectedMeasurement.Top_So}</span></div>
                                    <div className="flex"><span className="font-bold w-12">S:</span><span>{selectedMeasurement.Top_S1}, {selectedMeasurement.Top_S2}</span></div>
                                    <div className="flex"><span className="font-bold w-12">Ku:</span><span>{selectedMeasurement.Top_Ku1}, {selectedMeasurement.Top_Ku2}</span></div>
                                    <div className="flex"><span className="font-bold w-12">Ko:</span><span>{selectedMeasurement.Top_Ko1}, {selectedMeasurement.Top_Ko2}</span></div>
                                    <div className="flex"><span className="font-bold w-12">K:</span><span>{selectedMeasurement.Top_K}</span></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-mahesh-gold border-b pb-2 mb-4">Bottom (PANT)</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="flex"><span className="font-bold w-12">W:</span><span>{selectedMeasurement.Bot_W}</span></div>
                                    <div className="flex"><span className="font-bold w-12">H:</span><span>{selectedMeasurement.Bot_H}</span></div>
                                    <div className="flex"><span className="font-bold w-12">L:</span><span>{selectedMeasurement.Bot_L1}, {selectedMeasurement.Bot_L2}</span></div>
                                    <div className="flex"><span className="font-bold w-12">T:</span><span>{selectedMeasurement.Bot_T}</span></div>
                                    <div className="flex"><span className="font-bold w-12">K:</span><span>{selectedMeasurement.Bot_K}</span></div>
                                    <div className="flex"><span className="font-bold w-12">B:</span><span>{selectedMeasurement.Bot_B}</span></div>
                                    <div className="flex"><span className="font-bold w-12">R:</span><span>{selectedMeasurement.Bot_R}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
