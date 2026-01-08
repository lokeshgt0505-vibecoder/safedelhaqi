import { LIVABILITY_COLORS, LivabilityClass } from '@/types/livability';
import { useLivabilityData } from '@/hooks/useLivabilityData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LivabilityLegendProps {
  visible: boolean;
}

export function LivabilityLegend({ visible }: LivabilityLegendProps) {
  const { cityStats } = useLivabilityData();

  if (!visible) return null;

  const TrendIcon = () => {
    switch (cityStats.overallTrend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const classes: LivabilityClass[] = ['highly-livable', 'moderately-livable', 'low-livability'];
  const counts = [
    cityStats.highlyLivableCount,
    cityStats.moderatelyLivableCount,
    cityStats.lowLivabilityCount,
  ];

  return (
    <div className="absolute bottom-24 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-3 max-w-[220px]">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
        Livability Index
        <TrendIcon />
      </h3>

      <div className="space-y-1.5">
        {classes.map((cls, idx) => (
          <div key={cls} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: LIVABILITY_COLORS[cls].fill }}
              />
              <span>{LIVABILITY_COLORS[cls].label}</span>
            </div>
            <span className="font-medium">{counts[idx]}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-border">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">City Score</span>
          <span className="font-bold">{cityStats.avgLivabilityScore}/100</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Forecast AQI</p>
        <div className="grid grid-cols-5 gap-1 text-center">
          {Object.entries(cityStats.avgFutureAqi).slice(0, 5).map(([year, aqi]) => (
            <div key={year}>
              <p className="text-[10px] text-muted-foreground">{year.slice(2)}</p>
              <p className="font-medium">{aqi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
