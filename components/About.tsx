import React from 'react';
import { Shield, Lock, MapPin, Sparkles, Eye, Server, Zap, ExternalLink, Download, FileText } from 'lucide-react';

export function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#1e293b] mb-4 font-heading">
                        Sistema DenunZIA
                    </h1>
                    <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                        Plataforma de denuncia anónima con cifrado de extremo a extremo
                    </p>
                </div>

                {/* Main Description */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-8">
                    <div className="space-y-6 text-[#64748b] leading-relaxed">
                        <p className="text-lg">
                            El <span className="text-[#7c3aed] font-bold">Sistema Integrado de Inteligencia Ética y Criminal</span> es una infraestructura de vanguardia diseñada para la protección ciudadana y la transparencia institucional.
                        </p>
                        <p>
                            Nuestra arquitectura de seguridad implementa protocolos de grado militar para garantizar que la información fluya sin riesgos de intercepción o represalias.
                        </p>
                        <p className="text-sm bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl text-amber-800">
                            <strong>Compromiso de Privacidad:</strong> No almacenamos datos personales, direcciones IP, ni información de ubicación exacta. Tu anonimato es nuestra prioridad.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* TOR Infrastructure */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#7c3aed]/10 rounded-xl shrink-0">
                                <Shield size={24} className="text-[#7c3aed]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1e293b] mb-2 font-heading">
                                    Infraestructura TOR
                                </h3>
                                <p className="text-sm text-[#64748b] leading-relaxed">
                                    Ruteo cebolla (Onion Routing) para el anonimato total del origen de la información. Acceso opcional vía red TOR para máxima privacidad.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* E2EE Encryption */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#6366f1]/10 rounded-xl shrink-0">
                                <Lock size={24} className="text-[#6366f1]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1e293b] mb-2 font-heading">
                                    Cifrado E2EE
                                </h3>
                                <p className="text-sm text-[#64748b] leading-relaxed">
                                    Cifrado de extremo a extremo basado en RSA-4096 + AES-256-GCM. Solo las autoridades con la clave privada pueden descifrar la información.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* K-Anonymity */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#10b981]/10 rounded-xl shrink-0">
                                <MapPin size={24} className="text-[#10b981]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1e293b] mb-2 font-heading">
                                    K-Anonimato
                                </h3>
                                <p className="text-sm text-[#64748b] leading-relaxed">
                                    Algoritmos de ofuscación espacial para proteger la ubicación exacta de los denunciantes. Las coordenadas se aproximan para garantizar privacidad.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gemini AI */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#d946ef]/10 rounded-xl shrink-0">
                                <Sparkles size={24} className="text-[#d946ef]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1e293b] mb-2 font-heading">
                                    Gemini AI 2.5
                                </h3>
                                <p className="text-sm text-[#64748b] leading-relaxed">
                                    Motores de inteligencia artificial para validación de verosimilitud en tiempo real y análisis de patrones delictivos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ICCS Section */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-8 border-2 border-[#7c3aed]/10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="p-6 bg-[#7c3aed]/5 rounded-3xl shrink-0">
                            <FileText size={64} className="text-[#7c3aed]" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
                                Clasificación Internacional ICCS (ONU)
                            </h2>
                            <p className="text-[#64748b] mb-6 leading-relaxed">
                                Utilizamos la <strong>Clasificación Internacional de Delitos para Fines Estadísticos (ICCS)</strong> de la UNODC para estandarizar la recolección de datos y mejorar la inteligencia analítica. Este estándar global garantiza que cada reporte sea procesado bajo criterios internacionales de justicia y seguridad.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <a
                                    href="https://www.unodc.org/unodc/en/data-and-analysis/statistics/iccs.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-bold hover:bg-[#6d28d9] transition-all shadow-lg shadow-[#7c3aed]/20"
                                >
                                    <ExternalLink size={18} />
                                    Sitio Oficial ONU
                                </a>
                                <a
                                    href="/ICCS_SPANISH_2016_web.pdf"
                                    download
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#7c3aed] text-[#7c3aed] rounded-xl font-bold hover:bg-[#7c3aed]/5 transition-all"
                                >
                                    <Download size={18} />
                                    Descargar Manual (PDF)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Features */}
                <div className="bg-gradient-to-br from-[#7c3aed] to-[#6366f1] rounded-3xl p-8 md:p-12 text-white shadow-xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-heading">
                        Características Adicionales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                                <Eye size={32} />
                            </div>
                            <h3 className="font-bold mb-2">Sin Rastreo</h3>
                            <p className="text-sm text-white/80">
                                No almacenamos cookies de seguimiento ni registros de acceso
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                                <Server size={32} />
                            </div>
                            <h3 className="font-bold mb-2">Infraestructura Segura</h3>
                            <p className="text-sm text-white/80">
                                Servidores con certificados SSL y protección DDoS
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                                <Zap size={32} />
                            </div>
                            <h3 className="font-bold mb-2">Respuesta Rápida</h3>
                            <p className="text-sm text-white/80">
                                Sistema optimizado para procesamiento en tiempo real
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-[#64748b]">
                        🔒 Tu seguridad y anonimato son nuestra máxima prioridad
                    </p>
                </div>
            </div>
        </div>
    );
}
