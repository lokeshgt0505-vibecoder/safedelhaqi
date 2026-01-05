-- Create table for historical AQI data to train ML model
CREATE TABLE public.historical_aqi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  aqi INTEGER NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('blue', 'yellow', 'red')),
  pm25 NUMERIC,
  pm10 NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT DEFAULT 'api',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_historical_aqi_station ON public.historical_aqi (station_id);
CREATE INDEX idx_historical_aqi_recorded_at ON public.historical_aqi (recorded_at);
CREATE INDEX idx_historical_aqi_station_date ON public.historical_aqi (station_id, recorded_at);

-- Enable RLS (public read for training, admin write)
ALTER TABLE public.historical_aqi ENABLE ROW LEVEL SECURITY;

-- Allow public read access for ML training
CREATE POLICY "Anyone can view historical AQI data"
ON public.historical_aqi
FOR SELECT
USING (true);

-- Allow authenticated users to insert (for automated collection)
CREATE POLICY "Authenticated users can insert historical data"
ON public.historical_aqi
FOR INSERT
WITH CHECK (true);