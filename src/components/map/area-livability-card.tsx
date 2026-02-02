import { useEffect } from 'react';
import { X, MapPin, Building2, Leaf, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getZone, getZoneInfo } from '@/lib/aqi-utils';
import { AreaStationResult, getReasonText } from '@/lib/area-station-mapping';
import { StationForecastResult } from '@/lib/forecasting-engine';
import { LIVABILITY_COLORS, LivabilityClass } from '@/types/livability';

interface AreaLivabilityCardProps {
  clickedPosition: [number, number];
  areaMapping: AreaStationResult;
  stationForecast: StationForecastResult | null;
  selectedYear: number;
  onClose: () => void;
}

function getZoneColor(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-500';
    case 'red': return 'bg-red-500';
  }
}

function getLivabilityIcon(livabilityClass: LivabilityClass) {
  switch (livabilityClass) {
    case 'highly-livable':
      return <Leaf className="w-4 h-4 text-green-500" />;
    case 'moderately-livable':
      return <Building2 className="w-4 h-4 text-yellow-500" />;
    case 'low-livability':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
  }
}

export function AreaLivabilityCard({
  clickedPosition,
  areaMapping,
  stationForecast,
  selectedYear,
  onClose,
}: AreaLivabilityCardProps) {
  // Handle ESC key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Get the predicted AQI for the selected year
  const yearForecast = stationForecast?.forecasts.find(f => f.year === selectedYear);
  const predictedAqi = yearForecast?.predictedAqi || 0;
  const zone = getZone(predictedAqi);
  const zoneInfo = getZoneInfo(zone);
  
  const livabilityClass = stationForecast?.livabilityClass || 'low-livability';
  const livabilityScore = stationForecast?.livabilityScore || 0;
  const colorConfig = LIVABILITY_COLORS[livabilityClass];

  return (
    <Card className="w-80 shadow-xl border-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">Area Analysis</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {clickedPosition[0].toFixed(4)}, {clickedPosition[1].toFixed(4)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mt-1 -mr-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Governing Station */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Governing Station
          </p>
          <p className="font-semibold">{areaMapping.stationName}</p>
          <p className="text-xs text-muted-foreground italic">
            {getReasonText(areaMapping.reason)}
          </p>
        </div>

        {/* AQI Prediction */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {selectedYear} AQI
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{predictedAqi}</span>
              <Badge className={`${getZoneColor(zone)} text-white text-xs`}>
                {zoneInfo.label.replace(' Zone', '')}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Distance
            </p>
            <span className="text-2xl font-bold">
              {areaMapping.distance.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
            </span>
          </div>
        </div>

        {/* Livability Index */}
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${colorConfig.fill}15` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getLivabilityIcon(livabilityClass)}
              <span className="text-sm font-medium">Livability Index</span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-lg font-bold"
                style={{ color: colorConfig.fill }}
              >
                {livabilityScore}/100
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge 
              style={{ 
                backgroundColor: colorConfig.fill,
                color: 'white'
              }}
            >
              {colorConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {stationForecast?.overallTrend === 'improving' && '↗ Improving'}
              {stationForecast?.overallTrend === 'stable' && '→ Stable'}
              {stationForecast?.overallTrend === 'declining' && '↘ Declining'}
            </span>
          </div>
        </div>

        {/* Zone Recommendation */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">{zoneInfo.label} Advisory:</p>
          <p>{zoneInfo.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
