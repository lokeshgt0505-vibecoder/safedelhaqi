import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StationData } from '@/types/aqi';
import { getAQIInfo } from '@/lib/aqi-utils';
import { useTheme } from 'next-themes';

interface AQIMapProps {
  stations: StationData[];
  selectedStation?: StationData | null;
  onStationClick?: (station: StationData) => void;
  mapboxToken?: string;
}

export function AQIMap({
  stations,
  selectedStation,
  onStationClick,
  mapboxToken,
}: AQIMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { resolvedTheme } = useTheme();
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
      center: [77.2090, 28.6139], // Delhi center
      zoom: 10.5,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapReady(true);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update style on theme change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    map.current.setStyle(
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11'
    );
  }, [resolvedTheme, mapReady]);

  // Add/update markers when stations change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    stations.forEach((station) => {
      const aqiInfo = getAQIInfo(station.aqi);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'aqi-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${aqiInfo.color};
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
        font-weight: bold;
        font-size: 12px;
        color: white;
        font-family: 'Space Grotesk', sans-serif;
      `;
      el.textContent = station.aqi.toString();
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div style="padding: 8px; font-family: 'Inter', sans-serif;">
              <h3 style="font-weight: 600; margin: 0 0 4px 0; font-family: 'Space Grotesk', sans-serif;">
                ${station.name}
              </h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                AQI: <strong style="color: ${aqiInfo.color}">${station.aqi}</strong>
                <span style="margin-left: 8px; padding: 2px 8px; border-radius: 12px; background: ${aqiInfo.color}; color: white; font-size: 12px;">
                  ${aqiInfo.label}
                </span>
              </p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onStationClick?.(station);
      });

      markersRef.current.push(marker);
    });
  }, [stations, mapReady, onStationClick]);

  // Fly to selected station
  useEffect(() => {
    if (!map.current || !selectedStation) return;

    map.current.flyTo({
      center: [selectedStation.lng, selectedStation.lat],
      zoom: 13,
      duration: 1500,
    });
  }, [selectedStation]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">
            Map Unavailable
          </h3>
          <p className="text-sm text-muted-foreground">
            Add your Mapbox public token to enable the interactive map view.
            Get a free token at{' '}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
    </div>
  );
}
