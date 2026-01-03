import { getZoneInfo } from '@/lib/aqi-utils';
import { cn } from '@/lib/utils';

interface ZoneLegendProps {
  onZoneFilter?: (zone: 'blue' | 'yellow' | 'red' | null) => void;
  activeZone?: 'blue' | 'yellow' | 'red' | null;
  counts?: { blue: number; yellow: number; red: number };
}

export function ZoneLegend({ onZoneFilter, activeZone, counts }: ZoneLegendProps) {
  const zones: Array<'blue' | 'yellow' | 'red'> = ['blue', 'yellow', 'red'];

  return (
    <div className="flex flex-wrap gap-2">
      {onZoneFilter && (
        <button
          onClick={() => onZoneFilter(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            activeZone === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All
          {counts && (
            <span className="ml-1 text-xs opacity-70">
              ({counts.blue + counts.yellow + counts.red})
            </span>
          )}
        </button>
      )}
      {zones.map((zone) => {
        const info = getZoneInfo(zone);
        const zoneColors = {
          blue: 'bg-zone-blue text-white',
          yellow: 'bg-zone-yellow text-foreground',
          red: 'bg-zone-red text-white',
        };
        const inactiveColors = {
          blue: 'bg-zone-blue-bg text-zone-blue border border-zone-blue/30',
          yellow: 'bg-zone-yellow-bg text-zone-yellow border border-zone-yellow/30',
          red: 'bg-zone-red-bg text-zone-red border border-zone-red/30',
        };

        return (
          <button
            key={zone}
            onClick={() => onZoneFilter?.(activeZone === zone ? null : zone)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              activeZone === zone ? zoneColors[zone] : inactiveColors[zone],
              onZoneFilter && 'cursor-pointer hover:opacity-90'
            )}
          >
            {info.label}
            {counts && (
              <span className="ml-1 text-xs opacity-70">
                ({counts[zone]})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
