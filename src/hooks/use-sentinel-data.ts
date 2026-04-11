import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SentinelPollutantData {
  pollutant: 'NO2' | 'SO2' | 'CO' | 'O3' | 'AER_AI';
  label: string;
  unit: string;
  gridPoints: SentinelGridPoint[];
  source: 'live' | 'simulated';
  meanValue?: number;
  timestamp?: string;
}

export interface SentinelGridPoint {
  lat: number;
  lng: number;
  value: number;
  color: string;
}

const POLLUTANT_CONFIG: Record<string, { label: string; unit: string; colorScale: (v: number) => string }> = {
  NO2: {
    label: 'Nitrogen Dioxide',
    unit: 'mol/m²',
    colorScale: (v) => v > 150e-6 ? '#dc2626' : v > 100e-6 ? '#f59e0b' : v > 50e-6 ? '#eab308' : '#22c55e',
  },
  SO2: {
    label: 'Sulfur Dioxide',
    unit: 'mol/m²',
    colorScale: (v) => v > 60e-6 ? '#dc2626' : v > 40e-6 ? '#f59e0b' : v > 20e-6 ? '#eab308' : '#22c55e',
  },
  CO: {
    label: 'Carbon Monoxide',
    unit: 'mol/m²',
    colorScale: (v) => v > 0.05 ? '#dc2626' : v > 0.035 ? '#f59e0b' : v > 0.02 ? '#eab308' : '#22c55e',
  },
  O3: {
    label: 'Ozone',
    unit: 'mol/m²',
    colorScale: (v) => v > 160e-6 ? '#dc2626' : v > 120e-6 ? '#f59e0b' : v > 80e-6 ? '#eab308' : '#22c55e',
  },
  AER_AI: {
    label: 'Aerosol Index',
    unit: 'index',
    colorScale: (v) => v > 2.5 ? '#dc2626' : v > 1.5 ? '#f59e0b' : v > 0.8 ? '#eab308' : '#22c55e',
  },
};

function colorizePoints(points: Array<{ lat: number; lng: number; value: number }>, pollutant: string): SentinelGridPoint[] {
  const config = POLLUTANT_CONFIG[pollutant];
  if (!config) return [];
  return points.map((p) => ({
    ...p,
    color: config.colorScale(p.value),
  }));
}

// Fallback: generate simulated data when API is unavailable
function generateSimulatedGrid(pollutant: string): SentinelGridPoint[] {
  const bounds = { lat1: 28.4, lng1: 76.8, lat2: 29.0, lng2: 77.5 };
  const step = 0.05;
  const points: SentinelGridPoint[] = [];
  const config = POLLUTANT_CONFIG[pollutant];
  if (!config) return [];

  for (let lat = bounds.lat1; lat <= bounds.lat2; lat += step) {
    for (let lng = bounds.lng1; lng <= bounds.lng2; lng += step) {
      const distFromCenter = Math.sqrt(Math.pow(lat - 28.6139, 2) + Math.pow(lng - 77.209, 2));
      const urbanFactor = Math.max(0, 1 - distFromCenter * 3);
      const noise = (Math.random() - 0.5) * 0.3;

      let value: number;
      switch (pollutant) {
        case 'NO2': value = (80 + urbanFactor * 120 + noise * 40) * 1e-6; break;
        case 'SO2': value = (20 + urbanFactor * 60 + noise * 15) * 1e-6; break;
        case 'CO': value = 0.02 + urbanFactor * 0.04 + noise * 0.01; break;
        case 'O3': value = (100 + (1 - urbanFactor) * 80 + noise * 30) * 1e-6; break;
        case 'AER_AI': value = 0.5 + urbanFactor * 2.5 + noise * 0.5; break;
        default: value = 0;
      }

      points.push({ lat, lng, value: Math.max(0, value), color: config.colorScale(Math.max(0, value)) });
    }
  }
  return points;
}

async function fetchLiveData(pollutant: string): Promise<{ gridPoints: SentinelGridPoint[]; meanValue: number; timestamp: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-sentinel', {
      body: { action: 'getGridData', pollutant },
    });

    if (error) {
      console.warn('Sentinel edge function error:', error);
      return null;
    }

    if (!data?.success || !data?.data?.gridPoints) {
      console.warn('Sentinel API returned no data:', data?.error);
      return null;
    }

    const colorized = colorizePoints(data.data.gridPoints, pollutant);
    return {
      gridPoints: colorized,
      meanValue: data.data.meanValue,
      timestamp: data.data.timestamp,
    };
  } catch (err) {
    console.warn('Failed to call fetch-sentinel:', err);
    return null;
  }
}

export function useSentinelData() {
  const [data, setData] = useState<SentinelPollutantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePollutant, setActivePollutant] = useState<string>('NO2');
  const [isLive, setIsLive] = useState(false);

  const fetchSentinelData = useCallback(async () => {
    setIsLoading(true);
    try {
      const pollutants = ['NO2', 'SO2', 'CO', 'O3', 'AER_AI'] as const;

      // Try live API for the active pollutant first to check connectivity
      const liveResult = await fetchLiveData(activePollutant);
      const apiAvailable = !!liveResult;

      const results: SentinelPollutantData[] = [];

      for (const p of pollutants) {
        const config = POLLUTANT_CONFIG[p];
        if (apiAvailable) {
          // For the already-fetched pollutant, use cached result
          if (p === activePollutant && liveResult) {
            results.push({
              pollutant: p,
              label: config.label,
              unit: config.unit,
              gridPoints: liveResult.gridPoints,
              source: 'live',
              meanValue: liveResult.meanValue,
              timestamp: liveResult.timestamp,
            });
          } else {
            // Fetch other pollutants from live API
            const live = await fetchLiveData(p);
            if (live) {
              results.push({
                pollutant: p,
                label: config.label,
                unit: config.unit,
                gridPoints: live.gridPoints,
                source: 'live',
                meanValue: live.meanValue,
                timestamp: live.timestamp,
              });
            } else {
              // Fallback for this specific pollutant
              results.push({
                pollutant: p,
                label: config.label,
                unit: config.unit,
                gridPoints: generateSimulatedGrid(p),
                source: 'simulated',
              });
            }
          }
        } else {
          // No API - use simulation for all
          results.push({
            pollutant: p,
            label: config.label,
            unit: config.unit,
            gridPoints: generateSimulatedGrid(p),
            source: 'simulated',
          });
        }
      }

      setData(results);
      setIsLive(apiAvailable);

      if (apiAvailable) {
        toast.success('Live Sentinel-5P satellite data loaded');
      } else {
        toast.info('Using simulated Sentinel-5P data (API credentials not configured)');
      }
    } catch (err) {
      console.error('Failed to fetch Sentinel-5P data:', err);
      // Fall back to simulation
      const pollutants = ['NO2', 'SO2', 'CO', 'O3', 'AER_AI'] as const;
      const fallback: SentinelPollutantData[] = pollutants.map((p) => ({
        pollutant: p,
        label: POLLUTANT_CONFIG[p].label,
        unit: POLLUTANT_CONFIG[p].unit,
        gridPoints: generateSimulatedGrid(p),
        source: 'simulated' as const,
      }));
      setData(fallback);
      setIsLive(false);
      toast.error('Failed to load satellite data, using simulated values');
    } finally {
      setIsLoading(false);
    }
  }, [activePollutant]);

  const activeData = data.find((d) => d.pollutant === activePollutant) ?? null;

  return {
    data,
    activeData,
    activePollutant,
    setActivePollutant,
    isLoading,
    isLive,
    fetchSentinelData,
  };
}
