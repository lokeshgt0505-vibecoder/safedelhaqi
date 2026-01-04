import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WAQI_API_BASE = 'https://api.waqi.info';

function getWaqiToken() {
  // Read per-request so secret updates take effect without needing a redeploy/restart.
  return (Deno.env.get('WAQI_API_TOKEN') ?? '').trim();
}

function maskToken(token: string) {
  if (token.length <= 8) return '***';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, stationId, bounds, keyword } = (body ?? {}) as any;

    const token = getWaqiToken();
    if (!token) {
      throw new Error('WAQI_API_TOKEN not configured');
    }

    let data;

    switch (action) {
      case 'getStations': {
        // Fetch stations in Delhi NCR bounds
        const defaultBounds = bounds || { 
          lat1: 28.4, 
          lng1: 76.8, 
          lat2: 29.0, 
          lng2: 77.5 
        };
        
        const url = `${WAQI_API_BASE}/map/bounds/?latlng=${defaultBounds.lat1},${defaultBounds.lng1},${defaultBounds.lat2},${defaultBounds.lng2}&token=${token}`;
        console.log('Fetching stations from: token=', maskToken(token));
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status !== 'ok') {
          throw new Error(result.data || 'Failed to fetch stations');
        }
        
        // Transform and filter the data
        data = result.data
          .filter((s: any) => s.aqi && s.aqi !== '-' && !isNaN(parseInt(s.aqi)))
          .map((s: any) => ({
            id: s.uid?.toString() || s.station?.name || 'unknown',
            name: s.station?.name || 'Unknown Station',
            aqi: parseInt(s.aqi),
            lat: s.lat,
            lng: s.lon,
            time: s.station?.time,
          }));
        
        console.log(`Found ${data.length} stations with valid AQI data`);
        break;
      }

      case 'getStationDetails': {
        if (!stationId) {
          throw new Error('stationId is required for getStationDetails');
        }
        
        const url = `${WAQI_API_BASE}/feed/${stationId}/?token=${token}`;
        console.log('Fetching station details for:', stationId);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status !== 'ok') {
          throw new Error(result.data || 'Station not found');
        }
        
        data = {
          aqi: result.data.aqi,
          city: result.data.city,
          dominentpol: result.data.dominentpol,
          iaqi: result.data.iaqi,
          time: result.data.time,
          forecast: result.data.forecast,
          attributions: result.data.attributions,
        };
        break;
      }

      case 'searchStation': {
        if (!keyword) {
          throw new Error('keyword is required for searchStation');
        }
        
        const url = `${WAQI_API_BASE}/search/?keyword=${encodeURIComponent(keyword)}&token=${token}`;
        console.log('Searching for:', keyword);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status !== 'ok') {
          throw new Error(result.data || 'Search failed');
        }
        
        data = result.data.map((s: any) => ({
          uid: s.uid,
          name: s.station?.name || 'Unknown',
          aqi: s.aqi,
          time: s.time?.stime,
        }));
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('Error in fetch-aqi function:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
