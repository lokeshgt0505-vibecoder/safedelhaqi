import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { StationForecastResult, generateStationForecast } from '@/lib/forecasting-engine';
import { getAQIInfo } from '@/lib/aqi-utils';
import { HeatmapLayer } from './map/heatmap-layer';
import { VoronoiLayer } from './map/voronoi-layer';
import { InfluenceBuffers } from './map/influence-buffers';
import { ForecastLayer } from './map/forecast-layer';
import { MapLayerControls, LayerVisibility } from './map/map-layer-controls';
import { AreaInfoPopup } from './map/area-info-popup';
import { YearSlider } from './map/year-slider';
import { LivabilityLegend } from './map/livability-legend';
import { OnDemandVoronoiLayer } from './map/on-demand-voronoi-layer';
import { AreaLivabilityCard } from './map/area-livability-card';
import { mapAreaToStation, AreaStationResult } from '@/lib/area-station-mapping';

interface AQIMapProps {
  stations: StationData[];
  selectedStation?: StationData | null;
  onStationClick?: (station: StationData) => void;
  forecast?: ForecastData | null;
  forecastYear?: number;
  onForecastYearChange?: (year: number) => void;
  // Livability state lifted to parent
  onLivabilityForecastChange?: (forecast: StationForecastResult | null) => void;
  livabilityYear: number;
  onLivabilityYearChange?: (year: number) => void;
  livabilityLayerActive: boolean;
  onLayersChange?: (layers: LayerVisibility) => void;
  sidePanelOpen?: boolean;
}

// Calculate distance between two points in km (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
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

function findNearestStationAndAQI(
  lat: number,
  lng: number,
  stations: StationData[]
): { station: StationData; distance: number; estimatedAQI: number } | null {
  if (stations.length === 0) return null;

  let nearest: StationData = stations[0];
  let minDistance = Infinity;

  const stationsWithDistance = stations.map((station) => {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
    return { station, distance };
  });

  let weightedSum = 0;
  let weightSum = 0;
  const maxInfluenceDistance = 10;

  stationsWithDistance.forEach(({ station, distance }) => {
    if (distance < maxInfluenceDistance) {
      const weight = 1 / Math.pow(distance + 0.1, 2);
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

function FlyToStation({ station }: { station: StationData | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 13, { duration: 1.5 });
    }
  }, [station, map]);

  return null;
}

function MapResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [trigger, map]);

  return null;
}

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
    />
  );
}

export function AQIMap({ 
  stations, 
  selectedStation, 
  onStationClick,
  forecast,
  forecastYear,
  onForecastYearChange,
  onLivabilityForecastChange,
  livabilityYear,
  onLivabilityYearChange,
  livabilityLayerActive,
  onLayersChange,
  sidePanelOpen,
}: AQIMapProps) {
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

  // Sync livability layer with parent
  useEffect(() => {
    if (layers.livability !== livabilityLayerActive) {
      setLayers(prev => ({ ...prev, livability: livabilityLayerActive }));
    }
  }, [livabilityLayerActive]);

  // Area livability card state (for click-anywhere functionality)
  const [areaLivability, setAreaLivability] = useState<{
    position: [number, number];
    mapping: AreaStationResult;
    forecast: StationForecastResult | null;
  } | null>(null);

  // Area click popup state (for non-livability mode)
  const [areaInfo, setAreaInfo] = useState<{
    position: [number, number];
    station: StationData;
    distance: number;
    estimatedAQI: number;
  } | null>(null);

  // Handle ESC key to close popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAreaInfo(null);
        setAreaLivability(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    setLayers((prev) => {
      const next = { ...prev, [layer]: !prev[layer] };
      onLayersChange?.(next);
      return next;
    });
  }, [onLayersChange]);

  // Handle area click
  const handleAreaClick = useCallback(
    (info: {
      position: [number, number];
      station: StationData;
      distance: number;
      estimatedAQI: number;
    }) => {
      if (layers.livability) {
        const [lat, lng] = info.position;
        const mapping = mapAreaToStation(lat, lng, {
          voronoi: layers.voronoi,
          buffers: layers.buffers,
        });
        const forecast = generateStationForecast(mapping.stationId);
        setAreaLivability({
          position: info.position,
          mapping,
          forecast,
        });
        setAreaInfo(null);
      } else {
        setAreaInfo(info);
        setAreaLivability(null);
      }
    },
    [layers.livability, layers.voronoi, layers.buffers]
  );

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
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler stations={sortedStations} onAreaClick={handleAreaClick} />

        <VoronoiLayer
          stations={sortedStations}
          visible={layers.voronoi}
          onAreaClick={onStationClick}
        />

        <InfluenceBuffers stations={sortedStations} visible={layers.buffers} />
        <HeatmapLayer stations={sortedStations} visible={layers.heatmap} />

        <OnDemandVoronoiLayer
          visible={layers.livability}
          selectedYear={livabilityYear}
          onStationSelect={(f) => onLivabilityForecastChange?.(f)}
        />

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

        {layers.stations &&
          sortedStations.map((station) => (
            <StationMarker key={station.id} station={station} onClick={onStationClick} />
          ))}

        <FlyToStation station={selectedStation} />
        <MapResizeHandler trigger={!!sidePanelOpen} />
      </MapContainer>

      {/* Livability Legend */}
      <LivabilityLegend visible={layers.livability} />

      {/* Year slider for forecast (non-livability mode) */}
      {forecast && layers.forecast && !layers.livability && forecastYear && onForecastYearChange && forecastYears.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[500] max-w-xs">
          <YearSlider
            years={forecastYears}
            selectedYear={forecastYear}
            onYearChange={onForecastYearChange}
          />
        </div>
      )}

      {/* Area info popup (non-livability mode) */}
      {areaInfo && !layers.livability && (
        <div className="absolute bottom-20 left-4 z-[500]">
          <AreaInfoPopup
            station={areaInfo.station}
            distance={areaInfo.distance}
            estimatedAQI={areaInfo.estimatedAQI}
            position={areaInfo.position}
            onClose={() => setAreaInfo(null)}
          />
        </div>
      )}

      {/* Area Livability Card (livability mode) */}
      {areaLivability && layers.livability && (
        <div className="absolute bottom-20 left-4 z-[500]">
          <AreaLivabilityCard
            clickedPosition={areaLivability.position}
            areaMapping={areaLivability.mapping}
            stationForecast={areaLivability.forecast}
            selectedYear={livabilityYear}
            onClose={() => setAreaLivability(null)}
          />
        </div>
      )}
    </div>
  );
}
