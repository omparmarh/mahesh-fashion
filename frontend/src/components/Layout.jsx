import { useState } from 'react';
import Navbar from './Navbar';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out`}>
                <Navbar onNavItemClick={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col h-screen">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center p-4 bg-mahesh-maroon text-white shadow-md flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 mr-4 focus:outline-none focus:ring-2 focus:ring-mahesh-gold rounded-md hover:bg-red-800 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold tracking-wider">Mahesh Fashion</h1>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
