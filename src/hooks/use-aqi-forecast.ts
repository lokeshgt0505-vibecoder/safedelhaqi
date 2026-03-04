import { useState, useCallback } from 'react';
import { StationData } from '@/types/aqi';
import { ForecastData } from '@/types/forecast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateAllStationForecasts, getCityWideStats, SEASONAL_PATTERNS } from '@/lib/forecasting-engine';

// Re-export types from the canonical location
export type { YearlyPrediction, StationForecast, CityOverview, ForecastData } from '@/types/forecast';

// Helper to get zone from AQI
function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function getLivabilityLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useAQIForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = useCallback(async (stations: StationData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try AI-powered forecast first
      const stationPayload = stations.map(s => ({
        id: s.id,
        name: s.name,
        aqi: s.aqi,
        lat: s.lat,
        lng: s.lng,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('forecast-aqi', {
        body: { stations: stationPayload, forecastYears: 11 },
      });

      if (!fnError && data && data.forecasts) {
        setForecast(data as ForecastData);
        toast.success('AI-powered ML forecast generated (XGBoost pipeline)');
        return;
      }

      console.warn('AI forecast failed, falling back to local engine:', fnError?.message || 'No data');
      // Fallback to local deterministic engine
      const allForecasts = generateAllStationForecasts();
      const cityStats = getCityWideStats();

      const forecasts = allForecasts.map(stationForecast => {
        const yearlyPredictions = stationForecast.forecasts.map(fc => {
          const monthlyAqi = Object.entries(SEASONAL_PATTERNS).map(([month, factor]) => ({
            month: MONTH_NAMES[parseInt(month) - 1],
            aqi: Math.round(fc.predictedAqi * factor)
          }));
          const sortedMonths = [...monthlyAqi].sort((a, b) => a.aqi - b.aqi);
          return {
            year: fc.year,
            avgAqi: fc.predictedAqi,
            bestMonth: sortedMonths[0],
            worstMonth: sortedMonths[sortedMonths.length - 1],
            zone: getZone(fc.predictedAqi),
            livability: getLivabilityLabel(fc.predictedAqi),
            confidence: fc.confidence * 100
          };
        });

        return {
          stationId: stationForecast.stationId,
          stationName: stationForecast.stationName,
          stationType: stationForecast.stationType,
          yearlyPredictions,
          trend: stationForecast.overallTrend,
          recommendation: stationForecast.recommendation
        };
      });

      const cityOverview = {
        avgAqiByYear: Object.fromEntries(
          Object.entries(cityStats.avgFutureAqi).map(([year, aqi]) => [year, aqi])
        ),
        overallTrend: cityStats.overallTrend,
        keyInsights: [
          `${cityStats.highlyLivableCount} areas classified as highly livable`,
          `${cityStats.moderatelyLivableCount} areas with moderate livability`,
          `${cityStats.lowLivabilityCount} areas with low livability`,
          `Average livability score: ${cityStats.avgLivabilityScore}/100`,
          `Overall air quality trend: ${cityStats.overallTrend}`
        ]
      };

      setForecast({ forecasts, cityOverview });
      toast.success('Forecast generated (local engine fallback)');
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

  return { forecast, isLoading, error, generateForecast, clearForecast };
}
