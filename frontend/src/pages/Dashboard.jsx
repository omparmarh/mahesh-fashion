import { useState, useEffect } from 'react';
import api from '../api';
import {
    UsersIcon, ClipboardDocumentCheckIcon, CurrencyRupeeIcon, ShoppingBagIcon
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data } = await api.get('/dashboard');
                setStats(data);
            } catch (err) {
                console.error('Failed to load dashboard', err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
    if (!stats) return <div className="text-center py-10 text-red-500">Error loading data.</div>;

    const cards = [
        { title: "Today's Orders", value: stats.todayOrders, icon: ShoppingBagIcon, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Pending & Stitching", value: stats.pendingOrders + stats.stitchingOrders, icon: ClipboardDocumentCheckIcon, color: "text-amber-600", bg: "bg-amber-100" },
        { title: "Monthly Revenue", value: `₹${stats.monthRevenue.toLocaleString()}`, icon: CurrencyRupeeIcon, color: "text-green-600", bg: "bg-green-100" },
        { title: "Total Customers", value: stats.totalCustomers, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    const chartData = [...stats.monthlyStats].reverse();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4 border-gray-200">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                        <div className={`p-4 rounded-full ${card.bg} mr-4`}>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Trend (Last 6 Months)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Bar dataKey="revenue" fill="#8B0000" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Deliveries */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Deliveries</h2>
                    {stats.upcomingDeliveries.length === 0 ? (
                        <p className="text-gray-500 text-sm">No upcoming deliveries in the next 7 days.</p>
                    ) : (
                        <ul className="space-y-4">
                            {stats.upcomingDeliveries.map(order => (
                                <li key={order.OrderID} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{order.customer?.Name}</p>
                                        <p className="text-xs text-mahesh-maroon bg-red-50 inline-block px-2 py-0.5 rounded mt-1 font-medium">{order.OrderID}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">{new Date(order.DeliveryDate).toLocaleDateString('en-GB')}</p>
                                        <p className="text-xs text-gray-500 mt-1">{order.Status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
