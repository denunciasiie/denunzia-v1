import React, { useState, useEffect, useRef } from 'react';
import { UserRole, CrimeCategory, CrimeType, ReportData } from '../types';
import { Lock, MapPin, FileText, Upload, CheckCircle, AlertOctagon, EyeOff, ArrowLeft, ShieldCheck, RefreshCw, AlertTriangle, Terminal, Zap, Info, Shield } from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { analyzeReport } from '../services/geminiService';
import { saveReportToDB } from '../services/storageService';
import { encryptData, clearClipboard, sanitizeInput, validateFormData, getEncryptionStatus } from '../services/encryptionService';

// Simple Canvas CAPTCHA Component
const Captcha: React.FC<{ onVerify: (isValid: boolean) => void }> = ({ onVerify }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput("");
    setIsVerified(false);
    onVerify(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise lines
        for (let i = 0; i < 15; i++) {
          ctx.strokeStyle = `rgba(217, 70, 239, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }

        ctx.font = "bold 28px 'Orbitron', sans-serif";
        ctx.fillStyle = "#d946ef";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        for (let i = 0; i < text.length; i++) {
          ctx.save();
          ctx.translate(30 + i * 25, 25);
          ctx.rotate((Math.random() - 0.5) * 0.4);
          ctx.fillText(text[i], 0, 0);
          ctx.restore();
        }
      }
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    if (val === captchaText) {
      setIsVerified(true);
      onVerify(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <canvas ref={canvasRef} width="180" height="50" className="rounded-xl border border-white/10 shadow-inner" />
        <button
          onClick={generateCaptcha}
          type="button"
          className="p-3 bg-white/5 hover:bg-[#d946ef]/10 text-[#d946ef] rounded-xl border border-white/5 transition-all"
          title="Regenerar CAPTCHA"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <input
        type="text"
        placeholder="INGRESE CÓDIGO"
        className={`w-full bg-black/40 border rounded-xl p-4 text-center font-cyber tracking-widest outline-none transition-all ${isVerified ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/5' : 'border-white/10 focus:border-[#d946ef] text-white'}`}
        value={userInput}
        onChange={handleInput}
        maxLength={6}
        disabled={isVerified}
      />
    </div>
  );
};

export const ReportForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [encryptionStage, setEncryptionStage] = useState<'idle' | 'encrypting' | 'complete' | 'error'>('idle');
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    isAnonymous: true,
    role: UserRole.CITIZEN,
    category: CrimeCategory.COMMON,
    type: CrimeType.THEFT,
    customCrimeType: '',
    lat: 19.4326,
    lng: -99.1332,
    addressDetails: {
      street: '',
      colony: '',
      zipCode: '',
      municipality: '',
      state: '',
      references: ''
    },
    narrative: "",
    entities: "",
    files: [] as File[]
  });



  const handleLocationSelect = async (lat: number, lng: number) => {
    // 1. Update coordinates immediately
    setFormData(prev => ({ ...prev, lat, lng }));

    // 2. Reverse Geocoding (OpenStreetMap Nominatim)
    // Using a more detailed query parameters
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();

      if (data && data.address) {
        console.log("📍 Auto-fill Address:", data.address);
        const addr = data.address;

        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          addressDetails: {
            ...prev.addressDetails,
            // Map OSM fields to our fields with fallbacks
            state: addr.state || addr.region || '',
            municipality: addr.city || addr.town || addr.village || addr.county || addr.municipality || '',
            colony: addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || '',
            zipCode: addr.postcode || '',
            // Only update street if it was empty, or if we want to provide a suggestion. 
            // We'll append it if it looks valid.
            street: prev.addressDetails.street || (addr.road ? `${addr.road} ${addr.house_number || ''}`.trim() : '')
          }
        }));
      }
    } catch (error) {
      console.error("Error obtaining address:", error);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setEncryptionStage('idle');

    // Validate only required fields
    if (!formData.narrative || formData.narrative.trim().length < 20) {
      setErrorMsg(`La narrativa es demasiado corta. Mínimo 20 caracteres para validación.`);
      return;
    }

    if (formData.type === CrimeType.OTHER && formData.customCrimeType.trim().length < 3) {
      setErrorMsg(`Debe especificar el tipo de delito (mínimo 3 caracteres).`);
      return;
    }
    if (!captchaValid) {
      setErrorMsg("Error de validación CAPTCHA.");
      return;
    }

    setLoading(true);
    setEncryptionStage('encrypting');

    try {
      const uniqueId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      setReportId(uniqueId.toUpperCase());

      // Sanitize inputs
      const sanitizedNarrative = sanitizeInput(formData.narrative);
      const sanitizedEntities = sanitizeInput(formData.entities);

      // Encrypt sensitive data client-side
      const dataToEncrypt = JSON.stringify({
        narrative: sanitizedNarrative,
        entities: sanitizedEntities,
        addressDetails: formData.addressDetails,
        customCrimeType: formData.customCrimeType,
      });

      const encryptedPayload = await encryptData(dataToEncrypt);
      setEncryptionStage('complete');

      let analysis;
      try {
        analysis = await analyzeReport(sanitizedNarrative, formData.type);
      } catch (e) {
        console.warn("AI Analysis failed", e);
      }

      // Prepare report data for backend API
      const reportToSave: any = {
        id: uniqueId,
        isAnonymous: formData.isAnonymous,
        role: formData.role,
        category: formData.category,
        type: formData.type,
        customCrimeType: formData.type === CrimeType.OTHER ? formData.customCrimeType : undefined,

        // Encrypted payload for backend
        encryptedData: encryptedPayload.encryptedData,
        encryptedKey: encryptedPayload.encryptedKey,
        iv: encryptedPayload.iv,
        algorithm: encryptedPayload.algorithm,

        // Location data
        location: {
          lat: formData.lat,
          lng: formData.lng,
          details: formData.addressDetails
        },

        timestamp: new Date().toISOString(),
        trustScore: analysis?.trustScore,
        aiAnalysis: analysis?.summary
      };

      console.log('[DEBUG] Sending report to backend:', {
        id: reportToSave.id,
        hasEncryptedData: !!reportToSave.encryptedData,
        hasEncryptedKey: !!reportToSave.encryptedKey,
        hasIV: !!reportToSave.iv
      });

      // Send to backend API (await the async call)
      await saveReportToDB(reportToSave);

      console.log('[SUCCESS] Report saved to database');

      // Clear clipboard for security
      await clearClipboard();

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMsg(`Error al procesar la denuncia: ${errorMessage}`);
      setEncryptionStage('error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-700">
        <div className="glass-effect p-12 rounded-[2.5rem] border border-[#10b981]/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
            <ShieldCheck size={200} className="text-[#10b981]" />
          </div>
          <div className="bg-[#10b981]/10 p-6 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-[#10b981]/20">
            <CheckCircle size={56} className="text-[#10b981]" />
          </div>
          <h2 className="text-4xl font-cyber font-bold mb-4 text-[#10b981] tracking-[0.2em] uppercase">Misión Cumplida</h2>
          <p className="text-[#94a3b8] mb-12 text-sm leading-relaxed uppercase tracking-[0.1em] font-cyber max-w-sm mx-auto">
            Su información ha sido encriptada y transmitida a través de la red segura de inteligencia.
          </p>

          <div className="bg-black/60 p-8 rounded-2xl border border-white/5 mb-10 text-left font-mono relative group">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Terminal size={14} className="text-[#d946ef]" />
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[#94a3b8] block text-[10px] mb-1">ID DE SEGUIMIENTO (AES-256):</span>
                <span className="text-[#3b82f6] text-xl font-bold tracking-widest break-all select-all font-cyber">{reportId}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[#94a3b8] text-[10px]">ESTADO:</span>
                <span className="text-[#10b981] text-[10px] font-bold animate-pulse">● ENCRYPTED & TRANSMITTED</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-5 rounded-2xl font-cyber text-xs border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-[#020617] transition-all duration-700 tracking-[0.3em] shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
          >
            NUEVA DENUNCIA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:p-8 pb-24">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-cyber font-bold text-white tracking-[0.1em]">
          Módulo de Denuncia
        </h1>
        <p className="text-[#94a3b8] text-[10px] md:text-[10px] font-cyber uppercase tracking-[0.4em] opacity-60 mt-2">
          Completa el cuestionario y continúa dando click en el botón "Continuar"
        </p>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-cyber text-[#8b949e] uppercase tracking-wider">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-[10px] font-cyber text-[#d946ef]">
              {Math.round((step / totalSteps) * 100)}% Completado
            </span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Encryption Status Indicator */}
        <div className="mt-4 flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl p-3">
          <div className="p-2 bg-[#8b5cf6]/10 rounded-lg">
            <Shield size={16} className="text-[#8b5cf6]" style={{ color: getEncryptionStatus(encryptionStage).color }} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-cyber text-white uppercase tracking-wider">
              {getEncryptionStatus(encryptionStage).icon} {getEncryptionStatus(encryptionStage).message}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper HUD */}
      <div className="flex items-center justify-between mb-16 max-w-lg mx-auto relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 -z-10"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-cyber text-sm transition-all duration-500 border ${step >= s ? 'bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] border-[#d946ef] text-[#020617] shadow-[0_0_20px_rgba(217,70,239,0.4)]' : 'bg-black/60 border-white/10 text-[#94a3b8]'}`}>
              {s}
            </div>
            <span className={`absolute -bottom-8 whitespace-nowrap text-[9px] font-cyber uppercase tracking-widest transition-colors duration-300 ${step === s ? 'text-[#d946ef]' : 'text-[#94a3b8]'}`}>
              {s === 1 ? 'Clasificación' : s === 2 ? 'Ubicación' : 'Evidencia'}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="glass-effect rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20">
          <Zap size={24} className="text-[#d946ef]" />
        </div>

        <div className="p-10">
          {errorMsg && (
            <div className="mb-8 bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              <p className="text-[10px] font-cyber uppercase tracking-wider">{errorMsg}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Role */}
                <div className="space-y-4">
                  <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.2em] ml-1">Perfil del Reportante</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[#e6edf3] text-sm focus:border-[#d946ef] outline-none transition-all font-cyber appearance-none cursor-pointer hover:bg-black/60"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role} className="bg-[#06090f]">{role}</option>
                    ))}
                  </select>
                </div>

                {/* Anonymity */}
                <div className="space-y-4">
                  <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.2em] ml-1">Preferencia de Privacidad</label>
                  <button
                    onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${formData.isAnonymous ? 'bg-[#d946ef]/5 border-[#00f2ff]/30' : 'bg-white/5 border-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.isAnonymous ? 'bg-[#d946ef]/20 text-[#d946ef]' : 'bg-white/10 text-[#8b949e]'}`}>
                        <EyeOff size={16} />
                      </div>
                      <span className={`text-[10px] font-cyber uppercase tracking-wider ${formData.isAnonymous ? 'text-white' : 'text-[#8b949e]'}`}>
                        {formData.isAnonymous ? "MODO ANÓNIMO TOTAL" : "MODO IDENTIFICADO"}
                      </span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isAnonymous ? 'bg-[#d946ef]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isAnonymous ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.2em] ml-1">Categoría Criminal</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[#e6edf3] text-sm focus:border-[#d946ef] outline-none transition-all font-cyber appearance-none cursor-pointer hover:bg-black/60"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as CrimeCategory })}
                  >
                    {Object.values(CrimeCategory).map(c => <option key={c} value={c} className="bg-[#06090f] uppercase">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.2em] ml-1">Tipo de Delito</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[#e6edf3] text-sm focus:border-[#d946ef] outline-none transition-all font-cyber appearance-none cursor-pointer hover:bg-black/60"
                    value={formData.type}
                    onChange={e => {
                      const newType = e.target.value as CrimeType;
                      setFormData({ ...formData, type: newType, customCrimeType: newType === CrimeType.OTHER ? formData.customCrimeType : '' });
                    }}
                  >
                    {Object.values(CrimeType).map(t => <option key={t} value={t} className="bg-[#06090f] uppercase">{t}</option>)}
                  </select>

                  {/* Custom Crime Type Input - Shows when OTHER is selected */}
                  {formData.type === CrimeType.OTHER && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Especifique el tipo de delito..."
                          className="w-full bg-black/40 border border-[#d946ef]/30 rounded-xl p-4 pr-16 text-[#e6edf3] text-sm focus:border-[#d946ef] outline-none transition-all font-cyber"
                          value={formData.customCrimeType}
                          onChange={e => setFormData({ ...formData, customCrimeType: e.target.value.slice(0, 100) })}
                          maxLength={100}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-cyber text-[#8b949e]">
                          {formData.customCrimeType.length}/100
                        </span>
                      </div>
                      <p className="text-[9px] font-cyber text-[#8b949e] uppercase tracking-wider ml-1">
                        ⚠️ Máximo 100 caracteres
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/20 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-[#ffcc00]/10 rounded-lg text-[#ffcc00]">
                  <Info size={20} />
                </div>
                <p className="text-[10px] font-cyber text-[#8b949e] uppercase tracking-wider leading-relaxed">
                  <strong className="text-[#ffcc00]">PROTOCOLO GEOGRÁFICO:</strong>
                  1. Seleccione el punto en el mapa.
                  2. Verifique la dirección detectada.
                  3. Complete manualmente si falta información.
                </p>
              </div>

              {/* MAPA - Primero en el orden visual para Móvil */}
              <div className="h-[400px] w-full rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl dark-map">
                <LeafletMap mode="input" onLocationSelect={handleLocationSelect} />
                <div className="absolute top-4 left-4 z-[999] bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md pointer-events-none">
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-[#d946ef] animate-pulse" />
                    <span className="text-[9px] font-mono text-white/70">
                      Lat: {formData.lat.toFixed(5)} / Lng: {formData.lng.toFixed(5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CAMPOS DE DIRECCIÓN - Debajo del mapa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber text-[#d946ef] uppercase ml-1">Estado / Entidad *</label>
                  <input
                    type="text"
                    placeholder="Ej. Ciudad de México"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber transition-all"
                    value={formData.addressDetails.state || ''}
                    onChange={e => setFormData({ ...formData, addressDetails: { ...formData.addressDetails, state: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber text-[#d946ef] uppercase ml-1">Municipio / Alcaldía *</label>
                  <input
                    type="text"
                    placeholder="Ej. Cuauhtémoc"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber transition-all"
                    value={formData.addressDetails.municipality || ''}
                    onChange={e => setFormData({ ...formData, addressDetails: { ...formData.addressDetails, municipality: e.target.value } })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber text-[#d946ef] uppercase ml-1">Colonia *</label>
                  <input
                    type="text"
                    placeholder="Ej. Centro Histórico"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber transition-all"
                    value={formData.addressDetails.colony}
                    onChange={e => setFormData({ ...formData, addressDetails: { ...formData.addressDetails, colony: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber text-[#d946ef] uppercase ml-1">Código Postal *</label>
                  <input
                    type="text"
                    placeholder="Ej. 06000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber transition-all"
                    value={formData.addressDetails.zipCode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setFormData({ ...formData, addressDetails: { ...formData.addressDetails, zipCode: val } })
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-cyber text-[#d946ef] uppercase ml-1">Calle y Número (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Reforma 222 (Opcional)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber transition-all"
                  value={formData.addressDetails.street}
                  onChange={e => setFormData({ ...formData, addressDetails: { ...formData.addressDetails, street: e.target.value } })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.2em] ml-1 flex justify-between">
                  <span>Narrativa Detallada de los Hechos</span>
                  <span className="text-[#8b949e] lowercase font-normal italic">Cifrado E2EE</span>
                </label>
                <div className="relative">
                  <textarea
                    className="w-full h-56 bg-black/40 border border-white/10 rounded-2xl p-6 text-[#e6edf3] text-sm focus:border-[#d946ef] outline-none transition-all font-sans leading-relaxed resize-none custom-scrollbar"
                    placeholder="Describa el evento. La IA analizará este texto para evaluar verosimilitud."
                    value={formData.narrative}
                    onChange={e => setFormData({ ...formData, narrative: e.target.value })}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    maxLength={10000}
                  />
                  <div className="absolute bottom-4 right-6 flex items-center gap-3">
                    <span className={`text-[10px] font-cyber ${formData.narrative.length < 20 ? 'text-[#ff4d4d]' : 'text-[#00ff9d]'}`}>
                      {formData.narrative.length} CHARS
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.1em] ml-1">Entidades Relevantes</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-[#e6edf3] outline-none focus:border-[#d946ef] font-cyber"
                      placeholder="Políticos, Empresas, Grupos..."
                      value={formData.entities}
                      onChange={e => setFormData({ ...formData, entities: e.target.value })}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.1em] ml-1">Validación de Humano</label>
                    <Captcha onVerify={setCaptchaValid} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-cyber text-[#d946ef] uppercase tracking-[0.1em] ml-1">Evidencia Digital</label>
                  <div className="h-full bg-black/40 border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center group hover:border-[#00f2ff]/50 transition-all cursor-pointer relative">
                    <input
                      type="file" multiple
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => e.target.files && setFormData({ ...formData, files: Array.from(e.target.files) })}
                    />
                    <Upload className="text-[#8b949e] group-hover:text-[#d946ef] mb-4 transition-colors" size={48} />
                    <span className="text-[10px] font-cyber text-white uppercase tracking-widest">Inyectar Archivos</span>
                    <span className="text-[9px] text-[#8b949e] mt-2 uppercase">Fotos, Video, Audio, Documentos</span>

                    {formData.files.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {formData.files.map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse"></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
              className={`flex items-center gap-3 font-cyber text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${step === 1 ? 'opacity-0' : 'text-[#94a3b8] hover:text-[#d946ef]'}`}
            >
              <ArrowLeft size={16} /> Volver
            </button>

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 2) {
                    const { state, municipality, colony, zipCode } = formData.addressDetails;

                    // Solo validamos los campos generales. Calle es opcional.
                    if (!state || !municipality || !colony || !zipCode) {
                      setErrorMsg("Por favor complete los campos: Estado, Municipio, Colonia y CP (La calle es opcional).");
                      return;
                    }
                    setErrorMsg(null); // Clear errors if valid
                  }

                  if (step === 2 && formData.lat === 19.4326 && formData.lng === -99.1332) {
                    if (!confirm("¿Desea usar las coordenadas por defecto?")) return;
                  }
                  setStep(step + 1);
                }}
                className="bg-[#d946ef]/10 hover:bg-[#d946ef] text-[#d946ef] hover:text-[#020617] px-10 py-4 rounded-2xl font-cyber text-[10px] uppercase tracking-[0.3em] border border-[#d946ef]/30 transition-all duration-500 shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]"
              >
                Continuar Protocolo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !captchaValid}
                className="relative group overflow-hidden bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#3b82f6] text-[#020617] px-12 py-4 rounded-2xl font-cyber text-[11px] font-bold tracking-[0.3em] transition-all duration-500 shadow-[0_0_40px_rgba(217,70,239,0.4)] disabled:opacity-20 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> PROCESANDO...
                  </>
                ) : (
                  <>EJECUTAR TRANSMISIÓN</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};