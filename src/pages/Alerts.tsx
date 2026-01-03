import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useAlertSubscriptions } from '@/hooks/useAlertSubscriptions';
import { Bell, BellOff, Trash2, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { getAQIInfo } from '@/lib/aqi-utils';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscriptions, isLoading, updateSubscription, deleteSubscription } = useAlertSubscriptions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState<number>(150);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleToggleActive = (id: string, currentState: boolean) => {
    updateSubscription(id, { is_active: !currentState });
  };

  const handleUpdateThreshold = (id: string) => {
    updateSubscription(id, { aqi_threshold: editThreshold });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteSubscription(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              My Alert Subscriptions
            </h1>
            <p className="text-muted-foreground">
              Get notified when air quality exceeds your threshold at selected stations.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  No Alert Subscriptions
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Go to the dashboard and click "Get Alerts" on any station card to start receiving notifications.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/">Browse Stations</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const aqiInfo = getAQIInfo(subscription.aqi_threshold);
                const isEditing = editingId === subscription.id;

                return (
                  <Card
                    key={subscription.id}
                    className={cn(
                      'transition-all',
                      !subscription.is_active && 'opacity-60'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg',
                              subscription.is_active
                                ? 'bg-primary/10'
                                : 'bg-muted'
                            )}
                          >
                            {subscription.is_active ? (
                              <Bell className="h-5 w-5 text-primary" />
                            ) : (
                              <BellOff className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="font-display text-base flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {subscription.station_name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Alert when AQI exceeds{' '}
                              <Badge
                                variant="outline"
                                className={cn('ml-1', aqiInfo.bgColor, 'text-white border-0')}
                              >
                                {subscription.aqi_threshold}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={subscription.is_active}
                          onCheckedChange={() =>
                            handleToggleActive(subscription.id, subscription.is_active)
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>AQI Threshold: {editThreshold}</Label>
                            <Slider
                              value={[editThreshold]}
                              onValueChange={(v) => setEditThreshold(v[0])}
                              min={50}
                              max={400}
                              step={10}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Good (50)</span>
                              <span>Hazardous (400)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateThreshold(subscription.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditThreshold(subscription.aqi_threshold);
                              setEditingId(subscription.id);
                            }}
                          >
                            Edit Threshold
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(subscription.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">About Email Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Email alerts are sent when the AQI at your subscribed stations exceeds your
                    threshold. Alerts are rate-limited to avoid spam - you'll receive at most one
                    alert per station per hour.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
