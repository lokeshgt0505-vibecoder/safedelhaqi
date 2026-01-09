import { useState, useCallback } from 'react';
import { StationData } from '@/types/aqi';
import { toast } from 'sonner';
import { generateAllStationForecasts, getCityWideStats, SEASONAL_PATTERNS } from '@/lib/forecasting-engine';

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

// Helper to get zone from AQI
function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

// Helper to get livability label from AQI
function getLivabilityLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

// Get month names
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useAQIForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = useCallback(async (_stations: StationData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the local deterministic forecasting engine
      const allForecasts = generateAllStationForecasts();
      const cityStats = getCityWideStats();

      // Convert to the expected format
      const forecasts: StationForecast[] = allForecasts.map(stationForecast => {
        const yearlyPredictions: YearlyPrediction[] = stationForecast.forecasts.map(fc => {
          // Find best and worst months using seasonal patterns
          const monthlyAqi = Object.entries(SEASONAL_PATTERNS).map(([month, factor]) => ({
            month: MONTH_NAMES[parseInt(month) - 1],
            aqi: Math.round(fc.predictedAqi * factor)
          }));
          
          const sortedMonths = [...monthlyAqi].sort((a, b) => a.aqi - b.aqi);
          const bestMonth = sortedMonths[0];
          const worstMonth = sortedMonths[sortedMonths.length - 1];

          return {
            year: fc.year,
            avgAqi: fc.predictedAqi,
            bestMonth,
            worstMonth,
            zone: getZone(fc.predictedAqi),
            livability: getLivabilityLabel(fc.predictedAqi),
            confidence: fc.confidence
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

      // Generate city overview
      const cityOverview: CityOverview = {
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
