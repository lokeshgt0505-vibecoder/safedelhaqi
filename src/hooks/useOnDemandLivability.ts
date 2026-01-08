import { useState, useCallback, useRef } from 'react';
import { generateStationForecast, StationForecastResult } from '@/lib/forecasting-engine';
import { DELHI_STATIONS } from '@/lib/aqi-utils';

/**
 * On-Demand Livability Calculation Hook
 * 
 * Calculates livability ONLY when a user clicks on a location.
 * Uses caching to ensure repeated clicks return results instantly.
 * All predictions are deterministic (fixed random state 42).
 */
export function useOnDemandLivability() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<StationForecastResult | null>(null);
  
  // Cache to store computed forecasts per station
  const cacheRef = useRef<Map<string, StationForecastResult>>(new Map());

  /**
   * Calculate livability for a specific station on demand
   * Returns cached result if available, otherwise computes and caches
   */
  const calculateLivability = useCallback((stationId: string): StationForecastResult | null => {
    // Check cache first
    const cached = cacheRef.current.get(stationId);
    if (cached) {
      setLastCalculated(cached);
      return cached;
    }

    // Validate station exists
    const station = DELHI_STATIONS.find(s => s.id === stationId);
    if (!station) {
      console.warn(`Station ${stationId} not found`);
      return null;
    }

    setIsCalculating(true);

    // Calculate forecast (deterministic - same input always gives same output)
    const forecast = generateStationForecast(stationId);

    // Cache the result
    cacheRef.current.set(stationId, forecast);
    setLastCalculated(forecast);
    setIsCalculating(false);

    return forecast;
  }, []);

  /**
   * Get cached forecast if available (without triggering calculation)
   */
  const getCachedForecast = useCallback((stationId: string): StationForecastResult | undefined => {
    return cacheRef.current.get(stationId);
  }, []);

  /**
   * Check if a forecast is cached
   */
  const isCached = useCallback((stationId: string): boolean => {
    return cacheRef.current.has(stationId);
  }, []);

  /**
   * Clear cache (if needed for testing)
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setLastCalculated(null);
  }, []);

  /**
   * Get all cached stations
   */
  const getCachedStationIds = useCallback((): string[] => {
    return Array.from(cacheRef.current.keys());
  }, []);

  /**
   * Pre-warm cache for visible stations (optional optimization)
   */
  const preWarmCache = useCallback((stationIds: string[]) => {
    stationIds.forEach(id => {
      if (!cacheRef.current.has(id)) {
        const forecast = generateStationForecast(id);
        cacheRef.current.set(id, forecast);
      }
    });
  }, []);

  return {
    calculateLivability,
    getCachedForecast,
    isCached,
    clearCache,
    getCachedStationIds,
    preWarmCache,
    isCalculating,
    lastCalculated,
  };
}
