/**
 * Livability System Types
 * 
 * Types for the AQI forecasting and livability mapping system
 */

export type LivabilityClass = 'highly-livable' | 'moderately-livable' | 'low-livability';
export type TrendDirection = 'improving' | 'stable' | 'declining';
export type StationType = 'industrial' | 'residential' | 'traffic' | 'mixed';

export interface SeasonalBreakdown {
  Winter: number;
  Spring: number;
  Monsoon: number;
  Autumn: number;
}

export interface YearlyForecast {
  year: number;
  predictedAqi: number;
  pm25: number;
  pm10: number;
  confidence: number;
  seasonalBreakdown: SeasonalBreakdown;
  trend: TrendDirection;
}

export interface HistoricalDataPoint {
  year: number;
  avgAqi: number;
}

export interface StationLivability {
  stationId: string;
  stationName: string;
  stationType: StationType;
  coordinates: {
    lat: number;
    lng: number;
  };
  historicalData: HistoricalDataPoint[];
  forecasts: YearlyForecast[];
  livabilityScore: number;
  livabilityClass: LivabilityClass;
  overallTrend: TrendDirection;
  recommendation: string;
}

export interface CityWideStats {
  avgLivabilityScore: number;
  highlyLivableCount: number;
  moderatelyLivableCount: number;
  lowLivabilityCount: number;
  overallTrend: TrendDirection;
  avgFutureAqi: Record<number, number>;
}

export interface VoronoiRegion {
  stationId: string;
  stationName: string;
  positions: [number, number][];
  livabilityClass: LivabilityClass;
  livabilityScore: number;
  predictedAqi: number;
  color: string;
}

// Color mappings for livability classes
export const LIVABILITY_COLORS: Record<LivabilityClass, { fill: string; stroke: string; label: string }> = {
  'highly-livable': {
    fill: '#22c55e',     // Green
    stroke: '#16a34a',
    label: 'Highly Livable',
  },
  'moderately-livable': {
    fill: '#eab308',     // Yellow
    stroke: '#ca8a04',
    label: 'Moderately Livable',
  },
  'low-livability': {
    fill: '#ef4444',     // Red
    stroke: '#dc2626',
    label: 'Low Livability',
  },
};
