import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { getAQIInfo } from '@/lib/aqi-utils';
import { HeatmapLayer } from './map/heatmap-layer';
import { VoronoiLayer } from './map/voronoi-layer';
import { InfluenceBuffers } from './map/influence-buffers';
import { ForecastLayer } from './map/forecast-layer';
import { MapLayerControls, LayerVisibility } from './map/map-layer-controls';
import { AreaInfoPopup } from './map/area-info-popup';
import { YearSlider } from './map/year-slider';
import { LivabilityVoronoiLayer } from './map/livability-voronoi-layer';
import { LivabilityLegend } from './map/livability-legend';
import { OnDemandVoronoiLayer } from './map/on-demand-voronoi-layer';

interface AQIMapProps {
  stations: StationData[];
  selectedStation?: StationData | null;
  onStationClick?: (station: StationData) => void;
  forecast?: ForecastData | null;
  forecastYear?: number;
  onForecastYearChange?: (year: number) => void;
}

// Calculate distance between two points in km (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest station and calculate distance-weighted AQI
function findNearestStationAndAQI(
  lat: number,
  lng: number,
  stations: StationData[]
): { station: StationData; distance: number; estimatedAQI: number } | null {
  if (stations.length === 0) return null;

  let nearest: StationData = stations[0];
  let minDistance = Infinity;

  // Calculate distances to all stations
  const stationsWithDistance = stations.map((station) => {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
    return { station, distance };
  });

  // Calculate distance-weighted average AQI (inverse distance weighting)
  let weightedSum = 0;
  let weightSum = 0;
  const maxInfluenceDistance = 10; // km

  stationsWithDistance.forEach(({ station, distance }) => {
    if (distance < maxInfluenceDistance) {
      const weight = 1 / Math.pow(distance + 0.1, 2); // Inverse square with small offset
      weightedSum += station.aqi * weight;
      weightSum += weight;
    }
  });

  const estimatedAQI = weightSum > 0 ? weightedSum / weightSum : nearest.aqi;

  return {
    station: nearest,
    distance: minDistance,
    estimatedAQI,
  };
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

// Component to handle map click events
interface MapClickHandlerProps {
  stations: StationData[];
  onAreaClick: (info: {
    position: [number, number];
    station: StationData;
    distance: number;
    estimatedAQI: number;
  }) => void;
}

function MapClickHandler({ stations, onAreaClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      const result = findNearestStationAndAQI(e.latlng.lat, e.latlng.lng, stations);
      if (result) {
        onAreaClick({
          position: [e.latlng.lat, e.latlng.lng],
          station: result.station,
          distance: result.distance,
          estimatedAQI: result.estimatedAQI,
        });
      }
    },
  });
  return null;
}

// Station marker component
function StationMarker({
  station,
  onClick,
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
        click: (e) => {
          e.originalEvent.stopPropagation();
          onClick?.(station);
        },
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

export function AQIMap({ 
  stations, 
  selectedStation, 
  onStationClick,
  forecast,
  forecastYear,
  onForecastYearChange,
}: AQIMapProps) {
  // Delhi center coordinates
  const delhiCenter: [number, number] = [28.6139, 77.209];

  // Layer visibility state
  const [layers, setLayers] = useState<LayerVisibility>({
    stations: true,
    heatmap: true,
    voronoi: false,
    buffers: false,
    forecast: false,
    livability: false,
  });

  // Livability year selection
  const [livabilityYear, setLivabilityYear] = useState(2025);

  // Area click popup state
  const [areaInfo, setAreaInfo] = useState<{
    position: [number, number];
    station: StationData;
    distance: number;
    estimatedAQI: number;
  } | null>(null);

  // Enable forecast layer when forecast data is available
  useEffect(() => {
    if (forecast && !layers.forecast) {
      setLayers((prev) => ({ ...prev, forecast: true }));
    }
  }, [forecast]);

  // Get forecast years
  const forecastYears = useMemo(() => {
    if (!forecast || forecast.forecasts.length === 0) return [];
    return forecast.forecasts[0].yearlyPredictions.map((p) => p.year);
  }, [forecast]);

  // Toggle layer visibility
  const handleToggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  // Handle area click
  const handleAreaClick = useCallback(
    (info: {
      position: [number, number];
      station: StationData;
      distance: number;
      estimatedAQI: number;
    }) => {
      setAreaInfo(info);
    },
    []
  );

  // Memoize sorted stations for consistent rendering
  const sortedStations = useMemo(
    () => [...stations].sort((a, b) => a.aqi - b.aqi),
    [stations]
  );

  return (
    <div className="relative w-full h-full">
      {/* Layer controls */}
      <MapLayerControls 
        layers={layers} 
        onToggleLayer={handleToggleLayer}
        showForecastToggle={!!forecast}
      />

      <MapContainer
        center={delhiCenter}
        zoom={11}
        className="absolute inset-0 z-0"
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap tiles - completely free, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map click handler */}
        <MapClickHandler stations={sortedStations} onAreaClick={handleAreaClick} />

        {/* Voronoi coverage zones */}
        <VoronoiLayer
          stations={sortedStations}
          visible={layers.voronoi}
          onAreaClick={onStationClick}
        />

        {/* Influence buffers */}
        <InfluenceBuffers stations={sortedStations} visible={layers.buffers} />

        {/* Heatmap layer */}
        <HeatmapLayer stations={sortedStations} visible={layers.heatmap} />

        {/* On-Demand Livability layer - calculates on click */}
        <OnDemandVoronoiLayer
          visible={layers.livability}
          selectedYear={livabilityYear}
        />

        {/* Forecast layer */}
        {forecast && forecastYear && (
          <ForecastLayer
            forecast={forecast}
            selectedYear={forecastYear}
            visible={layers.forecast}
            onStationClick={(stationId) => {
              const station = stations.find((s) => s.id === stationId || s.name.toLowerCase().includes(stationId.split('-').slice(1).join(' ')));
              if (station) onStationClick?.(station);
            }}
          />
        )}

        {/* Station markers */}
        {layers.stations &&
          sortedStations.map((station) => (
            <StationMarker key={station.id} station={station} onClick={onStationClick} />
          ))}

        {/* Fly to selected station */}
        <FlyToStation station={selectedStation} />
      </MapContainer>

      {/* Livability Legend */}
      <LivabilityLegend visible={layers.livability} />

      {/* Year slider for livability */}
      {layers.livability && (
        <YearSlider
          years={[2025, 2026, 2027, 2028, 2029]}
          selectedYear={livabilityYear}
          onYearChange={setLivabilityYear}
        />
      )}

      {/* Year slider for forecast */}
      {forecast && layers.forecast && !layers.livability && forecastYear && onForecastYearChange && forecastYears.length > 0 && (
        <YearSlider
          years={forecastYears}
          selectedYear={forecastYear}
          onYearChange={onForecastYearChange}
        />
      )}

      {/* Area info popup */}
      {areaInfo && (
        <div className="absolute bottom-20 left-4 z-[1000]">
          <AreaInfoPopup
            station={areaInfo.station}
            distance={areaInfo.distance}
            estimatedAQI={areaInfo.estimatedAQI}
            position={areaInfo.position}
            onClose={() => setAreaInfo(null)}
          />
        </div>
      )}
    </div>
  );
}
