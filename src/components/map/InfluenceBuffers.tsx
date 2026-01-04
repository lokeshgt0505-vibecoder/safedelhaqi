import { Circle, Tooltip } from 'react-leaflet';
import { StationData } from '@/types/aqi';
import { getZone } from '@/lib/aqi-utils';

interface InfluenceBuffersProps {
  stations: StationData[];
  visible: boolean;
}

function getZoneColor(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue':
      return '#22c55e';
    case 'yellow':
      return '#eab308';
    case 'red':
      return '#ef4444';
  }
}

// Buffer distances in meters
const BUFFER_DISTANCES = [
  { radius: 3000, label: '3 km - High Influence' },
  { radius: 5000, label: '5 km - Moderate Influence' },
];

export function InfluenceBuffers({ stations, visible }: InfluenceBuffersProps) {
  if (!visible) return null;

  return (
    <>
      {stations.map((station) => {
        const zone = getZone(station.aqi);
        const color = getZoneColor(zone);

        return BUFFER_DISTANCES.map((buffer, idx) => (
          <Circle
            key={`buffer-${station.id}-${buffer.radius}`}
            center={[station.lat, station.lng]}
            radius={buffer.radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: idx === 0 ? 0.15 : 0.08,
              color: color,
              weight: 1,
              opacity: 0.5,
              dashArray: idx === 1 ? '5, 5' : undefined,
            }}
          >
            <Tooltip>
              <div className="p-1 font-sans text-xs">
                <p className="font-semibold">{station.name}</p>
                <p>{buffer.label}</p>
                <p>AQI: {station.aqi}</p>
              </div>
            </Tooltip>
          </Circle>
        ));
      })}
    </>
  );
}
