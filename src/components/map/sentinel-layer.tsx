import { useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { SentinelPollutantData } from '@/hooks/use-sentinel-data';

interface SentinelLayerProps {
  data: SentinelPollutantData | null;
  visible: boolean;
}

export function SentinelLayer({ data, visible }: SentinelLayerProps) {
  const points = useMemo(() => {
    if (!visible || !data) return [];
    return data.gridPoints;
  }, [visible, data]);

  if (!visible || points.length === 0) return null;

  return (
    <>
      {points.map((point, i) => (
        <CircleMarker
          key={`sentinel-${data!.pollutant}-${i}`}
          center={[point.lat, point.lng]}
          radius={8}
          pathOptions={{
            fillColor: point.color,
            fillOpacity: 0.45,
            color: point.color,
            weight: 0,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <div className="text-xs">
              <strong>{data!.label}</strong>
              <br />
              Value: {data!.pollutant === 'AER_AI' ? point.value.toFixed(2) : (point.value * 1e6).toFixed(1)} {data!.unit === 'mol/m²' ? 'µmol/m²' : data!.unit}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
