import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAQIData } from '@/hooks/useAQIData';
import { useAQIForecast, StationForecast } from '@/hooks/useAQIForecast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  Home, 
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankedNeighborhood {
  stationId: string;
  name: string;
  currentAqi: number;
  avgForecastAqi: number;
  trend: 'improving' | 'stable' | 'declining';
  livabilityScore: number;
  recommendation: string;
  zone: 'blue' | 'yellow' | 'red';
  bestYear: { year: number; aqi: number };
  worstYear: { year: number; aqi: number };
  confidence: number;
  rank: number;
}

function getLivabilityScore(avgAqi: number, trend: string): number {
  // Base score from AQI (0-100, higher is better)
  let score = Math.max(0, 100 - (avgAqi / 3));
  
  // Adjust for trend
  if (trend === 'improving') score += 10;
  if (trend === 'declining') score -= 10;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getZoneFromAqi(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
}

function getZoneColor(zone: string) {
  switch (zone) {
    case 'blue':
      return 'bg-green-500/10 text-green-600 border-green-500/30';
    case 'yellow':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
    case 'red':
      return 'bg-red-500/10 text-red-600 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getZoneLabel(zone: string) {
  switch (zone) {
    case 'blue':
      return 'Best for Living';
    case 'yellow':
      return 'Moderate';
    case 'red':
      return 'Not Recommended';
    default:
      return 'Unknown';
  }
}

function NeighborhoodCard({ neighborhood, index }: { neighborhood: RankedNeighborhood; index: number }) {
  const isTopThree = index < 3;
  const isBottom = neighborhood.zone === 'red';
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      isTopThree && "ring-2 ring-green-500/30",
      isBottom && "opacity-80"
    )}>
      {isTopThree && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-green-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
          #{index + 1} Recommended
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              neighborhood.zone === 'blue' ? 'bg-green-500/10' :
              neighborhood.zone === 'yellow' ? 'bg-yellow-500/10' : 'bg-red-500/10'
            )}>
              <Building2 className={cn(
                "h-5 w-5",
                neighborhood.zone === 'blue' ? 'text-green-600' :
                neighborhood.zone === 'yellow' ? 'text-yellow-600' : 'text-red-600'
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{neighborhood.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getZoneColor(neighborhood.zone)}>
                  {getZoneLabel(neighborhood.zone)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(neighborhood.trend)}
                  <span className="capitalize">{neighborhood.trend}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{neighborhood.livabilityScore}</div>
            <div className="text-xs text-muted-foreground">Livability Score</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current AQI</p>
            <p className="text-xl font-semibold">{neighborhood.currentAqi}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">5-Year Avg Forecast</p>
            <p className="text-xl font-semibold">{Math.round(neighborhood.avgForecastAqi)}</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Livability</span>
            <span className="font-medium">{neighborhood.livabilityScore}%</span>
          </div>
          <Progress 
            value={neighborhood.livabilityScore} 
            className={cn(
              "h-2",
              neighborhood.zone === 'blue' ? '[&>div]:bg-green-500' :
              neighborhood.zone === 'yellow' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Best Year</p>
              <p className="text-sm font-medium">{neighborhood.bestYear.year} (AQI: {Math.round(neighborhood.bestYear.aqi)})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Worst Year</p>
              <p className="text-sm font-medium">{neighborhood.worstYear.year} (AQI: {Math.round(neighborhood.worstYear.aqi)})</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">{neighborhood.recommendation}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <span className="text-muted-foreground">Forecast Confidence</span>
          <span className="font-medium">{Math.round(neighborhood.confidence * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Neighborhoods() {
  const { stations, isLoading: stationsLoading } = useAQIData();
  const { forecast, isLoading: forecastLoading, generateForecast } = useAQIForecast();
  const [hasGenerated, setHasGenerated] = useState(false);
  
  useEffect(() => {
    if (stations.length > 0 && !hasGenerated && !forecast) {
      generateForecast(stations);
      setHasGenerated(true);
    }
  }, [stations, hasGenerated, forecast, generateForecast]);
  
  const rankedNeighborhoods = useMemo((): RankedNeighborhood[] => {
    if (!forecast?.forecasts || stations.length === 0) return [];
    
    const neighborhoods = forecast.forecasts.map((f: StationForecast) => {
      const station = stations.find(s => s.id === f.stationId);
      const currentAqi = station?.aqi || 0;
      
      const avgForecastAqi = f.yearlyPredictions.reduce((sum, p) => sum + p.avgAqi, 0) / f.yearlyPredictions.length;
      const avgConfidence = f.yearlyPredictions.reduce((sum, p) => sum + p.confidence, 0) / f.yearlyPredictions.length;
      
      const sortedByAqi = [...f.yearlyPredictions].sort((a, b) => a.avgAqi - b.avgAqi);
      const bestYear = { year: sortedByAqi[0].year, aqi: sortedByAqi[0].avgAqi };
      const worstYear = { year: sortedByAqi[sortedByAqi.length - 1].year, aqi: sortedByAqi[sortedByAqi.length - 1].avgAqi };
      
      return {
        stationId: f.stationId,
        name: f.stationName,
        currentAqi,
        avgForecastAqi,
        trend: f.trend,
        livabilityScore: getLivabilityScore(avgForecastAqi, f.trend),
        recommendation: f.recommendation,
        zone: getZoneFromAqi(avgForecastAqi),
        bestYear,
        worstYear,
        confidence: avgConfidence,
        rank: 0
      };
    });
    
    // Sort by livability score (highest first)
    neighborhoods.sort((a, b) => b.livabilityScore - a.livabilityScore);
    
    // Assign ranks
    return neighborhoods.map((n, i) => ({ ...n, rank: i + 1 }));
  }, [forecast, stations]);
  
  const topPicks = rankedNeighborhoods.slice(0, 5);
  const avoidList = rankedNeighborhoods.filter(n => n.zone === 'red').slice(0, 5);
  const improving = rankedNeighborhoods.filter(n => n.trend === 'improving');
  
  const isLoading = stationsLoading || forecastLoading;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                Neighborhood Recommendations
              </h1>
              <p className="text-muted-foreground mt-2">
                Find the best areas in Delhi for long-term living based on 5-year AQI forecasts
              </p>
            </div>
            <Button 
              onClick={() => {
                setHasGenerated(false);
                generateForecast(stations);
                setHasGenerated(true);
              }}
              disabled={isLoading || stations.length === 0}
              variant="outline"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh Data
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Analyzing neighborhood data...</p>
            <p className="text-sm text-muted-foreground">Generating 5-year forecasts for all areas</p>
          </div>
        ) : rankedNeighborhoods.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Forecast Data Available</h3>
            <p className="text-muted-foreground mb-4">
              We need to generate forecasts to rank neighborhoods.
            </p>
            <Button onClick={() => generateForecast(stations)}>
              Generate Forecasts
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="rankings" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="rankings" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                Top Picks
              </TabsTrigger>
              <TabsTrigger value="avoid" className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4" />
                Avoid
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="rankings" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rankedNeighborhoods.map((neighborhood, index) => (
                  <NeighborhoodCard key={neighborhood.stationId} neighborhood={neighborhood} index={index} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recommended" className="space-y-6">
              <Card className="p-6 bg-green-500/5 border-green-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="h-6 w-6 text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold">Best Areas for Living</h2>
                    <p className="text-sm text-muted-foreground">
                      These neighborhoods have the best air quality outlook for the next 5 years
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topPicks.map((neighborhood, index) => (
                  <NeighborhoodCard key={neighborhood.stationId} neighborhood={neighborhood} index={index} />
                ))}
              </div>
              
              {improving.length > 0 && (
                <>
                  <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      <div>
                        <h2 className="text-xl font-semibold">Improving Areas</h2>
                        <p className="text-sm text-muted-foreground">
                          These areas show a positive trend in air quality improvement
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {improving.slice(0, 6).map((neighborhood, index) => (
                      <NeighborhoodCard key={neighborhood.stationId} neighborhood={neighborhood} index={topPicks.length + index} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="avoid" className="space-y-6">
              <Card className="p-6 bg-red-500/5 border-red-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <h2 className="text-xl font-semibold">Areas to Avoid</h2>
                    <p className="text-sm text-muted-foreground">
                      These neighborhoods have consistently poor air quality forecasts
                    </p>
                  </div>
                </div>
              </Card>
              
              {avoidList.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {avoidList.map((neighborhood, index) => (
                    <NeighborhoodCard key={neighborhood.stationId} neighborhood={neighborhood} index={rankedNeighborhoods.length - avoidList.length + index} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Good News!</h3>
                  <p className="text-muted-foreground">
                    No areas are currently classified as "Not Recommended" based on forecast data.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}