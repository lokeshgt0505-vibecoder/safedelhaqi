import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { ForecastData } from '@/types/forecast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastData;
  selectedStationId?: string;
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    case 'declining':
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
}

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

export function ForecastChart({ forecast, selectedStationId }: ForecastChartProps) {
  // Prepare data for city-wide chart
  const cityChartData = useMemo(() => {
    const years = Object.keys(forecast.cityOverview.avgAqiByYear).sort();
    return years.map((year) => ({
      year: parseInt(year),
      avgAqi: forecast.cityOverview.avgAqiByYear[year],
    }));
  }, [forecast.cityOverview.avgAqiByYear]);

  // Prepare data for selected station
  const stationData = useMemo(() => {
    if (!selectedStationId) return null;
    const stationForecast = forecast.forecasts.find(
      (f) => f.stationId === selectedStationId
    );
    if (!stationForecast) return null;

    return {
      ...stationForecast,
      chartData: stationForecast.yearlyPredictions.map((p) => ({
        year: p.year,
        avgAqi: p.avgAqi,
        bestAqi: p.bestMonth.aqi,
        worstAqi: p.worstMonth.aqi,
        confidence: p.confidence,
        zone: p.zone,
      })),
    };
  }, [forecast.forecasts, selectedStationId]);

  return (
    <div className="space-y-4">
      {/* City Overview Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Delhi NCR 5-Year AQI Forecast
              </CardTitle>
              <CardDescription>
                Predicted air quality trends based on historical data and ML analysis
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              {getTrendIcon(forecast.cityOverview.overallTrend)}
              {forecast.cityOverview.overallTrend}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cityChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="year"
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 300]}
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" label="Good" />
                <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" label="Poor" />
                <Area
                  type="monotone"
                  dataKey="avgAqi"
                  fill="hsl(var(--primary) / 0.2)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            {forecast.cityOverview.keyInsights.slice(0, 3).map((insight, idx) => (
              <div
                key={idx}
                className="text-xs p-2 bg-muted rounded-md text-muted-foreground"
              >
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Station Chart */}
      {stationData && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{stationData.stationName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {stationData.stationType}
                  </Badge>
                  {stationData.recommendation}
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {getTrendIcon(stationData.trend)}
                {stationData.trend}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stationData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="year"
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 400]}
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        avgAqi: 'Avg AQI',
                        bestAqi: 'Best Month',
                        worstAqi: 'Worst Month',
                      };
                      return [Math.round(value), labels[name] || name];
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" />
                  <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="worstAqi"
                    fill="hsl(var(--destructive) / 0.1)"
                    stroke="transparent"
                    name="Worst Month"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgAqi"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    name="Avg AQI"
                  />
                  <Line
                    type="monotone"
                    dataKey="bestAqi"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Best Month"
                  />
                  <Line
                    type="monotone"
                    dataKey="worstAqi"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Worst Month"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Year-by-year breakdown */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {stationData.yearlyPredictions.map((pred) => (
                <div
                  key={pred.year}
                  className="text-center p-2 rounded-lg border border-border"
                  style={{ borderColor: getZoneColor(pred.zone) }}
                >
                  <p className="text-xs text-muted-foreground">{pred.year}</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: getZoneColor(pred.zone) }}
                  >
                    {Math.round(pred.avgAqi)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pred.confidence}% conf
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
