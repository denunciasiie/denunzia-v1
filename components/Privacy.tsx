import React from 'react';
import { Shield, Eye, Lock, Server, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#7c3aed] transition-colors mb-8 font-heading font-bold uppercase tracking-tight text-sm"
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex p-4 bg-[#7c3aed]/10 rounded-2xl mb-4">
                        <Shield size={48} className="text-[#7c3aed]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-[#1e293b] mb-4 font-heading">
                        Política de Privacidad
                    </h1>
                    <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                        Tu anonimato es el pilar de nuestra infraestructura de seguridad
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Zero Knowledge Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-[#7c3aed]/10 rounded-xl shrink-0">
                                <Eye size={24} className="text-[#7c3aed]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1e293b] mb-4 font-heading">
                                    Filosofía de "Cero Conocimiento"
                                </h2>
                                <p className="text-[#64748b] leading-relaxed">
                                    El sistema DenunZIA ha sido diseñado bajo el principio de "Privacy by Design".
                                    <strong> No recolectamos, no procesamos y no almacenamos</strong> ninguna información que pueda identificar al usuario, incluyendo pero no limitado a:
                                </p>
                                <ul className="mt-4 space-y-2 text-sm text-[#64748b] list-disc list-inside">
                                    <li>Direcciones IP de origen</li>
                                    <li>Metadatos del navegador (User Agent)</li>
                                    <li>Huellas digitales del dispositivo (Fingerprinting)</li>
                                    <li>Cookies de rastreo o sesión</li>
                                    <li>Identificadores de publicidad</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Data Handling Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="p-3 bg-[#6366f1]/10 rounded-xl w-fit mb-4">
                                <Lock size={24} className="text-[#6366f1]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1e293b] mb-4 font-heading">Cifrado de Datos</h3>
                            <p className="text-sm text-[#64748b] leading-relaxed">
                                Toda la información enviada es cifrada en tu dispositivo antes de salir hacia nuestros servidores. Utilizamos RSA-4096 para el intercambio de claves y AES-256-GCM para la carga útil de datos.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="p-3 bg-[#10b981]/10 rounded-xl w-fit mb-4">
                                <Server size={24} className="text-[#10b981]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1e293b] mb-4 font-heading">Almacenamiento Seguro</h3>
                            <p className="text-sm text-[#64748b] leading-relaxed">
                                Los reportes se almacenan de forma fragmentada y cifrada. Ni siquiera nuestros administradores de base de datos pueden leer el contenido sin la clave privada resguardada en hardware seguro.
                            </p>
                        </div>
                    </div>

                    {/* Legal Compliance */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-[#7c3aed]/10">
                        <div className="flex items-center gap-4 mb-6">
                            <FileText size={32} className="text-[#7c3aed]" />
                            <h2 className="text-2xl font-bold text-[#1e293b] font-heading">Cumplimiento Legal</h2>
                        </div>
                        <p className="text-[#64748b] leading-relaxed mb-6">
                            DenunZIA cumple con los estándares internacionales de protección de datos personales y las mejores prácticas en sistemas de alerta (Whistleblowing). Al no poseer datos personales, el sistema está exento de riesgos de filtración de identidad bajo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).
                        </p>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-sm text-amber-800">
                            "La mejor forma de proteger tus datos es no tenerlos." - Equipo de Seguridad DenunZIA
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-[#64748b] text-sm">
                    <p>© 2026 DenunZIA SIIEC - Todos los derechos reservados.</p>
                    <p className="mt-2 text-xs">Versión del protocolo: 2.5.0-SEC</p>
                </div>
            </div>
        </div>
    );
}
