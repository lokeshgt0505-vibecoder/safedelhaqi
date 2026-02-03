import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { ArrowRight, TrendingUp, TrendingDown, Minus, X, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonViewProps {
  stations: StationData[];
  forecast: ForecastData;
  onClose: () => void;
}

// Threshold for determining stable trend
const STABLE_THRESHOLD = 10;

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
      return 'Good';
    case 'yellow':
      return 'Moderate';
    case 'red':
      return 'Poor';
    default:
      return zone;
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.85) return 'text-aqi-good';
  if (confidence >= 0.7) return 'text-aqi-moderate';
  return 'text-aqi-poor';
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 0.85) return 'High';
  if (confidence >= 0.7) return 'Medium';
  return 'Low';
}

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
  // Try exact ID match first
  let match = forecasts.find(f => f.stationId === station.id);
  if (match) return match;

  // Try exact name match
  match = forecasts.find(f => f.stationName === station.name);
  if (match) return match;

  // Try normalized name match
  const normalizedStationName = normalizeStationName(station.name);
  match = forecasts.find(f => normalizeStationName(f.stationName) === normalizedStationName);
  if (match) return match;

  // Try partial name match
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

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="h-4 w-4 text-aqi-good" />;
    case 'declining':
      return <TrendingUp className="h-4 w-4 text-aqi-very-poor" />;
    default:
      return <Minus className="h-4 w-4 text-aqi-moderate" />;
  }
}

function TrendBadge({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  const config = {
    improving: { label: 'Improving', className: 'bg-aqi-good/10 text-aqi-good border-aqi-good/30' },
    stable: { label: 'Stable', className: 'bg-aqi-moderate/10 text-aqi-moderate border-aqi-moderate/30' },
    declining: { label: 'Declining', className: 'bg-aqi-very-poor/10 text-aqi-very-poor border-aqi-very-poor/30' },
  };
  const { label, className } = config[trend];
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  );
}

interface ComparisonDataItem {
  station: StationData;
  currentAqi: number;
  currentZone: string;
  predictedAqi: number | null;
  predictedZone: string | null;
  computedTrend: 'improving' | 'stable' | 'declining' | null;
  recommendation: string;
  confidence: number;
  change: number | null;
  zoneChanged: boolean;
  hasPrediction: boolean;
}

