import { useMemo, useState } from 'react';
import { Polygon, Tooltip, Popup } from 'react-leaflet';
import { Delaunay } from 'd3-delaunay';
import { DELHI_STATIONS } from '@/lib/aqi-utils';
import { LIVABILITY_COLORS, LivabilityClass } from '@/types/livability';
import { StationForecastResult } from '@/lib/forecasting-engine';
import { useOnDemandLivability } from '@/hooks/use-on-demand-livability';
import { TrendingUp, TrendingDown, Minus, Info, Loader2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

interface OnDemandVoronoiLayerProps {
  visible: boolean;
  selectedYear?: number;
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

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    case 'declining':
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-yellow-500" />;
  }
}

function getAqiCategory(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Satisfactory', color: '#84cc16' };
  if (aqi <= 200) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 300) return { label: 'Poor', color: '#f97316' };
  if (aqi <= 400) return { label: 'Very Poor', color: '#ef4444' };
  return { label: 'Severe', color: '#7f1d1d' };
}

function MiniChart({ data }: { data: Array<{ year: number; aqi: number; type: string }> }) {
  return (
    <div className="w-full h-28 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <RechartsTooltip 
            contentStyle={{ fontSize: 11, padding: '4px 8px' }}
            labelStyle={{ fontSize: 10 }}
            formatter={(value: number, name: string) => [value, 'AQI']}
          />
          <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="3 3" />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="aqi" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={payload.type === 'forecast' ? 5 : 3}
                fill={payload.type === 'forecast' ? '#8b5cf6' : '#3b82f6'}
                stroke={payload.type === 'forecast' ? '#7c3aed' : '#2563eb'}
                strokeWidth={1}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OnDemandVoronoiLayer({ 
  visible, 
  selectedYear = 2025,
}: OnDemandVoronoiLayerProps) {
  const { calculateLivability, getCachedForecast, isCached, isCalculating } = useOnDemandLivability();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [activeForecast, setActiveForecast] = useState<StationForecastResult | null>(null);

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
  const handleRegionClick = (cell: VoronoiCell) => {
    setSelectedStation(cell.stationId);
    const forecast = calculateLivability(cell.stationId);
    setActiveForecast(forecast);
  };

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

            {isSelected && activeForecast && (
              <Popup
                position={[cell.lat, cell.lng]}
                eventHandlers={{
                  remove: () => {
                    setSelectedStation(null);
                    setActiveForecast(null);
                  },
                }}
              >
                <div className="p-3 font-sans min-w-[300px] max-w-[350px]">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base">{activeForecast.stationName}</h3>
                      <span className="text-xs text-gray-500 capitalize">
                        {activeForecast.stationType} area
                      </span>
                    </div>
                    <span 
                      className="px-3 py-1.5 rounded text-sm font-bold text-white"
                      style={{ backgroundColor: LIVABILITY_COLORS[activeForecast.livabilityClass].fill }}
                    >
                      {activeForecast.livabilityScore}/100
                    </span>
                  </div>

                  {/* Livability Classification */}
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: `${LIVABILITY_COLORS[activeForecast.livabilityClass].fill}15` }}>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LIVABILITY_COLORS[activeForecast.livabilityClass].fill }}
                    />
                    <span className="font-semibold text-sm">
                      {LIVABILITY_COLORS[activeForecast.livabilityClass].label}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <TrendIcon trend={activeForecast.overallTrend} />
                      <span className="text-xs capitalize">{activeForecast.overallTrend}</span>
                    </div>
                  </div>

                  {/* Mini Chart - Historical + Forecast */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      10-Year Historical + 5-Year Forecast
                    </p>
                    <MiniChart 
                      data={[
                        ...activeForecast.historicalData.map(h => ({ 
                          year: h.year, 
                          aqi: h.avgAqi, 
                          type: 'historical' 
                        })),
                        ...activeForecast.forecasts.map(f => ({ 
                          year: f.year, 
                          aqi: f.predictedAqi, 
                          type: 'forecast' 
                        })),
                      ]} 
                    />
                    <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>Historical
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>Predicted
                      </span>
                    </div>
                  </div>

                  {/* 5-Year Forecast Details */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">5-Year AQI Forecast</p>
                    <div className="space-y-1.5">
                      {activeForecast.forecasts.map(f => {
                        const category = getAqiCategory(f.predictedAqi);
                        return (
                          <div key={f.year} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{f.year}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{f.predictedAqi}</span>
                              <span 
                                className="px-1.5 py-0.5 rounded text-white text-[10px]"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.label}
                              </span>
                              <span className="text-gray-400">
                                ({Math.round(f.confidence * 100)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Answer the question */}
                  <div className="mt-3 p-2 rounded-lg border-2" style={{ 
                    borderColor: LIVABILITY_COLORS[activeForecast.livabilityClass].fill,
                    backgroundColor: `${LIVABILITY_COLORS[activeForecast.livabilityClass].fill}10`
                  }}>
                    <p className="text-xs font-semibold mb-1">
                      Is this place suitable for the next 5 years?
                    </p>
                    <p className="text-sm font-bold" style={{ color: LIVABILITY_COLORS[activeForecast.livabilityClass].fill }}>
                      {activeForecast.livabilityClass === 'highly-livable' 
                        ? '✓ Yes, Recommended' 
                        : activeForecast.livabilityClass === 'moderately-livable'
                        ? '△ Yes, with precautions'
                        : '✗ Not Recommended'}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-start gap-1">
                      <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{activeForecast.recommendation}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            )}

            {/* Loading state popup */}
            {isSelected && isCalculating && (
              <Popup position={[cell.lat, cell.lng]}>
                <div className="p-4 font-sans flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating livability...</span>
                </div>
              </Popup>
            )}
          </Polygon>
        );
      })}
    </>
  );
}
