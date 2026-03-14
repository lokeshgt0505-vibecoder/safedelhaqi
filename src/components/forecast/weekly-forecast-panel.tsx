import { useState, useMemo } from 'react';
import { WeeklyForecastData, DailyPrediction, StationWeeklyForecast } from '@/hooks/use-weekly-forecast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine,
} from 'recharts';
import {
  X, Sun, Cloud, Wind, Droplets, TrendingUp, TrendingDown, Minus,
  ThermometerSun, CalendarDays, MapPin, Shield, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyForecastPanelProps {
  data: WeeklyForecastData;
  onClose: () => void;
}

function getZoneColor(zone: string) {
  if (zone === 'blue') return 'hsl(var(--aqi-good))';
  if (zone === 'yellow') return 'hsl(var(--aqi-moderate))';
  return 'hsl(var(--aqi-poor))';
}

function getZoneBg(zone: string) {
  if (zone === 'blue') return 'bg-aqi-good/20 text-aqi-good';
  if (zone === 'yellow') return 'bg-aqi-moderate/20 text-aqi-moderate';
  return 'bg-aqi-poor/20 text-aqi-poor';
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <TrendingDown className="h-4 w-4 text-green-500" />;
  if (trend === 'worsening') return <TrendingUp className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-yellow-500" />;
}

function DayCard({ day, isSelected, onClick }: { day: DailyPrediction; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[90px]',
        isSelected
          ? 'border-primary bg-primary/10 shadow-md'
          : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{day.dayLabel}</span>
      <span className="text-xs text-muted-foreground">{day.dateLabel}</span>
      <span
        className="text-2xl font-bold font-display"
        style={{ color: getZoneColor(day.zone) }}
      >
        {day.predictedAqi}
      </span>
      <Badge variant="outline" className={cn('text-[10px] px-1.5', getZoneBg(day.zone))}>
        {day.zone === 'blue' ? 'Good' : day.zone === 'yellow' ? 'Moderate' : 'Poor'}
      </Badge>
      <span className="text-[10px] text-muted-foreground">{day.confidence}% conf</span>
    </button>
  );
}

export function WeeklyForecastPanel({ data, onClose }: WeeklyForecastPanelProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const selectedDay = data.cityAvgByDay[selectedDayIdx];

  const stationForDay = useMemo(() => {
    return data.stationForecasts
      .map(sf => ({
        ...sf,
        dayPrediction: sf.predictions[selectedDayIdx],
      }))
      .sort((a, b) => a.dayPrediction.predictedAqi - b.dayPrediction.predictedAqi);
  }, [data.stationForecasts, selectedDayIdx]);

  const selectedStationData = useMemo(() => {
    if (!selectedStationId) return null;
    return data.stationForecasts.find(sf => sf.stationId === selectedStationId) || null;
  }, [data.stationForecasts, selectedStationId]);

  const chartData = data.cityAvgByDay.map((d, i) => ({
    day: `${d.dayLabel}\n${d.dateLabel}`,
    aqi: d.predictedAqi,
    pm25: d.pm25,
    pm10: d.pm10,
    fill: getZoneColor(d.zone),
  }));

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              7-Day AQI Forecast
            </h2>
            <p className="text-sm text-muted-foreground">
              Daily predictions for {data.stationForecasts.length} stations across Delhi NCR
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Day Selector Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.cityAvgByDay.map((day, idx) => (
                <DayCard
                  key={day.date}
                  day={day}
                  isSelected={idx === selectedDayIdx}
                  onClick={() => setSelectedDayIdx(idx)}
                />
              ))}
            </div>

            {/* Selected Day Detail + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Day Detail Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sun className="h-4 w-4 text-primary" />
                    {selectedDay.dayLabel}, {selectedDay.dateLabel}
                  </CardTitle>
                  <CardDescription>City-wide average prediction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Predicted AQI</span>
                    <span className="text-3xl font-bold" style={{ color: getZoneColor(selectedDay.zone) }}>
                      {selectedDay.predictedAqi}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                      <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>PM2.5: <strong>{selectedDay.pm25}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                      <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>PM10: <strong>{selectedDay.pm10}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                      <ThermometerSun className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedDay.tempLow}°–{selectedDay.tempHigh}°C</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                      <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedDay.humidity}% RH</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 col-span-2">
                      <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Wind: {selectedDay.windSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{selectedDay.healthAdvice}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trend Chart */}
              <Card className="lg:col-span-2 bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">7-Day AQI Trend</CardTitle>
                  <CardDescription>City-wide average with pollutant breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: 12,
                          }}
                          formatter={(v: number, name: string) => [v, name === 'aqi' ? 'AQI' : name.toUpperCase()]}
                        />
                        <Legend />
                        <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" label="Good" />
                        <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" label="Poor" />
                        <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Station Rankings for Selected Day */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Station Predictions — {selectedDay.dayLabel}, {selectedDay.dateLabel}
                </CardTitle>
                <CardDescription>
                  Click a station to view its full 7-day trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {stationForDay.map(({ stationId, stationName, dayPrediction, weekTrend }) => (
                    <button
                      key={stationId}
                      onClick={() => setSelectedStationId(stationId === selectedStationId ? null : stationId)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                        stationId === selectedStationId
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getZoneColor(dayPrediction.zone) }}
                        />
                        <span className="text-sm truncate">{stationName}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <TrendIcon trend={weekTrend} />
                        <span className="text-lg font-bold font-display" style={{ color: getZoneColor(dayPrediction.zone) }}>
                          {dayPrediction.predictedAqi}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Station 7-Day Detail */}
            {selectedStationData && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedStationData.stationName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Week Avg: {selectedStationData.weekAvg}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <TrendIcon trend={selectedStationData.weekTrend} />
                          {selectedStationData.weekTrend}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">Best:</span> {selectedStationData.bestDay.dayLabel} ({selectedStationData.bestDay.predictedAqi})
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500">Worst:</span> {selectedStationData.worstDay.dayLabel} ({selectedStationData.worstDay.predictedAqi})
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStationData.predictions.map(p => ({
                        day: `${p.dayLabel}\n${p.dateLabel}`,
                        aqi: p.predictedAqi,
                        pm25: p.pm25,
                        pm10: p.pm10,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: 12,
                          }}
                        />
                        <Legend />
                        <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" />
                        <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={3} name="AQI" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="pm25" stroke="hsl(var(--chart-1))" strokeWidth={1.5} strokeDasharray="5 5" name="PM2.5" />
                        <Line type="monotone" dataKey="pm10" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="5 5" name="PM10" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
