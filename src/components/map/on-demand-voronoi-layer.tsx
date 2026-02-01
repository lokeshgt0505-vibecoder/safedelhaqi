import { useMemo, useState, useEffect, useCallback } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { Delaunay } from 'd3-delaunay';
import { DELHI_STATIONS } from '@/lib/aqi-utils';
import { LIVABILITY_COLORS } from '@/types/livability';
import { StationForecastResult } from '@/lib/forecasting-engine';
import { useOnDemandLivability } from '@/hooks/use-on-demand-livability';

interface OnDemandVoronoiLayerProps {
  visible: boolean;
  selectedYear?: number;
  onStationSelect?: (forecast: StationForecastResult | null) => void;
}

// Delhi bounds for clipping Voronoi
const DELHI_BOUNDS = {
  minLat: 28.4,
  maxLat: 28.9,
  minLng: 76.8,
  maxLng: 77.5,
};

interface VoronoiCell {
  stationId: string;
  stationName: string;
  lat: number;
  lng: number;
  positions: [number, number][];
}

export function OnDemandVoronoiLayer({ 
  visible, 
  selectedYear = 2025,
  onStationSelect,
}: OnDemandVoronoiLayerProps) {
  const { calculateLivability, getCachedForecast } = useOnDemandLivability();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // Create Voronoi cells from station positions (geometry only - no livability data)
  const voronoiCells = useMemo<VoronoiCell[]>(() => {
    if (DELHI_STATIONS.length < 3) return [];

    const points = DELHI_STATIONS.map(s => [s.lng, s.lat] as [number, number]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([
      DELHI_BOUNDS.minLng,
      DELHI_BOUNDS.minLat,
      DELHI_BOUNDS.maxLng,
      DELHI_BOUNDS.maxLat,
    ]);

    return DELHI_STATIONS.map((station, i) => {
      const cell = voronoi.cellPolygon(i);
      if (!cell) return null;

      const positions = cell.map(([lng, lat]) => [lat, lng] as [number, number]);

      return {
        stationId: station.id,
        stationName: station.name,
        lat: station.lat,
        lng: station.lng,
        positions,
      };
    }).filter(Boolean) as VoronoiCell[];
  }, []);

  // Handle region click - calculate livability on demand
  const handleRegionClick = useCallback((cell: VoronoiCell) => {
    // Deselect if clicking same station
    if (selectedStation === cell.stationId) {
      setSelectedStation(null);
      onStationSelect?.(null);
      return;
    }

    setSelectedStation(cell.stationId);
    const forecast = calculateLivability(cell.stationId);
    onStationSelect?.(forecast);
  }, [selectedStation, calculateLivability, onStationSelect]);

  // Clear selection when layer becomes invisible
  useEffect(() => {
    if (!visible) {
      setSelectedStation(null);
      onStationSelect?.(null);
    }
  }, [visible, onStationSelect]);

  if (!visible) return null;

  return (
    <>
      {voronoiCells.map((cell) => {
        // Get cached data if available for coloring
        const cached = getCachedForecast(cell.stationId);
        const hasData = !!cached;
        
        // Default color (gray) until clicked
        const color = hasData 
          ? LIVABILITY_COLORS[cached.livabilityClass].fill 
          : '#9ca3af';
        const strokeColor = hasData 
          ? LIVABILITY_COLORS[cached.livabilityClass].stroke 
          : '#6b7280';

        const isSelected = selectedStation === cell.stationId;

        return (
          <Polygon
            key={`ondemand-${cell.stationId}`}
            positions={cell.positions}
            pathOptions={{
              fillColor: color,
              fillOpacity: isSelected ? 0.5 : 0.25,
              color: strokeColor,
              weight: isSelected ? 3 : 1.5,
              opacity: isSelected ? 1 : 0.6,
            }}
            eventHandlers={{
              click: () => handleRegionClick(cell),
            }}
          >
            <Tooltip sticky>
              <div className="p-2 font-sans min-w-[180px]">
                <p className="font-semibold text-sm">{cell.stationName}</p>
                {hasData ? (
                  <div className="mt-1">
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {LIVABILITY_COLORS[cached.livabilityClass].label}
                    </span>
                    <p className="text-xs mt-1">Score: <strong>{cached.livabilityScore}/100</strong></p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Click to calculate livability
                  </p>
                )}
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
