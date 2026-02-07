import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // IMPORTANTE: Corrige el visualizado del mapa
import { Search, Loader2, MapPin, Target, Crosshair } from 'lucide-react';

// Fix for default marker icons in React Leaflet
const TacticalMarkerIcon = L.divIcon({
  className: 'tactical-marker',
  html: `<div class="relative w-8 h-8 flex items-center justify-center">
           <div class="absolute inset-0 bg-[#d946ef]/20 rounded-full animate-ping"></div>
           <div class="absolute inset-2 bg-[#d946ef] rounded-full shadow-[0_0_15px_#d946ef]"></div>
           <div class="w-1.5 h-1.5 bg-white rounded-full relative z-10 shadow-sm"></div>
           <div class="absolute inset-0 border border-[#d946ef]/30 rounded-full animate-spin-slow"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

L.Marker.prototype.options.icon = TacticalMarkerIcon;

interface MapProps {
  mode: 'input' | 'view';
  onLocationSelect?: (lat: number, lng: number) => void;
  points?: { lat: number; lng: number; intensity: number; category: string }[];
  initialCenter?: { lat: number; lng: number };
}

// Memoized MapClickHandler
const MapClickHandler = React.memo(({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 1.5 });
    },
  });
  return null;
});

// Memoized MapUpdater
const MapUpdater = React.memo(({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 15, {
        animate: true,
        duration: 2
      });
    }
  }, [center, map]);

  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
});

export const LeafletMap: React.FC<MapProps> = React.memo(({ mode, onLocationSelect, points = [], initialCenter }) => {
  const centerPos = { lat: 19.4326, lng: -99.1332 }; // CDMX
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2 && mode === 'input') {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/geocode/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Autocomplete error", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 600);


    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, mode]);

  const handleSelectSuggestion = useCallback((place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setMapCenter([lat, lng]);
    setSelectedPosition(L.latLng(lat, lng));
    setSearchQuery(place.display_name);
    setSuggestions([]);
    if (onLocationSelect) onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/geocode/search?q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        handleSelectSuggestion(data[0]);
      } else {
        alert("VECTOR NO ENCONTRADO EN LA GRID.");
      }
    } catch (error) {
      alert("ERROR DE CONEXIÓN SATELITAL.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, handleSelectSuggestion]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedPosition(L.latLng(lat, lng));
    if (onLocationSelect) onLocationSelect(lat, lng);
  }, [onLocationSelect]);


  return (
    <div className="w-full relative z-0 flex flex-col bg-white h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
      {mode === 'input' && (
        <div className="w-full bg-slate-50 border-b border-slate-200 p-3 z-[1000] flex flex-col">
          <div className="w-full relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-cyber uppercase tracking-widest text-[#d946ef] font-bold">Ubicación Táctica</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar ciudad, calle, colonia..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:border-[#d946ef] focus:ring-1 focus:ring-[#d946ef] outline-none transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-5 py-2.5 bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="hidden sm:inline">Buscando...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Buscar</span>
                    <span className="sm:hidden"><Search size={16} /></span>
                  </>
                )}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-[2000]">
                {suggestions.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(place)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none flex items-start gap-3"
                  >
                    <MapPin size={16} className="text-[#d946ef] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="block text-slate-700 text-sm mb-0.5">{place.address?.road || place.address?.suburb || place.address?.city || 'Ubicación'}</strong>
                      <span className="text-xs text-slate-500 block leading-tight">{place.display_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full relative">

        <MapContainer
          center={mapCenter || centerPos}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#ffffff' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />

          <MapUpdater center={mapCenter} />

          {mode === 'input' && <MapClickHandler onSelect={handleMapClick} />}

          {selectedPosition && (
            <Marker position={selectedPosition} icon={TacticalMarkerIcon}>
              <Popup className="cyber-popup">
                <div className="font-cyber text-[10px] uppercase tracking-widest text-[#e6edf3]">
                  <strong className="text-[#d946ef]">COORDENADAS FIJADAS</strong>
                  <div className="mt-2 opacity-60">Lat: {selectedPosition.lat.toFixed(6)}</div>
                  <div className="opacity-60">Lng: {selectedPosition.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {mode === 'view' && points.map((pt, idx) => (
            <Circle
              key={idx}
              center={[pt.lat, pt.lng]}
              radius={2000}
              pathOptions={{
                color: pt.category.includes('Corrupción') ? '#ffcc00' : '#ff4d4d',
                fillColor: pt.category.includes('Corrupción') ? '#ffcc00' : '#ff4d4d',
                fillOpacity: 0.15,
                weight: 2,
              }}
            >
              <Popup className="cyber-popup">
                <div className="font-cyber text-[10px] uppercase tracking-widest text-[#e6edf3]">
                  <strong className={pt.category.includes('Corrupción') ? 'text-[#ffcc00]' : 'text-[#ff4d4d]'}>{pt.category}</strong>
                  <div className="mt-2 opacity-60">Zona de Impacto Detectada</div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {mode === 'input' && (
        <div className="absolute bottom-4 left-4 right-4 z-[10000] bg-white/95 backdrop-blur-sm p-3 py-2 rounded-xl text-[9px] md:text-[10px] font-cyber text-slate-700 border border-slate-200 shadow-lg flex items-center gap-3 uppercase tracking-[0.15em] justify-center">
          <div className="relative flex-shrink-0">
            <Crosshair size={12} className="text-[#d946ef] animate-pulse" />
          </div>
          <p className="text-center">Click en la GRID para fijar coordenadas tácticas</p>
        </div>
      )}


      <style>{`
        .dark-map .leaflet-container {
          filter: none !important;
          background: #ffffff !important;
        }
        .cyber-popup .leaflet-popup-content-wrapper {
          background: #ffffff;
          color: #000000;
          border: 3px solid #d946ef;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          font-weight: 700;
        }
        .cyber-popup .leaflet-popup-tip {
          background: #ffffff;
          border: 2px solid #d946ef;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});