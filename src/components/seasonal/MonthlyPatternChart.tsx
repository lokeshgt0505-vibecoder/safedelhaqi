import { useMemo } from 'react';
import { MonthlyPattern } from '@/hooks/useSeasonalAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from 'recharts';

interface MonthlyPatternChartProps {
  monthlyPatterns: MonthlyPattern[];
  title?: string;
}

function getZoneColor(zone: string): string {
  switch (zone) {
    case 'blue': return 'hsl(var(--chart-2))';
    case 'yellow': return 'hsl(var(--chart-3))';
    case 'red': return 'hsl(var(--chart-1))';
    default: return 'hsl(var(--muted))';
  }
}

function getRatingEmoji(rating: string): string {
  switch (rating) {
    case 'excellent': return '🌟';
    case 'good': return '😊';
    case 'moderate': return '😐';
    case 'poor': return '😷';
    case 'hazardous': return '☠️';
    default: return '';
  }
}

export function MonthlyPatternChart({ monthlyPatterns, title = 'Monthly AQI Patterns' }: MonthlyPatternChartProps) {
  const chartData = useMemo(() => {
    return monthlyPatterns.map(pattern => ({
      ...pattern,
      monthShort: pattern.monthName.substring(0, 3),
      range: [pattern.minAqi, pattern.maxAqi],
      color: getZoneColor(pattern.zone),
    }));
  }, [monthlyPatterns]);

  const bestMonth = useMemo(() => {
    return [...monthlyPatterns].sort((a, b) => a.avgAqi - b.avgAqi)[0];
  }, [monthlyPatterns]);

  const worstMonth = useMemo(() => {
    return [...monthlyPatterns].sort((a, b) => b.avgAqi - a.avgAqi)[0];
  }, [monthlyPatterns]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthShort" className="text-xs" />
                <YAxis domain={[0, 'auto']} className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as MonthlyPattern & { monthShort: string };
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.monthName}</p>
                        <p className="text-sm">
                          Avg AQI: <span style={{ color: getZoneColor(data.zone) }}>{data.avgAqi}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Range: {data.minAqi} - {data.maxAqi}
                        </p>
                        <p className="text-sm">
                          {getRatingEmoji(data.outdoorRating)} {data.outdoorRating.charAt(0).toUpperCase() + data.outdoorRating.slice(1)}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={100} stroke="hsl(var(--chart-2))" strokeDasharray="5 5" label="Good" />
                <ReferenceLine y={200} stroke="hsl(var(--chart-3))" strokeDasharray="5 5" label="Moderate" />
                <Area
                  type="monotone"
                  dataKey="range"
                  fill="hsl(var(--primary) / 0.1)"
                  stroke="none"
                />
                <Bar
                  dataKey="avgAqi"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--primary))"
                />
                <Line
                  type="monotone"
                  dataKey="avgAqi"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-4))', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Best & Worst Months Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌟</div>
              <div>
                <p className="text-sm text-muted-foreground">Best Month</p>
                <p className="font-semibold text-lg text-green-600">{bestMonth?.monthName}</p>
                <p className="text-sm">Avg AQI: {bestMonth?.avgAqi}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="text-sm text-muted-foreground">Worst Month</p>
                <p className="font-semibold text-lg text-red-600">{worstMonth?.monthName}</p>
                <p className="text-sm">Avg AQI: {worstMonth?.avgAqi}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
