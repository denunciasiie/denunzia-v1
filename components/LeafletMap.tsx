import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
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
}

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 1.5 });
    },
  });
  return null;
};

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
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
};

export const LeafletMap: React.FC<MapProps> = ({ mode, onLocationSelect, points = [] }) => {
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
          const query = encodeURIComponent(searchQuery);
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=mx&addressdetails=1&limit=5`;
          const response = await fetch(url);
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Autocomplete error", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, mode]);

  const handleSelectSuggestion = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setMapCenter([lat, lng]);
    setSelectedPosition(L.latLng(lat, lng));
    setSearchQuery(place.display_name);
    setSuggestions([]);
    if (onLocationSelect) onLocationSelect(lat, lng);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const query = encodeURIComponent(searchQuery);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=mx&addressdetails=1&limit=1`;
      const response = await fetch(url);
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
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition(L.latLng(lat, lng));
    if (onLocationSelect) onLocationSelect(lat, lng);
  };

  return (
    <div className="w-full relative z-0 flex flex-col bg-[#020617] h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-white/10">
      {mode === 'input' && (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col items-center">
          <div className="w-full max-w-md glass-effect p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="BUSCAR COORDENADAS (Ciudad, Calle, Colonia...)"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-[#e6edf3] text-xs focus:border-[#d946ef] outline-none transition-all font-cyber placeholder:text-[#8b949e] placeholder:text-[10px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-3 bg-[#d946ef] hover:bg-[#d946ef]/80 text-white rounded-xl font-cyber text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">BUSCANDO...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    <span className="hidden sm:inline">BUSCAR</span>
                  </>
                )}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                {suggestions.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(place)}
                    className="p-3 bg-black/40 hover:bg-[#d946ef]/20 rounded-xl cursor-pointer transition-all text-[10px] text-[#e6edf3] font-cyber border border-white/5 hover:border-[#d946ef]/30"
                  >
                    <strong className="block text-[#d946ef] mb-1">{place.address?.road || place.address?.suburb || 'VECTOR'}</strong>
                    {place.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full dark-map relative">
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
};