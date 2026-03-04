export interface YearlyPrediction {
  year: number;
  avgAqi: number;
  upperBound?: number;
  lowerBound?: number;
  pm25?: number;
  pm10?: number;
  bestMonth: { month: string; aqi: number };
  worstMonth: { month: string; aqi: number };
  seasonalBreakdown?: {
    Winter: number;
    Spring: number;
    Monsoon: number;
    Autumn: number;
  };
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

export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2Score: number;
  trainingSize?: number;
  testSize?: number;
  nEstimators?: number;
  maxDepth?: number;
  learningRate?: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  description?: string;
}

export interface CityOverview {
  avgAqiByYear: Record<string, number>;
  overallTrend: string;
  keyInsights: string[];
}

export interface ForecastData {
  forecasts: StationForecast[];
  cityOverview: CityOverview;
  modelMetrics?: ModelMetrics;
  featureImportance?: FeatureImportanceItem[];
}
