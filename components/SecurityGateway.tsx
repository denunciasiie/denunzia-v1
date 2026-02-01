import React, { useState, useEffect } from 'react';

interface SecurityGatewayProps {
    onProceed: () => void;
}

export const SecurityGateway: React.FC<SecurityGatewayProps> = ({ onProceed }) => {
    const [showTorModal, setShowTorModal] = useState(false);
    const onionAddress = "siiecxxxxxxxxxxxxxxxx.onion"; // Replace with actual .onion address

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
        // Add meta tags for no-cache
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

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-x-hidden selection:bg-[#d946ef]/30 font-sans">
            {/* Background Gradient - Fixed */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] -z-10"></div>

            {/* Panic Button - Always Fixed */}
            <button
                onClick={handlePanic}
                className="fixed top-4 right-4 z-[9999] bg-red-600 text-white border-none py-2 px-4 md:py-3 md:px-6 rounded-lg text-xs md:text-base font-black cursor-pointer shadow-lg shadow-red-600/40 hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
                aria-label="Botón de pánico - Salir inmediatamente"
                title="Presiona ESC o haz clic para salir inmediatamente"
            >
                ⚠️ <span className="hidden sm:inline">SALIDA RÁPIDA</span><span className="sm:hidden">SALIR</span>
            </button>

            {/* Scrollable Content Wrapper */}
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-24 md:py-12">
                {/* Main Content */}
                <div className="w-full max-w-2xl text-center">
                    {/* Logo/Icon */}
                    <div className="mb-6 flex justify-center transform hover:scale-105 transition-transform duration-500">
                        <img src="/denunzia_logo.png" alt="DenunzIA Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
                    </div>

                    {/* Warning Message */}
                    <h1 className="text-2xl md:text-4xl font-black text-slate-50 mb-6 md:mb-8 tracking-wide leading-tight px-4">
                        ACCESO SEGURO A DENUNCIAS ANÓNIMAS
                    </h1>

                    <div className="bg-[#d946ef]/10 border-2 border-[#d946ef]/30 rounded-2xl p-6 md:p-8 mb-8 md:mb-10 text-left mx-2 backdrop-blur-sm">
                        <p className="text-base md:text-lg font-bold text-slate-200 mb-3 md:mb-4 leading-relaxed flex items-start gap-3">
                            <span className="shrink-0">⚡</span>
                            <span>Esta plataforma protege tu identidad mediante cifrado de extremo a extremo.</span>
                        </p>
                        <p className="text-base md:text-lg font-bold text-slate-200 mb-3 md:mb-4 leading-relaxed flex items-start gap-3">
                            <span className="shrink-0">🔒</span>
                            <span>Tu ubicación, dispositivo e identidad permanecerán completamente anónimos.</span>
                        </p>
                        <p className="text-base md:text-lg font-bold text-slate-200 leading-relaxed flex items-start gap-3">
                            <span className="shrink-0">🛡️</span>
                            <span>No almacenamos registros de acceso ni información personal.</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 mb-8 mx-2">
                        <button
                            onClick={onProceed}
                            className="group relative overflow-hidden bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] border-none rounded-2xl p-5 md:p-6 cursor-pointer flex items-center gap-4 md:gap-6 shadow-xl shadow-[#d946ef]/20 transition-all hover:-translate-y-1 active:scale-95 text-left"
                        >
                            <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform">✓</span>
                            <div className="flex-1">
                                <div className="text-lg md:text-xl font-black text-slate-50 mb-1">Proceder con Seguridad Estándar</div>
                                <div className="text-sm md:text-base font-semibold text-slate-300">Conexión cifrada HTTPS + Anonimización de datos</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowTorModal(true)}
                            className="group bg-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-5 md:p-6 cursor-pointer flex items-center gap-4 md:gap-6 transition-all hover:-translate-y-1 hover:bg-blue-500/20 active:scale-95 text-left"
                        >
                            <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform">🔐</span>
                            <div className="flex-1">
                                <div className="text-lg md:text-xl font-black text-slate-50 mb-1">Necesito Anonimato Extremo</div>
                                <div className="text-sm md:text-base font-semibold text-slate-300">Acceso vía red TOR para máxima privacidad</div>
                            </div>
                        </button>
                    </div>

                    {/* Footer Info */}
                    <p className="text-slate-400 font-semibold text-sm md:text-base px-6">
                        💡 Presiona <strong className="text-slate-200">ESC</strong> en cualquier momento para salir inmediatamente
                    </p>
                </div>
            </div>

            {/* TOR Modal */}
            {showTorModal && (
                <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowTorModal(false)}>
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl border-2 border-blue-500/30" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowTorModal(false)}
                            className="absolute top-4 right-4 bg-white/10 text-slate-200 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors text-xl font-bold"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-50 mb-6 flex items-center gap-3">
                            🔐 Acceso con Anonimato Extremo
                        </h2>

                        <div className="text-slate-200 space-y-6">
                            <p className="text-lg font-semibold leading-relaxed">
                                Para garantizar el máximo nivel de anonimato, te recomendamos acceder a esta plataforma
                                a través de la red <strong className="text-blue-400">TOR</strong>.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <span className="bg-blue-500 text-white w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-lg shrink-0">1</span>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black text-slate-50 mb-2">Descarga TOR Browser</h3>
                                        <p className="text-slate-300 font-medium mb-3">
                                            Visita el sitio oficial de TOR para descargar el navegador seguro:
                                        </p>
                                        <a
                                            href="https://www.torproject.org/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-violet-500/20 text-violet-300 px-4 py-2 md:px-6 md:py-3 rounded-xl border-2 border-violet-500/40 font-bold hover:bg-violet-500/30 transition-colors"
                                        >
                                            🌐 torproject.org
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="bg-blue-500 text-white w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-lg shrink-0">2</span>
                                    <div className="w-full">
                                        <h3 className="text-lg md:text-xl font-black text-slate-50 mb-2">Accede a nuestra dirección .onion</h3>
                                        <p className="text-slate-300 font-medium mb-3">
                                            Una vez instalado TOR Browser, copia y pega esta dirección:
                                        </p>
                                        <div className="bg-black/40 p-3 md:p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-3 w-full">
                                            <code className="text-emerald-400 font-mono font-bold text-sm break-all">{onionAddress}</code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(onionAddress);
                                                    alert('✓ Dirección copiada al portapapeles');
                                                }}
                                                className="bg-emerald-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-emerald-600 transition-colors w-full sm:w-auto"
                                            >
                                                📋 Copiar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="bg-blue-500 text-white w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-lg shrink-0">3</span>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black text-slate-50 mb-2">Navega de forma completamente anónima</h3>
                                        <p className="text-slate-300 font-medium">
                                            TOR oculta tu dirección IP y ubicación, garantizando que nadie pueda rastrearte.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 md:p-5 text-amber-400 font-bold text-sm md:text-base leading-relaxed">
                                ⚠️ <strong>Importante:</strong> Nunca descargues TOR desde sitios no oficiales.
                                Solo usa <strong>torproject.org</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
