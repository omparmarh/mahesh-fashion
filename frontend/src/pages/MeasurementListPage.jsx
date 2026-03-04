import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function MeasurementListPage() {
    const [measurements, setMeasurements] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/measurements/list')
            .then(({ data }) => {
                setMeasurements(data.measurements);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filtered = measurements.filter(m =>
        m.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        m.customerPhone?.includes(search) ||
        m.OrderID?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-l-4 pl-4 border-mahesh-maroon">Measurements List</h1>
                    <p className="text-gray-500 text-sm mt-1 ml-5">View all detailed measurements</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by Name/Phone/Order ID..."
                        className="input-field w-64 md:w-80 shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Link to="/measurements/new" className="btn-primary flex items-center shadow-md">
                        + New Measurement
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4" rowSpan="2">Order ID</th>
                            <th className="p-4" rowSpan="2">Customer</th>
                            <th className="p-4" rowSpan="2">Phone</th>
                            <th className="p-2 border-l border-r text-center bg-gray-100 text-mahesh-maroon font-bold" colSpan="8">TOP (SHIRT)</th>
                            <th className="p-2 border-r text-center bg-gray-100 text-mahesh-gold font-bold" colSpan="7">BOTTOM (PANT)</th>
                        </tr>
                        <tr>
                            <th className="p-2 border-l">C</th>
                            <th className="p-2">F</th>
                            <th className="p-2">L</th>
                            <th className="p-2">So</th>
                            <th className="p-2">S</th>
                            <th className="p-2">Ku</th>
                            <th className="p-2">Ko</th>
                            <th className="p-2 border-r">K</th>

                            <th className="p-2 border-l border-gray-300">W</th>
                            <th className="p-2">H</th>
                            <th className="p-2">L</th>
                            <th className="p-2">T</th>
                            <th className="p-2">K</th>
                            <th className="p-2">B</th>
                            <th className="p-2">R</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="18" className="p-8 text-center text-gray-500">Loading measurements...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="18" className="p-8 text-center text-gray-500">No measurements found.</td></tr>
                        ) : (
                            filtered.map((m) => (
                                <tr key={m.OrderID} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-gray-800">{m.OrderID}</td>
                                    <td className="p-4 font-medium text-gray-900">{m.customerName}</td>
                                    <td className="p-4 text-gray-500">{m.customerPhone}</td>

                                    {/* Top */}
                                    <td className="p-2 border-l text-center font-mono">
                                        {[m.Top_C1, m.Top_C2, m.Top_C3].filter(Boolean).join(', ')}
                                    </td>
                                    <td className="p-2 text-center font-mono">{m.Top_F}</td>
                                    <td className="p-2 text-center font-mono">{m.Top_L}</td>
                                    <td className="p-2 text-center font-mono">{m.Top_So}</td>
                                    <td className="p-2 text-center font-mono">
                                        {[m.Top_S1, m.Top_S2].filter(Boolean).join(', ')}
                                    </td>
                                    <td className="p-2 text-center font-mono">
                                        {[m.Top_Ku1, m.Top_Ku2].filter(Boolean).join(', ')}
                                    </td>
                                    <td className="p-2 text-center font-mono">
                                        {[m.Top_Ko1, m.Top_Ko2].filter(Boolean).join(', ')}
                                    </td>
                                    <td className="p-2 border-r text-center font-mono">{m.Top_K}</td>

                                    {/* Bottom */}
                                    <td className="p-2 text-center font-mono border-l border-gray-200">{m.Bot_W}</td>
                                    <td className="p-2 text-center font-mono">{m.Bot_H}</td>
                                    <td className="p-2 text-center font-mono">
                                        {[m.Bot_L1, m.Bot_L2].filter(Boolean).join(', ')}
                                    </td>
                                    <td className="p-2 text-center font-mono">{m.Bot_T}</td>
                                    <td className="p-2 text-center font-mono">{m.Bot_K}</td>
                                    <td className="p-2 text-center font-mono">{m.Bot_B}</td>
                                    <td className="p-2 text-center font-mono border-r border-gray-200">{m.Bot_R}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
