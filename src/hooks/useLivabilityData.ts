import { useMemo } from 'react';
import { 
  generateAllStationForecasts, 
  getCityWideStats,
  StationForecastResult 
} from '@/lib/forecasting-engine';
import { CityWideStats } from '@/types/livability';

/**
 * Hook for accessing pre-computed livability data
 * 
 * All data is deterministically computed using fixed random state (42)
 * ensuring consistent results across page refreshes.
 */
export function useLivabilityData() {
  // Memoize to prevent recalculation on every render
  const stationForecasts = useMemo<StationForecastResult[]>(() => {
    return generateAllStationForecasts();
  }, []);

  const cityStats = useMemo<CityWideStats>(() => {
    return getCityWideStats();
  }, []);

  // Get stations sorted by livability score (best first)
  const rankedStations = useMemo(() => {
    return [...stationForecasts].sort((a, b) => b.livabilityScore - a.livabilityScore);
  }, [stationForecasts]);

  // Get top 5 most livable stations
  const topLivable = useMemo(() => {
    return rankedStations.slice(0, 5);
  }, [rankedStations]);

  // Get bottom 5 least livable stations
  const leastLivable = useMemo(() => {
    return rankedStations.slice(-5).reverse();
  }, [rankedStations]);

  // Get stations by livability class
  const stationsByClass = useMemo(() => ({
    highlyLivable: stationForecasts.filter(s => s.livabilityClass === 'highly-livable'),
    moderatelyLivable: stationForecasts.filter(s => s.livabilityClass === 'moderately-livable'),
    lowLivability: stationForecasts.filter(s => s.livabilityClass === 'low-livability'),
  }), [stationForecasts]);

  // Get forecast for specific station
  const getStationForecast = (stationId: string) => {
    return stationForecasts.find(s => s.stationId === stationId);
  };

  // Get aggregated forecast for a specific year
  const getYearForecast = (year: number) => {
    const yearData = stationForecasts.map(s => {
      const forecast = s.forecasts.find(f => f.year === year);
      return {
        stationId: s.stationId,
        stationName: s.stationName,
        livabilityClass: s.livabilityClass,
        predictedAqi: forecast?.predictedAqi || 0,
        pm25: forecast?.pm25 || 0,
        pm10: forecast?.pm10 || 0,
        confidence: forecast?.confidence || 0,
      };
    });
    return yearData;
  };

  return {
    stationForecasts,
    cityStats,
    rankedStations,
    topLivable,
    leastLivable,
    stationsByClass,
    getStationForecast,
    getYearForecast,
  };
}
