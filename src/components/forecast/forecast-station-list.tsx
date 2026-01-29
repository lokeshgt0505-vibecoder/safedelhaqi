import { useState, useMemo } from 'react';
import { ForecastData } from '@/types/forecast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Building2, Trees, Factory, Store } from 'lucide-react';

interface ForecastStationListProps {
  forecast: ForecastData;
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

function getStationTypeIcon(type: string) {
  switch (type) {
    case 'industrial':
      return <Factory className="h-4 w-4" />;
    case 'residential':
      return <Building2 className="h-4 w-4" />;
    case 'commercial':
      return <Store className="h-4 w-4" />;
    case 'green':
      return <Trees className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    case 'declining':
      return <TrendingUp className="h-3 w-3 text-red-500" />;
    default:
      return <Minus className="h-3 w-3 text-yellow-500" />;
  }
}

function getZoneStyles(zone: string) {
  switch (zone) {
    case 'blue':
      return { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/50' };
    case 'yellow':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/50' };
    case 'red':
      return { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/50' };
    default:
      return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  }
}

export function ForecastStationList({
  forecast,
  selectedStationId,
  onSelectStation,
  selectedYear,
  onSelectYear,
}: ForecastStationListProps) {
  // Get available years
  const years = useMemo(() => {
    if (forecast.forecasts.length === 0) return [];
    return forecast.forecasts[0].yearlyPredictions.map((p) => p.year);
  }, [forecast.forecasts]);

  // Sort stations by predicted AQI for selected year
  const sortedStations = useMemo(() => {
    return [...forecast.forecasts].sort((a, b) => {
      const aqi_a = a.yearlyPredictions.find((p) => p.year === selectedYear)?.avgAqi || 0;
      const aqi_b = b.yearlyPredictions.find((p) => p.year === selectedYear)?.avgAqi || 0;
      return aqi_a - aqi_b;
    });
  }, [forecast.forecasts, selectedYear]);

  // Group by zone
  const groupedStations = useMemo(() => {
    const groups = { blue: [] as typeof sortedStations, yellow: [] as typeof sortedStations, red: [] as typeof sortedStations };
    sortedStations.forEach((station) => {
      const prediction = station.yearlyPredictions.find((p) => p.year === selectedYear);
      const zone = prediction?.zone || 'yellow';
      groups[zone].push(station);
    });
    return groups;
  }, [sortedStations, selectedYear]);

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Station Forecasts</CardTitle>
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => onSelectYear(parseInt(v))}
          >
            <SelectTrigger className="w-24 h-8">
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="space-y-4">
            {/* Blue Zone - Best */}
            {groupedStations.blue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-500">
                    Best for Living ({groupedStations.blue.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {groupedStations.blue.map((station) => {
                    const prediction = station.yearlyPredictions.find(
                      (p) => p.year === selectedYear
                    );
                    const styles = getZoneStyles('blue');
                    return (
                      <Button
                        key={station.stationId}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2 px-3 ${
                          selectedStationId === station.stationId
                            ? `${styles.bg} ${styles.border} border`
                            : ''
                        }`}
                        onClick={() => onSelectStation(station.stationId)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {getStationTypeIcon(station.stationType)}
                            <span className="text-sm truncate max-w-[120px]">
                              {station.stationName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(station.trend)}
                            <Badge variant="secondary" className={`${styles.text} text-xs`}>
                              {Math.round(prediction?.avgAqi || 0)}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Yellow Zone - Moderate */}
            {groupedStations.yellow.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs font-medium text-yellow-500">
                    Moderate ({groupedStations.yellow.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {groupedStations.yellow.map((station) => {
                    const prediction = station.yearlyPredictions.find(
                      (p) => p.year === selectedYear
                    );
                    const styles = getZoneStyles('yellow');
                    return (
                      <Button
                        key={station.stationId}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2 px-3 ${
                          selectedStationId === station.stationId
                            ? `${styles.bg} ${styles.border} border`
                            : ''
                        }`}
                        onClick={() => onSelectStation(station.stationId)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {getStationTypeIcon(station.stationType)}
                            <span className="text-sm truncate max-w-[120px]">
                              {station.stationName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(station.trend)}
                            <Badge variant="secondary" className={`${styles.text} text-xs`}>
                              {Math.round(prediction?.avgAqi || 0)}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Red Zone - Poor */}
            {groupedStations.red.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-500">
                    Not Recommended ({groupedStations.red.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {groupedStations.red.map((station) => {
                    const prediction = station.yearlyPredictions.find(
                      (p) => p.year === selectedYear
                    );
                    const styles = getZoneStyles('red');
                    return (
                      <Button
                        key={station.stationId}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2 px-3 ${
                          selectedStationId === station.stationId
                            ? `${styles.bg} ${styles.border} border`
                            : ''
                        }`}
                        onClick={() => onSelectStation(station.stationId)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {getStationTypeIcon(station.stationType)}
                            <span className="text-sm truncate max-w-[120px]">
                              {station.stationName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(station.trend)}
                            <Badge variant="secondary" className={`${styles.text} text-xs`}>
                              {Math.round(prediction?.avgAqi || 0)}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
