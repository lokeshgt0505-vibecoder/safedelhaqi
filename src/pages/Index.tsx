import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { AQIMap } from '@/components/AQIMap';
import { StationCard } from '@/components/StationCard';
import { StationSearch } from '@/components/StationSearch';
import { HealthAdvisoryPanel } from '@/components/HealthAdvisoryPanel';
import { ZoneLegend } from '@/components/ZoneLegend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAQIData } from '@/hooks/useAQIData';
import { useAlertSubscriptions } from '@/hooks/useAlertSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { StationData } from '@/types/aqi';
import { RefreshCw, Map, LayoutGrid, Clock, Key, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Index = () => {
  const [mapboxToken, setMapboxToken] = useState(() => 
    localStorage.getItem('mapbox_token') || ''
  );
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [zoneFilter, setZoneFilter] = useState<'blue' | 'yellow' | 'red' | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');

  const { isAuthenticated } = useAuth();
  const { stations, isLoading, lastUpdated, refresh } = useAQIData({
    token: undefined, // Using mock data for now
  });
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

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
      toast.success('Mapbox token saved');
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Delhi Air Quality Index
              </h1>
              <p className="text-muted-foreground">
                Real-time AQI monitoring and zone classification for residential planning
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
                />
                Refresh
              </Button>
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-card to-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wind className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{averageAQI}</p>
                    <p className="text-xs text-muted-foreground">Avg. AQI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zone-blue-bg to-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zone-blue/10">
                    <div className="w-5 h-5 rounded-full bg-zone-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-zone-blue">
                      {zoneCounts.blue}
                    </p>
                    <p className="text-xs text-muted-foreground">Blue Zones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zone-yellow-bg to-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zone-yellow/10">
                    <div className="w-5 h-5 rounded-full bg-zone-yellow" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-zone-yellow">
                      {zoneCounts.yellow}
                    </p>
                    <p className="text-xs text-muted-foreground">Yellow Zones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zone-red-bg to-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zone-red/10">
                    <div className="w-5 h-5 rounded-full bg-zone-red" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-zone-red">
                      {zoneCounts.red}
                    </p>
                    <p className="text-xs text-muted-foreground">Red Zones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <StationSearch
              stations={stations}
              onSelect={setSelectedStation}
              onAddCustomLocation={(coords) => {
                toast.info(`Custom location added: ${coords.name}`);
              }}
            />
            <div className="flex items-center gap-4">
              <ZoneLegend
                onZoneFilter={setZoneFilter}
                activeZone={zoneFilter}
                counts={zoneCounts}
              />
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mapbox Token Input */}
        {showTokenInput && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-4 w-4" />
                Enter Mapbox Token for Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoieW91ci10b2tlbi1oZXJlIi4uLg=="
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveToken}>Save Token</Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTokenInput(false)}
                >
                  Skip
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Get a free token at{' '}
                <a
                  href="https://mapbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
                . The map will work without it using card view.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map / Cards View */}
          <div className="lg:col-span-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'map' | 'cards')}>
              <TabsContent value="map" className="mt-0">
                <Card className="overflow-hidden">
                  <div className="h-[500px]">
                    <AQIMap
                      stations={filteredStations}
                      selectedStation={selectedStation}
                      onStationClick={setSelectedStation}
                      mapboxToken={mapboxToken}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="cards" className="mt-0">
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredStations.map((station, index) => (
                    <div
                      key={station.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <StationCard
                        station={station}
                        isSubscribed={subscribedStationIds.has(station.id)}
                        onSubscribe={handleSubscribe}
                        onUnsubscribe={handleUnsubscribe}
                        onClick={() => setSelectedStation(station)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Station Details */}
            {selectedStation && (
              <div className="animate-slide-in-right">
                <StationCard
                  station={selectedStation}
                  isSubscribed={subscribedStationIds.has(selectedStation.id)}
                  onSubscribe={handleSubscribe}
                  onUnsubscribe={handleUnsubscribe}
                />
              </div>
            )}

            {/* Health Advisory */}
            <HealthAdvisoryPanel
              aqi={selectedStation?.aqi || averageAQI}
              stationName={selectedStation?.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
