import { useState, useCallback } from 'react';
import { StationData } from '@/types/aqi';
import { SEASONAL_PATTERNS, STATION_COEFFICIENTS } from '@/lib/forecasting-engine';
import { toast } from 'sonner';

export interface DailyPrediction {
  date: string; // ISO date string
  dayLabel: string; // e.g. "Mon", "Tue"
  dateLabel: string; // e.g. "Mar 15"
  predictedAqi: number;
  pm25: number;
  pm10: number;
  zone: 'blue' | 'yellow' | 'red';
  confidence: number;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  windSpeed: number;
  healthAdvice: string;
}

export interface StationWeeklyForecast {
  stationId: string;
  stationName: string;
  currentAqi: number;
  predictions: DailyPrediction[];
  weekAvg: number;
  weekTrend: 'improving' | 'stable' | 'worsening';
  bestDay: DailyPrediction;
  worstDay: DailyPrediction;
}

export interface WeeklyForecastData {
  generatedAt: string;
  stationForecasts: StationWeeklyForecast[];
  cityAvgByDay: DailyPrediction[];
}

function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function getHealthAdvice(aqi: number): string {
  if (aqi <= 50) return 'Enjoy outdoor activities freely.';
  if (aqi <= 100) return 'Sensitive individuals should limit prolonged outdoor exertion.';
  if (aqi <= 200) return 'Reduce prolonged outdoor exertion. Use masks if needed.';
  if (aqi <= 300) return 'Avoid outdoor activities. Use N95 masks outdoors.';
  if (aqi <= 400) return 'Stay indoors. Use air purifiers. Avoid all outdoor exposure.';
  return 'Health emergency. Do not go outside. Seal windows.';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Seeded PRNG for deterministic daily variation
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateStationWeekly(station: StationData): StationWeeklyForecast {
  const coeff = STATION_COEFFICIENTS[station.id] || {
    baseMultiplier: 1.0,
    trendSensitivity: 1.0,
    stationType: 'mixed',
    greenCoverScore: 0.4,
  };

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const seed = station.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + today.getDate() + today.getMonth();
  const rng = seededRandom(seed);

  const predictions: DailyPrediction[] = [];

  for (let d = 1; d <= 7; d++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + d);
    const month = forecastDate.getMonth() + 1;
    const seasonalFactor = SEASONAL_PATTERNS[month] || 1.0;

    // Daily variation: slight randomness around base
    const dailyVariation = 0.9 + rng() * 0.2; // 0.9-1.1
    const weatherEffect = 0.95 + rng() * 0.1; // wind/rain effect

    let predictedAqi = Math.round(
      station.aqi * seasonalFactor * coeff.baseMultiplier * dailyVariation * weatherEffect / coeff.baseMultiplier
    );
    // Add a small drift per day
    predictedAqi = Math.round(predictedAqi + (rng() - 0.5) * 20);
    predictedAqi = Math.max(25, Math.min(500, predictedAqi));

    const pm25 = Math.round(predictedAqi * 0.52 + rng() * 8);
    const pm10 = Math.round(predictedAqi * 0.95 + rng() * 15);

    // Weather simulation (Delhi typical)
    const baseTemp = currentMonth >= 4 && currentMonth <= 9 ? 32 : 18;
    const tempHigh = Math.round(baseTemp + rng() * 8);
    const tempLow = Math.round(tempHigh - 8 - rng() * 4);
    const humidity = Math.round(40 + rng() * 40);
    const windSpeed = Math.round(5 + rng() * 20);

    predictions.push({
      date: forecastDate.toISOString().split('T')[0],
      dayLabel: DAY_NAMES[forecastDate.getDay()],
      dateLabel: `${MONTH_NAMES[forecastDate.getMonth()]} ${forecastDate.getDate()}`,
      predictedAqi,
      pm25,
      pm10,
      zone: getZone(predictedAqi),
      confidence: Math.round(95 - d * 3), // confidence decreases over days
      tempHigh,
      tempLow,
      humidity,
      windSpeed,
      healthAdvice: getHealthAdvice(predictedAqi),
    });
  }

  const weekAvg = Math.round(predictions.reduce((s, p) => s + p.predictedAqi, 0) / predictions.length);
  const sorted = [...predictions].sort((a, b) => a.predictedAqi - b.predictedAqi);
  const bestDay = sorted[0];
  const worstDay = sorted[sorted.length - 1];

  const firstHalf = predictions.slice(0, 3).reduce((s, p) => s + p.predictedAqi, 0) / 3;
  const secondHalf = predictions.slice(4).reduce((s, p) => s + p.predictedAqi, 0) / Math.max(1, predictions.slice(4).length);
  const weekTrend: 'improving' | 'stable' | 'worsening' =
    secondHalf < firstHalf - 15 ? 'improving' : secondHalf > firstHalf + 15 ? 'worsening' : 'stable';

  return {
    stationId: station.id,
    stationName: station.name,
    currentAqi: station.aqi,
    predictions,
    weekAvg,
    weekTrend,
    bestDay,
    worstDay,
  };
}

export function useWeeklyForecast() {
  const [data, setData] = useState<WeeklyForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback((stations: StationData[]) => {
    setIsLoading(true);
    try {
      const stationForecasts = stations.map(generateStationWeekly);

      // City-wide daily averages
      const cityAvgByDay: DailyPrediction[] = [];
      for (let d = 0; d < 7; d++) {
        const dayPredictions = stationForecasts.map(sf => sf.predictions[d]);
        const avgAqi = Math.round(dayPredictions.reduce((s, p) => s + p.predictedAqi, 0) / dayPredictions.length);
        cityAvgByDay.push({
          ...dayPredictions[0],
          predictedAqi: avgAqi,
          pm25: Math.round(dayPredictions.reduce((s, p) => s + p.pm25, 0) / dayPredictions.length),
          pm10: Math.round(dayPredictions.reduce((s, p) => s + p.pm10, 0) / dayPredictions.length),
          zone: getZone(avgAqi),
          healthAdvice: getHealthAdvice(avgAqi),
        });
      }

      setData({
        generatedAt: new Date().toISOString(),
        stationForecasts,
        cityAvgByDay,
      });
      toast.success('7-day AQI forecast generated');
    } catch {
      toast.error('Failed to generate weekly forecast');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => setData(null), []);

  return { data, isLoading, generate, clear };
}
