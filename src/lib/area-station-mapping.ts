/**
 * Area-to-Station Mapping Utilities
 * 
 * Determines the governing AQI station for any clicked point on the map
 * using a priority fallback: Voronoi Zone → Influence Buffer → Nearest Station
 */

import { Delaunay } from 'd3-delaunay';
import { DELHI_STATIONS } from './aqi-utils';

export type AssignmentReason = 
  | { type: 'voronoi'; stationName: string }
  | { type: 'buffer'; stationName: string; distance: number }
  | { type: 'nearest'; stationName: string; distance: number };

export interface AreaStationResult {
  stationId: string;
  stationName: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  reason: AssignmentReason;
}

// Delhi bounds for Voronoi clipping
const DELHI_BOUNDS = {
  minLat: 28.4,
  maxLat: 28.9,
  minLng: 76.8,
  maxLng: 77.5,
};

// Buffer distance in km for influence zones
const BUFFER_DISTANCE_KM = 5;

/**
 * Calculate distance between two points in km (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Pre-compute Voronoi diagram for all stations
let voronoiDiagram: ReturnType<Delaunay<[number, number]>['voronoi']> | null = null;
let delaunayTriangulation: Delaunay<[number, number]> | null = null;

function getVoronoiDiagram() {
  if (!voronoiDiagram || !delaunayTriangulation) {
    const points = DELHI_STATIONS.map(s => [s.lng, s.lat] as [number, number]);
    delaunayTriangulation = Delaunay.from(points);
    voronoiDiagram = delaunayTriangulation.voronoi([
      DELHI_BOUNDS.minLng,
      DELHI_BOUNDS.minLat,
      DELHI_BOUNDS.maxLng,
      DELHI_BOUNDS.maxLat,
    ]);
  }
  return { voronoi: voronoiDiagram, delaunay: delaunayTriangulation };
}

/**
 * Find station using Voronoi zone (Primary method)
 * Returns the station whose Voronoi cell contains the clicked point
 */
function findByVoronoi(lat: number, lng: number): AreaStationResult | null {
  const { delaunay } = getVoronoiDiagram();
  
  // Find which Voronoi cell contains the point
  const stationIndex = delaunay.find(lng, lat);
  
  if (stationIndex >= 0 && stationIndex < DELHI_STATIONS.length) {
    const station = DELHI_STATIONS[stationIndex];
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    
    return {
      stationId: station.id,
      stationName: station.name,
      coordinates: { lat: station.lat, lng: station.lng },
      distance,
      reason: { type: 'voronoi', stationName: station.name },
    };
  }
  
  return null;
}

/**
 * Find station using influence buffer (Fallback method)
 * Returns the station if the point is within its influence buffer
 */
function findByBuffer(lat: number, lng: number): AreaStationResult | null {
  const stationsWithDistance = DELHI_STATIONS.map(station => ({
    station,
    distance: calculateDistance(lat, lng, station.lat, station.lng),
  }));
  
  // Filter stations within buffer distance
  const withinBuffer = stationsWithDistance.filter(s => s.distance <= BUFFER_DISTANCE_KM);
  
  if (withinBuffer.length === 0) return null;
  
  // Choose the nearest station within buffer
  const nearest = withinBuffer.reduce((min, curr) => 
    curr.distance < min.distance ? curr : min
  );
  
  return {
    stationId: nearest.station.id,
    stationName: nearest.station.name,
    coordinates: { lat: nearest.station.lat, lng: nearest.station.lng },
    distance: nearest.distance,
    reason: { type: 'buffer', stationName: nearest.station.name, distance: nearest.distance },
  };
}

/**
 * Find nearest station (Final fallback)
 * Returns the closest station regardless of zone or buffer
 */
function findNearest(lat: number, lng: number): AreaStationResult {
  const stationsWithDistance = DELHI_STATIONS.map(station => ({
    station,
    distance: calculateDistance(lat, lng, station.lat, station.lng),
  }));
  
  const nearest = stationsWithDistance.reduce((min, curr) => 
    curr.distance < min.distance ? curr : min
  );
  
  return {
    stationId: nearest.station.id,
    stationName: nearest.station.name,
    coordinates: { lat: nearest.station.lat, lng: nearest.station.lng },
    distance: nearest.distance,
    reason: { type: 'nearest', stationName: nearest.station.name, distance: nearest.distance },
  };
}

export interface LayerVisibilityState {
  voronoi: boolean;
  buffers: boolean;
}

/**
 * Map any clicked area to its governing AQI station
 * Uses priority fallback: Voronoi → Buffer → Nearest
 * 
 * @param lat - Latitude of clicked point
 * @param lng - Longitude of clicked point
 * @param layerVisibility - Current visibility state of map layers
 * @returns AreaStationResult with station info and assignment reason
 */
export function mapAreaToStation(
  lat: number, 
  lng: number, 
  layerVisibility?: LayerVisibilityState
): AreaStationResult {
  // If layers visibility is provided, use priority based on what's visible
  if (layerVisibility) {
    // Priority 1: Voronoi (if visible or as fallback)
    if (layerVisibility.voronoi) {
      const result = findByVoronoi(lat, lng);
      if (result) return result;
    }
    
    // Priority 2: Buffer (if visible)
    if (layerVisibility.buffers) {
      const result = findByBuffer(lat, lng);
      if (result) return result;
    }
  }
  
  // Always try Voronoi first (most accurate for area assignment)
  const voronoiResult = findByVoronoi(lat, lng);
  if (voronoiResult) return voronoiResult;
  
  // Try buffer zones
  const bufferResult = findByBuffer(lat, lng);
  if (bufferResult) return bufferResult;
  
  // Final fallback: nearest station
  return findNearest(lat, lng);
}

/**
 * Get the reason text for display in UI
 */
export function getReasonText(reason: AssignmentReason): string {
  switch (reason.type) {
    case 'voronoi':
      return `Inside Voronoi zone of ${reason.stationName}`;
    case 'buffer':
      return `Within influence buffer of ${reason.stationName} (${reason.distance.toFixed(1)} km)`;
    case 'nearest':
      return `Nearest station: ${reason.stationName} (${reason.distance.toFixed(1)} km)`;
  }
}
