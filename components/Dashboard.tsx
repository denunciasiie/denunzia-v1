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
        const response = await fetch(`${apiUrl}/api/reports?limit=500`);
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
      if (!hData[r.category]) hData[r.category] = [];
      const intensity = parseFloat(r.trust_score) || 0.8;
      hData[r.category].push([lat, lng, intensity]);
    });

    // Distribución para el gráfico de barras
    const categories = Object.values(CrimeCategory);
    const distribution = categories.map(cat => ({
      name: cat,
      count: reports.filter(r => r.category === cat).length,
      color: cat === CrimeCategory.CORRUPTION ? '#7c3aed' : (cat === CrimeCategory.HIGH_IMPACT ? '#d946ef' : '#6366f1')
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
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-4 md:p-6">
      {/* Header Táctico */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2 flex items-center gap-3">
            <Database className="text-[#7c3aed]" />
            Inteligencia Táctica
          </h1>
          <p className="text-[#64748b] text-sm font-medium">
            Visualización avanzada de incidentes con redes de calor dinámicas
          </p>
        </div>

        {/* Selector de Filtro de Categoría */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-md border border-slate-100">
          <div className="p-2 bg-[#7c3aed]/10 rounded-xl">
            <Filter size={16} className="text-[#7c3aed]" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-[#1e293b] outline-none pr-4 py-1 uppercase tracking-tight"
          >
            <option value="TODOS">TODOS LOS DELITOS</option>
            {Object.values(CrimeCategory).map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sección del Mapa - Visor Principal */}
        <div className="lg:col-span-3 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/50">
          <div className="p-4 bg-[#1e293b] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-green-400 shadow-[0_0_8px_#4ade80]'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase">SIIEC: Satélite en línea</span>
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
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200/50 z-[1000]">
              <h3 className="text-[10px] font-black text-[#64748b] mb-4 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                Densidad Táctica
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6366f1] shadow-[0_0_8px_#6366f1] border-2 border-white"></div>
                  <span className="text-[11px] font-bold text-[#1e293b]">Delito Común</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef] border-2 border-white"></div>
                  <span className="text-[11px] font-bold text-[#1e293b]">Alto Impacto</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24] border-2 border-white"></div>
                  <span className="text-[11px] font-bold text-[#1e293b]">Corrupción</span>
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
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#d946ef]/10 rounded-xl">
                <Settings2 size={20} className="text-[#d946ef]" />
              </div>
              <h2 className="text-lg font-bold text-[#1e293b]">Parámetros</h2>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[10px] font-black text-[#64748b] mb-3 uppercase tracking-widest">
                  <span>Radio de Influencia</span>
                  <span className="text-[#d946ef]">{heatmapRadius}px</span>
                </div>
                <input
                  type="range" min="10" max="80" step="1"
                  value={heatmapRadius}
                  onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-black text-[#64748b] mb-3 uppercase tracking-widest">
                  <span>Desenfoque (Blur)</span>
                  <span className="text-[#d946ef]">{heatmapBlur}px</span>
                </div>
                <input
                  type="range" min="5" max="50" step="1"
                  value={heatmapBlur}
                  onChange={(e) => setHeatmapBlur(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#d946ef]"
                />
              </div>
            </div>
          </div>

          {/* Gráfico de Distribución */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#7c3aed]/10 rounded-xl">
                <TrendingUp size={20} className="text-[#7c3aed]" />
              </div>
              <h2 className="text-lg font-bold text-[#1e293b]">Distribución</h2>
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
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-[10px] font-bold text-[#475569] truncate max-w-[120px]">{stat.name}</span>
                  </div>
                  <span className="text-sm font-black text-[#1e293b]">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};