import React, { useState, useEffect, useMemo } from 'react';
import { LeafletMap } from './LeafletMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter, TrendingUp, AlertCircle, Settings2, Database } from 'lucide-react';
import { CrimeCategory } from '../types';

/**
 * Dashboard Component
 * Provee la interfaz de visualización táctica con soporte para Heatmap dinámico.
 */
export const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('TODOS');
  const [heatmapRadius, setHeatmapRadius] = useState(30);
  const [heatmapBlur, setHeatmapBlur] = useState(20);

  // Carga de reportes desde la API centralizada
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/reports?limit=500&status=published`);
        const data = await response.json();
        if (data.success) {
          setReports(data.reports);
        }
      } catch (error) {
        console.error('Error al sincronizar reportes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Procesamiento de datos para Mapa y Estadísticas
  const { filteredPoints, heatmapData, stats } = useMemo(() => {
    const filtered = reports.filter(r => {
      const matchCategory = filterCategory === 'TODOS' || r.category === filterCategory;
      const hasValidCoords = !isNaN(parseFloat(r.latitude)) && !isNaN(parseFloat(r.longitude));
      return matchCategory && hasValidCoords;
    });

    // Agrupación para el Mapa de Calor: { categorio: [ [lat, lng, intensidad], ... ] }
    const hData: { [key: string]: Array<[number, number, number]> } = {};

    filtered.forEach(r => {
      const lat = parseFloat(r.latitude);
      const lng = parseFloat(r.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      if (!hData[r.category]) hData[r.category] = [];
      const intensity = parseFloat(r.trust_score) || 0.8;
      hData[r.category].push([lat, lng, intensity]);
    });

    // Distribución para el gráfico de barras
    const categories = Object.values(CrimeCategory);

    // Mapeo táctico de colores para respetar el diseño actual
    const getCategoryColor = (cat: string) => {
      // Corrupción (Purple)
      if (cat.includes('corrupción')) return '#7c3aed';
      // Alto Impacto (Pink)
      if (cat.includes('muerte') || cat.includes('daños a las personas') || cat.includes('sexual') || cat.includes('violencia') || cat.includes('seguridad pública')) return '#d946ef';
      // Delito Común / Otros (Indigo)
      return '#6366f1';
    };

    const distribution = categories.map(cat => ({
      name: cat,
      count: reports.filter(r => r.category === cat).length,
      color: getCategoryColor(cat)
    }));

    return {
      filteredPoints: filtered.map(r => ({
        lat: parseFloat(r.latitude),
        lng: parseFloat(r.longitude),
        category: r.category,
        intensity: parseFloat(r.trust_score) || 0.8
      })),
      heatmapData: hData,
      stats: distribution
    };
  }, [reports, filterCategory]);

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-6 text-[#f8fafc] selection:bg-[#d946ef]/30">
      {/* Header Táctico */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2 flex items-center gap-3 font-heading">
            <Database className="text-[#d946ef]" />
            Denuncia Anónima y Análisis Delictivo
          </h1>
          <p className="text-[#94a3b8] text-sm font-medium font-heading uppercase tracking-widest">
            Visualización avanzada de incidentes con redes de calor dinámicas
          </p>
        </div>

        {/* Selector de Filtro de Categoría */}
        <div className="flex items-center gap-2 bg-[#0f172a]/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/5">
          <div className="p-2 bg-[#d946ef]/10 rounded-xl">
            <Filter size={16} className="text-[#d946ef]" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-white outline-none pr-4 py-1 uppercase tracking-tight font-heading"
          >
            <option value="TODOS" className="bg-[#1e293b] text-white">TODOS LOS DELITOS</option>
            {Object.values(CrimeCategory).map(cat => (
              <option key={cat} value={cat} className="bg-[#1e293b] text-white">{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sección del Mapa - Visor Principal */}
        <div className="lg:col-span-3 bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/5">
          <div className="p-4 bg-[#1e293b] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase font-heading">SIIEC: Satélite en línea</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter opacity-80">
              <span className="hidden sm:inline">{reports.length} ENTRADAS TOTALES</span>
              <span className="text-[#d946ef]">{filteredPoints.length} VISUALIZADOS</span>
            </div>
          </div>

          <div className="h-[500px] md:h-[600px] relative">
            <LeafletMap
              mode="view"
              points={filteredPoints}
              heatmapData={heatmapData}
              heatmapRadius={heatmapRadius}
              heatmapBlur={heatmapBlur}
            />

            {/* Leyenda Táctica del Mapa */}
            <div className="absolute top-4 left-4 bg-[#0f172a]/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/10 z-[1000]">
              <h3 className="text-[10px] font-black text-[#94a3b8] mb-4 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-cyber">
                Densidad Táctica
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6366f1] shadow-[0_0_8px_#6366f1] border-2 border-white/20"></div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Delito Común</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef] border-2 border-white/20"></div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Alto Impacto</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24] border-2 border-white/20"></div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Corrupción</span>
                </div>
              </div>
            </div>

            {/* Aviso de Privacidad */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end z-[1000]">
              <div className="bg-[#1e293b]/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/10 max-w-[200px]">
                <p className="text-[9px] text-white/70 leading-tight flex gap-2 font-medium">
                  <AlertCircle size={12} className="text-amber-400 shrink-0" />
                  Zonas de calor aplicando algoritmos de anonimización espacial.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Lateral de Controles */}
        <aside className="flex flex-col gap-6">

          {/* Parámetros del Mapa de Calor */}
          <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#d946ef]/10 rounded-xl">
                <Settings2 size={20} className="text-[#d946ef]" />
              </div>
              <h2 className="text-lg font-bold text-white font-cyber">Parámetros</h2>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[10px] font-black text-[#94a3b8] mb-3 uppercase tracking-widest font-cyber">
                  <span>Radio de Influencia</span>
                  <span className="text-[#d946ef]">{heatmapRadius}px</span>
                </div>
                <input
                  type="range" min="10" max="80" step="1"
                  value={heatmapRadius}
                  onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-black text-[#94a3b8] mb-3 uppercase tracking-widest font-cyber">
                  <span>Desenfoque (Blur)</span>
                  <span className="text-[#d946ef]">{heatmapBlur}px</span>
                </div>
                <input
                  type="range" min="5" max="50" step="1"
                  value={heatmapBlur}
                  onChange={(e) => setHeatmapBlur(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
                />
              </div>
            </div>
          </div>

          {/* Gráfico de Distribución */}
          <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#3b82f6]/10 rounded-xl">
                <TrendingUp size={20} className="text-[#3b82f6]" />
              </div>
              <h2 className="text-lg font-bold text-white font-cyber">Distribución</h2>
            </div>

            <div className="h-[220px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={26}>
                    {stats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-[10px] font-bold text-[#94a3b8] truncate max-w-[120px] uppercase font-cyber">{stat.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Sección Informativa SEO - Misión y Blindaje */}
      <section className="mt-16 bg-[#0f172a]/30 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black font-cyber bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#3b82f6] mb-6 leading-tight uppercase tracking-tighter">
            DenunZIA: La Plataforma Líder en Denuncia Ciudadana Anónima en México
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d946ef] to-[#3b82f6] mx-auto rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#d946ef] font-heading uppercase tracking-wider flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#d946ef] rounded-full"></span>
              Nuestra Misión Nacional
            </h3>
            <p className="text-[#94a3b8] leading-relaxed text-sm md:text-base font-medium">
              En DenunZIA, nuestra misión es transformar la seguridad ciudadana en toda la República Mexicana. Proporcionamos una herramienta tecnológica avanzada que permite a cualquier habitante de los 32 estados reportar actos delictivos de forma 100% segura y sin miedo a represalias.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#3b82f6] font-heading uppercase tracking-wider flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#3b82f6] rounded-full"></span>
              Inteligencia para un México más Seguro
            </h3>
            <p className="text-[#94a3b8] leading-relaxed text-sm md:text-base font-medium">
              No solo recibimos reportes; generamos inteligencia colectiva. Gracias a nuestro mapa de calor nacional, los ciudadanos pueden visualizar zonas de riesgo en tiempo real, permitiendo una toma de decisiones informada y una presión social efectiva para la justicia.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white/90 font-cyber mb-4 uppercase tracking-normal">
              Anonimato Real y Blindaje Digital
            </h3>
            <p className="text-[#64748b] max-w-2xl mx-auto italic text-sm">
              "Entendemos que la confianza es la base de la prevención. Por ello, hemos diseñado una infraestructura de grado militar:"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 bg-white/5 rounded-[32px] border border-white/5 hover:border-[#d946ef]/30 transition-all duration-500 hover:bg-[#d946ef]/5">
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-[0.1em] font-cyber group-hover:text-[#d946ef] transition-colors">
                Encriptación E2EE
              </h4>
              <p className="text-xs text-[#94a3b8] leading-loose">
                Utilizamos algoritmos **RSA-4096** para asegurar que solo tú y los analistas autorizados puedan ver la información.
              </p>
            </div>

            <div className="group p-8 bg-white/5 rounded-[32px] border border-white/5 hover:border-[#3b82f6]/30 transition-all duration-500 hover:bg-[#3b82f6]/5">
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-[0.1em] font-cyber group-hover:text-[#3b82f6] transition-colors">
                Seguridad en la Nube
              </h4>
              <p className="text-xs text-[#94a3b8] leading-loose">
                Operamos con conexiones cifradas **SSL** y bases de datos optimizadas para garantizar la integridad de cada reporte desde cualquier punto del país.
              </p>
            </div>

            <div className="group p-8 bg-white/5 rounded-[32px] border border-white/5 hover:border-[#d946ef]/30 transition-all duration-500 hover:bg-[#d946ef]/5">
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-[0.1em] font-cyber group-hover:text-[#d946ef] transition-colors">
                Eliminación de Metadatos
              </h4>
              <p className="text-xs text-[#94a3b8] leading-loose">
                Protegemos tu ubicación real eliminando automáticamente el rastro digital de tus evidencias fotográficas y documentos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};