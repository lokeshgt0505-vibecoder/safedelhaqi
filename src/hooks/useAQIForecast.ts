import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StationData } from '@/types/aqi';
import { toast } from 'sonner';

export interface YearlyPrediction {
  year: number;
  avgAqi: number;
  bestMonth: { month: string; aqi: number };
  worstMonth: { month: string; aqi: number };
  zone: 'blue' | 'yellow' | 'red';
  livability: string;
  confidence: number;
}

export interface StationForecast {
  stationId: string;
  stationName: string;
  stationType: string;
  yearlyPredictions: YearlyPrediction[];
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
}

export interface CityOverview {
  avgAqiByYear: Record<string, number>;
  overallTrend: string;
  keyInsights: string[];
}

export interface ForecastData {
  forecasts: StationForecast[];
  cityOverview: CityOverview;
}

export function useAQIForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = useCallback(async (stations: StationData[]) => {
    if (stations.length === 0) {
      setError('No stations available for forecasting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('forecast-aqi', {
        body: {
          stations: stations.map(s => ({
            id: s.id,
            name: s.name,
            aqi: s.aqi,
            lat: s.lat,
            lng: s.lng,
            zone: s.zone
          })),
          currentYear: new Date().getFullYear()
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setForecast(data);
      toast.success('5-year AQI forecast generated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate forecast';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearForecast = useCallback(() => {
    setForecast(null);
    setError(null);
  }, []);

  return {
    forecast,
    isLoading,
    error,
    generateForecast,
    clearForecast
  };
}
