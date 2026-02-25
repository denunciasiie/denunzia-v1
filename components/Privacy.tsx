import React, { useEffect } from 'react';
import { Shield, EyeOff, Lock, Archive, FileCheck, ArrowLeft, CameraOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Privacy() {
    const navigate = useNavigate();

    useEffect(() => {
        // Actualizar metadatos específicos para SEO de Privacidad y Seguridad
        document.title = "Aviso de Privacidad Integral | DenunZIA México - Seguridad E2EE";

        // Intentar actualizar la meta descripción si existe, o crearla
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Aviso de privacidad de DenunZIA México. Detalles sobre nuestra arquitectura de anonimato total, cifrado E2EE RSA-4096 y eliminación automática de metadatos EXIF.");
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-[#f8fafc] selection:bg-[#d946ef]/30 font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
                {/* Navigation */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-[#94a3b8] hover:text-[#d946ef] transition-all mb-12 font-heading font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Panel Táctico
                </button>

                {/* Header Section */}
                <header className="text-center mb-16">
                    <div className="inline-flex p-5 bg-gradient-to-br from-[#d946ef]/20 to-[#7c3aed]/20 rounded-3xl mb-6 border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                        <Shield size={48} className="text-[#d946ef] animate-pulse" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                        Aviso de Privacidad Integral
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[#d946ef] font-heading font-bold text-sm uppercase tracking-widest">
                        <span>DenunZIA México</span>
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                        <span>Protocolo v2.5.0-SEC</span>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Intro Card */}
                    <div className="glass-effect rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Lock size={120} />
                        </div>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
                            En <span className="text-white font-bold decoration-[#d946ef] underline decoration-2 underline-offset-4">DenunZIA</span>, la protección de tu identidad no es una opción, es nuestra arquitectura fundamental. Este aviso detalla cómo garantizamos el anonimato total en cada reporte ciudadano a nivel nacional.
                        </p>
                    </div>

                    {/* Section 1: Identity */}
                    <section className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-[#d946ef]/20 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#d946ef]/10 rounded-2xl text-[#d946ef]">
                                <EyeOff size={24} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">1. Identidad y Anonimato Total</h2>
                        </div>
                        <div className="space-y-4 text-slate-400 leading-relaxed">
                            <p>DenunZIA es una plataforma diseñada para que ningún dato personal sea requerido, almacenado o procesado.</p>
                            <p className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 text-slate-300 italic">
                                "No solicitamos nombres, correos electrónicos, números telefónicos ni identificaciones oficiales."
                            </p>
                            <p>Nuestra infraestructura está configurada para no registrar direcciones IP ni metadatos de conexión, asegurando que tu rastro digital se detenga en tu dispositivo.</p>
                        </div>
                    </section>

                    {/* Section 2: Technical Shield */}
                    <section className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-[#3b82f6]/20 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#3b82f6]/10 rounded-2xl text-[#3b82f6]">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">2. Blindaje Técnico de la Evidencia</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                                <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <FileCheck size={18} className="text-[#3b82f6]" />
                                    Cifrado RSA-4096
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Todos los reportes son encriptados mediante algoritmos de extremo a extremo (E2EE), garantizando que solo los analistas autorizados puedan acceder a la información.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                                <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <CameraOff size={18} className="text-[#3b82f6]" />
                                    Limpieza EXIF
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Nuestro sistema elimina automáticamente las coordenadas GPS y marcas de identificación de todas las fotos y documentos subidos antes de ser almacenados.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Custody */}
                    <section className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-[#10b981]/20 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#10b981]/10 rounded-2xl text-[#10b981]">
                                <Archive size={24} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">3. Custodia y Finalidad</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            La información recolectada tiene como único fin la generación de inteligencia ciudadana y la visualización de datos en nuestro mapa de calor nacional.
                            DenunZIA se compromete a mantener la integridad de la base de datos mediante aislamiento en contenedores seguros.
                        </p>
                    </section>

                    {/* Section 4: Rights */}
                    <section className="bg-white/5 rounded-[2rem] p-8 border border-white/5 hover:border-slate-500/20 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-100/10 rounded-2xl text-slate-100">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading">4. Derechos del Usuario</h2>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed bg-[#d946ef]/10 p-6 rounded-3xl border border-[#d946ef]/20">
                            "Dado que no recolectamos datos personales, no existen perfiles de usuario que consultar, rectificar o cancelar. Tu anonimato es el ejercicio máximo de tu privacidad."
                        </p>
                    </section>

                    {/* Meta Info for Bots */}
                    <div className="pt-12 border-t border-white/5 text-center space-y-4">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-heading">
                            Certified Secure Infrastructure ● E2EE Verified ● Metadata Scrubbing Active
                        </p>
                        <p className="text-xs text-slate-600">
                            © 2026 DenunZIA SIIEC - Sistema Integrado de Inteligencia Ética y Criminal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
