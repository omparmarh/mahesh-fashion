import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, ScissorsIcon, DocumentTextIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navbar({ onNavItemClick }) {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Measurements', path: '/measurements', icon: ScissorsIcon },
        { name: 'Billing', path: '/billing', icon: DocumentTextIcon },
        { name: 'Orders List', path: '/orders', icon: ClipboardDocumentListIcon },
        { name: 'Order History', path: '/history', icon: ArchiveBoxIcon },
    ];

    return (
        <div className="w-64 bg-mahesh-maroon text-white min-h-screen shadow-xl flex flex-col">
            <div className="p-6 text-center border-b border-red-800 flex flex-col items-center">
                <img src="/logo.png" alt="Mahesh Fashion & Tailors Logo" className="w-24 h-24 object-contain rounded-full bg-white p-1 border-2 border-mahesh-gold" />
                <p className="text-xs tracking-widest text-mahesh-light opacity-90 mt-3 font-medium uppercase font-sans">&amp; TAILORS</p>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={onNavItemClick}
                            className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-mahesh-gold text-mahesh-maroon font-semibold' : 'text-gray-100 hover:bg-red-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-mahesh-maroon' : 'text-gray-300'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-red-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-red-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-mahesh-gold"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-300" />
                    Logout
                </button>
            </div>
        </div >
    );
}
