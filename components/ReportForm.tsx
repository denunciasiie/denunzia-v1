import React, { useState, useEffect, useRef } from 'react';
import { UserRole, CrimeCategory, CrimeType } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { analyzeReport } from '../services/geminiService';
import { encryptData, sanitizeInput } from '../services/encryptionService';
import { uploadToPinata } from '../services/pinataService';

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
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise lines
        for (let i = 0; i < 15; i++) {
          ctx.strokeStyle = `rgba(124, 58, 237, ${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }

        ctx.font = "bold 28px Arial, sans-serif";
        ctx.fillStyle = "#7c3aed";
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <canvas ref={canvasRef} width="180" height="50" className="rounded-xl border-2 border-slate-200 shadow-sm" />
        <button
          onClick={generateCaptcha}
          type="button"
          className="p-3 bg-slate-100 hover:bg-[#7c3aed]/10 text-[#7c3aed] rounded-xl border-2 border-slate-200 transition-all"
          title="Regenerar CAPTCHA"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <input
        type="text"
        placeholder="INGRESE CÓDIGO"
        className={`w-full border-2 rounded-xl p-4 text-center font-bold tracking-widest outline-none transition-all ${isVerified
            ? 'border-green-500 text-green-600 bg-green-50'
            : 'border-slate-200 focus:border-[#7c3aed] text-[#1e293b] bg-white'
          }`}
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

  const [formData, setFormData] = useState({
    role: '' as UserRole | '',
    customRole: '',
    lat: null as number | null,
    lng: null as number | null,
    addressDetails: {
      street: '',
      colony: '',
      municipality: '',
      state: '',
      zipCode: '',
      references: ''
    },
    accusedName: '',
    narrative: '',
    files: [] as File[]
  });

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setErrorMsg(null);

    // Reverse Geocoding
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        setFormData(prev => ({
          ...prev,
          addressDetails: {
            street: addr.road || addr.street || '',
            colony: addr.suburb || addr.neighbourhood || addr.hamlet || '',
            municipality: addr.city || addr.town || addr.municipality || '',
            state: addr.state || '',
            zipCode: addr.postcode || '',
            references: data.display_name || ''
          }
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    if (!formData.lat || !formData.lng) {
      setErrorMsg('Selecciona ubicación en el mapa');
      return false;
    }
    if (!formData.role) {
      setErrorMsg('Selecciona tipo de denunciante');
      return false;
    }
    if (formData.role === UserRole.OTHER && !formData.customRole.trim()) {
      setErrorMsg('Especifica el tipo de denunciante');
      return false;
    }
    return true;
  };

  // Handle Step 1 Continue
  const handleStep1Continue = () => {
    if (validateStep1()) {
      setErrorMsg(null);
      setStep(2);
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!captchaValid) {
      setErrorMsg('Por favor completa el CAPTCHA');
      return;
    }

    if (!formData.narrative || formData.narrative.trim().length < 20) {
      setErrorMsg('La narrativa debe tener al menos 20 caracteres');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Generate report ID
      const id = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Prepare data for encryption
      const reportData = {
        narrative: sanitizeInput(formData.narrative),
        entities: sanitizeInput(formData.accusedName),
        addressDetails: formData.addressDetails
      };

      // Encrypt sensitive data
      const { encryptedData, encryptedKey, iv } = await encryptData(JSON.stringify(reportData));

      // Upload files to Pinata if any
      const filePromises = formData.files.map(file => uploadToPinata(file, id));
      await Promise.all(filePromises);

      // AI Analysis
      const aiAnalysis = await analyzeReport(formData.narrative);
      const trustScore = 0.85; // Placeholder

      // Send to backend
      const payload = new FormData();
      payload.append('id', id);
      payload.append('isAnonymous', 'true');
      payload.append('role', formData.role === UserRole.OTHER ? formData.customRole : formData.role);
      payload.append('category', CrimeCategory.COMMON);
      payload.append('type', CrimeType.OTHER);
      payload.append('encryptedData', encryptedData);
      payload.append('encryptedKey', encryptedKey);
      payload.append('iv', iv);
      payload.append('algorithm', 'RSA-OAEP-4096 + AES-256-GCM');

      const location = {
        lat: formData.lat,
        lng: formData.lng,
        details: formData.addressDetails
      };
      payload.append('location', JSON.stringify(location));
      payload.append('timestamp', new Date().toISOString());
      payload.append('trustScore', trustScore.toString());
      payload.append('aiAnalysis', aiAnalysis);

      formData.files.forEach(file => {
        payload.append('files', file);
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        body: payload
      });

      if (!response.ok) {
        throw new Error('Error al enviar la denuncia');
      }

      setReportId(id);
      setSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMsg('Error al enviar la denuncia. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
          <div className="bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-4">
            Denuncia Enviada
          </h2>
          <p className="text-[#64748b] mb-8 leading-relaxed">
            Tu denuncia ha sido encriptada y enviada de forma segura. Guarda este ID para seguimiento:
          </p>
          <div className="bg-slate-100 p-4 rounded-xl mb-8">
            <code className="text-[#7c3aed] font-mono font-bold text-sm break-all">
              {reportId}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#7c3aed] text-white py-4 px-6 rounded-full font-bold hover:bg-[#6d28d9] transition-all"
          >
            Nueva Denuncia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd]">
      {/* Header */}
      <div className="bg-[#7c3aed] text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Denuncia</h1>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-lg flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500" />
          <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Step 1: Map + Role Selection */}
      {step === 1 && (
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Map Section */}
          <div className="flex-1 relative">
            <LeafletMap
              mode="select"
              onLocationSelect={handleLocationSelect}
              initialCenter={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
            />
            {formData.lat && formData.lng && (
              <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-[#7c3aed] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {formData.addressDetails.street || 'Ubicación seleccionada'}
                    {formData.addressDetails.colony && `, ${formData.addressDetails.colony}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Role Selection Section */}
          <div className="bg-white p-6 rounded-t-3xl shadow-2xl">
            <h2 className="text-lg font-bold text-[#1e293b] mb-4">
              Denuncias algún delito como:
            </h2>

            <div className="space-y-3 mb-6">
              {[
                { value: UserRole.CITIZEN, label: 'Ciudadano' },
                { value: UserRole.GOVERNMENT, label: 'Empleado de Gobierno' },
                { value: UserRole.COMPANY, label: 'Empresa' },
                { value: UserRole.MILITARY, label: 'Fuerzas Armadas' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, role: option.value, customRole: '' })}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${formData.role === option.value
                      ? 'bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed] font-bold'
                      : 'bg-slate-50 border-slate-200 text-[#64748b] hover:border-[#7c3aed]/30'
                    }`}
                >
                  {option.label}
                </button>
              ))}

              {/* Otro (especifica) */}
              <div className="space-y-2">
                <button
                  onClick={() => setFormData({ ...formData, role: UserRole.OTHER })}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${formData.role === UserRole.OTHER
                      ? 'bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed] font-bold'
                      : 'bg-slate-50 border-slate-200 text-[#64748b] hover:border-[#7c3aed]/30'
                    }`}
                >
                  Otro (especifica)
                </button>

                {formData.role === UserRole.OTHER && (
                  <input
                    type="text"
                    placeholder="Especifica el tipo de denunciante"
                    value={formData.customRole}
                    onChange={e => setFormData({ ...formData, customRole: e.target.value })}
                    className="w-full p-4 border-2 border-[#7c3aed]/30 rounded-2xl bg-white text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed]"
                  />
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleStep1Continue}
              className="w-full bg-[#1e293b] text-white py-4 px-6 rounded-full font-bold hover:bg-[#0f172a] transition-all shadow-lg"
            >
              Continuar
            </button>

            {/* Footer Note */}
            <p className="text-center text-xs text-[#94a3b8] mt-4">
              Recuerda que tu denuncia es totalmente anónima
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Form Details */}
      {step === 2 && (
        <div className="p-6 space-y-6 pb-32">
          {/* Address Details */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#7c3aed] mb-4">
              ¿Dónde sucedió el incidente?
            </h2>
            <input
              type="text"
              placeholder="Calle y número"
              value={formData.addressDetails.street}
              onChange={e => setFormData({
                ...formData,
                addressDetails: { ...formData.addressDetails, street: e.target.value }
              })}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] mb-3"
            />
          </div>

          {/* Colony, Municipality, State */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#7c3aed] mb-4">
              Colonia, Municipio y Estado
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Colonia"
                value={formData.addressDetails.colony}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, colony: e.target.value }
                })}
                className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed]"
              />
              <input
                type="text"
                placeholder="Municipio"
                value={formData.addressDetails.municipality}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, municipality: e.target.value }
                })}
                className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed]"
              />
              <input
                type="text"
                placeholder="Estado"
                value={formData.addressDetails.state}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, state: e.target.value }
                })}
                className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>

          {/* Accused Name */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#d946ef] mb-4">
              ¿A quién denuncias?
            </h2>
            <input
              type="text"
              placeholder="Escribe el nombre o descripción"
              value={formData.accusedName}
              onChange={e => setFormData({ ...formData, accusedName: e.target.value })}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          {/* Narrative */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#d946ef] mb-4">
              ¿Qué te pasó?
            </h2>
            <textarea
              placeholder="Describe brevemente lo sucedido"
              value={formData.narrative}
              onChange={e => setFormData({ ...formData, narrative: e.target.value })}
              rows={6}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] resize-none"
            />
          </div>

          {/* CAPTCHA */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#7c3aed] mb-4">
              Verificación de Seguridad
            </h2>
            <Captcha onVerify={setCaptchaValid} />
          </div>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 shadow-2xl">
            <button
              onClick={handleSubmit}
              disabled={loading || !captchaValid}
              className="w-full bg-[#7c3aed] text-white py-4 px-6 rounded-full font-bold hover:bg-[#6d28d9] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'ENVIAR DENUNCIA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};