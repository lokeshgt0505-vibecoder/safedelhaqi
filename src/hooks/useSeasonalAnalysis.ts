import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StationData } from '@/types/aqi';

export interface MonthlyPattern {
  month: number;
  monthName: string;
  avgAqi: number;
  minAqi: number;
  maxAqi: number;
  recordCount: number;
  zone: 'blue' | 'yellow' | 'red';
  outdoorRating: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
}

export interface SeasonalPattern {
  season: string;
  months: number[];
  avgAqi: number;
  zone: 'blue' | 'yellow' | 'red';
  outdoorRating: string;
}

export interface StationSeasonalData {
  stationId: string;
  stationName: string;
  monthlyPatterns: MonthlyPattern[];
  seasonalPatterns: SeasonalPattern[];
  bestMonths: MonthlyPattern[];
  worstMonths: MonthlyPattern[];
  yearlyAvgAqi: Record<number, number>;
}

export interface SeasonalAnalysis {
  stations: StationSeasonalData[];
  cityWideMonthly: MonthlyPattern[];
  cityWideSeasonal: SeasonalPattern[];
  bestMonthsOverall: { month: string; avgAqi: number; recommendation: string }[];
  outdoorActivityCalendar: {
    month: string;
    rating: string;
    activities: string[];
    precautions: string[];
  }[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SEASONS = {
  Winter: [12, 1, 2],
  Spring: [3, 4, 5],
  Summer: [6, 7, 8],
  Monsoon: [9, 10, 11],
};

function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function getOutdoorRating(aqi: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous' {
  if (aqi <= 50) return 'excellent';
  if (aqi <= 100) return 'good';
  if (aqi <= 150) return 'moderate';
  if (aqi <= 200) return 'poor';
  return 'hazardous';
}

function getOutdoorActivities(rating: string): string[] {
  switch (rating) {
    case 'excellent':
      return ['Jogging', 'Cycling', 'Outdoor sports', 'Hiking', 'Picnics'];
    case 'good':
      return ['Walking', 'Light jogging', 'Outdoor dining', 'Morning yoga'];
    case 'moderate':
      return ['Short walks', 'Brief outdoor exercise', 'Covered outdoor activities'];
    case 'poor':
      return ['Indoor activities preferred', 'Brief essential outdoor trips only'];
    default:
      return ['Stay indoors', 'Use air purifiers'];
  }
}

function getPrecautions(rating: string): string[] {
  switch (rating) {
    case 'excellent':
      return ['Enjoy outdoor activities freely'];
    case 'good':
      return ['Sensitive groups should limit prolonged outdoor exertion'];
    case 'moderate':
      return ['Wear N95 mask for extended outdoor activities', 'Limit outdoor exercise'];
    case 'poor':
      return ['Wear N95 mask outdoors', 'Avoid strenuous outdoor activities', 'Keep windows closed'];
    default:
      return ['Stay indoors', 'Use air purifiers', 'Wear N95 mask if going outside', 'Seek medical attention if experiencing symptoms'];
  }
}

export function useSeasonalAnalysis() {
  const [analysis, setAnalysis] = useState<SeasonalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSeasonalPatterns = useCallback(async (stations: StationData[]) => {
    if (stations.length === 0) {
      setError('No stations available for analysis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all historical data
      const { data: historicalData, error: fetchError } = await supabase
        .from('historical_aqi')
        .select('*')
        .order('recorded_at', { ascending: true })
        .limit(10000);

      if (fetchError) throw new Error(fetchError.message);

      // If no historical data, generate synthetic patterns based on current readings
      const dataToAnalyze = historicalData && historicalData.length > 0 
        ? historicalData 
        : generateSyntheticData(stations);

      // Group by station and month
      const stationMonthlyData: Record<string, Record<number, number[]>> = {};
      const cityMonthlyData: Record<number, number[]> = {};

      dataToAnalyze.forEach((record: { station_id: string; station_name: string; aqi: number; recorded_at: string }) => {
        const month = new Date(record.recorded_at).getMonth() + 1;
        
        // Station-level
        if (!stationMonthlyData[record.station_id]) {
          stationMonthlyData[record.station_id] = {};
        }
        if (!stationMonthlyData[record.station_id][month]) {
          stationMonthlyData[record.station_id][month] = [];
        }
        stationMonthlyData[record.station_id][month].push(record.aqi);

        // City-level
        if (!cityMonthlyData[month]) {
          cityMonthlyData[month] = [];
        }
        cityMonthlyData[month].push(record.aqi);
      });

      // Calculate city-wide monthly patterns
      const cityWideMonthly: MonthlyPattern[] = Object.entries(cityMonthlyData)
        .map(([monthStr, aqiValues]) => {
          const month = parseInt(monthStr);
          const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
          return {
            month,
            monthName: MONTH_NAMES[month - 1],
            avgAqi,
            minAqi: Math.min(...aqiValues),
            maxAqi: Math.max(...aqiValues),
            recordCount: aqiValues.length,
            zone: getZone(avgAqi),
            outdoorRating: getOutdoorRating(avgAqi),
          };
        })
        .sort((a, b) => a.month - b.month);

      // Fill missing months with estimates
      for (let m = 1; m <= 12; m++) {
        if (!cityWideMonthly.find(p => p.month === m)) {
          const estimatedAqi = estimateMonthlyAqi(m, stations);
          cityWideMonthly.push({
            month: m,
            monthName: MONTH_NAMES[m - 1],
            avgAqi: estimatedAqi,
            minAqi: Math.round(estimatedAqi * 0.7),
            maxAqi: Math.round(estimatedAqi * 1.3),
            recordCount: 0,
            zone: getZone(estimatedAqi),
            outdoorRating: getOutdoorRating(estimatedAqi),
          });
        }
      }
      cityWideMonthly.sort((a, b) => a.month - b.month);

      // Calculate seasonal patterns
      const cityWideSeasonal: SeasonalPattern[] = Object.entries(SEASONS).map(([season, months]) => {
        const monthData = cityWideMonthly.filter(m => months.includes(m.month));
        const avgAqi = Math.round(monthData.reduce((sum, m) => sum + m.avgAqi, 0) / monthData.length);
        return {
          season,
          months,
          avgAqi,
          zone: getZone(avgAqi),
          outdoorRating: getOutdoorRating(avgAqi),
        };
      });

      // Best months overall
      const sortedMonths = [...cityWideMonthly].sort((a, b) => a.avgAqi - b.avgAqi);
      const bestMonthsOverall = sortedMonths.slice(0, 3).map(m => ({
        month: m.monthName,
        avgAqi: m.avgAqi,
        recommendation: m.avgAqi <= 50 
          ? 'Ideal for all outdoor activities'
          : m.avgAqi <= 100 
            ? 'Great for outdoor activities with minor precautions'
            : 'Suitable for outdoor activities with some precautions',
      }));

      // Outdoor activity calendar
      const outdoorActivityCalendar = cityWideMonthly.map(m => ({
        month: m.monthName,
        rating: m.outdoorRating,
        activities: getOutdoorActivities(m.outdoorRating),
        precautions: getPrecautions(m.outdoorRating),
      }));

      // Station-level analysis
      const stationAnalysis: StationSeasonalData[] = stations.map(station => {
        const monthlyData = stationMonthlyData[station.id] || {};
        const monthlyPatterns: MonthlyPattern[] = [];

        for (let m = 1; m <= 12; m++) {
          const aqiValues = monthlyData[m] || [];
          let avgAqi: number;
          
          if (aqiValues.length > 0) {
            avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
          } else {
            avgAqi = estimateMonthlyAqi(m, [station]);
          }

          monthlyPatterns.push({
            month: m,
            monthName: MONTH_NAMES[m - 1],
            avgAqi,
            minAqi: aqiValues.length > 0 ? Math.min(...aqiValues) : Math.round(avgAqi * 0.7),
            maxAqi: aqiValues.length > 0 ? Math.max(...aqiValues) : Math.round(avgAqi * 1.3),
            recordCount: aqiValues.length,
            zone: getZone(avgAqi),
            outdoorRating: getOutdoorRating(avgAqi),
          });
        }

        const seasonalPatterns: SeasonalPattern[] = Object.entries(SEASONS).map(([season, months]) => {
          const monthData = monthlyPatterns.filter(m => months.includes(m.month));
          const avgAqi = Math.round(monthData.reduce((sum, m) => sum + m.avgAqi, 0) / monthData.length);
          return {
            season,
            months,
            avgAqi,
            zone: getZone(avgAqi),
            outdoorRating: getOutdoorRating(avgAqi),
          };
        });

        const sortedPatterns = [...monthlyPatterns].sort((a, b) => a.avgAqi - b.avgAqi);

        return {
          stationId: station.id,
          stationName: station.name,
          monthlyPatterns,
          seasonalPatterns,
          bestMonths: sortedPatterns.slice(0, 3),
          worstMonths: sortedPatterns.slice(-3).reverse(),
          yearlyAvgAqi: {},
        };
      });

      setAnalysis({
        stations: stationAnalysis,
        cityWideMonthly,
        cityWideSeasonal,
        bestMonthsOverall,
        outdoorActivityCalendar,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze seasonal patterns';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isLoading,
    error,
    analyzeSeasonalPatterns,
    clearAnalysis,
  };
}

// Generate synthetic data based on known Delhi AQI patterns
function generateSyntheticData(stations: StationData[]) {
  const data: { station_id: string; station_name: string; aqi: number; recorded_at: string }[] = [];
  const now = new Date();

  // Delhi's typical monthly AQI multipliers (based on known patterns)
  const monthlyMultipliers: Record<number, number> = {
    1: 1.3,   // January - cold, high pollution
    2: 1.1,   // February - slightly better
    3: 0.9,   // March - improving
    4: 0.7,   // April - pre-summer, good
    5: 0.6,   // May - summer, better dispersion
    6: 0.5,   // June - pre-monsoon, best
    7: 0.4,   // July - monsoon, cleanest
    8: 0.45,  // August - monsoon
    9: 0.6,   // September - post-monsoon
    10: 1.0,  // October - stubble burning starts
    11: 1.5,  // November - peak pollution
    12: 1.4,  // December - cold, high pollution
  };

  stations.forEach(station => {
    for (let m = 1; m <= 12; m++) {
      // Generate multiple readings per month
      for (let d = 1; d <= 3; d++) {
        const baseAqi = station.aqi || 150;
        const multiplier = monthlyMultipliers[m];
        const variance = (Math.random() - 0.5) * 40;
        const aqi = Math.max(20, Math.round(baseAqi * multiplier + variance));
        
        const date = new Date(now.getFullYear(), m - 1, d * 10);
        data.push({
          station_id: station.id,
          station_name: station.name,
          aqi,
          recorded_at: date.toISOString(),
        });
      }
    }
  });

  return data;
}

// Estimate monthly AQI based on known Delhi patterns
function estimateMonthlyAqi(month: number, stations: StationData[]): number {
  const avgCurrentAqi = stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length;
  
  const monthlyMultipliers: Record<number, number> = {
    1: 1.3, 2: 1.1, 3: 0.9, 4: 0.7, 5: 0.6, 6: 0.5,
    7: 0.4, 8: 0.45, 9: 0.6, 10: 1.0, 11: 1.5, 12: 1.4,
  };

  return Math.round(avgCurrentAqi * monthlyMultipliers[month]);
}
