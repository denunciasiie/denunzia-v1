import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Extensión de tipos para Leaflet.heat
 * Dado que leaflet.heat no está tipado oficialmente en DefinitelyTyped de forma completa para L.heatLayer
 */
declare module 'leaflet' {
    function heatLayer(
        latlngs: Array<[number, number, number]>,
        options: any
    ): any;
}

interface HeatmapLayerProps {
    points: Array<[number, number, number]>; // [lat, lng, intensity]
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
    opacity?: number;
}

/**
 * Componente que integra Leaflet.heat con React-Leaflet.
 * Permite visualizar zonas de calor basadas en la densidad de reportes.
 */
export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
    points,
    radius = 25,
    blur = 15,
    gradient,
    opacity = 0.7
}) => {
    const map = useMap();
    const heatLayerRef = useRef<any>(null);

    useEffect(() => {
        if (!map) return;

        // Si ya existe una capa previa, la removemos antes de recrearla
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        // Creamos la nueva capa de calor
        // @ts-ignore - Aunque hayamos declarado el módulo, a veces el linter de Vite es estricto
        const heatLayer = L.heatLayer(points, {
            radius,
            blur,
            gradient,
            minOpacity: 0.1,
            max: 1.0,
        });

        // Ajustar opacidad global del canvas si es necesario (vía CSS o el plugin)
        // El plugin heatLayer no tiene setOpacity nativo, pero podemos aplicarlo al contenedor si fuera necesario.

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;

        // Limpieza al desmontar o cambiar puntos
        return () => {
            if (heatLayerRef.current && map) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, points, radius, blur, gradient]);

    return null;
};
