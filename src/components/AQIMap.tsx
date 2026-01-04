import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { StationData } from '@/types/aqi';
import { getAQIInfo } from '@/lib/aqi-utils';

interface AQIMapProps {
  stations: StationData[];
  selectedStation?: StationData | null;
  onStationClick?: (station: StationData) => void;
}

// Component to handle flying to selected station
function FlyToStation({ station }: { station: StationData | null | undefined }) {
  const map = useMap();
  
  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 13, { duration: 1.5 });
    }
  }, [station, map]);
  
  return null;
}

// Station marker component
function StationMarker({ 
  station, 
  onClick 
}: { 
  station: StationData; 
  onClick?: (station: StationData) => void;
}) {
  const aqiInfo = getAQIInfo(station.aqi);
  
  return (
    <CircleMarker
      center={[station.lat, station.lng]}
      radius={20}
      pathOptions={{
        fillColor: aqiInfo.color,
        fillOpacity: 0.9,
        color: 'white',
        weight: 3,
      }}
      eventHandlers={{
        click: () => onClick?.(station),
      }}
    >
      <Popup>
        <div className="p-2 font-sans">
          <h3 className="font-semibold text-base mb-1">{station.name}</h3>
          <p className="text-sm text-gray-600">
            AQI: <strong style={{ color: aqiInfo.color }}>{station.aqi}</strong>
            <span 
              className="ml-2 px-2 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: aqiInfo.color }}
            >
              {aqiInfo.label}
            </span>
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}

// Heatmap-style background circles for zone visualization
function ZoneHeatmap({ stations }: { stations: StationData[] }) {
  return (
    <>
      {stations.map((station) => {
        const aqiInfo = getAQIInfo(station.aqi);
        return (
          <CircleMarker
            key={`heatmap-${station.id}`}
            center={[station.lat, station.lng]}
            radius={50}
            pathOptions={{
              fillColor: aqiInfo.color,
              fillOpacity: 0.2,
              stroke: false,
            }}
          />
        );
      })}
    </>
  );
}

export function AQIMap({
  stations,
  selectedStation,
  onStationClick,
}: AQIMapProps) {
  // Delhi center coordinates
  const delhiCenter: [number, number] = [28.6139, 77.2090];
  
  // Memoize sorted stations for consistent rendering
  const sortedStations = useMemo(() => 
    [...stations].sort((a, b) => a.aqi - b.aqi), 
    [stations]
  );

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={delhiCenter}
        zoom={10.5}
        className="absolute inset-0 z-0"
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap tiles - completely free, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heatmap-style zone visualization */}
        <ZoneHeatmap stations={sortedStations} />
        
        {/* Station markers */}
        {sortedStations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            onClick={onStationClick}
          />
        ))}
        
        {/* Fly to selected station */}
        <FlyToStation station={selectedStation} />
      </MapContainer>
      
      {/* Gradient overlay for visual polish */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded-lg z-10" />
    </div>
  );
}
