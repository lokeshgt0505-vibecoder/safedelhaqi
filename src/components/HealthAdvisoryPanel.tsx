import { getAQIInfo, getHealthAdvisory } from '@/lib/aqi-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  Sun,
  Home,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthAdvisoryPanelProps {
  aqi: number;
  stationName?: string;
}

export function HealthAdvisoryPanel({ aqi, stationName }: HealthAdvisoryPanelProps) {
  const aqiInfo = getAQIInfo(aqi);
  const advisory = getHealthAdvisory(aqi);

  const getIcon = () => {
    if (aqi <= 100) return <CheckCircle className="h-5 w-5 text-aqi-good" />;
    if (aqi <= 200) return <Info className="h-5 w-5 text-aqi-moderate" />;
    return <AlertTriangle className="h-5 w-5 text-aqi-very-poor" />;
  };

  const advisoryItems = [
    {
      icon: Heart,
      label: 'General',
      content: advisory.general,
    },
    {
      icon: Users,
      label: 'Sensitive Groups',
      content: advisory.sensitiveGroups,
    },
    {
      icon: Sun,
      label: 'Outdoor Activity',
      content: advisory.outdoor,
    },
    {
      icon: Home,
      label: 'Indoor',
      content: advisory.indoor,
    },
    {
      icon: Shield,
      label: 'Mask Recommendation',
      content: advisory.mask,
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="font-display text-lg">
              Health Advisory
            </CardTitle>
          </div>
          <Badge className={cn('font-medium', aqiInfo.bgColor, 'text-white')}>
            {aqiInfo.label}
          </Badge>
        </div>
        {stationName && (
          <p className="text-sm text-muted-foreground">
            Based on current AQI at {stationName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Implications */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm font-medium text-foreground mb-1">
            Health Implications
          </p>
          <p className="text-sm text-muted-foreground">
            {aqiInfo.healthImplications}
          </p>
        </div>

        {/* Advisory Items */}
        <div className="grid gap-3">
          {advisoryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className="p-2 rounded-md bg-muted">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cautionary Statement */}
        {aqiInfo.cautionaryStatement !== 'None' && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Caution
                </p>
                <p className="text-sm text-destructive/80 mt-0.5">
                  {aqiInfo.cautionaryStatement}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
