import { useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { Delaunay } from 'd3-delaunay';
import { StationData } from '@/types/aqi';
import { getZone, getZoneInfo } from '@/lib/aqi-utils';

interface VoronoiLayerProps {
  stations: StationData[];
  visible: boolean;
  onAreaClick?: (station: StationData) => void;
}

// Delhi bounds for clipping Voronoi
const DELHI_BOUNDS = {
  minLat: 28.4,
  maxLat: 28.9,
  minLng: 76.8,
  maxLng: 77.5,
};

function getZoneColor(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue':
      return '#22c55e'; // Green for best
    case 'yellow':
      return '#eab308'; // Yellow for moderate
    case 'red':
      return '#ef4444'; // Red for poor
  }
}

function getLivabilityLabel(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue':
      return 'Best for Living';
    case 'yellow':
      return 'Moderate - Caution Advised';
    case 'red':
      return 'Poor - Not Recommended';
  }
}

export function VoronoiLayer({ stations, visible, onAreaClick }: VoronoiLayerProps) {
  const voronoiPolygons = useMemo(() => {
    if (stations.length < 3) return [];

    // Create Delaunay triangulation and then Voronoi diagram
    const points = stations.map((s) => [s.lng, s.lat] as [number, number]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([
      DELHI_BOUNDS.minLng,
      DELHI_BOUNDS.minLat,
      DELHI_BOUNDS.maxLng,
      DELHI_BOUNDS.maxLat,
    ]);

    // Extract polygon coordinates for each cell
    return stations.map((station, i) => {
      const cell = voronoi.cellPolygon(i);
      if (!cell) return null;

      // Convert [lng, lat] to [lat, lng] for Leaflet
      const positions = cell.map(([lng, lat]) => [lat, lng] as [number, number]);
      const zone = getZone(station.aqi);

      return {
        station,
        positions,
        zone,
        color: getZoneColor(zone),
        livability: getLivabilityLabel(zone),
      };
    }).filter(Boolean);
  }, [stations]);

  if (!visible) return null;

  return (
    <>
      {voronoiPolygons.map((cell) => {
        if (!cell) return null;
        return (
          <Polygon
            key={`voronoi-${cell.station.id}`}
            positions={cell.positions}
            pathOptions={{
              fillColor: cell.color,
              fillOpacity: 0.25,
              color: cell.color,
              weight: 2,
              opacity: 0.7,
            }}
            eventHandlers={{
              click: () => onAreaClick?.(cell.station),
            }}
          >
            <Tooltip sticky>
              <div className="p-2 font-sans">
                <p className="font-semibold text-sm">{cell.station.name} Coverage</p>
                <p className="text-xs">AQI: <strong>{cell.station.aqi}</strong></p>
                <p className="text-xs" style={{ color: cell.color }}>
                  {cell.livability}
                </p>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
