import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function MeasurementListPage() {
    const [measurements, setMeasurements] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingM, setEditingM] = useState(null);  // measurement being edited
    const [saving, setSaving] = useState(false);

    const fetchMeasurements = () => {
        api.get('/measurements/list')
            .then(({ data }) => {
                setMeasurements(data.measurements);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => { fetchMeasurements(); }, []);

    const filtered = measurements.filter(m =>
        m.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        m.customerPhone?.includes(search) ||
        m.OrderID?.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (m) => {
        // Make a deep copy of the measurement row into edit state
        setEditingM({ ...m });
    };

    const handleEditChange = (field, value) => {
        setEditingM(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/measurements/update/${editingM.OrderID}`, {
                Top_C1: editingM.Top_C1, Top_C2: editingM.Top_C2, Top_C3: editingM.Top_C3,
                Top_F: editingM.Top_F, Top_L: editingM.Top_L, Top_So: editingM.Top_So,
                Top_S1: editingM.Top_S1, Top_S2: editingM.Top_S2,
                Top_Ku1: editingM.Top_Ku1, Top_Ku2: editingM.Top_Ku2,
                Top_Ko1: editingM.Top_Ko1, Top_Ko2: editingM.Top_Ko2,
                Top_K: editingM.Top_K, Top_Notes: editingM.Top_Notes,
                Bot_W: editingM.Bot_W, Bot_H: editingM.Bot_H,
                Bot_L1: editingM.Bot_L1, Bot_L2: editingM.Bot_L2,
                Bot_T: editingM.Bot_T, Bot_K: editingM.Bot_K,
                Bot_B: editingM.Bot_B, Bot_R: editingM.Bot_R,
                Bot_Notes: editingM.Bot_Notes,
                DeliveryDate: editingM.DeliveryDate,
            });
            setEditingM(null);
            fetchMeasurements(); // refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (orderID) => {
        if (!window.confirm(`Are you sure you want to delete measurement for Order ${orderID}?`)) return;
        try {
            await api.delete(`/measurements/delete/${orderID}`);
            fetchMeasurements();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete measurement');
        }
    };

    // Reusable small input for the modal
    const mInput = (field, label, span = 1) => (
        <div className={span > 1 ? `col-span-${span}` : ''}>
            {label && <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>}
            <input
                type="text"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center outline-none focus:ring-1 focus:ring-red-700 focus:border-red-700"
                value={editingM?.[field] || ''}
                onChange={e => handleEditChange(field, e.target.value)}
            />
        </div>
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
                            <th className="p-4" rowSpan="2">Actions</th>
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
                            <tr><td colSpan="19" className="p-8 text-center text-gray-500">Loading measurements...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="19" className="p-8 text-center text-gray-500">No measurements found.</td></tr>
                        ) : (
                            filtered.map((m) => (
                                <tr key={m.OrderID} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-gray-800 text-xs">{m.OrderID}</td>
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

                                    {/* Actions */}
                                    <td className="p-3 text-center space-x-2">
                                        <button
                                            onClick={() => openEdit(m)}
                                            className="text-mahesh-maroon hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            title="Edit Measurements"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(m.OrderID)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            title="Delete Measurement"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── EDIT MODAL ───────────────────────────────────────────── */}
            {editingM && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Measurements</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    <span className="font-semibold text-mahesh-maroon">{editingM.OrderID}</span>
                                    {' — '}{editingM.customerName} · {editingM.customerPhone}
                                </p>
                            </div>
                            <button onClick={() => setEditingM(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Delivery Date */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Delivery Date</label>
                                <input
                                    type="date"
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-700"
                                    value={editingM.DeliveryDate ? editingM.DeliveryDate.split('T')[0] : ''}
                                    onChange={e => handleEditChange('DeliveryDate', e.target.value)}
                                />
                            </div>

                            {/* SHIRT Section */}
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <div className="bg-mahesh-maroon px-4 py-2">
                                    <h3 className="text-white font-bold text-sm tracking-wide">SHIRT MEASUREMENTS</h3>
                                </div>
                                <div className="p-4 grid grid-cols-4 gap-3">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">C (Chest) — C1, C2, C3</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {mInput('Top_C1', 'C1')}
                                            {mInput('Top_C2', 'C2')}
                                            {mInput('Top_C3', 'C3')}
                                        </div>
                                    </div>
                                    {mInput('Top_F', 'F (Front)')}
                                    {mInput('Top_L', 'L (Length)')}
                                    {mInput('Top_So', 'So (Shoulder)')}
                                    {mInput('Top_K', 'K')}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">S (Sleeve) — S1, S2</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {mInput('Top_S1', 'S1')}
                                            {mInput('Top_S2', 'S2')}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Ku — Ku1, Ku2</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {mInput('Top_Ku1', 'Ku1')}
                                            {mInput('Top_Ku2', 'Ku2')}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Ko — Ko1, Ko2</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {mInput('Top_Ko1', 'Ko1')}
                                            {mInput('Top_Ko2', 'Ko2')}
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Shirt Notes</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-red-700 resize-none"
                                            rows={2}
                                            value={editingM.Top_Notes || ''}
                                            onChange={e => handleEditChange('Top_Notes', e.target.value)}
                                            placeholder="e.g. બ્લૂ શર્ટ, 2 chipati sirava"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PANT Section */}
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <div className="bg-amber-500 px-4 py-2">
                                    <h3 className="text-white font-bold text-sm tracking-wide">PANT MEASUREMENTS</h3>
                                </div>
                                <div className="p-4 grid grid-cols-4 gap-3">
                                    {mInput('Bot_W', 'W (Waist)')}
                                    {mInput('Bot_H', 'H (Hip)')}
                                    {mInput('Bot_T', 'T (Thigh)')}
                                    {mInput('Bot_K', 'K (Knee)')}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">L (Length) — L1, L2</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {mInput('Bot_L1', 'L1')}
                                            {mInput('Bot_L2', 'L2')}
                                        </div>
                                    </div>
                                    {mInput('Bot_B', 'B (Bottom)')}
                                    {mInput('Bot_R', 'R (Rise)')}
                                    <div className="col-span-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Pant Notes</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                                            rows={2}
                                            value={editingM.Bot_Notes || ''}
                                            onChange={e => handleEditChange('Bot_Notes', e.target.value)}
                                            placeholder="e.g. લોન્ગ બેલ્ટ, 1 પોકેટ"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setEditingM(null)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-mahesh-maroon hover:bg-red-900 text-white font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-colors disabled:opacity-60"
                            >
                                <CheckIcon className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Measurements'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
