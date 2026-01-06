import { StationSeasonalData } from '@/hooks/useSeasonalAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MonthlyPatternChart } from './MonthlyPatternChart';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface StationSeasonalViewProps {
  stations: StationSeasonalData[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
}

function getZoneColor(zone: string): string {
  switch (zone) {
    case 'blue': return 'text-blue-600';
    case 'yellow': return 'text-yellow-600';
    case 'red': return 'text-red-600';
    default: return 'text-muted-foreground';
  }
}

function getZoneBg(zone: string): string {
  switch (zone) {
    case 'blue': return 'bg-blue-500/10';
    case 'yellow': return 'bg-yellow-500/10';
    case 'red': return 'bg-red-500/10';
    default: return 'bg-muted';
  }
}

export function StationSeasonalView({ 
  stations, 
  selectedStationId, 
  onSelectStation 
}: StationSeasonalViewProps) {
  const selectedStation = stations.find(s => s.stationId === selectedStationId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Station List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-2">
              {stations.map((station) => {
                const avgAqi = Math.round(
                  station.monthlyPatterns.reduce((sum, m) => sum + m.avgAqi, 0) / 12
                );
                const bestMonth = station.bestMonths[0];
                
                return (
                  <button
                    key={station.stationId}
                    onClick={() => onSelectStation(station.stationId)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedStationId === station.stationId
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium truncate">{station.stationName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">
                        Avg: {avgAqi} AQI
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Best: {bestMonth?.monthName.slice(0, 3)}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Station Details */}
      <div className="lg:col-span-2 space-y-4">
        {selectedStation ? (
          <>
            {/* Station Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{selectedStation.stationName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {selectedStation.seasonalPatterns.map((season) => (
                    <div key={season.season} className={`p-3 rounded-lg ${getZoneBg(season.zone)}`}>
                      <p className="text-sm text-muted-foreground">{season.season}</p>
                      <p className={`text-xl font-bold ${getZoneColor(season.zone)}`}>
                        {season.avgAqi}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best & Worst Months */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    Best Months (Low AQI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedStation.bestMonths.map((month, i) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                          {month.monthName}
                        </span>
                        <Badge variant="outline" className="text-green-600">
                          {month.avgAqi} AQI
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                    <TrendingUp className="h-4 w-4" />
                    Worst Months (High AQI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedStation.worstMonths.map((month, i) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{i === 0 ? '⚠️' : i === 1 ? '🔶' : '🟡'}</span>
                          {month.monthName}
                        </span>
                        <Badge variant="outline" className="text-red-600">
                          {month.avgAqi} AQI
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Chart */}
            <MonthlyPatternChart
              monthlyPatterns={selectedStation.monthlyPatterns}
              title={`${selectedStation.stationName} - Monthly Patterns`}
            />
          </>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a station to view seasonal patterns</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
