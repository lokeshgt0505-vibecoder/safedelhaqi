import { useState, useEffect, useCallback } from 'react';
import { StationData } from '@/types/aqi';
import { DELHI_STATIONS, getZone, formatAQI } from '@/lib/aqi-utils';

const WAQI_API_BASE = 'https://api.waqi.info';

interface UseAQIDataOptions {
  token?: string;
  refreshInterval?: number;
}

export function useAQIData(options: UseAQIDataOptions = {}) {
  const { token, refreshInterval = 300000 } = options; // 5 min default
  const [stations, setStations] = useState<StationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStationData = useCallback(async (stationId: string, stationInfo: typeof DELHI_STATIONS[0]) => {
    if (!token) return null;
    
    try {
      const response = await fetch(
        `${WAQI_API_BASE}/feed/${stationId}/?token=${token}`
      );
      const data = await response.json();
      
      if (data.status === 'ok' && data.data) {
        const aqi = formatAQI(data.data.aqi);
        return {
          id: stationInfo.id,
          name: stationInfo.name,
          aqi,
          lat: stationInfo.lat,
          lng: stationInfo.lng,
          zone: getZone(aqi),
          pollutants: {
            pm25: data.data.iaqi?.pm25?.v,
            pm10: data.data.iaqi?.pm10?.v,
            no2: data.data.iaqi?.no2?.v,
            so2: data.data.iaqi?.so2?.v,
            co: data.data.iaqi?.co?.v,
            o3: data.data.iaqi?.o3?.v,
          },
          dominentPol: data.data.dominentpol,
          time: data.data.time?.s,
        } as StationData;
      }
      return null;
    } catch {
      return null;
    }
  }, [token]);

  const fetchAllStations = useCallback(async () => {
    if (!token) {
      // Return mock data if no token
      const mockStations: StationData[] = DELHI_STATIONS.map((station, index) => {
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
      setStations(mockStations);
      setLastUpdated(new Date());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch data for map bounds around Delhi
      const response = await fetch(
        `${WAQI_API_BASE}/map/bounds/?latlng=28.4,76.8,29.0,77.5&token=${token}`
      );
      const data = await response.json();

      if (data.status === 'ok' && Array.isArray(data.data)) {
        const stationData: StationData[] = data.data
          .filter((s: any) => s.aqi && s.aqi !== '-')
          .map((s: any) => {
            const aqi = formatAQI(s.aqi);
            return {
              id: s.uid?.toString() || s.station?.name || 'unknown',
              name: s.station?.name || 'Unknown Station',
              aqi,
              lat: s.lat,
              lng: s.lon,
              zone: getZone(aqi),
              time: s.station?.time,
            };
          });
        setStations(stationData);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch AQI data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Fall back to mock data
      const mockStations: StationData[] = DELHI_STATIONS.map((station) => {
        const baseAQI = 80 + Math.floor(Math.random() * 220);
        return {
          id: station.id,
          name: station.name,
          aqi: baseAQI,
          lat: station.lat,
          lng: station.lng,
          zone: getZone(baseAQI),
          time: new Date().toISOString(),
        };
      });
      setStations(mockStations);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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
  };
}

export function useStationDetails(stationId: string | null, token?: string) {
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
        if (!token) {
          // Mock detailed data
          const mockDetails = {
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
          };
          setDetails(mockDetails);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${WAQI_API_BASE}/feed/${stationId}/?token=${token}`
        );
        const data = await response.json();

        if (data.status === 'ok') {
          setDetails(data.data);
        } else {
          throw new Error('Station not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [stationId, token]);

  return { details, isLoading, error };
}
