import React, { useState, useEffect, useRef } from 'react';
import { UserRole, CrimeCategory, CrimeType } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, RefreshCw, Info, Map as MapIcon } from 'lucide-react';
import { LeafletMap } from './LeafletMap';
import { analyzeReport } from '../services/geminiService';
import { encryptData, sanitizeInput } from '../services/encryptionService';

// Sub-component for Category Items to handle local tooltip state correctly
const CategoryItem: React.FC<{
  category: CrimeCategory;
  examples: string;
  selected: boolean;
  onSelect: (cat: CrimeCategory) => void;
}> = ({ category, examples, selected, onSelect }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative group">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelect(category)}
          className={`flex-1 text-left p-4 rounded-2xl border-2 transition-all text-xs font-bold leading-tight ${selected
            ? 'bg-[#1e293b] border-[#1e293b] text-white'
            : 'bg-slate-50 border-slate-200 text-[#64748b] hover:border-[#1e293b]/30'
            }`}
        >
          {category}
        </button>
        <button
          type="button"
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
          onClick={(e) => {
            e.stopPropagation();
            setShowHelp(!showHelp);
          }}
          className={`px-4 rounded-2xl border-2 transition-all hover:bg-slate-100 ${showHelp ? 'border-[#7c3aed] text-[#7c3aed] bg-[#7c3aed]/5' : 'border-slate-200 text-slate-400'}`}
        >
          <Info size={16} />
        </button>
      </div>
      {/* Tooltip táctico */}
      {showHelp && (
        <div className="absolute z-[1100] left-0 right-0 bottom-full mb-2 p-4 bg-[#1e293b] text-white rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[#d946ef] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Ejemplos:</p>
              <p className="text-xs font-medium leading-relaxed">{examples}</p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-10 w-4 h-4 bg-[#1e293b] rotate-45 border-r border-b border-white/20"></div>
        </div>
      )}
    </div>
  );
};

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
  console.log('ReportForm v3.0 - Robust Fetch Check');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '' as CrimeCategory | '',
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
    files: [] as File[],
    website_url: '' // Honeypot field
  });

  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Smart API URL detection
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      // Add your production domain(s) here
      if (host === 'denunzia.org' || host.includes('github.io') || host === 'www.denunzia.org') {
        return 'https://denunzia-v1.onrender.com'; // Change to your actual production API URL if different
      }
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  };

  // Handle location selection from map with Robust Fallback
  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setErrorMsg(null);
    setIsLoadingAddress(true);

    try {
      let data = null;
      let success = false;

      // 1. Intentar Proxy Backend (Prioridad)
      try {
        const apiUrl = getApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
        const response = await fetch(`${apiUrl}/api/geocode/reverse?lat=${lat}&lon=${lng}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          data = await response.json();
          // Validar que no sea error de Nominatim forwarding
          if (data && !data.error) success = true;
        }
      } catch (proxyError) {
        console.warn('Proxy geocode failed, attempting direct fallback...');
      }

      // 2. Intentar Nominatim Directo (Fallback de Respaldo)
      if (!success) {
        console.log('Using direct Nominatim fallback');
        try {
          const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
            if (data && !data.error) success = true;
          }
        } catch (directError) {
          console.error('Direct fallback also failed:', directError);
        }
      }

      if (success && data && data.address) {
        const addr = data.address;
        const colonyBase = addr.suburb || addr.neighbourhood || addr.hamlet || addr.quarter || addr.village || '';
        const cp = addr.postcode ? ` C.P. ${addr.postcode}` : '';

        // Definir Estado primero para comparar
        const state = addr.state || addr.province || '';

        // Búsqueda exhaustiva de la Alcaldía/Municipio
        // Nominatim en CDMX suele poner la Alcaldía en 'city_district' o 'county'
        let municipality = addr.city_district || addr.borough || addr.county || addr.municipality || addr.city || addr.town || '';

        // Lógica de limpieza para Ciudad de México
        // Si el municipio detectado es genérico ("Mexico City") y hay algo más específico, lo intercambiamos
        const genericNames = ['Mexico City', 'Ciudad de México', 'CDMX'];
        if (genericNames.includes(municipality) || municipality === state) {
          // Intentar buscar el distrito o alcaldía específicamente
          const specificDistrict = addr.city_district || addr.borough || addr.county;
          if (specificDistrict && !genericNames.includes(specificDistrict)) {
            municipality = specificDistrict;
          }
        }

        setFormData(prev => ({
          ...prev,
          addressDetails: {
            street: addr.road || addr.street || addr.pedestrian || '',
            colony: colonyBase ? `Colonia ${colonyBase}${cp}` : (addr.postcode ? `Área C.P. ${addr.postcode}` : ''),
            municipality: municipality,
            state: state,
            zipCode: addr.postcode || '',
            references: data.display_name || ''
          }
        }));
      } else {
        // Fallback visual si falla geocodificación
        setFormData(prev => ({
          ...prev,
          addressDetails: {
            ...prev.addressDetails,
            references: `Ubicación manual (${lat.toFixed(5)}, ${lng.toFixed(5)})`
          }
        }));
      }
    } catch (error) {
      console.error('Final geocoding error:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    if (!formData.lat || !formData.lng) {
      setErrorMsg('Selecciona ubicación en el mapa');
      return false;
    }
    if (!formData.category) {
      setErrorMsg('Selecciona la categoría del delito');
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('--- ENVIANDO DENUNCIA ---');
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

    // Proof-of-Work (PoW) computation - 100% Anonymous
    let powNonce = 0;
    const difficulty = 6;
    // Use window.crypto for better browser compatibility
    const reportId = Array.from(window.crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    try {
      console.log('Generating security proof (PoW)...');
      let hash = '';
      const encoder = new TextEncoder();

      // Safety limit for the loop (max 10 seconds of computation)
      const startTime = Date.now();

      while (true) {
        const data = encoder.encode(reportId + powNonce);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hash.startsWith('0'.repeat(difficulty))) break;
        powNonce++;

        // Timeout check every 1000 iterations
        if (powNonce % 1000 === 0 && (Date.now() - startTime > 10000)) {
          console.warn('PoW took too long, proceeding anyway with nonce:', powNonce);
          break;
        }
      }
      console.log('PoW generated:', powNonce);
    } catch (powError) {
      console.error('PoW error:', powError);
    }

    try {
      const id = reportId;

      // Prepare data for encryption
      const reportData = {
        entities: sanitizeInput(formData.accusedName),
        addressDetails: formData.addressDetails
      };

      // Encrypt sensitive data
      const { encryptedData, encryptedKey, iv } = await encryptData(JSON.stringify(reportData));

      // AI Analysis
      let aiAnalysis = '';
      let trustScore = 0.85;
      try {
        const analysis = await analyzeReport(formData.narrative, CrimeType.OTHER);
        aiAnalysis = analysis?.summary || 'Análisis no disponible';
        trustScore = analysis?.trustScore || 0.85;
      } catch (error) {
        console.error('AI Analysis error:', error);
        aiAnalysis = 'Análisis no disponible';
      }

      // Formatear fecha para CDMX (UTC-6)
      const now = new Date();
      const cdmxOffset = 6 * 60 * 60 * 1000; // 6 horas en milisegundos
      const cdmxDate = new Date(now.getTime() - cdmxOffset);
      const timestampCDMX = cdmxDate.toISOString();

      // Construir objeto location correctamente
      const locationData = {
        lat: formData.lat,
        lng: formData.lng,
        details: formData.addressDetails
      };

      // Preparar objeto completo de datos (Payload)
      // Esto coincide con la lógica del servidor línea 273: JSON.parse(req.body.payload)
      const fullPayload = {
        id,
        isAnonymous: true,
        category: formData.category,
        type: CrimeType.OTHER,
        encryptedData,
        encryptedKey,
        iv,
        algorithm: 'RSA-OAEP-4096 + AES-256-GCM',
        location: locationData,
        timestamp: timestampCDMX,
        trustScore: trustScore.toString(),
        aiAnalysis: aiAnalysis || 'Sin análisis',
        narrativa_real: formData.narrative,
        website_url: formData.website_url // Honeypot
      };

      // Send to backend
      const payload = new FormData();
      payload.append('payload', JSON.stringify(fullPayload));

      formData.files.forEach(file => {
        payload.append('files', file);
      });

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'pow-nonce': powNonce.toString()
        },
        body: payload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al enviar la denuncia');
      }

      setReportId(id);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Submit error:', error);
      let msg = 'Error al enviar la denuncia. Por favor intenta de nuevo.';
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        msg = `No se pudo conectar con el servidor en ${getApiUrl()}. Verifica que el backend esté activo.`;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMsg(msg);
      // Scroll to error message at the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onClick={() => {
              window.location.href = window.location.origin + '/#/';
            }}
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

      {/* Step 1: Map + Role + Category Selection */}
      {step === 1 && (
        <div className="flex flex-col min-h-[calc(100vh-64px)] pb-10">
          {/* Map Section */}
          <div className="relative w-full p-8 md:p-12 flex flex-col gap-4">
            <LeafletMap
              mode="input"
              onLocationSelect={handleLocationSelect}
              initialCenter={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
            />
            {formData.lat && formData.lng && (
              <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#7c3aed]/10 rounded-full shrink-0">
                    <MapPin size={20} className="text-[#7c3aed]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider mb-1">Ubicación Seleccionada</h3>
                    <p className="text-sm text-[#1e293b] font-medium leading-relaxed">
                      {formData.addressDetails.street || 'Coordenadas fijadas'}
                      {formData.addressDetails.colony && `, ${formData.addressDetails.colony}`}
                      {formData.addressDetails.municipality && `, ${formData.addressDetails.municipality}`}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">
                      Lat: {formData.lat.toFixed(6)}, Lng: {formData.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="bg-white p-6 rounded-t-3xl shadow-2xl">
            {/* Crime Category Selection - UNODC ICCS */}
            <h2 className="text-lg font-bold text-[#1e293b] mb-4">
              Categoría del Incidente:
            </h2>
            <div className="space-y-3 mb-8">
              {Object.entries({
                [CrimeCategory.LEVEL_1]: "Homicidio, feminicidio, tentativa de homicidio, desaparición forzada.",
                [CrimeCategory.LEVEL_2]: "Lesiones, asalto físico, amenazas graves, extorsión, pago de piso, secuestro.",
                [CrimeCategory.LEVEL_3]: "Abuso sexual, violación, acoso sexual.",
                [CrimeCategory.LEVEL_4]: "Robo a mano armada, secuestro express, daños a propiedad de forma violenta, con armas o maquinaria.",
                [CrimeCategory.LEVEL_5]: "Robo sin violencia, vandalismo, grafiti, daños a propiedad solamente.",
                [CrimeCategory.LEVEL_6]: "Posesión, tráfico de drogas, consumo público, venta, fabricación.",
                [CrimeCategory.LEVEL_7]: "Estafas, sobornos, desvío de recursos públicos, enriquecimiento ilícito, moches, mordidas, clausuras arbitrarias.",
                [CrimeCategory.LEVEL_8]: "Alteración del orden, desacato, obstrucción de vías, daño a propiedad pública y/o privada.",
                [CrimeCategory.LEVEL_9]: "Portación de armas prohibidas, terrorismo.",
                [CrimeCategory.LEVEL_10]: "Tala ilegal, maltrato animal, contaminación ambiental, incendios premeditados.",
                [CrimeCategory.LEVEL_11]: "Cualquier otro delito no listado anteriormente."
              }).map(([category, examples]) => (
                <CategoryItem
                  key={category}
                  category={category as CrimeCategory}
                  examples={examples}
                  selected={formData.category === category}
                  onSelect={(cat) => setFormData({ ...formData, category: cat })}
                />
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleStep1Continue}
              className="w-full bg-[#7c3aed] text-white py-4 px-6 rounded-full font-bold hover:bg-[#6d28d9] transition-all shadow-xl shadow-[#7c3aed]/30"
            >
              CONTINUAR AL REPORTE
            </button>

            <p className="text-center text-[10px] text-[#94a3b8] mt-4 uppercase tracking-widest">
              Garantizamos el anonimato total bajo protocolos internacionales
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
              value={isLoadingAddress ? 'Obteniendo dirección...' : formData.addressDetails.street}
              disabled={isLoadingAddress}
              onChange={e => setFormData({
                ...formData,
                addressDetails: { ...formData.addressDetails, street: e.target.value }
              })}
              className={`w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] mb-1 ${isLoadingAddress ? 'opacity-70 animate-pulse' : ''}`}
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
                value={isLoadingAddress ? '...' : formData.addressDetails.colony}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, colony: e.target.value }
                })}
                disabled={isLoadingAddress}
                className={`w-full p-4 border-2 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] ${isLoadingAddress ? 'border-[#7c3aed]/50 animate-pulse' : 'border-slate-200'}`}
              />
              <input
                type="text"
                placeholder="Municipio"
                value={isLoadingAddress ? '...' : formData.addressDetails.municipality}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, municipality: e.target.value }
                })}
                disabled={isLoadingAddress}
                className={`w-full p-4 border-2 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] ${isLoadingAddress ? 'border-[#7c3aed]/50 animate-pulse' : 'border-slate-200'}`}
              />
              <input
                type="text"
                placeholder="Estado"
                value={isLoadingAddress ? '...' : formData.addressDetails.state}
                onChange={e => setFormData({
                  ...formData,
                  addressDetails: { ...formData.addressDetails, state: e.target.value }
                })}
                disabled={isLoadingAddress}
                className={`w-full p-4 border-2 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] ${isLoadingAddress ? 'border-[#7c3aed]/50 animate-pulse' : 'border-slate-200'}`}
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
              placeholder="Escribe quien es el presunto responsable"
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
              placeholder="Describe lo sucedido de forma breve y clara"
              value={formData.narrative}
              onChange={e => setFormData({ ...formData, narrative: e.target.value })}
              rows={6}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-slate-50 text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#7c3aed] resize-none"
            />
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-[#7c3aed] mb-4">
              📎 Evidencia (Opcional)
            </h2>
            <p className="text-sm text-[#64748b] mb-4">
              Adjunta fotos, videos o documentos que respalden tu denuncia
            </p>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-[#7c3aed]', 'bg-[#7c3aed]/5');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-[#7c3aed]', 'bg-[#7c3aed]/5');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#7c3aed]', 'bg-[#7c3aed]/5');
                const droppedFiles = Array.from(e.dataTransfer.files);
                setFormData({ ...formData, files: [...formData.files, ...droppedFiles] });
              }}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center transition-all cursor-pointer hover:border-[#7c3aed]/50 hover:bg-slate-50"
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setFormData({ ...formData, files: [...formData.files, ...newFiles] });
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-[#7c3aed]/10 rounded-full">
                    <svg className="w-8 h-8 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e293b] mb-1">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-[#64748b]">
                      Imágenes, videos o PDFs (máx. 10MB por archivo)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* File Previews */}
            {formData.files.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-bold text-[#1e293b]">
                  Archivos adjuntos ({formData.files.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.files.map((file, index) => (
                    <div key={index} className="relative group">
                      {/* Image Preview */}
                      {file.type.startsWith('image/') ? (
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        /* Non-image file */
                        <div className="aspect-square rounded-xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center p-4">
                          <svg className="w-12 h-12 text-[#7c3aed] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-center text-[#64748b] font-medium truncate w-full">
                            {file.type.includes('video') ? '🎥 Video' : file.type.includes('pdf') ? '📄 PDF' : '📎 Archivo'}
                          </p>
                        </div>
                      )}

                      {/* File Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-xl">
                        <p className="text-xs text-white truncate font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-white/70">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          const newFiles = formData.files.filter((_, i) => i !== index);
                          setFormData({ ...formData, files: newFiles });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title="Eliminar archivo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Honeypot Field - Invisible to humans */}
          <div className="hidden" aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website_url}
              onChange={e => setFormData({ ...formData, website_url: e.target.value })}
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
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 shadow-2xl z-[1000]">
            {errorMsg && (
              <p className="text-red-600 text-xs font-bold mb-2 text-center animate-bounce">
                ⚠️ {errorMsg}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !captchaValid}
              className="w-full bg-[#7c3aed] text-white py-4 px-6 rounded-full font-bold hover:bg-[#6d28d9] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin" />
                  PROCESANDO...
                </span>
              ) : 'ENVIAR DENUNCIA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};