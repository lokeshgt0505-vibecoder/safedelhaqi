import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendDistributionChartProps {
  stations: StationData[];
  forecast: ForecastData;
}

const STABLE_THRESHOLD = 10;

// Normalize station name for matching
function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/delhi/g, '')
    .replace(/sector/g, 'sec')
    .trim();
}

// Match station with forecast data
function findMatchingForecast(station: StationData, forecasts: ForecastData['forecasts']) {
  let match = forecasts.find(f => f.stationId === station.id);
  if (match) return match;

  match = forecasts.find(f => f.stationName === station.name);
  if (match) return match;

  const normalizedStationName = normalizeStationName(station.name);
  match = forecasts.find(f => normalizeStationName(f.stationName) === normalizedStationName);
  if (match) return match;

  match = forecasts.find(f => {
    const normForecast = normalizeStationName(f.stationName);
    return normalizedStationName.includes(normForecast) || normForecast.includes(normalizedStationName);
  });

  return match || null;
}

// Compute trend from actual AQI difference
function computeTrend(currentAqi: number, predictedAqi: number): 'improving' | 'stable' | 'declining' {
  const change = predictedAqi - currentAqi;
  if (change < -STABLE_THRESHOLD) return 'improving';
  if (change > STABLE_THRESHOLD) return 'declining';
  return 'stable';
}

const COLORS = {
  improving: 'hsl(var(--chart-2))',  // Green
  stable: 'hsl(var(--chart-3))',      // Yellow/Orange
  declining: 'hsl(var(--chart-5))',   // Red
};

export function TrendDistributionChart({ stations, forecast }: TrendDistributionChartProps) {
  const chartData = useMemo(() => {
    if (forecast.forecasts.length === 0) return [];

    const years = forecast.forecasts[0].yearlyPredictions.map(p => p.year);

    return years.map(year => {
      let improving = 0;
      let stable = 0;
      let declining = 0;

      stations.forEach(station => {
        const stationForecast = findMatchingForecast(station, forecast.forecasts);
        if (!stationForecast) return;

        const prediction = stationForecast.yearlyPredictions.find(p => p.year === year);
        if (!prediction) return;

        const trend = computeTrend(station.aqi, prediction.avgAqi);
        if (trend === 'improving') improving++;
        else if (trend === 'stable') stable++;
        else declining++;
      });

      return {
        year: year.toString(),
        improving,
        stable,
        declining,
        total: improving + stable + declining,
      };
    });
  }, [stations, forecast]);

  // Calculate totals for the legend
  const totals = useMemo(() => {
    if (chartData.length === 0) return { improving: 0, stable: 0, declining: 0 };
    const lastYear = chartData[chartData.length - 1];
    return {
      improving: lastYear.improving,
      stable: lastYear.stable,
      declining: lastYear.declining,
    };
  }, [chartData]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          Trend Distribution by Year
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 12,
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                }}
                formatter={(value: number, name: string) => [
                  `${value} stations`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Bar 
                dataKey="improving" 
                stackId="a" 
                fill={COLORS.improving}
                radius={[0, 0, 0, 0]}
                name="Improving"
              />
              <Bar 
                dataKey="stable" 
                stackId="a" 
                fill={COLORS.stable}
                radius={[0, 0, 0, 0]}
                name="Stable"
              />
              <Bar 
                dataKey="declining" 
                stackId="a" 
                fill={COLORS.declining}
                radius={[4, 4, 0, 0]}
                name="Declining"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" style={{ color: COLORS.improving }} />
            <span>Improving</span>
            <span className="font-semibold" style={{ color: COLORS.improving }}>
              ({totals.improving})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Minus className="h-3.5 w-3.5" style={{ color: COLORS.stable }} />
            <span>Stable</span>
            <span className="font-semibold" style={{ color: COLORS.stable }}>
              ({totals.stable})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: COLORS.declining }} />
            <span>Declining</span>
            <span className="font-semibold" style={{ color: COLORS.declining }}>
              ({totals.declining})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
