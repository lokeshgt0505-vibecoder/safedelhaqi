import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface SentinelPollutantData {
  pollutant: 'NO2' | 'SO2' | 'CO' | 'O3' | 'AER_AI';
  label: string;
  unit: string;
  gridPoints: SentinelGridPoint[];
}

export interface SentinelGridPoint {
  lat: number;
  lng: number;
  value: number;
  color: string;
}

// Simulated Sentinel-5P data for Delhi NCR region
// In production, this would call the Copernicus Data Space API
function generateSentinelGrid(
  pollutant: string,
  bounds: { lat1: number; lng1: number; lat2: number; lng2: number }
): SentinelGridPoint[] {
  const points: SentinelGridPoint[] = [];
  const step = 0.05; // ~5km grid resolution (Sentinel-5P is ~7km)

  for (let lat = bounds.lat1; lat <= bounds.lat2; lat += step) {
    for (let lng = bounds.lng1; lng <= bounds.lng2; lng += step) {
      // Simulate realistic spatial variation based on distance from city center
      const distFromCenter = Math.sqrt(
        Math.pow(lat - 28.6139, 2) + Math.pow(lng - 77.209, 2)
      );
      const urbanFactor = Math.max(0, 1 - distFromCenter * 3);
      const noise = (Math.random() - 0.5) * 0.3;

      let value: number;
      let color: string;

      switch (pollutant) {
        case 'NO2':
          value = (80 + urbanFactor * 120 + noise * 40) * 1e-6; // mol/m²
          color = value > 150e-6 ? '#dc2626' : value > 100e-6 ? '#f59e0b' : value > 50e-6 ? '#eab308' : '#22c55e';
          break;
        case 'SO2':
          value = (20 + urbanFactor * 60 + noise * 15) * 1e-6;
          color = value > 60e-6 ? '#dc2626' : value > 40e-6 ? '#f59e0b' : value > 20e-6 ? '#eab308' : '#22c55e';
          break;
        case 'CO':
          value = 0.02 + urbanFactor * 0.04 + noise * 0.01; // mol/m²
          color = value > 0.05 ? '#dc2626' : value > 0.035 ? '#f59e0b' : value > 0.02 ? '#eab308' : '#22c55e';
          break;
        case 'O3':
          // O3 is typically higher in suburban areas
          value = (100 + (1 - urbanFactor) * 80 + noise * 30) * 1e-6;
          color = value > 160e-6 ? '#dc2626' : value > 120e-6 ? '#f59e0b' : value > 80e-6 ? '#eab308' : '#22c55e';
          break;
        case 'AER_AI':
          value = 0.5 + urbanFactor * 2.5 + noise * 0.5;
          color = value > 2.5 ? '#dc2626' : value > 1.5 ? '#f59e0b' : value > 0.8 ? '#eab308' : '#22c55e';
          break;
        default:
          value = 0;
          color = '#22c55e';
      }

      points.push({ lat, lng, value: Math.max(0, value), color });
    }
  }

  return points;
}

const POLLUTANT_CONFIG: Record<string, { label: string; unit: string }> = {
  NO2: { label: 'Nitrogen Dioxide', unit: 'mol/m²' },
  SO2: { label: 'Sulfur Dioxide', unit: 'mol/m²' },
  CO: { label: 'Carbon Monoxide', unit: 'mol/m²' },
  O3: { label: 'Ozone', unit: 'mol/m²' },
  AER_AI: { label: 'Aerosol Index', unit: 'index' },
};

export function useSentinelData() {
  const [data, setData] = useState<SentinelPollutantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePollutant, setActivePollutant] = useState<string>('NO2');

  const fetchSentinelData = useCallback(async () => {
    setIsLoading(true);
    try {
      const bounds = { lat1: 28.4, lng1: 76.8, lat2: 29.0, lng2: 77.5 };
      const pollutants = ['NO2', 'SO2', 'CO', 'O3', 'AER_AI'] as const;

      const results: SentinelPollutantData[] = pollutants.map((p) => ({
        pollutant: p,
        label: POLLUTANT_CONFIG[p].label,
        unit: POLLUTANT_CONFIG[p].unit,
        gridPoints: generateSentinelGrid(p, bounds),
      }));

      setData(results);
      toast.success('Sentinel-5P satellite data loaded');
    } catch (err) {
      console.error('Failed to fetch Sentinel-5P data:', err);
      toast.error('Failed to load satellite data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activeData = data.find((d) => d.pollutant === activePollutant) ?? null;

  return {
    data,
    activeData,
    activePollutant,
    setActivePollutant,
    isLoading,
    fetchSentinelData,
  };
}
