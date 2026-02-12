import React, { useState, useEffect } from 'react';
import { getReportsFromDB, updateReportInDB, getDecryptedReportById, deleteAllReports } from '../services/storageService';
import { ReportData } from '../types';
import { Eye, ShieldAlert, CheckSquare, AlertCircle, Terminal, Cpu, Database, HardDrive, Lock, Unlock, Zap, Activity, MapPin, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [booting, setBooting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
    }
  }, [isAuthenticated]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReportsFromDB();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (report: ReportData) => {
    setDecrypting(true);
    try {
      // Fetch the report with decrypted data from backend
      const decryptedReport = await getDecryptedReportById(report.id);
      setSelectedReport(decryptedReport);
    } catch (error) {
      console.error('Error fetching decrypted report:', error);
      // Fallback to showing encrypted version
      setSelectedReport(report);
    } finally {
      setDecrypting(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL reports from the database. This action cannot be undone. Are you sure?')) {
      return;
    }

    if (!confirm('FINAL CONFIRMATION: Type YES in the next prompt to proceed')) {
      return;
    }

    const confirmation = prompt('Type "DELETE ALL" to confirm:');
    if (confirmation !== 'DELETE ALL') {
      alert('Cleanup cancelled');
      return;
    }

    try {
      setLoading(true);
      await deleteAllReports();
      alert('✓ All reports deleted successfully');
      await loadReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Failed to cleanup reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setLoading(true);
      await updateReportInDB(id, { status: newStatus } as any);
      await loadReports();
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setBooting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const secureKey = import.meta.env.VITE_ADMIN_PASSWORD;

      if (!secureKey) {
        setErrorMsg("⚠️ CONFIGURACIÓN INCOMPLETA: La variable VITE_ADMIN_PASSWORD no ha sido detectada en este despliegue.");
        setBooting(false);
        return;
      }

      if (password === secureKey) {
        setIsAuthenticated(true);
      } else {
        setErrorMsg("❌ CREDENCIALES INCORRECTAS - ACCESO DENEGADO");
        setBooting(false);
      }
    }, 1500);
  };

  const toggleTrust = async (id: string, currentScore: number) => {
    const newScore = currentScore > 0.5 ? 0.2 : 0.9;
    await updateReportInDB(id, { trustScore: newScore });
    await loadReports(); // Refresh
    // Update selected if it's the same
    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, trust_score: newScore });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-6">
        <div className="bg-white p-12 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="bg-[#7c3aed]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <ShieldAlert size={48} className="text-[#7c3aed]" />
          </div>

          <h2 className="text-2xl font-bold mb-3 text-[#1e293b]">Panel Administrativo</h2>
          <p className="text-sm text-[#64748b] mb-10">Solo personal autorizado</p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <p className="text-xs text-red-600 font-bold leading-tight">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                placeholder="Contraseña de acceso"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 text-center outline-none focus:border-[#7c3aed] text-[#1e293b] transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={booting}
              />
            </div>

            <button
              disabled={booting}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-4 rounded-full font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {booting ? (
                <>
                  <Cpu size={16} className="animate-spin" /> Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-[#94a3b8]">Sistema DenunZIA v2.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col bg-transparent text-[#e6edf3]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-cyber font-bold flex items-center gap-4 text-[#d946ef] tracking-[0.1em]">
            <Terminal size={32} /> TERMINAL DE INTELIGENCIA
          </h2>
          <p className="text-[10px] font-cyber text-[#94a3b8] uppercase tracking-[0.3em] mt-2 opacity-60">Base de Datos de Denuncias Securitizadas</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-effect px-5 py-3 rounded-xl border border-white/10 flex items-center gap-3">
            <Database size={16} className="text-[#3b82f6]" />
            <div className="text-right">
              <span className="block text-[8px] font-cyber text-[#8b949e]">TOTAL RECORDS</span>
              <span className="text-sm font-cyber text-white">{reports.length}</span>
            </div>
          </div>
          {reports.some(r => r.status !== 'published') && (
            <button
              onClick={async () => {
                if (confirm("¿Seguro que deseas publicar TODAS las denuncias pendientes?")) {
                  setLoading(true);
                  for (const r of reports.filter(r => r.status !== 'published')) {
                    await updateReportInDB(r.id, { status: 'published' } as any);
                  }
                  await loadReports();
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-5 py-3 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] rounded-xl hover:bg-[#10b981] hover:text-white transition-all text-[10px] font-cyber uppercase tracking-widest"
            >
              Publicar Pendientes
            </button>
          )}
          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex-1 glass-effect flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 text-[#8b949e] p-12 text-center translate-y-2">
          <HardDrive size={64} className="mb-6 opacity-20" />
          <h3 className="text-xl font-cyber font-bold mb-2 uppercase tracking-widest text-white/40">Base de Datos Vacía</h3>
          <p className="text-xs font-cyber uppercase tracking-wider opacity-60">No se detectaron paquetes de información en el almacenamiento local.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
          {/* List - 4 columns */}
          <div className="lg:col-span-4 flex flex-col glass-effect rounded-[2rem] border border-white/10 overflow-hidden relative">
            <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
              <h4 className="text-[10px] font-cyber text-[#8b949e] uppercase tracking-widest">Cola de Procesamiento</h4>
              <Activity size={14} className="text-[#10b981] animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              {reports.map(r => (
                <div
                  key={r.id}
                  onClick={() => handleSelectReport(r)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group relative ${selectedReport?.id === r.id ? 'bg-[#d946ef]/10 border-[#d946ef] shadow-[0_0_20px_rgba(0,242,255,0.15)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  {selectedReport?.id === r.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#d946ef] rounded-r-full"></div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] text-[#8b949e]">PK-{r.id.substring(0, 8).toUpperCase()}</span>
                      <div className={`flex items-center gap-1 text-[8px] font-cyber uppercase tracking-tighter ${r.status === 'published' ? 'text-green-500' :
                        r.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                        {r.status === 'published' ? <CheckCircle size={8} /> :
                          r.status === 'rejected' ? <XCircle size={8} /> : <Clock size={8} />}
                        {r.status || 'pending'}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-cyber ${r.trustScore && r.trustScore > 0.7 ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#ff4d4d]/10 border-[#ff4d4d]/30 text-[#ff4d4d]'}`}>
                      TRUST: {Math.round((r.trustScore || 0) * 100)}%
                    </div>
                  </div>
                  <div className="font-cyber text-xs truncate text-white mb-2 uppercase tracking-wider">{r.type}</div>
                  <div className="text-[9px] text-[#8b949e] font-mono">{new Date(r.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail View - 8 columns */}
          <div className="lg:col-span-8 glass-effect rounded-[2rem] border border-white/10 flex flex-col overflow-hidden relative">
            {selectedReport ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-cyber text-[#00f2ff] uppercase tracking-[0.2em]">{selectedReport.category}</span>
                      <span className="text-[#8b949e]">/</span>
                      <span className="text-[10px] font-cyber text-white uppercase tracking-[0.2em]">
                        {selectedReport.type}
                        {selectedReport.customCrimeType && (
                          <span className="text-[#d946ef] ml-2">({selectedReport.customCrimeType})</span>
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl font-cyber font-bold text-white tracking-widest">EXPEDIENTE ANALÍTICO</h3>
                  </div>
                  <div className="flex gap-3">
                    {selectedReport.status !== 'published' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReport.id, 'published')}
                        disabled={loading}
                        className="text-[9px] font-cyber bg-green-500/10 border border-green-500/30 hover:bg-green-500 hover:text-white text-green-500 px-6 py-3 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> PUBLICAR EN MAPA
                      </button>
                    )}
                    {selectedReport.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                        disabled={loading}
                        className="text-[9px] font-cyber bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 px-6 py-3 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <XCircle size={14} /> RECHAZAR / FALSA
                      </button>
                    )}
                    <button
                      onClick={() => toggleTrust(selectedReport.id, selectedReport.trustScore || 0)}
                      className="text-[9px] font-cyber bg-white/5 border border-white/10 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/20 text-[#8b5cf6] px-6 py-3 rounded-xl transition-all uppercase tracking-widest"
                    >
                      Re-Calibrar
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                      <span className="text-[#8b949e] block text-[9px] font-cyber uppercase tracking-widest mb-2">Rol del Reportante</span>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#d946ef]/10 rounded-lg text-[#d946ef]">
                          <Activity size={16} />
                        </div>
                        <span className="font-cyber text-sm text-white uppercase">{selectedReport.role}</span>
                      </div>
                    </div>
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                      <span className="text-[#8b949e] block text-[9px] font-cyber uppercase tracking-widest mb-2">Vector de Ubicación</span>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#7c4dff]/10 rounded-lg text-[#7c4dff]">
                          <MapPin size={16} />
                        </div>
                        <span className="font-cyber text-sm text-white truncate uppercase">
                          {selectedReport.location.details?.colony || 'ZONA NO IDENTIFICADA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Narrative Section */}
                  <div className="bg-black/60 p-8 rounded-[2rem] border border-[#d946ef]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      {decrypting ? (
                        <Lock size={32} className="text-[#ff4d4d] animate-pulse" />
                      ) : (selectedReport.narrativa_real || selectedReport.decrypted_narrative) ? (
                        <Unlock size={32} className="text-[#10b981]" />
                      ) : (
                        <Lock size={32} className="text-[#ff4d4d]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[#d946ef] font-cyber text-xs mb-6 border-b border-white/5 pb-4">
                      <Terminal size={16} />
                      {decrypting ? (
                        <span>PROCESANDO NARRATIVA...</span>
                      ) : (selectedReport.narrativa_real || selectedReport.decrypted_narrative) ? (
                        <span className="text-[#10b981]">✓ NARRATIVA DISPONIBLE {selectedReport.narrativa_real ? '(Texto Plano)' : '(Descifrada)'}</span>
                      ) : (
                        <span className="text-[#ff4d4d]">⚠️ DATOS CIFRADOS (Clave privada no disponible)</span>
                      )}
                    </div>
                    {decrypting ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d946ef]"></div>
                      </div>
                    ) : (selectedReport.narrativa_real || selectedReport.decrypted_narrative) ? (
                      <p className="text-[#e6edf3] text-sm whitespace-pre-wrap leading-relaxed font-sans selection:bg-[#d946ef]/30">
                        {selectedReport.narrativa_real || selectedReport.decrypted_narrative}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[#8b949e] text-xs italic">
                          Los datos están cifrados end-to-end. El texto original solo puede ser descifrado con la clave privada del servidor.
                        </p>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-[#8b949e] break-all">
                          <div className="mb-2 text-[#d946ef]">encrypted_data:</div>
                          {selectedReport.encrypted_data?.substring(0, 200)}...
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedReport.aiAnalysis && (
                    <div className="bg-[#8b5cf6]/5 p-8 rounded-[2rem] border border-[#8b5cf6]/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Zap size={32} className="text-[#8b5cf6]" />
                      </div>
                      <div className="text-[10px] text-[#8b5cf6] font-cyber font-bold mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Cpu size={14} /> ANÁLISIS DE INTELIGENCIA GEMINI 2.5
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                          <span className="block text-[8px] text-[#8b949e] mb-1 font-cyber">SPAM PROBABILITY</span>
                          <span className="text-lg font-cyber text-[#ff4d4d]">
                            {Math.round((JSON.parse(selectedReport.aiAnalysis as string).spamProbability || 0) * 100)}%
                          </span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                          <span className="block text-[8px] text-[#8b949e] mb-1 font-cyber">ENTITY COUNT</span>
                          <span className="text-lg font-cyber text-[#00f2ff]">
                            {JSON.parse(selectedReport.aiAnalysis as string).extractedEntities?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[9px] text-[#8b949e] font-cyber uppercase tracking-widest block ml-1">Resumen Ejecutivo</span>
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-xs text-white/90 leading-relaxed font-sans italic border-l-4 border-l-[#7c4dff]">
                          "{JSON.parse(selectedReport.aiAnalysis as string).summary}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#94a3b8] p-12 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[#d946ef]/20 blur-[40px] rounded-full animate-pulse"></div>
                  <Terminal size={64} className="text-white opacity-20 relative z-10" />
                </div>
                <h3 className="text-xl font-cyber font-bold mb-2 uppercase tracking-[0.2em] text-white/40">Terminal en Espera</h3>
                <p className="text-[10px] font-cyber uppercase tracking-widest opacity-60">Seleccione un paquete de datos para iniciar la desencriptación táctica.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};