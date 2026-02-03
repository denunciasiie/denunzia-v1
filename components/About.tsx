import React from 'react';

export function About() {
    return (
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
    );
}
