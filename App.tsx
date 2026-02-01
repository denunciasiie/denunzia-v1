import React, { useState } from 'react';
import { SecurityGateway } from './components/SecurityGateway';
import { SecurityBanner } from './components/SecurityBanner';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { AdminPanel } from './components/AdminPanel';
import { LayoutDashboard, ShieldAlert, ShieldCheck, Terminal, Info, ShieldPlus } from 'lucide-react';

function App() {
  const [hasAcceptedSecurity, setHasAcceptedSecurity] = useState(false);
  const [view, setView] = useState<'dashboard' | 'report' | 'about' | 'admin'>('dashboard');

  // Show SecurityGateway first
  if (!hasAcceptedSecurity) {
    return <SecurityGateway onProceed={() => setHasAcceptedSecurity(true)} />;
  }

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
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
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
            <button
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${view === 'dashboard' ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
            >
              <LayoutDashboard size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
              <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">PANEL</span>
            </button>

            <button
              onClick={() => setView('report')}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${view === 'report' ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
            >
              <ShieldAlert size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
              <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">DENUNCIAR</span>
            </button>

            <button
              onClick={() => setView('about')}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${view === 'about' ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
            >
              <Info size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
              <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">INFO</span>
            </button>

            <button
              onClick={() => setView('admin')}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all min-w-[65px] md:min-w-[80px] ${view === 'admin' ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/30' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
            >
              <Terminal size={18} className="md:w-5 md:h-5 mb-0.5 md:mb-1" />
              <span className="text-[9px] md:text-[10px] font-cyber font-bold uppercase tracking-wide">ADMIN</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d946ef]/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          {view === 'dashboard' && <Dashboard />}

          {view === 'report' && (
            <div className="w-full">
              <ReportForm />
            </div>
          )}

          {view === 'admin' && (
            <div className="h-[calc(100vh-4rem)] overflow-hidden">
              <AdminPanel />
            </div>
          )}


          {view === 'about' && (
            <div className="p-12 max-w-4xl mx-auto">
              <div className="glass-effect p-10 rounded-3xl border border-white/10">
                <h2 className="text-4xl font-cyber font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#3b82f6]">
                  SISTEMA DENUNZIA
                </h2>
                <div className="space-y-6 text-[#94a3b8] leading-relaxed text-lg">
                  <p>
                    El <span className="text-[#d946ef] font-semibold">Sistema Integrado de Inteligencia Ética y Criminal</span> es una infraestructura de vanguardia diseñada para la protección ciudadana y la transparencia institucional.
                  </p>
                  <p>
                    Nuestra arquitectura de seguridad implementa protocolos de grado militar para garantizar que la información fluya sin riesgos de intercepción o represalias.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#d946ef]/20">
                      <h4 className="text-[#d946ef] font-cyber text-sm mb-3">INFRAESTRUCTURA TOR</h4>
                      <p className="text-xs">Ruteo cebolla (Onion Routing) para el anonimato total del origen de la información.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#8b5cf6]/20">
                      <h4 className="text-[#8b5cf6] font-cyber text-sm mb-3">CIFRADO E2EE</h4>
                      <p className="text-xs">Cifrado de extremo a extremo basado en Web Crypto API para máxima privacidad.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#10b981]/20">
                      <h4 className="text-[#10b981] font-cyber text-sm mb-3">K-ANONIMATO</h4>
                      <p className="text-xs">Algoritmos de ofuscación espacial para proteger la ubicación exacta de los denunciantes.</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#f59e0b]/20">
                      <h4 className="text-[#f59e0b] font-cyber text-sm mb-3">GEMINI AI 2.5</h4>
                      <p className="text-xs">Motores de inteligencia artificial para validación de verosimilitud en tiempo real.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;