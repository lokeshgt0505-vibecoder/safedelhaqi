import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StationData } from '@/types/aqi';
import { DELHI_STATIONS, getZone, formatAQI } from '@/lib/aqi-utils';

interface UseAQIDataOptions {
  refreshInterval?: number;
}

export function useAQIData(options: UseAQIDataOptions = {}) {
  const { refreshInterval = 300000 } = options; // 5 min default
  const [stations, setStations] = useState<StationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingLiveData, setIsUsingLiveData] = useState(false);
  const lastStoredRef = useRef<number>(0);

  // Store historical data (throttled to once per hour)
  const storeHistoricalData = useCallback(async (stationData: StationData[]) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - lastStoredRef.current < oneHour) {
      return; // Skip if stored within last hour
    }
    
    try {
      const records = stationData.map((station) => ({
        station_id: station.id,
        station_name: station.name,
        aqi: station.aqi,
        zone: station.zone,
        pm25: station.pollutants?.pm25 || null,
        pm10: station.pollutants?.pm10 || null,
        recorded_at: new Date().toISOString(),
        source: 'live_api',
      }));

      const { error: insertError } = await supabase
        .from('historical_aqi')
        .insert(records);

      if (!insertError) {
        lastStoredRef.current = now;
        console.log('Historical AQI data stored successfully');
      }
    } catch (err) {
      console.error('Failed to store historical data:', err);
    }
  }, []);

  const generateMockData = useCallback((): StationData[] => {
    return DELHI_STATIONS.map((station) => {
      // Generate realistic mock AQI values for Delhi (typically 50-400 range)
      const baseAQI = 80 + Math.floor(Math.random() * 220);
      return {
        id: station.id,
        name: station.name,
        aqi: baseAQI,
        lat: station.lat,
        lng: station.lng,
        zone: getZone(baseAQI),
        pollutants: {
          pm25: 30 + Math.floor(Math.random() * 200),
          pm10: 50 + Math.floor(Math.random() * 250),
          no2: 10 + Math.floor(Math.random() * 80),
          so2: 5 + Math.floor(Math.random() * 40),
          co: 2 + Math.floor(Math.random() * 15),
          o3: 20 + Math.floor(Math.random() * 60),
        },
        dominentPol: 'pm25',
        time: new Date().toISOString(),
      };
    });
  }, []);

  const fetchAllStations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch live data from edge function
      const { data, error: fnError } = await supabase.functions.invoke('fetch-aqi', {
        body: { action: 'getStations' },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch AQI data');
      }

      const stationData: StationData[] = data.data.map((s: any) => {
        const aqi = formatAQI(s.aqi);
        return {
          id: s.id,
          name: s.name,
          aqi,
          lat: s.lat,
          lng: s.lng,
          zone: getZone(aqi),
          time: s.time,
        };
      });

      setStations(stationData);
      setLastUpdated(new Date());
      setIsUsingLiveData(true);
      console.log(`Loaded ${stationData.length} stations with live data`);
      
      // Store historical data asynchronously
      storeHistoricalData(stationData);
    } catch (err) {
      console.warn('Failed to fetch live AQI data, using mock data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fall back to mock data
      const mockStations = generateMockData();
      setStations(mockStations);
      setLastUpdated(new Date());
      setIsUsingLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  useEffect(() => {
    fetchAllStations();
    
    const interval = setInterval(fetchAllStations, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAllStations, refreshInterval]);

  const refresh = useCallback(() => {
    fetchAllStations();
  }, [fetchAllStations]);

  return {
    stations,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isUsingLiveData,
  };
}

export function useStationDetails(stationId: string | null) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('fetch-aqi', {
          body: { action: 'getStationDetails', stationId },
        });

        if (fnError) throw fnError;
        if (!data.success) throw new Error(data.error);

        setDetails(data.data);
      } catch (err) {
        console.warn('Failed to fetch station details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        
        // Mock detailed data as fallback
        setDetails({
          aqi: 150 + Math.floor(Math.random() * 100),
          city: { name: stationId, geo: [28.6, 77.2] },
          dominentpol: 'pm25',
          iaqi: {
            pm25: { v: 80 + Math.floor(Math.random() * 100) },
            pm10: { v: 120 + Math.floor(Math.random() * 100) },
            no2: { v: 30 + Math.floor(Math.random() * 50) },
            so2: { v: 10 + Math.floor(Math.random() * 20) },
            co: { v: 5 + Math.floor(Math.random() * 10) },
            o3: { v: 40 + Math.floor(Math.random() * 40) },
            t: { v: 25 + Math.floor(Math.random() * 15) },
            h: { v: 40 + Math.floor(Math.random() * 40) },
          },
          time: { s: new Date().toISOString(), iso: new Date().toISOString() },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [stationId]);

  return { details, isLoading, error };
}
