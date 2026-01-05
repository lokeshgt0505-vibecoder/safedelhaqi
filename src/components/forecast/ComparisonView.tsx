import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { ArrowRight, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonViewProps {
  stations: StationData[];
  forecast: ForecastData;
  onClose: () => void;
}

function getZoneColor(zone: string) {
  switch (zone) {
    case 'blue':
      return 'bg-zone-blue text-white';
    case 'yellow':
      return 'bg-zone-yellow text-black';
    case 'red':
      return 'bg-zone-red text-white';
    default:
      return 'bg-muted';
  }
}

function getZoneLabel(zone: string) {
  switch (zone) {
    case 'blue':
      return 'Best';
    case 'yellow':
      return 'Moderate';
    case 'red':
      return 'Poor';
    default:
      return zone;
  }
}

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="h-4 w-4 text-aqi-good" />;
    case 'declining':
      return <TrendingUp className="h-4 w-4 text-aqi-very-poor" />;
    default:
      return <Minus className="h-4 w-4 text-aqi-moderate" />;
  }
}

export function ComparisonView({ stations, forecast, onClose }: ComparisonViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
  
  const years = useMemo(() => {
    if (forecast.forecasts.length === 0) return [];
    return forecast.forecasts[0].yearlyPredictions.map((p) => p.year);
  }, [forecast]);

  const comparisonData = useMemo(() => {
    return stations.map((station) => {
      const stationForecast = forecast.forecasts.find(
        (f) => f.stationId === station.id || f.stationName === station.name
      );
      
      const prediction = stationForecast?.yearlyPredictions.find(
        (p) => p.year === selectedYear
      );

      return {
        station,
        currentAqi: station.aqi,
        currentZone: station.zone,
        predictedAqi: prediction?.avgAqi || null,
        predictedZone: prediction?.zone || null,
        trend: stationForecast?.trend || 'stable',
        recommendation: stationForecast?.recommendation || '',
        confidence: prediction?.confidence || 0,
        change: prediction ? Math.round(prediction.avgAqi - station.aqi) : null,
      };
    }).sort((a, b) => {
      // Sort by improvement potential (biggest decrease first)
      const aChange = a.change || 0;
      const bChange = b.change || 0;
      return aChange - bChange;
    });
  }, [stations, forecast, selectedYear]);

  const summary = useMemo(() => {
    const improving = comparisonData.filter((d) => d.trend === 'improving').length;
    const declining = comparisonData.filter((d) => d.trend === 'declining').length;
    const stable = comparisonData.filter((d) => d.trend === 'stable').length;
    const zoneChanges = comparisonData.filter(
      (d) => d.currentZone !== d.predictedZone && d.predictedZone
    ).length;
    return { improving, declining, stable, zoneChanges };
  }, [comparisonData]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Current vs Predicted Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Side-by-side view of current and forecasted AQI zones
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-aqi-good" />
                  <div>
                    <p className="text-2xl font-bold text-aqi-good">{summary.improving}</p>
                    <p className="text-xs text-muted-foreground">Improving</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-aqi-moderate" />
                  <div>
                    <p className="text-2xl font-bold text-aqi-moderate">{summary.stable}</p>
                    <p className="text-xs text-muted-foreground">Stable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-aqi-very-poor" />
                  <div>
                    <p className="text-2xl font-bold text-aqi-very-poor">{summary.declining}</p>
                    <p className="text-xs text-muted-foreground">Declining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">{summary.zoneChanges}</p>
                    <p className="text-xs text-muted-foreground">Zone Changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid gap-3">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Station</div>
                <div className="col-span-2 text-center">Current</div>
                <div className="col-span-1 text-center"></div>
                <div className="col-span-2 text-center">{selectedYear}</div>
                <div className="col-span-1 text-center">Change</div>
                <div className="col-span-3">Trend & Notes</div>
              </div>

              {comparisonData.map((data) => (
                <Card key={data.station.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Station Name */}
                      <div className="col-span-3">
                        <p className="font-medium text-sm">{data.station.name}</p>
                        <p className="text-xs text-muted-foreground">
                          AQI Zone: {data.currentZone}
                        </p>
                      </div>

                      {/* Current */}
                      <div className="col-span-2 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-lg font-bold">{data.currentAqi}</span>
                          <Badge className={cn('text-xs', getZoneColor(data.currentZone))}>
                            {getZoneLabel(data.currentZone)}
                          </Badge>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="col-span-1 flex justify-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Predicted */}
                      <div className="col-span-2 text-center">
                        {data.predictedAqi !== null ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-lg font-bold">
                              {Math.round(data.predictedAqi)}
                            </span>
                            <Badge
                              className={cn('text-xs', getZoneColor(data.predictedZone || ''))}
                            >
                              {getZoneLabel(data.predictedZone || '')}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>

                      {/* Change */}
                      <div className="col-span-1 text-center">
                        {data.change !== null && (
                          <span
                            className={cn(
                              'font-medium',
                              data.change < 0 ? 'text-aqi-good' : data.change > 0 ? 'text-aqi-very-poor' : 'text-muted-foreground'
                            )}
                          >
                            {data.change > 0 ? '+' : ''}{data.change}
                          </span>
                        )}
                      </div>

                      {/* Trend & Notes */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendIcon trend={data.trend} />
                          <span className="text-sm capitalize">{data.trend}</span>
                          {data.confidence > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({data.confidence}% conf.)
                            </span>
                          )}
                        </div>
                        {data.recommendation && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {data.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
