import { useState, useMemo, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { Header } from '@/components/header';
import { AQIMap } from '@/components/aqi-map';
import { StationCard } from '@/components/station-card';
import { StationSearch } from '@/components/station-search';
import { ZoneLegend } from '@/components/zone-legend';
import { ForecastPanel } from '@/components/forecast/forecast-panel';
import { ComparisonView } from '@/components/forecast/comparison-view';
import { SeasonalAnalysisPanel } from '@/components/seasonal/seasonal-analysis-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAQIData } from '@/hooks/use-aqi-data';
import { useAQIForecast } from '@/hooks/use-aqi-forecast';
import { useSeasonalAnalysis } from '@/hooks/use-seasonal-analysis';
import { useAlertSubscriptions } from '@/hooks/use-alert-subscriptions';
import { useAuth } from '@/hooks/use-auth';
import { StationData } from '@/types/aqi';
import { RefreshCw, Clock, Wind, Wifi, WifiOff, TrendingUp, Loader2, PanelRightOpen, GitCompare, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Index = () => {
  const topChromeRef = useRef<HTMLDivElement>(null);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [zoneFilter, setZoneFilter] = useState<'blue' | 'yellow' | 'red' | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showSeasonalAnalysis, setShowSeasonalAnalysis] = useState(false);
  const [forecastYear, setForecastYear] = useState<number>(new Date().getFullYear() + 1);


  const { isAuthenticated } = useAuth();
  const { stations, isLoading, lastUpdated, refresh, isUsingLiveData } = useAQIData();
  const { forecast, isLoading: isForecastLoading, generateForecast, clearForecast } = useAQIForecast();
  const { analysis: seasonalAnalysis, isLoading: isSeasonalLoading, analyzeSeasonalPatterns } = useSeasonalAnalysis();
  const { subscriptions, addSubscription, deleteSubscription } = useAlertSubscriptions();

  const subscribedStationIds = useMemo(
    () => new Set(subscriptions.map((s) => s.station_id)),
    [subscriptions]
  );

  const filteredStations = useMemo(() => {
    if (!zoneFilter) return stations;
    return stations.filter((s) => s.zone === zoneFilter);
  }, [stations, zoneFilter]);

  const zoneCounts = useMemo(() => {
    return {
      blue: stations.filter((s) => s.zone === 'blue').length,
      yellow: stations.filter((s) => s.zone === 'yellow').length,
      red: stations.filter((s) => s.zone === 'red').length,
    };
  }, [stations]);

  const averageAQI = useMemo(() => {
    if (stations.length === 0) return 0;
    return Math.round(
      stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length
    );
  }, [stations]);

  const forecastYears = useMemo(() => {
    if (!forecast) return [];
    return forecast.forecasts[0]?.yearlyPredictions.map((p) => p.year) || [];
  }, [forecast]);

  const handleSubscribe = async (stationId: string, stationName: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe to alerts');
      return;
    }
    await addSubscription(stationId, stationName);
  };

  const handleUnsubscribe = async (stationId: string) => {
    const subscription = subscriptions.find((s) => s.station_id === stationId);
    if (subscription) {
      await deleteSubscription(subscription.id);
    }
  };

  const handleGenerateForecast = async () => {
    if (stations.length === 0) {
      toast.error('No station data available');
      return;
    }
    await generateForecast(stations);
    setShowForecast(true);
  };

  const handleCloseForecast = () => {
    setShowForecast(false);
  };

  const handleSeasonalAnalysis = async () => {
    if (stations.length === 0) {
      toast.error('No station data available');
      return;
    }
    await analyzeSeasonalPatterns(stations);
    setShowSeasonalAnalysis(true);
  };

  // Close selected station card
  const handleCloseStation = useCallback(() => {
    setSelectedStation(null);
  }, []);

  // Handle ESC key to close all modals/popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close in order of z-index priority
        if (showSeasonalAnalysis) {
          setShowSeasonalAnalysis(false);
        } else if (showComparison) {
          setShowComparison(false);
        } else if (showForecast) {
          setShowForecast(false);
        } else if (selectedStation) {
          setSelectedStation(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSeasonalAnalysis, showComparison, showForecast, selectedStation]);

  // Expose top chrome (header + control bar) height to fixed overlays (e.g., right sidebar)
  useLayoutEffect(() => {
    const el = topChromeRef.current;
    if (!el) return;

    const setOffset = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--app-top-offset', `${Math.round(height)}px`);
    };

    setOffset();
    const ro = new ResizeObserver(() => setOffset());
    ro.observe(el);
    window.addEventListener('resize', setOffset);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setOffset);
    };
  }, []);

  // Handle click outside station card to close it
  const handleMapClick = useCallback(() => {
    // This is handled by clicking on the map - deselect station
    // Note: The map component handles its own click events
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div ref={topChromeRef}>
        <Header />

        {/* Top Control Bar */}
        <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left side - Stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <Wind className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Avg AQI:</span>
                <span className="text-lg font-bold font-display">{averageAQI}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zone-blue/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-zone-blue" />
                  <span className="text-xs font-medium">{zoneCounts.blue}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zone-yellow/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-zone-yellow" />
                  <span className="text-xs font-medium">{zoneCounts.yellow}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zone-red/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-zone-red" />
                  <span className="text-xs font-medium">{zoneCounts.red}</span>
                </div>
              </div>

              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                isUsingLiveData 
                  ? "bg-aqi-good/20 text-aqi-good" 
                  : "bg-muted text-muted-foreground"
              )}>
                {isUsingLiveData ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Demo
                  </>
                )}
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <StationSearch
                stations={stations}
                onSelect={setSelectedStation}
                onAddCustomLocation={(coords) => {
                  toast.info(`Custom location added: ${coords.name}`);
                }}
              />
              
              <ZoneLegend
                onZoneFilter={setZoneFilter}
                activeZone={zoneFilter}
                counts={zoneCounts}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateForecast}
                disabled={isForecastLoading || stations.length === 0}
              >
                {isForecastLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                5-Year Forecast
              </Button>

              {forecast && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleSeasonalAnalysis}
                disabled={isSeasonalLoading || stations.length === 0}
              >
                {isSeasonalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Seasonal
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Full Screen Map */}
      <div className="flex-1 relative">
        <AQIMap
          stations={filteredStations}
          selectedStation={selectedStation}
          onStationClick={setSelectedStation}
          forecast={forecast}
          forecastYear={forecastYear}
          onForecastYearChange={setForecastYear}
        />

        {/* Station Details Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-[1000] shadow-lg"
            >
              <PanelRightOpen className="h-4 w-4 mr-2" />
              Stations
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-lg font-semibold">AQI Stations</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredStations.length} stations
                </p>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {filteredStations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSubscribed={subscribedStationIds.has(station.id)}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                    onClick={() => setSelectedStation(station)}
                  />
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Selected Station Card - with close button */}
        {selectedStation && (
          <div className="absolute top-4 left-4 z-[1000] w-80 animate-slide-in-right">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border shadow-md z-10 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseStation();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
              <StationCard
                station={selectedStation}
                isSubscribed={subscribedStationIds.has(selectedStation.id)}
                onSubscribe={handleSubscribe}
                onUnsubscribe={handleUnsubscribe}
              />
            </div>
          </div>
        )}
      </div>

      {/* Forecast Panel */}
      {showForecast && forecast && (
        <ForecastPanel forecast={forecast} onClose={handleCloseForecast} />
      )}

      {/* Comparison View */}
      {showComparison && forecast && (
        <ComparisonView
          stations={stations}
          forecast={forecast}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Seasonal Analysis Panel */}
      {showSeasonalAnalysis && seasonalAnalysis && (
        <SeasonalAnalysisPanel
          analysis={seasonalAnalysis}
          onClose={() => setShowSeasonalAnalysis(false)}
        />
      )}
    </div>
  );
};

export default Index;
