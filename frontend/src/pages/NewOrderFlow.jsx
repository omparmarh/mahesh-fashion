import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

// ─── Progress Indicator ───────────────────────────────────────────────────────
function ProgressBar({ step, onStepClick }) {
    const steps = ['Customer Details', 'Measurements', 'Bill'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                    <div key={num} className="flex items-center">
                        <div
                            className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105`}
                            onClick={() => onStepClick && onStepClick(num)}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${done
                                    ? 'bg-mahesh-maroon border-mahesh-maroon text-white'
                                    : active
                                        ? 'bg-white border-mahesh-maroon text-mahesh-maroon'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                            >
                                {done ? '✓' : num}
                            </div>
                            <span
                                className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? 'text-mahesh-maroon' : done ? 'text-gray-700' : 'text-gray-400'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`h-0.5 w-16 mx-2 mb-5 transition-all ${done ? 'bg-mahesh-maroon' : 'bg-gray-200'}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── STEP 1: Customer Details ──────────────────────────────────────────────────
export function CustomerDetailsStep() {
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!customerName.trim()) e.name = 'Name is required';
        if (!/^\d{10}$/.test(customerPhone.trim())) e.phone = 'Enter a valid 10-digit phone number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleKeyDownNext = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form.elements, e.target);
            const next = form.elements[index + 1];
            if (next) {
                next.focus();
            } else {
                handleNext(e);
            }
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!validate()) return;
        navigate('/new-order/measurements', {
            state: { customerName: customerName.trim(), customerPhone: customerPhone.trim() },
        });
    };

    const handleStepNav = (targetStep) => {
        if (targetStep === 1) return; // Already here
        if (targetStep === 2) {
            navigate('/new-order/measurements', { state: { customerName, customerPhone } });
        }
        if (targetStep === 3) {
            navigate('/new-order/billing', { state: { customerName, customerPhone } });
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <ProgressBar step={1} onStepClick={handleStepNav} />
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
                    <p className="text-sm text-gray-500 mt-1">Step 1 of 3 — Enter customer details</p>
                </div>

                <form onSubmit={handleNext} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name *</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-800 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="e.g. Ramesh Patel"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            onKeyDown={handleKeyDownNext}
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-800 transition ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="10-digit mobile number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            onKeyDown={handleKeyDownNext}
                            maxLength={10}
                        />
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-mahesh-maroon hover:bg-red-900 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-base mt-2"
                    >
                        Next: Add Measurements →
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── STEP 2: Measurements ──────────────────────────────────────────────────────
export function MeasurementsStep() {
    const navigate = useNavigate();
    const location = useLocation();
    const { customerName = '', customerPhone = '' } = location.state || {};

    const [shirt, setShirt] = useState({ c1: '', c2: '', c3: '', f: '', l: '', so: '', s1: '', ku1: '', ku2: '', ko1: '', ko2: '', k: '', notes: '', options: [] });
    const [pant, setPant] = useState({ w: '', h: '', l1: '', l2: '', t: '', k: '', b: '', r: '', notes: '', options: [] });
    const [error, setError] = useState('');

    const shirtColumns = [
        ['ઓપન', 'બુ શર્ટ', 'ઓપન ટીશર્ટ', 'ઉપર 2 પોકેટ', 'ઉપર 2 પોકેટ ઢાકણા વાળા', 'બોમ્બે પટ્ટી', 'અંદર પોકેટ', 'સ્ટેન્ડ પટ્ટી', 'ફેન્સી બટન'],
        ['લોગો', 'પોકેટ નથી', 'પેટન કરવી', 'પાછળ તક્ષ', 'ફોડ પટ્ટી', 'V શોલ્ડર', 'ગાજ પટ્ટી ફોડ', 'પેન્ટ ના કપડાની ટેન પટ્ટી', 'ટેન પટ્ટી માં પાઈપિંગ'],
        ['કોલર કફ ગાજ માં પટ્ટી', 'હાફ બાઈ માં ફોડ પટ્ટી', 'બાઈ પટ્ટી ગાજ બટન']
    ];
    const pantColumns = [
        ['કોસ પોકેટ', '2 ચપટી શોની', '1 ચપટી શોની', '3 ચપટી શોની', 'V ચપટી', 'L પોકેટ', '2 વોચ પોકેટ', 'વોચ મોટી', 'કટ બેલ્ટ'],
        ['કટ બેલ્ટ માં ગાજ', 'લોન્ગ બેલ્ટ', 'લોન્ગ બેલ્ટ માં ગાજ', '2 પોકેટ', '1 પોકેટ', 'મોબાઈલ પોકેટ', 'પેટન કરવી', 'લુક્સ મોટા', 'સાઈડ પોકેટ'],
        ['આડી ઇંચી', 'જીન્સ ટાઇપ', 'પાછળ પોકેટ માં લૂપી', 'ગ્રુપ', 'ગ્રુપ + ચીરવા']
    ];

    const updateShirt = (field, val) => setShirt((p) => ({ ...p, [field]: val }));
    const updatePant = (field, val) => setPant((p) => ({ ...p, [field]: val }));

    const toggleShirtOption = (opt) => {
        setShirt(p => ({
            ...p,
            options: p.options.includes(opt) ? p.options.filter(o => o !== opt) : [...p.options, opt]
        }));
    };

    const togglePantOption = (opt) => {
        setPant(p => ({
            ...p,
            options: p.options.includes(opt) ? p.options.filter(o => o !== opt) : [...p.options, opt]
        }));
    };

    const handleKeyDownNext = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form.elements, e.target);
            const next = form.elements[index + 1];
            if (next && (next.tagName === 'INPUT' || next.tagName === 'TEXTAREA' || next.tagName === 'SELECT')) {
                next.focus();
            } else {
                handleNext(e);
            }
        }
    };

    const mInput = (val, onChange, placeholder = '') => (
        <input
            type="text"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-700 text-center"
            value={val}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDownNext}
            placeholder={placeholder}
        />
    );

    const handleNext = (e) => {
        e.preventDefault();
        setError('');
        navigate('/new-order/billing', {
            state: { customerName, customerPhone, shirt, pant },
        });
    };

    const handleBack = () => {
        navigate('/new-order/customer', {
            state: { customerName, customerPhone },
        });
    };

    const handleStepNav = (targetStep) => {
        if (targetStep === 1) {
            navigate('/new-order/customer', { state: { customerName, customerPhone } });
        }
        if (targetStep === 2) return; // Already here
        if (targetStep === 3) {
            navigate('/new-order/billing', { state: { customerName, customerPhone, shirt, pant } });
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <ProgressBar step={2} onStepClick={handleStepNav} />

            {/* Customer info banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3 text-sm">
                <span className="font-semibold text-mahesh-maroon">Customer:</span>
                <span className="text-gray-800 font-medium">{customerName}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-mahesh-maroon">Phone:</span>
                <span className="text-gray-800">{customerPhone}</span>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
                {/* SHIRT Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-mahesh-maroon px-5 py-3">
                        <h2 className="text-white font-bold text-base tracking-wide">SHIRT MEASUREMENTS</h2>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">C (Chest)</label>
                            <div className="flex gap-1">
                                {mInput(shirt.c1, (v) => updateShirt('c1', v), 'C1')}
                                {mInput(shirt.c2, (v) => updateShirt('c2', v), 'C2')}
                                {mInput(shirt.c3, (v) => updateShirt('c3', v), 'C3')}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">F (Front)</label>
                            {mInput(shirt.f, (v) => updateShirt('f', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">L (Length)</label>
                            {mInput(shirt.l, (v) => updateShirt('l', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">So (Shoulder)</label>
                            {mInput(shirt.so, (v) => updateShirt('so', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">S / K (Sleeve / K)</label>
                            <div className="flex gap-1">
                                {mInput(shirt.s1, (v) => updateShirt('s1', v), 'S')}
                                {mInput(shirt.k, (v) => updateShirt('k', v), 'K')}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Ku</label>
                            <div className="flex gap-1">
                                {mInput(shirt.ku1, (v) => updateShirt('ku1', v), 'Ku1')}
                                {mInput(shirt.ku2, (v) => updateShirt('ku2', v), 'Ku2')}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Ko</label>
                            <div className="flex gap-1">
                                {mInput(shirt.ko1, (v) => updateShirt('ko1', v), 'Ko1')}
                                {mInput(shirt.ko2, (v) => updateShirt('ko2', v), 'Ko2')}
                            </div>
                        </div>
                        <div>
                            {/* K field moved next to S */}
                        </div>
                        <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                            <label className="text-xs font-bold text-gray-600 mb-3 block">SHIRT OPTIONS</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {shirtColumns.map((col, ci) => (
                                    <div key={ci} className="flex flex-col gap-2">
                                        {col.map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-mahesh-maroon focus:ring-mahesh-maroon"
                                                    checked={shirt.options.includes(opt)}
                                                    onChange={() => toggleShirtOption(opt)}
                                                />
                                                <span className={`text-sm transition-colors ${shirt.options.includes(opt) ? 'text-mahesh-maroon font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Shirt Notes (e.g. બ્લૂ શર્ટ, 2 chipati sirava)</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-red-700 resize-none"
                                rows={2}
                                value={shirt.notes}
                                onChange={(e) => updateShirt('notes', e.target.value)}
                                onKeyDown={handleKeyDownNext}
                                placeholder="Special instructions..."
                            />
                        </div>
                    </div>
                </div>

                {/* PANT Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-amber-500 px-5 py-3">
                        <h2 className="text-white font-bold text-base tracking-wide">PANT MEASUREMENTS</h2>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">W (Waist)</label>
                            {mInput(pant.w, (v) => updatePant('w', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">H (Hip)</label>
                            {mInput(pant.h, (v) => updatePant('h', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">L (Length)</label>
                            <div className="flex gap-1">
                                {mInput(pant.l1, (v) => updatePant('l1', v), 'L1')}
                                {mInput(pant.l2, (v) => updatePant('l2', v), 'L2')}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">T (Thigh)</label>
                            {mInput(pant.t, (v) => updatePant('t', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">K (Knee)</label>
                            {mInput(pant.k, (v) => updatePant('k', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">B (Bottom)</label>
                            {mInput(pant.b, (v) => updatePant('b', v))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">R (Rise)</label>
                            {mInput(pant.r, (v) => updatePant('r', v))}
                        </div>
                        <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                            <label className="text-xs font-bold text-gray-600 mb-3 block">PANT OPTIONS</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {pantColumns.map((col, ci) => (
                                    <div key={ci} className="flex flex-col gap-2">
                                        {col.map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                    checked={pant.options.includes(opt)}
                                                    onChange={() => togglePantOption(opt)}
                                                />
                                                <span className={`text-sm transition-colors ${pant.options.includes(opt) ? 'text-amber-700 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Pant Notes (e.g. લોન્ગ બેલ્ટ, 1 પોકેટ)</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                                rows={2}
                                value={pant.notes}
                                onChange={(e) => updatePant('notes', e.target.value)}
                                onKeyDown={handleKeyDownNext}
                                placeholder="Special instructions..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-2">
                    <button type="button" onClick={handleBack} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                        ← Back
                    </button>
                    <button type="submit" className="bg-mahesh-maroon hover:bg-red-900 text-white font-bold px-8 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2">
                        Next: Create Bill →
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── STEP 3: Billing ───────────────────────────────────────────────────────────
export function BillingStep() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        customerName = '', customerPhone = '',
        shirt = {}, pant = {}
    } = location.state || {};

    const [deliveryDate, setDeliveryDate] = useState('');
    const [billNo, setBillNo] = useState('...');
    const [realOrderID, setRealOrderID] = useState('');
    const today = new Date().toLocaleDateString('en-IN');
    const deliveryDisplay = deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-IN') : '';

    const [articles, setArticles] = useState([
        { article: 'PANT', qty: 0, rate: 0, amount: 0 },
        { article: 'SHIRT', qty: 0, rate: 0, amount: 0 },
        { article: 'JODI', qty: 0, rate: 0, amount: 0 },
    ]);
    const [stitchingCost, setStitchingCost] = useState(0);
    const [fabricCost, setFabricCost] = useState(0);
    const [extraCost, setExtraCost] = useState(0);
    const [payAmount, setPayAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [saving, setSaving] = useState(false);
    const [printTarget, setPrintTarget] = useState(null);

    // BUG FIX: Pre-fetch next OrderID from backend to show a clean ID (e.g., 0001) immediately
    useEffect(() => {
        const fetchNextID = async () => {
            try {
                const { data } = await api.get('/new-order/next-id');
                if (data.orderID) setBillNo(data.orderID);
            } catch (err) {
                console.error('Failed to fetch next ID:', err);
                setBillNo(`T${Date.now().toString().slice(-6)}`); // Fallback to a cleaner temp ID
            }
        };
        fetchNextID();
    }, []);

    const subTotal = articles.reduce((s, a) => s + (Number(a.amount) || 0), 0);
    const grandTotal = subTotal + Number(stitchingCost || 0) + Number(fabricCost || 0) + Number(extraCost || 0);
    const totalDue = Math.max(0, grandTotal - Number(payAmount || 0));

    const DEFAULT_RATES = {
        'PANT': 350,
        'SHIRT': 300,
        'JODI': 650
    };

    const updateArticle = (i, field, val) => {
        const updated = [...articles];
        updated[i][field] = val;

        // Auto-fill rate based on quantity with dynamic extras
        if (field === 'qty') {
            const newQty = Number(val) || 0;
            const articleName = updated[i].article.toUpperCase();

            if (newQty > 0 && (Number(updated[i].rate) === 0)) {
                let base = DEFAULT_RATES[articleName] || 0;
                let extra = 0;

                const shirtOptions = shirt.options || [];
                const pantOptions = pant.options || [];

                const hasLogo = shirtOptions.includes('લોગો');
                const hasGroup = pantOptions.includes('ગ્રુપ');
                const hasGroupChirva = pantOptions.includes('ગ્રુપ + ચીરવા');

                if (articleName === 'SHIRT') {
                    if (hasLogo) extra += 50;
                } else if (articleName === 'PANT') {
                    if (hasGroupChirva) extra += 100;
                    else if (hasGroup) extra += 50;
                } else if (articleName === 'JODI') {
                    if (hasLogo) extra += 50;
                    if (hasGroupChirva) extra += 100;
                    else if (hasGroup) extra += 50;
                }

                updated[i].rate = base + extra;
            } else if (newQty === 0) {
                updated[i].rate = 0;
            }
        }

        if (field === 'qty' || field === 'rate') {
            updated[i].amount = (Number(updated[i].qty) || 0) * (Number(updated[i].rate) || 0);
        }
        setArticles(updated);
    };

    const addArticle = () => setArticles([...articles, { article: '', qty: 1, rate: 0, amount: 0 }]);
    const removeArticle = (i) => setArticles(articles.filter((_, idx) => idx !== i));

    const handlePrint = (target) => {
        setPrintTarget(target);
        setTimeout(() => {
            window.print();
            setPrintTarget(null);
        }, 100);
    };

    const handleSave = async () => {
        if (!deliveryDate) {
            alert('Please select a delivery date');
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.post('/new-order/complete', {
                customerName, customerPhone, deliveryDate,
                shirt, pant, articles,
                stitchingCost: Number(stitchingCost),
                fabricCost: Number(fabricCost),
                extraCost: Number(extraCost),
                grandTotal,
                payAmount: Number(payAmount),
                totalDue,
                paymentMode,
                billNo
            });

            // Set the real Order ID returned from the database
            if (data.orderID) {
                setRealOrderID(data.orderID);
            }

            alert(`Order Saved Successfully! Order ID: ${data.orderID || 'Created'}`);

            // Auto-print after saving
            setTimeout(() => {
                handlePrint('measurement');
                setTimeout(() => {
                    handlePrint('bill');
                }, 1000); // Wait a bit for the first print dialog to be handled/ready
            }, 500);

            // Don't navigate immediately so user can print with the real ID if they want
            // navigate('/orders'); 
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const handleStepNav = (targetStep) => {
        if (targetStep === 1) {
            navigate('/new-order/customer', { state: { customerName, customerPhone } });
        }
        if (targetStep === 2) {
            navigate('/new-order/measurements', { state: { customerName, customerPhone, deliveryDate, shirt, pant } });
        }
        if (targetStep === 3) return; // Already here
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <ProgressBar step={3} onStepClick={handleStepNav} />

            {/* Print components (hidden on screen, shown on print) */}
            <MeasurementSlipPrint
                active={printTarget === 'measurement'}
                customerName={customerName}
                customerPhone={customerPhone}
                billNo={realOrderID || billNo}
                deliveryDate={deliveryDisplay}
                shirt={shirt}
                pant={pant}
            />
            <BillPrint
                active={printTarget === 'bill'}
                customerName={customerName}
                customerPhone={customerPhone}
                billNo={realOrderID || billNo}
                date={today}
                deliveryDate={deliveryDisplay}
                articles={articles.filter(a => Number(a.qty) >= 1)}
                subTotal={subTotal}
                stitchingCost={Number(stitchingCost)}
                fabricCost={Number(fabricCost)}
                extraCost={Number(extraCost)}
                grandTotal={grandTotal}
                payAmount={Number(payAmount)}
                totalDue={totalDue}
            />

            {/* Customer readonly info */}
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3 text-sm">
                <span className="font-semibold text-mahesh-maroon">Customer:</span>
                <span className="text-gray-800 font-medium">{customerName}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-mahesh-maroon">Phone:</span>
                <span className="text-gray-800">{customerPhone}</span>
                <span className="text-gray-400 ml-4">|</span>
                <span className="font-semibold text-mahesh-maroon">Delivery:</span>
                <span className="text-gray-800">{deliveryDisplay}</span>
            </div>

            {/* Bill header & Delivery Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <div className="flex gap-6 text-sm text-gray-600 mb-4 items-center">
                    <div>
                        <span className="font-semibold text-gray-800">{realOrderID ? 'Order ID:' : 'Temp Bill No:'}</span>
                        <span className="font-mono text-mahesh-maroon ml-1">{realOrderID || billNo}</span>
                        {realOrderID && <span className="ml-2 text-green-600 font-bold">✓ Saved</span>}
                    </div>
                    <div><span className="font-semibold text-gray-800">Date:</span> {today}</div>
                    <div><span className="font-semibold text-gray-800">Payment Mode:</span>
                        <select className="ml-2 border border-gray-300 rounded px-2 py-0.5 text-sm" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                            <option>Cash</option><option>UPI</option><option>Card</option>
                        </select>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-700">Delivery Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-800 text-sm"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Articles table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-gray-800">Articles</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                        <tr>
                            <th className="px-4 py-2 text-left w-8">No.</th>
                            <th className="px-4 py-2 text-left">Article</th>
                            <th className="px-4 py-2 text-center w-20">Qty</th>
                            <th className="px-4 py-2 text-right w-24">Rate (₹)</th>
                            <th className="px-4 py-2 text-right w-24">Amount (₹)</th>
                            <th className="px-4 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {articles.map((a, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-400 font-mono">{i + 1}</td>
                                <td className="px-4 py-2">
                                    <input type="text" className="w-full border-0 border-b border-transparent focus:border-mahesh-maroon outline-none py-1 bg-transparent" placeholder="e.g. PANT" value={a.article} onChange={(e) => updateArticle(i, 'article', e.target.value)} />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" className="w-full text-center border border-gray-200 rounded px-2 py-1 text-sm" value={a.qty} onChange={(e) => updateArticle(i, 'qty', e.target.value)} />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm" value={a.rate} onChange={(e) => updateArticle(i, 'rate', e.target.value)} />
                                </td>
                                <td className="px-4 py-2 text-right font-mono font-medium text-gray-800">₹{a.amount}</td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => removeArticle(i)} className="text-red-300 hover:text-red-600 transition-colors" disabled={articles.length === 1}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button onClick={addArticle} className="text-mahesh-maroon hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors">
                        + Add Article
                    </button>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <h2 className="font-bold text-gray-800 mb-4">Cost Breakdown</h2>
                <div className="space-y-3 max-w-xs ml-auto">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Sub Total</span>
                        <span className="font-mono font-medium">₹{subTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Stitching Cost</span>
                        <input type="number" className="w-28 text-right border border-gray-200 rounded px-2 py-1 text-sm font-mono" value={stitchingCost} onChange={(e) => setStitchingCost(e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Fabric Cost</span>
                        <input type="number" className="w-28 text-right border border-gray-200 rounded px-2 py-1 text-sm font-mono" value={fabricCost} onChange={(e) => setFabricCost(e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Extra Cost</span>
                        <input type="number" className="w-28 text-right border border-gray-200 rounded px-2 py-1 text-sm font-mono" value={extraCost} onChange={(e) => setExtraCost(e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center font-bold text-mahesh-maroon text-lg border-t border-gray-200 pt-3">
                        <span>GRAND TOTAL</span>
                        <span className="font-mono">₹{grandTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-3">
                        <span className="text-gray-600 font-medium">Pay Amount</span>
                        <input type="number" className="w-28 text-right border border-mahesh-maroon rounded px-2 py-1 text-sm font-mono font-bold text-green-700 bg-green-50" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center font-bold text-red-600 text-base border-t border-gray-200 pt-3">
                        <span>Total Due</span>
                        <span className="font-mono">₹{totalDue}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap items-center">
                <button onClick={() => handlePrint('measurement')} className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold flex items-center gap-2 px-5 py-3 rounded-lg transition-colors">
                    📋 Print Measurement
                </button>
                <button onClick={() => handlePrint('bill')} className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold flex items-center gap-2 px-5 py-3 rounded-lg transition-colors">
                    🧾 Print Bill
                </button>

                {!realOrderID ? (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-mahesh-maroon hover:bg-red-900 text-white font-bold flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition-colors ml-auto disabled:opacity-60"
                    >
                        💾 {saving ? 'Saving...' : 'Save & Get Order ID'}
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 px-8 py-3 rounded-lg shadow-md transition-colors ml-auto"
                    >
                        ✅ Finish & Close
                    </button>
                )}
            </div>
        </div>
    );
}
// ─── MEASUREMENT SLIP PRINT ───────────────────────────────────────────────────
function MeasurementSlipPrint({ active, customerName, customerPhone, billNo, deliveryDate, shirt, pant }) {
    const val = (v) => (v ? v : '');

    return (
        <div id="measurement-slip-print" style={{ display: 'none' }}>
            {active && (
                <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #measurement-slip-print, #measurement-slip-print * { visibility: visible !important; }
            #measurement-slip-print { 
                position: absolute; 
                top: 0; 
                left: 0; 
                width: 100%; 
                min-height: 100%;
                box-sizing: border-box;
                display: flex !important; 
                flex-direction: column;
                overflow: hidden;
                padding: 10mm;
            }
            @page { size: A4 portrait; margin: 0; }
          }
        `}</style>
            )}
            <div style={{
                fontFamily: "'Courier New', monospace",
                color: '#000',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* PANT SLIP (TOP HALF) */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '20px 30px',
                    borderBottom: '4px dashed #000',
                    position: 'relative'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontWeight: '900', fontSize: '40px' }}>MAHESH TAILOR</div>
                        <div style={{ fontSize: '28px', marginTop: '4px' }}>
                            <b>Name:</b> {customerName} | <b>PANT ( )</b>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', marginBottom: '16px', borderBottom: '2px solid #ccc', paddingBottom: '8px' }}>
                        <div><b>ID: {billNo}</b></div>
                        <div style={{ textAlign: 'right' }}>
                            <div><b>Date: {deliveryDate}</b></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
                        <div style={{ flex: 1, fontSize: '36px', lineHeight: '1.6' }}>
                            <div><b>W:</b> <b style={{ fontSize: '40px' }}>{val(pant.w)}</b></div>
                            <div><b>H:</b> <b style={{ fontSize: '40px' }}>{val(pant.h)}</b></div>
                            <div><b>L:</b> <b style={{ fontSize: '40px' }}>{val(pant.l1)} {val(pant.l2)}</b></div>
                            <div><b>T:</b> <b style={{ fontSize: '40px' }}>{val(pant.t)}</b></div>
                            <div><b>K:</b> <b style={{ fontSize: '40px' }}>{val(pant.k)}</b></div>
                            <div><b>B:</b> <b style={{ fontSize: '40px' }}>{val(pant.b)}</b></div>
                            <div><b>R:</b> <b style={{ fontSize: '40px' }}>{val(pant.r)}</b></div>
                        </div>
                        <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center' }}>
                            {pant.options && pant.options.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {pant.options.map((opt, idx) => (
                                        <div key={idx} style={{ fontSize: '40px', fontWeight: '900', color: '#000', lineHeight: '1.2' }}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {pant.notes && (
                                <div style={{ fontSize: '22px', border: '2px solid #ddd', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
                                    {pant.notes}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SHIRT SLIP (BOTTOM HALF) */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '20px 30px',
                    position: 'relative'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontWeight: '900', fontSize: '40px' }}>MAHESH TAILOR</div>
                        <div style={{ fontSize: '28px', marginTop: '4px' }}>
                            <b>Name:</b> {customerName} | <b>SHIRT ( )</b>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', marginBottom: '16px', borderBottom: '2px solid #ccc', paddingBottom: '8px' }}>
                        <div><b>ID: {billNo}</b></div>
                        <div style={{ textAlign: 'right' }}>
                            <div><b>Date: {deliveryDate}</b></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
                        <div style={{ flex: 1, fontSize: '36px', lineHeight: '1.6' }}>
                            <div><b>C:</b> <b style={{ fontSize: '40px' }}>{val(shirt.c1)} {val(shirt.c2)} {val(shirt.c3)}</b></div>
                            <div><b>F:</b> <b style={{ fontSize: '40px' }}>{val(shirt.f)}</b></div>
                            <div><b>L:</b> <b style={{ fontSize: '40px' }}>{val(shirt.l)}</b></div>
                            <div><b>So:</b> <b style={{ fontSize: '40px' }}>{val(shirt.so)}</b></div>
                            <div><b>S:</b> <b style={{ fontSize: '40px' }}>{val(shirt.s1)}</b></div>
                            <div><b>Ku:</b> <b style={{ fontSize: '40px' }}>{val(shirt.ku1)} {val(shirt.ku2)}</b></div>
                            <div><b>Ko:</b> <b style={{ fontSize: '40px' }}>{val(shirt.ko1)} {val(shirt.ko2)}</b></div>
                        </div>
                        <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center' }}>
                            {shirt.options && shirt.options.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {shirt.options.map((opt, idx) => (
                                        <div key={idx} style={{ fontSize: '40px', fontWeight: '900', color: '#000', lineHeight: '1.2' }}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {shirt.notes && (
                                <div style={{ fontSize: '22px', border: '2px solid #ddd', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
                                    {shirt.notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* K moved to bottom right */}
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        right: '50px',
                        border: '4px solid #000',
                        padding: '16px 30px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>K</div>
                        <div style={{ fontSize: '48px', fontWeight: '900' }}>{val(shirt.k)}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// ─── BILL PRINT ───────────────────────────────────────────────────────────────
function BillPrint({ active, customerName, customerPhone, billNo, date, deliveryDate, articles, subTotal, stitchingCost, fabricCost, extraCost, grandTotal, payAmount, totalDue }) {
    return (
        <div id="bill-print" style={{ display: 'none' }}>
            {active && (
                <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #bill-print, #bill-print * { visibility: visible !important; }
            #bill-print { 
                position: absolute; 
                top: 0; 
                left: 0; 
                width: 100%; 
                min-height: 100%;
                box-sizing: border-box;
                display: flex !important;
                flex-direction: column;
                padding: 15mm;
            }
            @page { size: A4 portrait; margin: 0; }
          }
        `}</style>
            )}
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#000' }}>

                {/* TOP HEADER */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '4px', lineHeight: 1 }}>MAHESH</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '6px' }}>FASHION & TAILORS</div>
                        <div style={{ fontSize: '20px', marginTop: '8px', color: '#000', fontWeight: 'bold' }}>290, Ghansham Nagar, Street No.2, L.H Road, Surat</div>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '4px' }}>Mo. 99258 41798</div>
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: '26px', fontWeight: '900' }}>9925841798</div>
                    </div>
                </div>

                <hr style={{ border: '2px solid #000', margin: '8px 0' }} />

                {/* CUSTOMER INFO */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                    <div><strong>Name :</strong> {customerName}</div>
                    <div style={{ textAlign: 'right' }}><strong>Order ID</strong> <b>{billNo}</b></div>
                    <div><strong>Mo :</strong> <b>{customerPhone}</b></div>
                    <div style={{ textAlign: 'right' }}><strong>Date</strong> <b>{date}</b></div>
                    <div></div>
                    <div style={{ textAlign: 'right' }}><strong>Del. Date</strong> <b>{deliveryDate}</b></div>
                </div>

                <hr style={{ border: '2px solid #000', margin: '8px 0' }} />

                {/* ARTICLES TABLE */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '22px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '4px 6px', width: '48px' }}>No.</th>
                            <th style={{ textAlign: 'left', padding: '4px 6px' }}>Article</th>
                            <th style={{ textAlign: 'center', padding: '4px 6px', width: '60px' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '4px 6px', width: '80px' }}>Rate</th>
                            <th style={{ textAlign: 'right', padding: '4px 6px', width: '100px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.filter(a => Number(a.qty) >= 1).map((a, i) => (
                            <tr key={i}>
                                <td style={{ padding: '4px 6px' }}><b>{i + 1}</b></td>
                                <td style={{ padding: '4px 6px' }}>{a.article}</td>
                                <td style={{ textAlign: 'center', padding: '4px 6px' }}><b>{a.qty}</b></td>
                                <td style={{ textAlign: 'right', padding: '4px 6px' }}><b>{a.rate}</b></td>
                                <td style={{ textAlign: 'right', padding: '4px 6px' }}><b>{a.amount}</b></td>
                            </tr>
                        ))}
                        {Array.from({ length: Math.max(0, 5 - articles.filter(a => Number(a.qty) >= 1).length) }).map((_, i) => (
                            <tr key={`e-${i}`}><td colSpan={5} style={{ padding: '12px' }}>&nbsp;</td></tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid #000' }}>
                            <td colSpan={2}></td>
                            <td style={{ textAlign: 'center', padding: '4px 6px', fontWeight: 'bold' }}>
                                <b>{articles.filter(a => Number(a.qty) >= 1).reduce((s, a) => s + (Number(a.qty) || 0), 0)}</b>
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>Sub Total :</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}><b>{subTotal}</b></td>
                        </tr>
                    </tfoot>
                </table>

                <hr style={{ border: '2px solid #000', margin: '8px 0' }} />

                {/* BOTTOM SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '18px', maxWidth: '55%', lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>શનિવારે દુકાન બંધ રહેશ.</div>
                        <div>સૂચના(૧) કપડાનો ડીલીવરી તારીખની ૩૦ દિવસ્ ની અંદર ના લઇ જાય</div>
                        <div>તો અમો જવાબ દાર નઈ.</div>
                        <div>(૨) કપડાને આગ્રે ભુલ્ ગ્રાહીની જવાબ્ ધ્ારી. ભાડ્ કકડ્ નઈ</div>
                        <div>(૩) ભીડ પડ : સ્ ગણ ન્ સસ ની</div>
                    </div>
                    <div style={{ fontSize: '22px', minWidth: '44%' }}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '2px 0' }}>Extra :</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}><b>{extraCost}</b></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 0' }}>Stitching Cost :</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}><b>{stitchingCost}</b></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 0' }}>Fabric Amount :</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}><b>{fabricCost}</b></td>
                                </tr>
                                <tr style={{ borderTop: '2px solid #000' }}>
                                    <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Pay Amount :</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '4px 0' }}><b>{payAmount}</b></td>
                                </tr>
                                <tr style={{ borderTop: '2px solid #000' }}>
                                    <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Total Due :</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '4px 0' }}><b>{totalDue}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
