import { useMemo, useState } from 'react';
import { Polygon, Tooltip, Popup } from 'react-leaflet';
import { Delaunay } from 'd3-delaunay';
import { useLivabilityData } from '@/hooks/use-livability-data';
import { LIVABILITY_COLORS, LivabilityClass } from '@/types/livability';
import { StationForecastResult } from '@/lib/forecasting-engine';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

interface LivabilityVoronoiLayerProps {
  visible: boolean;
  selectedYear?: number;
  onRegionClick?: (station: StationForecastResult) => void;
}

// Delhi bounds for clipping Voronoi
const DELHI_BOUNDS = {
  minLat: 28.4,
  maxLat: 28.9,
  minLng: 76.8,
  maxLng: 77.5,
};

interface VoronoiCell {
  station: StationForecastResult;
  positions: [number, number][];
  livabilityClass: LivabilityClass;
  color: string;
  strokeColor: string;
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

function MiniChart({ data }: { data: Array<{ year: number; aqi: number }> }) {
  return (
    <div className="w-48 h-24 mt-2">
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
          />
          <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="3 3" />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="aqi" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LivabilityVoronoiLayer({ 
  visible, 
  selectedYear = 2025,
  onRegionClick 
}: LivabilityVoronoiLayerProps) {
  const { stationForecasts } = useLivabilityData();
  const [selectedStation, setSelectedStation] = useState<StationForecastResult | null>(null);

  const voronoiCells = useMemo<VoronoiCell[]>(() => {
    if (stationForecasts.length < 3) return [];

    // Create Delaunay triangulation and Voronoi diagram
    const points = stationForecasts.map(s => [s.coordinates.lng, s.coordinates.lat] as [number, number]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([
      DELHI_BOUNDS.minLng,
      DELHI_BOUNDS.minLat,
      DELHI_BOUNDS.maxLng,
      DELHI_BOUNDS.maxLat,
    ]);

    return stationForecasts.map((station, i) => {
      const cell = voronoi.cellPolygon(i);
      if (!cell) return null;

      // Convert [lng, lat] to [lat, lng] for Leaflet
      const positions = cell.map(([lng, lat]) => [lat, lng] as [number, number]);
      const colorConfig = LIVABILITY_COLORS[station.livabilityClass];

      return {
        station,
        positions,
        livabilityClass: station.livabilityClass,
        color: colorConfig.fill,
        strokeColor: colorConfig.stroke,
      };
    }).filter(Boolean) as VoronoiCell[];
  }, [stationForecasts]);

  if (!visible) return null;

  return (
    <>
      {voronoiCells.map((cell) => {
        const yearForecast = cell.station.forecasts.find(f => f.year === selectedYear);
        const predictedAqi = yearForecast?.predictedAqi || 0;
        
        // Combine historical + forecast data for chart
        const chartData = [
          ...cell.station.historicalData.map(h => ({ year: h.year, aqi: h.avgAqi })),
          ...cell.station.forecasts.map(f => ({ year: f.year, aqi: f.predictedAqi })),
        ];

        return (
          <Polygon
            key={`livability-${cell.station.stationId}`}
            positions={cell.positions}
            pathOptions={{
              fillColor: cell.color,
              fillOpacity: 0.35,
              color: cell.strokeColor,
              weight: 2,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => {
                setSelectedStation(cell.station);
                onRegionClick?.(cell.station);
              },
            }}
          >
            <Tooltip sticky>
              <div className="p-2 font-sans min-w-[200px]">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{cell.station.stationName}</p>
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: cell.color }}
                  >
                    {LIVABILITY_COLORS[cell.livabilityClass].label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-gray-500">Livability Score</span>
                    <p className="font-bold text-lg">{cell.station.livabilityScore}/100</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{selectedYear} AQI</span>
                    <p className="font-bold text-lg">{predictedAqi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 text-xs">
                  <span className="text-gray-500">Trend:</span>
                  <TrendIcon trend={cell.station.overallTrend} />
                  <span className="capitalize">{cell.station.overallTrend}</span>
                </div>

                <p className="text-xs text-gray-500 mt-1 italic">
                  Click for detailed analysis
                </p>
              </div>
            </Tooltip>

            {selectedStation?.stationId === cell.station.stationId && (
              <Popup
                position={[cell.station.coordinates.lat, cell.station.coordinates.lng]}
                eventHandlers={{
                  remove: () => setSelectedStation(null),
                }}
              >
                <div className="p-3 font-sans min-w-[280px] max-w-[320px]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base">{cell.station.stationName}</h3>
                      <span className="text-xs text-gray-500 capitalize">
                        {cell.station.stationType} area
                      </span>
                    </div>
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: cell.color }}
                    >
                      {cell.station.livabilityScore}/100
                    </span>
                  </div>

                  {/* Mini Chart */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      AQI Trend (2021-2029)
                    </p>
                    <MiniChart data={chartData} />
                    <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-green-500"></span>Good (100)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-red-500"></span>Poor (200)
                      </span>
                    </div>
                  </div>

                  {/* Forecast Details */}
                  <div className="border-t pt-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">5-Year Forecast</p>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {cell.station.forecasts.map(f => (
                        <div key={f.year} className="text-xs">
                          <p className="text-gray-500">{f.year}</p>
                          <p className="font-bold">{f.predictedAqi}</p>
                          <p className="text-gray-400">{Math.round(f.confidence * 100)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-start gap-1">
                      <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{cell.station.recommendation}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Polygon>
        );
      })}
    </>
  );
}
