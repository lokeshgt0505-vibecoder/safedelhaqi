import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';

interface ZoneDistributionChartProps {
  stations: StationData[];
  forecast: ForecastData;
  selectedYear: number;
}

const ZONE_CONFIG = {
  blue: { label: 'Good (≤100)', color: 'hsl(var(--chart-2))' },
  yellow: { label: 'Moderate (101-200)', color: 'hsl(var(--chart-3))' },
  red: { label: 'Poor (>200)', color: 'hsl(var(--chart-5))' },
};

function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/delhi/g, '')
    .replace(/sector/g, 'sec')
    .trim();
}

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

export function ZoneDistributionChart({ stations, forecast, selectedYear }: ZoneDistributionChartProps) {
  const chartData = useMemo(() => {
    const zoneCounts = { blue: 0, yellow: 0, red: 0 };

    stations.forEach(station => {
      const stationForecast = findMatchingForecast(station, forecast.forecasts);
      if (!stationForecast) return;

      const prediction = stationForecast.yearlyPredictions.find(p => p.year === selectedYear);
      if (!prediction) return;

      const zone = getZone(prediction.avgAqi);
      zoneCounts[zone]++;
    });

    return Object.entries(zoneCounts)
      .filter(([_, count]) => count > 0)
      .map(([zone, count]) => ({
        name: ZONE_CONFIG[zone as keyof typeof ZONE_CONFIG].label,
        value: count,
        color: ZONE_CONFIG[zone as keyof typeof ZONE_CONFIG].color,
        zone,
      }));
  }, [stations, forecast, selectedYear]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Zone Distribution for {selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                }}
                formatter={(value: number) => [`${value} stations (${((value / total) * 100).toFixed(1)}%)`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs flex-wrap">
          {chartData.map((entry) => (
            <div key={entry.zone} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
              <span className="font-semibold">({entry.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
