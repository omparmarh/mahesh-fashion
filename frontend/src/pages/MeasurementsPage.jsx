import { useState } from 'react';
import api from '../api';
import { UserIcon, PhoneIcon, CalculatorIcon, ArchiveBoxArrowDownIcon, CalendarDaysIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function MeasurementsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState({
        name: '', phone: '', email: '', whatsapp: '', address: '',
        gender: 'Male', ageGroup: 'Adult', advance: 0, totalAmount: 0,
        deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        fabricNotes: '', stylePreference: 'Regular'
    });

    const [shirt, setShirt] = useState({
        c1: '', c2: '', c3: '',
        f: '',
        l: '',
        so: '',
        s1: '',
        ku1: '', ku2: '',
        ko1: '', ko2: '',
        k: ''
    });

    const [pant, setPant] = useState({
        w: '', h: '',
        l1: '', l2: '',
        t: '', k: '',
        b: '', r: ''
    });

    const handleCustChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });
    const handleShirtChange = (e) => setShirt({ ...shirt, [e.target.name]: e.target.value });
    const handlePantChange = (e) => setPant({ ...pant, [e.target.name]: e.target.value });

    const handleKeyDownNext = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form.elements, e.target);
            const next = form.elements[index + 1];
            if (next && (next.tagName === 'INPUT' || next.tagName === 'TEXTAREA' || next.tagName === 'SELECT')) {
                next.focus();
            } else if (next && next.tagName === 'BUTTON' && next.type === 'submit') {
                // Focus the submit button but don't click it automatically if it's the last one
                // Or we can just submit. Let's focus it.
                next.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Convert empty strings to undefined for numbers
        const cleanShirt = Object.fromEntries(Object.entries(shirt).map(([k, v]) => [k, v === '' ? undefined : Number(v)]));
        const cleanPant = Object.fromEntries(Object.entries(pant).map(([k, v]) => [k, v === '' ? undefined : Number(v)]));

        try {
            const { data } = await api.post('/measurements', {
                ...customer,
                shirt: cleanShirt,
                pant: cleanPant
            });

            alert('Saved successfully!');
            navigate('/measurements');
        } catch (err) {

            alert(err.response?.data?.message || 'Error saving measurement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 print:pb-0 print:space-y-4">
            <div className="flex justify-between items-center border-b pb-4 border-gray-200 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/measurements')} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 border-l-4 pl-4 border-mahesh-maroon">New Measurement</h1>
                        <p className="text-gray-500 text-sm mt-1 ml-5">Enter details to generate production record</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-secondary flex items-center shadow-sm"
                >
                    <ArchiveBoxArrowDownIcon className="w-5 h-5 mr-2" /> Print Layout
                </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:flex items-center gap-4 mb-4 border-b-2 border-mahesh-maroon pb-4">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain grayscale" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-widest">MAHESH FASHION &amp; TAILORS</h2>
                    <p className="text-sm text-gray-600">Tailoring & Stitching Measurements</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 print:space-y-4">
                {/* Customer Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-gray-800 print:p-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center print:border-gray-400">
                        <UserIcon className="w-5 h-5 mr-2 text-mahesh-maroon print:text-black" /> Customer Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-3 gap-6 print:gap-4 print:grid-cols-3">
                        <InputGroup label="Full Name *" name="name" value={customer.name} onChange={handleCustChange} onKeyDown={handleKeyDownNext} icon={UserIcon} />
                        <InputGroup label="Phone *" name="phone" value={customer.phone} onChange={handleCustChange} onKeyDown={handleKeyDownNext} type="tel" icon={PhoneIcon} />
                        <InputGroup label="WhatsApp" name="whatsapp" value={customer.whatsapp} onChange={handleCustChange} onKeyDown={handleKeyDownNext} type="tel" />
                        <InputGroup label="Email" name="email" value={customer.email} onChange={handleCustChange} onKeyDown={handleKeyDownNext} type="email" />
                        <InputGroup label="Address (Pincode)" name="address" value={customer.address} onChange={handleCustChange} onKeyDown={handleKeyDownNext} />
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 font-bold print:text-xs">Gender</label>
                            <select name="gender" value={customer.gender} onChange={handleCustChange} onKeyDown={handleKeyDownNext} className="input-field print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0">
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6 pt-6 border-t border-gray-100 print:gap-4 print:mt-4 print:pt-4 print:border-gray-400">
                        <InputGroup label="Delivery Date *" name="deliveryDate" type="date" value={customer.deliveryDate} onChange={handleCustChange} onKeyDown={handleKeyDownNext} icon={CalendarDaysIcon} />
                        <InputGroup label="Total Amount (₹)" name="totalAmount" type="number" value={customer.totalAmount} onChange={handleCustChange} onKeyDown={handleKeyDownNext} icon={CalculatorIcon} />
                        <InputGroup label="Advance Paid (₹)" name="advance" type="number" value={customer.advance} onChange={handleCustChange} onKeyDown={handleKeyDownNext} icon={CalculatorIcon} />
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 font-bold print:text-xs">Style Pref</label>
                            <select name="stylePreference" value={customer.stylePreference} onChange={handleCustChange} onKeyDown={handleKeyDownNext} className="input-field print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0">
                                <option>Slim</option><option>Regular</option><option>Fit</option>
                            </select>
                        </div>
                        <InputGroup label="Fabric Notes" name="fabricNotes" value={customer.fabricNotes} onChange={handleCustChange} onKeyDown={handleKeyDownNext} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-4">
                    {/* Shirt Measurements */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-mahesh-maroon print:shadow-none print:border-gray-800 print:border-t-gray-800 print:p-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 print:mb-4 border-b pb-2 print:border-gray-400">Top (SHIRT)</h2>

                        <div className="space-y-4">
                            {/* Row C */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">C:</span>
                                <div className="grid grid-cols-3 gap-2 flex-grow">
                                    <MeasureInput name="c1" value={shirt.c1} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="c2" value={shirt.c2} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="c3" value={shirt.c3} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row F */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">F:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="f" value={shirt.f} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row L */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">L:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="l" value={shirt.l} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row So */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">So:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="so" value={shirt.so} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row S / K */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700 text-xs">S / K:</span>
                                <div className="grid grid-cols-2 gap-2 w-2/3">
                                    <MeasureInput name="s1" value={shirt.s1} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="k" value={shirt.k} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row Ku */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">Ku:</span>
                                <div className="grid grid-cols-2 gap-2 w-2/3">
                                    <MeasureInput name="ku1" value={shirt.ku1} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="ku2" value={shirt.ku2} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row Ko */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">Ko:</span>
                                <div className="grid grid-cols-2 gap-2 w-2/3">
                                    <MeasureInput name="ko1" value={shirt.ko1} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="ko2" value={shirt.ko2} onChange={handleShirtChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row K moved next to S */}
                        </div>
                    </div>

                    {/* Pant Measurements */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-mahesh-gold print:shadow-none print:border-gray-800 print:border-t-gray-800 print:p-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 print:mb-4 border-b pb-2 print:border-gray-400">Bottom (PANT)</h2>

                        <div className="space-y-4">
                            {/* Row W */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">W:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="w" value={pant.w} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row H */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">H:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="h" value={pant.h} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row L */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">L:</span>
                                <div className="grid grid-cols-2 gap-2 w-2/3">
                                    <MeasureInput name="l1" value={pant.l1} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                    <MeasureInput name="l2" value={pant.l2} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row T */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">T:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="t" value={pant.t} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row K */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">K:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="k" value={pant.k} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row B */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">B:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="b" value={pant.b} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>

                            {/* Row R */}
                            <div className="flex items-center gap-4">
                                <span className="w-8 font-bold text-gray-700">R:</span>
                                <div className="grid grid-cols-1 gap-2 w-1/3">
                                    <MeasureInput name="r" value={pant.r} onChange={handlePantChange} onKeyDown={handleKeyDownNext} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 print:hidden">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary text-lg flex items-center px-8 py-3 shadow-lg"
                    >
                        <ArchiveBoxArrowDownIcon className="w-6 h-6 mr-2" />
                        {loading ? 'Saving & Generating Excel...' : 'Save & Export to Excel'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const InputGroup = ({ label, name, value, onChange, onKeyDown, placeholder, type = "text", icon: Icon }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 font-bold print:text-xs">{label}</label>
        <div className="relative rounded-md shadow-sm print:shadow-none">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none print:hidden">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                required={name === 'name' || name === 'phone' || name === 'deliveryDate'}
                className={`input-field print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:border-gray-400 print:rounded-none print:px-0 print:py-0 print:text-sm print:font-semibold ${Icon ? 'pl-10 print:pl-0' : ''}`}
            />
        </div>
    </div>
);

const MeasureInput = ({ name, value, onChange, onKeyDown }) => (
    <div className="relative rounded-md shadow-sm print:shadow-none">
        <input
            type="number"
            step="0.25"
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="input-field text-center font-bold text-mahesh-maroon print:text-black print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:border-gray-400 print:rounded-none print:px-1 print:py-0 print:text-sm"
            placeholder=""
        />
    </div>
);
