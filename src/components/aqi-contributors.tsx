import { Car, Factory, Users, TreePine, Cloud, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AQIContributor, getAQIContributors, getAQISummary } from '@/lib/aqi-contributors';
import { cn } from '@/lib/utils';

interface AQIContributorsProps {
  stationId: string;
  aqi: number;
  trend?: 'improving' | 'stable' | 'declining';
  className?: string;
}

const iconMap = {
  traffic: Car,
  industry: Factory,
  population: Users,
  greenery: TreePine,
  weather: Cloud,
  trend: TrendingUp,
};

const impactColors = {
  high: 'text-red-500 dark:text-red-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-green-600 dark:text-green-400',
};

const impactBgColors = {
  high: 'bg-red-500/10',
  medium: 'bg-yellow-500/10',
  low: 'bg-green-500/10',
};

function ContributorIcon({ icon, trend }: { icon: AQIContributor['icon']; trend?: string }) {
  if (icon === 'trend') {
    if (trend === 'improving') return <TrendingDown className="h-3.5 w-3.5" />;
    if (trend === 'declining') return <TrendingUp className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  }
  const Icon = iconMap[icon];
  return <Icon className="h-3.5 w-3.5" />;
}

export function AQIContributors({ stationId, aqi, trend, className }: AQIContributorsProps) {
  const contributors = getAQIContributors(stationId, aqi, trend);
  const summary = getAQISummary(aqi);

  if (aqi <= 50) {
    // For excellent AQI, show a simpler positive message
    return (
      <div className={cn('space-y-2', className)}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Why AQI is Low
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">
          {summary}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {aqi > 150 ? 'Why AQI is High' : 'Contributing Factors'}
      </p>
      
      <div className="space-y-1.5">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.factor}
            className={cn(
              'flex items-start gap-2 p-1.5 rounded text-xs',
              impactBgColors[contributor.impact]
            )}
          >
            <div className={cn('mt-0.5 flex-shrink-0', impactColors[contributor.impact])}>
              <ContributorIcon icon={contributor.icon} trend={trend} />
            </div>
            <span className="text-foreground/90 leading-tight">
              {contributor.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
