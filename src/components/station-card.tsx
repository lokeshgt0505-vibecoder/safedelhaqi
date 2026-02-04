import { StationData } from '@/types/aqi';
import { getAQIInfo, getZoneInfo } from '@/lib/aqi-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, MapPin, Wind, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AQIContributors } from '@/components/aqi-contributors';

interface StationCardProps {
  station: StationData;
  isSubscribed?: boolean;
  onSubscribe?: (stationId: string, stationName: string) => void;
  onUnsubscribe?: (stationId: string) => void;
  onClick?: () => void;
  compact?: boolean;
}

export function StationCard({
  station,
  isSubscribed = false,
  onSubscribe,
  onUnsubscribe,
  onClick,
  compact = false,
}: StationCardProps) {
  const aqiInfo = getAQIInfo(station.aqi);
  const zoneInfo = getZoneInfo(station.zone);

  const zoneStyles = {
    blue: 'border-zone-blue/30 bg-zone-blue-bg/50',
    yellow: 'border-zone-yellow/30 bg-zone-yellow-bg/50',
    red: 'border-zone-red/30 bg-zone-red-bg/50',
  };

  const zoneBadgeStyles = {
    blue: 'bg-zone-blue text-white',
    yellow: 'bg-zone-yellow text-foreground',
    red: 'bg-zone-red text-white',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-2',
        zoneStyles[station.zone],
        compact && 'p-2'
      )}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-transparent pointer-events-none" />

      <CardHeader className={cn('relative pb-2', compact && 'p-2')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-display font-semibold text-foreground truncate">
                {station.name}
              </h3>
            </div>
            <Badge className={cn('text-xs', zoneBadgeStyles[station.zone])}>
              {zoneInfo.label}
            </Badge>
          </div>

          {/* AQI Circle */}
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-full w-16 h-16 text-white shadow-lg',
              aqiInfo.bgColor
            )}
          >
            <span className="font-display text-2xl font-bold leading-none">
              {station.aqi}
            </span>
            <span className="text-[10px] opacity-90">AQI</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('relative pt-0', compact && 'p-2 pt-0')}>
        <p className="text-sm text-muted-foreground mb-3">
          {aqiInfo.label} - {aqiInfo.description}
        </p>

        {!compact && station.pollutants && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {station.pollutants.pm25 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Wind className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">PM2.5:</span>
                <span className="font-medium">{station.pollutants.pm25}</span>
              </div>
            )}
            {station.pollutants.pm10 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Droplets className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">PM10:</span>
                <span className="font-medium">{station.pollutants.pm10}</span>
              </div>
            )}
            {station.pollutants.no2 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">NO₂:</span>
                <span className="font-medium">{station.pollutants.no2}</span>
              </div>
            )}
          </div>
        )}

        {!compact && (
          <div className="border-t border-border pt-3 mt-3">
            <AQIContributors stationId={station.id} aqi={station.aqi} />
          </div>
        )}

        {(onSubscribe || onUnsubscribe) && (
          <Button
            variant={isSubscribed ? 'secondary' : 'outline'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (isSubscribed) {
                onUnsubscribe?.(station.id);
              } else {
                onSubscribe?.(station.id, station.name);
              }
            }}
          >
            {isSubscribed ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Get Alerts
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
