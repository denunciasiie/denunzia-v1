import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Terminal, Info } from 'lucide-react';
import { SecurityBanner } from './SecurityBanner';

export function Layout({ onReset }: { onReset: () => void }) {
    const location = useLocation();
    const path = location.pathname;

    // Helper to check active state
    const isActive = (route: string) => {
        if (route === '/' && path === '/') return true;
        if (route !== '/' && path.startsWith(route)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-[#f8fafc] font-sans flex flex-col selection:bg-[#d946ef]/30">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#d946ef]/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#3b82f6]/10 rounded-full blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <SecurityBanner />

            {/* Modern Cyber Navbar */}
            <nav className="glass-effect border-b border-white/5 shrink-0 z-50 px-2 md:px-6 py-2">
                <div className="flex items-center justify-between">
                    <div
                        onClick={onReset}
                        className="flex items-center gap-2 md:gap-4 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <img src="/denunzia_logo.png" alt="DenunzIA Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]" />
                        <div>
                            <h1 className="text-sm md:text-lg font-cyber font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#3b82f6] tracking-wider leading-none">
                                DenunzIA
                            </h1>
                            <p className="text-[8px] md:text-[9px] text-[#94a3b8] font-cyber uppercase tracking-[0.2em] hidden xs:block mt-0.5">
                                Reporte Seguro
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar py-1">
                        <Link
                            to="/"
                            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${isActive('/') ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutDashboard size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
                            <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">PANEL</span>
                        </Link>

                        <Link
                            to="/denunciar"
                            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${isActive('/denunciar') ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ShieldAlert size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
                            <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">DENUNCIAR</span>
                        </Link>

                        <Link
                            to="/informacion"
                            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${isActive('/informacion') ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Info size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
                            <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">INFO</span>
                        </Link>

                        <Link
                            to="/admin"
                            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${isActive('/admin') ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Terminal size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
                            <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">ADMIN</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-[#d946ef]/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10 h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
