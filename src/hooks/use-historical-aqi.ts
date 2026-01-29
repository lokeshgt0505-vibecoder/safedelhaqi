import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StationData } from '@/types/aqi';
import { toast } from 'sonner';

export interface HistoricalAQI {
  id: string;
  station_id: string;
  station_name: string;
  aqi: number;
  zone: 'blue' | 'yellow' | 'red';
  pm25?: number;
  pm10?: number;
  recorded_at: string;
  source: string;
  created_at: string;
}

export function useHistoricalAQI() {
  // Store current AQI readings as historical data
  const storeHistoricalData = useCallback(async (stations: StationData[]) => {
    try {
      const records = stations.map((station) => ({
        station_id: station.id,
        station_name: station.name,
        aqi: station.aqi,
        zone: station.zone,
        pm25: station.pollutants?.pm25 || null,
        pm10: station.pollutants?.pm10 || null,
        recorded_at: new Date().toISOString(),
        source: 'live_api',
      }));

      const { error } = await supabase
        .from('historical_aqi')
        .insert(records);

      if (error) {
        console.error('Failed to store historical data:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error storing historical data:', err);
      return false;
    }
  }, []);

  // Fetch historical data for a station
  const fetchStationHistory = useCallback(async (
    stationId: string,
    days: number = 30
  ): Promise<HistoricalAQI[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('historical_aqi')
        .select('*')
        .eq('station_id', stationId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch historical data:', error);
        return [];
      }

      return (data || []) as HistoricalAQI[];
    } catch (err) {
      console.error('Error fetching historical data:', err);
      return [];
    }
  }, []);

  // Fetch all historical data for training
  const fetchAllHistoricalData = useCallback(async (): Promise<HistoricalAQI[]> => {
    try {
      const { data, error } = await supabase
        .from('historical_aqi')
        .select('*')
        .order('recorded_at', { ascending: true })
        .limit(10000);

      if (error) {
        console.error('Failed to fetch historical data:', error);
        return [];
      }

      return (data || []) as HistoricalAQI[];
    } catch (err) {
      console.error('Error fetching historical data:', err);
      return [];
    }
  }, []);

  // Get aggregated stats for a station
  const getStationStats = useCallback(async (stationId: string) => {
    try {
      const { data, error } = await supabase
        .from('historical_aqi')
        .select('aqi, zone, recorded_at')
        .eq('station_id', stationId)
        .order('recorded_at', { ascending: false })
        .limit(1000);

      if (error || !data || data.length === 0) {
        return null;
      }

      const aqiValues = data.map((d) => d.aqi);
      const avgAqi = aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length;
      const minAqi = Math.min(...aqiValues);
      const maxAqi = Math.max(...aqiValues);

      const zoneCounts = data.reduce((acc, d) => {
        acc[d.zone] = (acc[d.zone] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        avgAqi: Math.round(avgAqi),
        minAqi,
        maxAqi,
        recordCount: data.length,
        zoneCounts,
        mostCommonZone: Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
      };
    } catch (err) {
      console.error('Error getting station stats:', err);
      return null;
    }
  }, []);

  return {
    storeHistoricalData,
    fetchStationHistory,
    fetchAllHistoricalData,
    getStationStats,
  };
}
