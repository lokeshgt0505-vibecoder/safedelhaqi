import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StationForecastResult } from '@/lib/forecasting-engine';

interface AreaForecastChartProps {
  forecast: StationForecastResult | null;
  selectedYear: number;
}

export function AreaForecastChart({ forecast, selectedYear }: AreaForecastChartProps) {
  if (!forecast) return null;

  // Combine historical and forecast data
  const chartData = [
    ...forecast.historicalData.map(d => ({
      year: d.year,
      aqi: d.avgAqi,
      type: 'historical' as const,
    })),
    ...forecast.forecasts.map(d => ({
      year: d.year,
      aqi: d.predictedAqi,
      type: 'forecast' as const,
    })),
  ].sort((a, b) => a.year - b.year);

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              fontSize: 12, 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 6,
            }}
            formatter={(value: number) => [`AQI: ${value}`, '']}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <ReferenceLine 
            x={selectedYear} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="3 3" 
            strokeWidth={2}
          />
          {/* Historical data line */}
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.type === 'historical') {
                return (
                  <circle
                    key={payload.year}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="hsl(var(--muted-foreground))"
                  />
                );
              }
              return (
                <circle
                  key={payload.year}
                  cx={cx}
                  cy={cy}
                  r={payload.year === selectedYear ? 5 : 3}
                  fill={payload.year === selectedYear ? 'hsl(var(--primary))' : 'hsl(var(--chart-1))'}
                  stroke={payload.year === selectedYear ? 'hsl(var(--background))' : 'none'}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
