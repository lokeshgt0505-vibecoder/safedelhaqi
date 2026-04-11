import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SentinelControlsProps {
  visible: boolean;
  activePollutant: string;
  onPollutantChange: (p: string) => void;
  isLoading: boolean;
  hasData: boolean;
  isLive: boolean;
  onFetch: () => void;
}

const POLLUTANTS = [
  { value: 'NO2', label: 'NO₂' },
  { value: 'SO2', label: 'SO₂' },
  { value: 'CO', label: 'CO' },
  { value: 'O3', label: 'O₃' },
  { value: 'AER_AI', label: 'Aerosol Index' },
];

export function SentinelControls({
  visible,
  activePollutant,
  onPollutantChange,
  isLoading,
  hasData,
  isLive,
  onFetch,
}: SentinelControlsProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground">🛰️ Sentinel-5P</p>
        {hasData && (
          <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isLive ? 'bg-aqi-good/20 text-aqi-good' : 'bg-muted text-muted-foreground'
          }`}>
            {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
            {isLive ? 'Live' : 'Sim'}
          </span>
        )}
      </div>

      {!hasData ? (
        <Button size="sm" variant="default" className="w-full" onClick={onFetch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          Load Satellite Data
        </Button>
      ) : (
        <Select value={activePollutant} onValueChange={onPollutantChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POLLUTANTS.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-xs">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
