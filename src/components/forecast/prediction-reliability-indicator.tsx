import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Info, Database, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';

interface PredictionReliabilityIndicatorProps {
  stations: StationData[];
  forecast: ForecastData;
  selectedYear: number;
}

interface ReliabilityMetrics {
  overallScore: number;
  historicalCoverage: number;
  stationCoverage: number;
  forecastHorizon: number;
  dataQuality: number;
  label: 'Excellent' | 'Good' | 'Moderate' | 'Limited';
  color: string;
  bgColor: string;
  description: string;
}

// Match station with forecast data (reused logic)
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

export function PredictionReliabilityIndicator({ 
  stations, 
  forecast, 
  selectedYear 
}: PredictionReliabilityIndicatorProps) {
  const metrics = useMemo<ReliabilityMetrics>(() => {
    const currentYear = new Date().getFullYear();
    const forecastHorizonYears = selectedYear - currentYear;
    
    // Calculate station coverage (% of stations with predictions)
    const stationsWithPredictions = stations.filter(s => {
      const match = findMatchingForecast(s, forecast.forecasts);
      return match?.yearlyPredictions.some(p => p.year === selectedYear);
    }).length;
    const stationCoverage = stations.length > 0 
      ? (stationsWithPredictions / stations.length) * 100 
      : 0;

    // Calculate average confidence for the selected year
    let totalConfidence = 0;
    let confidenceCount = 0;
    stations.forEach(s => {
      const match = findMatchingForecast(s, forecast.forecasts);
      const prediction = match?.yearlyPredictions.find(p => p.year === selectedYear);
      if (prediction) {
        totalConfidence += prediction.confidence;
        confidenceCount++;
      }
    });
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Historical data coverage (based on training data years 2021-2024 = 4 years)
    const historicalYears = 4;
    const maxHistoricalYears = 10;
    const historicalCoverage = Math.min((historicalYears / maxHistoricalYears) * 100, 100);

    // Forecast horizon penalty (predictions further out are less reliable)
    // 1 year = 100%, 5 years = 50%
    const forecastHorizonScore = Math.max(0, 100 - (forecastHorizonYears - 1) * 12.5);

    // Data quality based on average confidence
    const dataQuality = avgConfidence * 100;

    // Calculate overall reliability score (weighted average)
    const overallScore = Math.round(
      stationCoverage * 0.25 +
      historicalCoverage * 0.20 +
      forecastHorizonScore * 0.30 +
      dataQuality * 0.25
    );

    // Determine reliability label and styling
    let label: ReliabilityMetrics['label'];
    let color: string;
    let bgColor: string;
    let description: string;

    if (overallScore >= 85) {
      label = 'Excellent';
      color = 'text-green-600 dark:text-green-400';
      bgColor = 'bg-green-500';
      description = 'High confidence predictions based on comprehensive data coverage and recent historical trends.';
    } else if (overallScore >= 70) {
      label = 'Good';
      color = 'text-blue-600 dark:text-blue-400';
      bgColor = 'bg-blue-500';
      description = 'Reliable predictions with adequate data coverage. Minor uncertainties due to forecast horizon.';
    } else if (overallScore >= 50) {
      label = 'Moderate';
      color = 'text-yellow-600 dark:text-yellow-400';
      bgColor = 'bg-yellow-500';
      description = 'Predictions should be treated as estimates. Some stations have limited data coverage.';
    } else {
      label = 'Limited';
      color = 'text-red-600 dark:text-red-400';
      bgColor = 'bg-red-500';
      description = 'Low reliability due to limited data or extended forecast horizon. Use with caution.';
    }

    return {
      overallScore,
      historicalCoverage,
      stationCoverage,
      forecastHorizon: forecastHorizonScore,
      dataQuality,
      label,
      color,
      bgColor,
      description,
    };
  }, [stations, forecast, selectedYear]);

  const ReliabilityIcon = metrics.overallScore >= 70 
    ? ShieldCheck 
    : metrics.overallScore >= 50 
      ? ShieldQuestion 
      : ShieldAlert;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Main Score */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              metrics.bgColor + '/15'
            )}>
              <ReliabilityIcon className={cn('w-8 h-8', metrics.color)} />
            </div>
            <div className="mt-2 text-center">
              <span className={cn('text-2xl font-bold', metrics.color)}>
                {metrics.overallScore}%
              </span>
              <Badge 
                variant="outline" 
                className={cn('ml-0 mt-1 block text-xs', metrics.color, 'border-current')}
              >
                {metrics.label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Prediction Reliability</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{metrics.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Metric Bars */}
            <div className="space-y-2">
              <MetricBar 
                icon={Database} 
                label="Station Coverage" 
                value={metrics.stationCoverage} 
                tooltip="Percentage of stations with available predictions"
              />
              <MetricBar 
                icon={Calendar} 
                label="Historical Data" 
                value={metrics.historicalCoverage} 
                tooltip="Based on 4 years of historical AQI data (2021-2024)"
              />
              <MetricBar 
                icon={TrendingUp} 
                label="Forecast Horizon" 
                value={metrics.forecastHorizon} 
                tooltip="Reliability decreases for predictions further into the future"
              />
              <MetricBar 
                icon={CheckCircle2} 
                label="Data Quality" 
                value={metrics.dataQuality} 
                tooltip="Average model confidence across all station predictions"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricBarProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tooltip: string;
}

function MetricBar({ icon: Icon, label, value, tooltip }: MetricBarProps) {
  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-blue-500';
    if (val >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all', getBarColor(value))}
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-10 text-right">{Math.round(value)}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
