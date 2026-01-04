import { Popup } from 'react-leaflet';
import { StationData } from '@/types/aqi';
import { getZone, getZoneInfo } from '@/lib/aqi-utils';

interface AreaInfoPopupProps {
  station: StationData;
  distance: number;
  estimatedAQI: number;
  position: [number, number];
  onClose: () => void;
}

function getLivabilityColor(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue':
      return '#22c55e';
    case 'yellow':
      return '#eab308';
    case 'red':
      return '#ef4444';
  }
}

function getLivabilityLabel(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue':
      return 'Best for Living';
    case 'yellow':
      return 'Moderate - Caution Advised';
    case 'red':
      return 'Poor - Not Recommended';
  }
}

export function AreaInfoPopup({
  station,
  distance,
  estimatedAQI,
  position,
  onClose,
}: AreaInfoPopupProps) {
  const zone = getZone(estimatedAQI);
  const zoneInfo = getZoneInfo(zone);
  const color = getLivabilityColor(zone);

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-foreground">Area Analysis</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nearest Station:</span>
          <span className="font-medium text-foreground">{station.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Distance:</span>
          <span className="font-medium text-foreground">{distance.toFixed(2)} km</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Station AQI:</span>
          <span className="font-medium text-foreground">{station.aqi}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated AQI:</span>
          <span className="font-medium text-foreground">{Math.round(estimatedAQI)}</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold" style={{ color }}>
              {getLivabilityLabel(zone)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {zoneInfo.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
