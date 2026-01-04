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
