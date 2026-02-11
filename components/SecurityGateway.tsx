import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SecurityGatewayProps {
    onProceed: () => void;
}

export const SecurityGateway: React.FC<SecurityGatewayProps> = ({ onProceed }) => {
    const [showTorModal, setShowTorModal] = useState(false);
    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const navigate = useNavigate();
    const onionAddress = "https://denunzia.org"; // Dirección segura oficial

    // Panic button handler - redirect to Google
    const handlePanic = () => {
        window.location.replace('https://www.google.com');
    };

    // ESC key listener for panic button
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handlePanic();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent browser from caching this page
    useEffect(() => {
        const metaNoCache = document.createElement('meta');
        metaNoCache.httpEquiv = 'Cache-Control';
        metaNoCache.content = 'no-store, no-cache, must-revalidate, max-age=0';
        document.head.appendChild(metaNoCache);

        const metaPragma = document.createElement('meta');
        metaPragma.httpEquiv = 'Pragma';
        metaPragma.content = 'no-cache';
        document.head.appendChild(metaPragma);

        const metaExpires = document.createElement('meta');
        metaExpires.httpEquiv = 'Expires';
        metaExpires.content = '0';
        document.head.appendChild(metaExpires);

        return () => {
            document.head.removeChild(metaNoCache);
            document.head.removeChild(metaPragma);
            document.head.removeChild(metaExpires);
        };
    }, []);

    const handleProceedToDashboard = () => {
        onProceed();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-x-hidden selection:bg-[#d946ef]/30 font-sans text-[#f8fafc]">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#d946ef]/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#3b82f6]/10 rounded-full blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>
            {/* Top Right Buttons */}
            <div className="fixed top-4 right-4 z-[9999] flex gap-3">
                {/* Ver Mapa de Reportes Button */}
                <button
                    onClick={handleProceedToDashboard}
                    className="bg-white/5 backdrop-blur-md text-[#3b82f6] border border-white/10 py-2 px-4 md:py-2.5 md:px-5 rounded-full text-xs md:text-sm font-cyber font-bold cursor-pointer shadow-xl hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                    aria-label="Ver mapa de reportes"
                >
                    📊 <span className="hidden sm:inline">Ver Mapa de Reportes</span><span className="sm:hidden">Mapa</span>
                </button>

                {/* Panic/Exit Button */}
                <button
                    onClick={handlePanic}
                    className="bg-red-500 text-white border-none py-2 px-4 md:py-2.5 md:px-5 rounded-full text-xs md:text-sm font-cyber font-bold cursor-pointer shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                    aria-label="Botón de salida rápida"
                    title="Presiona ESC o haz clic para salir inmediatamente"
                >
                    SALIR
                </button>
            </div>

            {/* Scrollable Content Wrapper */}
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-24 md:py-12">
                {/* Main Content */}
                <div className="w-full max-w-md text-center">
                    {/* Logo/Icon */}
                    <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-500">
                        <img src="/denunzia_logo.png" alt="DenunzIA Logo" className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_0_20px_rgba(124,58,237,0.4)]" />
                    </div>

                    {/* Welcome Message */}
                    <h1 className="text-3xl md:text-5xl font-cyber font-black bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#3b82f6] mb-12 tracking-[0.2em] uppercase">
                        Bienvenidos
                    </h1>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 mb-8 mx-2">
                        {/* Main Report Button */}
                        <button
                            onClick={() => setShowChecklistModal(true)}
                            className="group relative overflow-hidden bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] border-none rounded-2xl py-6 px-8 cursor-pointer shadow-2xl shadow-[#d946ef]/20 transition-all hover:scale-[1.02] active:scale-98"
                        >
                            <div className="relative z-10 text-center">
                                <div className="text-xl md:text-2xl font-cyber font-black text-white mb-2 uppercase tracking-widest">
                                    Haz tu Denuncia
                                </div>
                                <div className="text-xs md:text-sm font-medium text-white/90 leading-relaxed max-w-xs mx-auto">
                                    Tu reporte es 100% anónimo con cifrado de grado militar de extremo a extremo.
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>

                        {/* Emergency Warning */}
                        <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-4 md:p-6 flex items-center gap-5 backdrop-blur-sm shadow-xl">
                            <div className="bg-red-500/20 p-3 rounded-full animate-pulse border border-red-500/20">
                                <span className="text-2xl md:text-3xl">⚠️</span>
                            </div>
                            <div className="text-left">
                                <p className="text-red-400 font-cyber font-bold text-sm md:text-base leading-tight uppercase tracking-wider">
                                    En caso de peligro inmediato: LLAMA AL 911
                                </p>
                                <p className="text-[#94a3b8] text-[9px] md:text-[10px] font-medium uppercase tracking-[0.1em] mt-1.5 leading-relaxed">
                                    Este servidor no es un sistema de respuesta de emergencia directa.
                                </p>
                            </div>
                        </div>

                        {/* TOR Browser Button */}
                        <button
                            onClick={() => setShowTorModal(true)}
                            className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/60 backdrop-blur-md border border-white/5 rounded-2xl py-6 px-8 cursor-pointer transition-all hover:border-[#d946ef]/30 active:scale-98 shadow-xl"
                        >
                            <div className="text-center">
                                <div className="text-lg md:text-xl font-cyber font-bold text-white mb-2 uppercase tracking-widest">
                                    Red TOR (Onion)
                                </div>
                                <div className="text-xs md:text-sm font-medium text-[#94a3b8] leading-relaxed max-w-xs mx-auto">
                                    Accede mediante nuestro enlace .onion para anonimato extremo de IP.
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin Button - Bottom Right (Discrete) */}
            <button
                onClick={() => navigate('/admin')}
                className="fixed bottom-4 right-4 text-[#94a3b8] hover:text-[#7c3aed] text-xs font-medium transition-colors"
                aria-label="Acceso administrativo"
            >
                Admin.
            </button>

            {/* TOR Modal */}
            {showTorModal && (
                <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowTorModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowTorModal(false)}
                            className="absolute top-4 right-4 bg-slate-100 text-slate-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-xl font-bold"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 flex items-center gap-3">
                            🔐 Acceso con Anonimato Extremo
                        </h2>

                        <div className="text-[#475569] space-y-6">
                            <p className="text-lg font-medium leading-relaxed">
                                Para garantizar el máximo nivel de anonimato, te recomendamos acceder a esta plataforma
                                a través de la red <strong className="text-[#7c3aed]">TOR</strong>.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <span className="bg-[#7c3aed] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shrink-0">1</span>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#1e293b] mb-2">Descarga TOR Browser</h3>
                                        <p className="text-[#64748b] font-medium mb-3">
                                            Visita el sitio oficial de TOR para descargar el navegador seguro:
                                        </p>
                                        <a
                                            href="https://www.torproject.org/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-[#7c3aed]/10 text-[#7c3aed] px-6 py-3 rounded-xl border-2 border-[#7c3aed]/30 font-bold hover:bg-[#7c3aed]/20 transition-colors"
                                        >
                                            🌐 torproject.org
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="bg-[#7c3aed] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shrink-0">2</span>
                                    <div className="w-full">
                                        <h3 className="text-lg md:text-xl font-bold text-[#1e293b] mb-2">Accede a nuestra plataforma segura</h3>
                                        <p className="text-[#64748b] font-medium mb-3">
                                            Una vez instalado TOR Browser, copia y pega esta dirección:
                                        </p>
                                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 w-full">
                                            <code className="text-[#7c3aed] font-mono font-bold text-sm break-all">{onionAddress}</code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(onionAddress);
                                                    alert('✓ Dirección copiada al portapapeles');
                                                }}
                                                className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-[#6d28d9] transition-colors w-full sm:w-auto"
                                            >
                                                📋 Copiar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="bg-[#7c3aed] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shrink-0">3</span>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#1e293b] mb-2">Navega de forma completamente anónima</h3>
                                        <p className="text-[#64748b] font-medium">
                                            TOR oculta tu dirección IP y ubicación, garantizando que nadie pueda rastrearte.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-amber-800 font-medium text-sm md:text-base leading-relaxed">
                                ⚠️ <strong>Importante:</strong> Nunca descargues TOR desde sitios no oficiales.
                                Solo usa <strong>torproject.org</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Pre-Report Checklist Modal */}
            {showChecklistModal && (
                <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowChecklistModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowChecklistModal(false)}
                            className="absolute top-4 right-4 bg-slate-100 text-slate-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-xl font-bold"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 flex items-center gap-3">
                            📋 Antes de Denunciar
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                {[
                                    { title: "Anonimato Total", text: "Toda la información es encriptada y tu dirección IP nunca se registra.", icon: "🔒" },
                                    { title: "Detalle es Clave", text: "Describe el 'Qué', 'Quién', 'Cuándo' y 'Dónde' con la mayor precisión posible.", icon: "📝" },
                                    { title: "Evidencia", text: "Si tienes fotos o documentos, prepáralos. Ayudan significativamente en la investigación.", icon: "📎" },
                                    { title: "Seguridad Personal", text: "Asegúrate de estar en un lugar privado y seguro antes de proceder.", icon: "🛡️" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-2xl mt-1">{item.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-[#1e293b] mb-1">{item.title}</h3>
                                            <p className="text-sm text-[#64748b] leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    onProceed();
                                    navigate('/denunciar');
                                }}
                                className="w-full bg-[#7c3aed] text-white py-4 px-6 rounded-full font-bold text-lg hover:bg-[#6d28d9] transition-all shadow-xl shadow-[#7c3aed]/20 active:scale-95"
                            >
                                ENTENDIDO, COMENZAR REPORTE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
