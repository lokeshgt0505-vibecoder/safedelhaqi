import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { StationData } from '@/types/aqi';

// Extend L types for heat layer
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

interface HeatmapLayerProps {
  stations: StationData[];
  visible: boolean;
}

export function HeatmapLayer({ stations, visible }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!visible || stations.length === 0) return;

    // Wait for map to have valid dimensions before creating heatmap
    const container = map.getContainer();
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      return;
    }

    // Also check if map size is valid
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) {
      return;
    }

    // Convert station data to heatmap format: [lat, lng, intensity]
    // Normalize AQI to 0-1 range for intensity (max AQI ~500)
    const heatData: Array<[number, number, number]> = stations.map((station) => [
      station.lat,
      station.lng,
      Math.min(station.aqi / 300, 1), // Normalize intensity
    ]);

    // Create gradient based on AQI colors
    const heatLayer = L.heatLayer(heatData, {
      radius: 40,
      blur: 25,
      maxZoom: 12,
      minOpacity: 0.4,
      gradient: {
        0.0: '#00e400', // Good (green)
        0.17: '#a3ff00', // Satisfactory (lime)
        0.33: '#ffff00', // Moderate (yellow)
        0.50: '#ff7e00', // Poor (orange)
        0.67: '#ff0000', // Very Poor (red)
        1.0: '#8b0000', // Hazardous (maroon)
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, stations, visible]);

  return null;
}