export function ComparisonView({ stations, forecast, onClose }: ComparisonViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (forecast.forecasts.length === 0 || forecast.forecasts[0].yearlyPredictions.length === 0) {
      return new Date().getFullYear() + 1;
    }
    return forecast.forecasts[0].yearlyPredictions[0].year;
  });

  const years = useMemo(() => {
    if (forecast.forecasts.length === 0) return [];
    return forecast.forecasts[0].yearlyPredictions.map((p) => p.year);
  }, [forecast]);

  const comparisonData = useMemo<ComparisonDataItem[]>(() => {
    return stations.map((station) => {
      const stationForecast = findMatchingForecast(station, forecast.forecasts);

      const prediction = stationForecast?.yearlyPredictions.find(
        (p) => p.year === selectedYear
      );

      const predictedAqi = prediction?.avgAqi ?? null;
      const hasPrediction = predictedAqi !== null;
      
      // Compute trend based on actual AQI difference
      const computedTrend = hasPrediction 
        ? computeTrend(station.aqi, predictedAqi)
        : null;

      const change = hasPrediction ? Math.round(predictedAqi - station.aqi) : null;
      const zoneChanged = hasPrediction && prediction?.zone !== station.zone;

      return {
        station,
        currentAqi: station.aqi,
        currentZone: station.zone,
        predictedAqi,
        predictedZone: prediction?.zone || null,
        computedTrend,
        recommendation: stationForecast?.recommendation || '',
        confidence: prediction?.confidence || 0,
        change,
        zoneChanged,
        hasPrediction,
      };
    }).sort((a, b) => {
      // Sort: stations with predictions first, then by improvement potential
      if (a.hasPrediction !== b.hasPrediction) return a.hasPrediction ? -1 : 1;
      const aChange = a.change ?? 0;
      const bChange = b.change ?? 0;
      return aChange - bChange;
    });
  }, [stations, forecast, selectedYear]);

  // Calculate summary based on computed trends (excluding stations without predictions)
  const summary = useMemo(() => {
    const withPredictions = comparisonData.filter(d => d.hasPrediction);
    const noPredictions = comparisonData.filter(d => !d.hasPrediction);
    
    const improving = withPredictions.filter((d) => d.computedTrend === 'improving').length;
    const declining = withPredictions.filter((d) => d.computedTrend === 'declining').length;
    const stable = withPredictions.filter((d) => d.computedTrend === 'stable').length;
    const zoneChanges = withPredictions.filter((d) => d.zoneChanged).length;
    
    return { 
      improving, 
      declining, 
      stable, 
      zoneChanges, 
      total: withPredictions.length,
      unavailable: noPredictions.length
    };
  }, [comparisonData]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Current vs Predicted AQI Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Comparing current readings with {selectedYear} predictions 
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="inline h-3.5 w-3.5 ml-1 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Trends are computed from the difference between current and predicted AQI:
                      <br />• <strong>Improving:</strong> Predicted ≤ Current - {STABLE_THRESHOLD}
                      <br />• <strong>Stable:</strong> Within ±{STABLE_THRESHOLD} AQI
                      <br />• <strong>Declining:</strong> Predicted ≥ Current + {STABLE_THRESHOLD}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          <div className="grid grid-cols-5 gap-4">
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
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{summary.total}</p>
                    <p className="text-xs text-muted-foreground">With Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {summary.unavailable > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>{summary.unavailable} station(s) excluded due to missing prediction data</span>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid gap-3">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Station</div>
                <div className="col-span-2 text-center">Current (Live)</div>
                <div className="col-span-1 text-center"></div>
                <div className="col-span-2 text-center">{selectedYear} (Predicted)</div>
                <div className="col-span-1 text-center">Change</div>
                <div className="col-span-3">Trend & Confidence</div>
              </div>

              {comparisonData.map((data) => (
                <Card 
                  key={data.station.id} 
                  className={cn(
                    "overflow-hidden transition-opacity",
                    !data.hasPrediction && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Station Name */}
                      <div className="col-span-3">
                        <p className="font-medium text-sm">{data.station.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {data.zoneChanged && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              Zone Change
                            </Badge>
                          )}
                        </div>
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
                        {data.hasPrediction ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-lg font-bold">
                              {Math.round(data.predictedAqi!)}
                            </span>
                            <Badge
                              className={cn('text-xs', getZoneColor(data.predictedZone || ''))}
                            >
                              {getZoneLabel(data.predictedZone || '')}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-muted-foreground text-sm">Unavailable</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">No prediction model available for this station</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>

                      {/* Change */}
                      <div className="col-span-1 text-center">
                        {data.change !== null ? (
                          <span
                            className={cn(
                              'font-semibold text-lg',
                              data.change < -STABLE_THRESHOLD 
                                ? 'text-aqi-good' 
                                : data.change > STABLE_THRESHOLD 
                                  ? 'text-aqi-very-poor' 
                                  : 'text-muted-foreground'
                            )}
                          >
                            {data.change > 0 ? '+' : ''}{data.change}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Trend & Confidence */}
                      <div className="col-span-3">
                        {data.hasPrediction && data.computedTrend ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <TrendIcon trend={data.computedTrend} />
                              <TrendBadge trend={data.computedTrend} />
                            </div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <span className={cn('text-xs font-medium', getConfidenceColor(data.confidence))}>
                                        {getConfidenceLabel(data.confidence)} confidence
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({Math.round(data.confidence * 100)}%)
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-xs">
                                      Prediction reliability based on historical data quality and forecast horizon.
                                      {data.confidence >= 0.85 
                                        ? ' High confidence predictions are more reliable.'
                                        : data.confidence >= 0.7
                                          ? ' Medium confidence - consider as estimate.'
                                          : ' Low confidence - treat as rough estimate only.'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {data.recommendation && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {data.recommendation}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Prediction unavailable for this station
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer with legend */}
        <div className="border-t border-border p-3 bg-muted/30">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zone-blue" />
              <span>Good (AQI ≤100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zone-yellow" />
              <span>Moderate (101-200)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zone-red" />
              <span>Poor (AQI &gt;200)</span>
            </div>
            <span className="text-muted-foreground/60">|</span>
            <span>Trend threshold: ±{STABLE_THRESHOLD} AQI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
