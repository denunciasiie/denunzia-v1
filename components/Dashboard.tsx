import React, { useState } from 'react';
import { LeafletMap } from './LeafletMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter } from 'lucide-react';

// Mock Data
const mockData = [
  { lat: 19.4326, lng: -99.1332, category: 'Delito Común', intensity: 0.8 }, // CDMX
  { lat: 20.6597, lng: -103.3496, category: 'Corrupción / Cuello Blanco', intensity: 0.9 }, // GDL
  { lat: 25.6866, lng: -100.3161, category: 'Alto Impacto', intensity: 0.7 }, // MTY
  { lat: 19.0414, lng: -98.2063, category: 'Delito Común', intensity: 0.5 }, // Puebla
  { lat: 21.1619, lng: -86.8515, category: 'Alto Impacto', intensity: 0.6 }, // Cancun
];

const statsData = [
  { name: 'Corrupción', count: 120, color: '#8b5cf6' }, // Violet
  { name: 'Alto Impacto', count: 85, color: '#d946ef' }, // Fuchsia
  { name: 'Común', count: 230, color: '#3b82f6' }, // Blue
];

export const Dashboard: React.FC = () => {
  const [minTrust, setMinTrust] = useState(0.7);

  return (
    <div className="flex flex-col h-full overflow-y-auto md:overflow-hidden p-4 md:p-6 gap-6 bg-transparent text-[#f8fafc]">
      <header className="mb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-cyber font-bold tracking-wider text-[#d946ef] drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            INTELIGENCIA ESTRATÉGICA
          </h1>
          <p className="text-[#94a3b8] mt-1 text-xs md:text-sm uppercase tracking-widest font-cyber opacity-70">
            Monitoreo Global de Incidencia Delictiva Agregada
          </p>
        </div>
      </header>

      {/* Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-y-auto md:overflow-hidden pb-20 md:pb-0" aria-label="Panel de Métricas">

        {/* Map Section - Occupies 3 columns */}
        <article className="lg:col-span-3 glass-effect rounded-2xl overflow-hidden border border-white/10 flex flex-col relative group h-[500px] md:h-auto">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#d946ef] via-[#8b5cf6] to-[#3b82f6] opacity-50"></div>

          <div className="p-4 bg-black/40 border-b border-white/5 flex flex-col md:flex-row justify-between items-center z-10 backdrop-blur-md gap-4">
            <div className="flex items-center gap-3 text-xs font-cyber text-[#d946ef] w-full md:w-auto">
              <div className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse"></div>
              <span>VISUALIZACIÓN K-ANONIMATO</span>
            </div>
          </div>

          <div className="flex-1 relative z-0 dark-map min-h-[300px]">
            <LeafletMap mode="view" points={mockData} />

            {/* Map Overlay HUD */}
            <div className="absolute top-4 left-4 pointer-events-none md:top-6 md:left-6">
              <div className="bg-black/80 backdrop-blur-xl p-3 md:p-5 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-[10px] font-cyber text-[#94a3b8] mb-3 md:mb-4 uppercase tracking-tighter">Firma Digital Estructural</h2>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-cyber">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]"></div>
                    <span className="text-white/80">CORRUPCIÓN</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-cyber">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d946ef] shadow-[0_0_10px_#d946ef]"></div>
                    <span className="text-white/80">ALTO IMPACTO</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-cyber">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></div>
                    <span className="text-white/80">DELITO COMÚN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Info & Stats Section - 1 column */}
        <aside className="flex flex-col gap-6 h-full overflow-visible md:overflow-y-auto custom-scrollbar pr-0 md:pr-1">

          {/* Chart Card */}
          <article className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col flex-1 min-h-[300px]">
            <h2 className="text-xs font-cyber font-bold mb-6 flex items-center gap-3 text-[#d946ef]">
              <Filter size={14} /> DISTRIBUCIÓN
            </h2>
            <div className="flex-1 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px', fontSize: '10px', fontFamily: 'Orbitron' }}
                    cursor={{ fill: 'rgba(217, 70, 239, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2.5">
              {statsData.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-cyber">
                  <span className="text-[#94a3b8]">{s.name}</span>
                  <span className="text-white font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </article>

        </aside>
      </section>
    </div>
  );
};