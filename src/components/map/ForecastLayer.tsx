import { useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { ForecastData } from '@/types/forecast';

interface ForecastLayerProps {
  forecast: ForecastData;
  selectedYear: number;
  visible: boolean;
  onStationClick?: (stationId: string) => void;
}

// Station coordinates mapping
const STATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'delhi-anand-vihar': { lat: 28.6469, lng: 77.316 },
  'delhi-ito': { lat: 28.6289, lng: 77.2405 },
  'delhi-mandir-marg': { lat: 28.6369, lng: 77.201 },
  'delhi-punjabi-bagh': { lat: 28.6683, lng: 77.1167 },
  'delhi-r-k-puram': { lat: 28.5633, lng: 77.1861 },
  'delhi-shadipur': { lat: 28.6519, lng: 77.1478 },
  'delhi-dwarka-sec-8': { lat: 28.5708, lng: 77.0711 },
  'delhi-ashok-vihar': { lat: 28.695, lng: 77.1817 },
  'delhi-bawana': { lat: 28.7761, lng: 77.0511 },
  'delhi-jawaharlal-nehru-stadium': { lat: 28.5833, lng: 77.2333 },
  'delhi-lodhi-road': { lat: 28.5918, lng: 77.2273 },
  'delhi-major-dhyan-chand-stadium': { lat: 28.6117, lng: 77.2378 },
  'delhi-mathura-road': { lat: 28.5558, lng: 77.2506 },
  'delhi-mundka': { lat: 28.6833, lng: 77.0333 },
  'delhi-narela': { lat: 28.8528, lng: 77.0928 },
  'delhi-nehru-nagar': { lat: 28.5678, lng: 77.25 },
  'delhi-north-campus': { lat: 28.6879, lng: 77.2089 },
  'delhi-okhla': { lat: 28.531, lng: 77.269 },
  'delhi-patparganj': { lat: 28.6236, lng: 77.2878 },
  'delhi-pusa': { lat: 28.64, lng: 77.1467 },
  'delhi-rohini': { lat: 28.7328, lng: 77.1089 },
  'delhi-siri-fort': { lat: 28.5503, lng: 77.2156 },
  'delhi-sonia-vihar': { lat: 28.7108, lng: 77.2489 },
  'delhi-vivek-vihar': { lat: 28.6722, lng: 77.3156 },
  'delhi-wazirpur': { lat: 28.6989, lng: 77.1658 },
};

function getZoneColor(zone: string): string {
  switch (zone) {
    case 'blue':
      return '#22c55e';
    case 'yellow':
      return '#eab308';
    case 'red':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function getZoneLabel(zone: string): string {
  switch (zone) {
    case 'blue':
      return 'Best for Living';
    case 'yellow':
      return 'Moderate';
    case 'red':
      return 'Not Recommended';
    default:
      return 'Unknown';
  }
}

export function ForecastLayer({
  forecast,
  selectedYear,
  visible,
  onStationClick,
}: ForecastLayerProps) {
  const forecastMarkers = useMemo(() => {
    return forecast.forecasts.map((station) => {
      const coords = STATION_COORDS[station.stationId];
      if (!coords) return null;

      const prediction = station.yearlyPredictions.find((p) => p.year === selectedYear);
      if (!prediction) return null;

      return {
        ...station,
        ...coords,
        prediction,
        color: getZoneColor(prediction.zone),
      };
    }).filter(Boolean);
  }, [forecast.forecasts, selectedYear]);

  if (!visible) return null;

  return (
    <>
      {forecastMarkers.map((marker) => {
        if (!marker) return null;
        return (
          <CircleMarker
            key={`forecast-${marker.stationId}`}
            center={[marker.lat, marker.lng]}
            radius={25}
            pathOptions={{
              fillColor: marker.color,
              fillOpacity: 0.7,
              color: 'white',
              weight: 3,
              dashArray: '5, 5',
            }}
            eventHandlers={{
              click: () => onStationClick?.(marker.stationId),
            }}
          >
            <Tooltip sticky>
              <div className="p-2 font-sans">
                <p className="font-semibold text-sm">{marker.stationName}</p>
                <p className="text-xs text-gray-500">{selectedYear} Forecast</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">
                    Predicted AQI:{' '}
                    <strong style={{ color: marker.color }}>
                      {Math.round(marker.prediction.avgAqi)}
                    </strong>
                  </p>
                  <p className="text-xs" style={{ color: marker.color }}>
                    {getZoneLabel(marker.prediction.zone)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Best: {marker.prediction.bestMonth.month} ({marker.prediction.bestMonth.aqi})
                  </p>
                  <p className="text-xs text-gray-500">
                    Worst: {marker.prediction.worstMonth.month} ({marker.prediction.worstMonth.aqi})
                  </p>
                  <p className="text-xs text-gray-400">
                    Confidence: {marker.prediction.confidence}%
                  </p>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
