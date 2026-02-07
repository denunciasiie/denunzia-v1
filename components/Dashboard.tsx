import React, { useState } from 'react';
import { LeafletMap } from './LeafletMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter, TrendingUp, AlertCircle } from 'lucide-react';

// Mock Data
const mockData = [
  { lat: 19.4326, lng: -99.1332, category: 'Delito Común', intensity: 0.8 }, // CDMX
  { lat: 20.6597, lng: -103.3496, category: 'Corrupción / Cuello Blanco', intensity: 0.9 }, // GDL
  { lat: 25.6866, lng: -100.3161, category: 'Alto Impacto', intensity: 0.7 }, // MTY
  { lat: 19.0414, lng: -98.2063, category: 'Delito Común', intensity: 0.5 }, // Puebla
  { lat: 21.1619, lng: -86.8515, category: 'Alto Impacto', intensity: 0.6 }, // Cancun
];

const statsData = [
  { name: 'Corrupción', count: 120, color: '#7c3aed' }, // Purple
  { name: 'Alto Impacto', count: 85, color: '#d946ef' }, // Pink
  { name: 'Común', count: 230, color: '#6366f1' }, // Indigo
];

export const Dashboard: React.FC = () => {
  const [minTrust, setMinTrust] = useState(0.7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2">
          Mapa de Reportes
        </h1>
        <p className="text-[#64748b] text-sm">
          Visualización agregada de denuncias anónimas
        </p>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Map Section - Occupies 3 columns */}
        <div className="lg:col-span-3 bg-white rounded-3xl overflow-hidden shadow-xl">
          {/* Map Header */}
          <div className="p-4 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-sm font-bold">Mapa en Tiempo Real</span>
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {mockData.length} reportes
            </div>
          </div>

          {/* Map Container */}
          <div className="h-[400px] md:h-[500px] relative">
            <LeafletMap mode="view" points={mockData} />

            {/* Map Legend */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
              <h3 className="text-xs font-bold text-[#64748b] mb-3 uppercase">
                Categorías
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div>
                  <span className="text-xs text-[#1e293b]">Corrupción</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#d946ef]"></div>
                  <span className="text-xs text-[#1e293b]">Alto Impacto</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                  <span className="text-xs text-[#1e293b]">Delito Común</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="absolute bottom-4 right-4 bg-amber-50 border-2 border-amber-200 p-3 rounded-xl shadow-lg max-w-xs">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Privacidad:</strong> Las ubicaciones son aproximadas para proteger el anonimato.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar - 1 column */}
        <aside className="flex flex-col gap-6">

          {/* Stats Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#7c3aed]/10 rounded-xl">
                <TrendingUp size={20} className="text-[#7c3aed]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1e293b]">Estadísticas</h2>
                <p className="text-xs text-[#64748b]">Últimos 30 días</p>
              </div>
            </div>

            {/* Total Reports */}
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#6366f1] rounded-2xl p-6 mb-6 text-white">
              <p className="text-sm opacity-90 mb-2">Total de Reportes</p>
              <p className="text-4xl font-bold">
                {statsData.reduce((acc, curr) => acc + curr.count, 0)}
              </p>
            </div>

            {/* Stats List */}
            <div className="space-y-4">
              {statsData.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                    <span className="text-sm font-medium text-[#1e293b]">{stat.name}</span>
                  </div>
                  <span className="text-lg font-bold text-[#1e293b]">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={16} className="text-[#7c3aed]" />
              <h2 className="text-sm font-bold text-[#1e293b]">Distribución</h2>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#6366f1]/10 border-2 border-[#7c3aed]/20 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-[#7c3aed] mb-3">
              ℹ️ Información
            </h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Este mapa muestra denuncias agregadas y anonimizadas. No se almacenan datos personales ni ubicaciones exactas.
            </p>
          </div>

        </aside>
      </div>
    </div>
  );
};