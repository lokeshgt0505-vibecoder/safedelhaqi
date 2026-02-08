-- Add validation to historical_aqi INSERT policy
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert historical data" ON public.historical_aqi;

-- Create a new policy with validation constraints
-- - Requires authentication
-- - Validates AQI is within valid range (0-500)
-- - Validates zone is one of the allowed values
CREATE POLICY "Validated inserts for authenticated users"
ON public.historical_aqi
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  aqi >= 0 AND aqi <= 500 AND
  zone IN ('blue', 'yellow', 'red')
);