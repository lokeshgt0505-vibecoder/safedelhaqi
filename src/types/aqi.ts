// AQI Types and Interfaces

export interface Station {
  uid: string;
  aqi: number | string;
  station: {
    name: string;
    geo: [number, number]; // [lat, lng]
    url?: string;
  };
}

export interface StationData {
  id: string;
  name: string;
  aqi: number;
  lat: number;
  lng: number;
  zone: 'blue' | 'yellow' | 'red';
  pollutants?: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  dominentPol?: string;
  time?: string;
}

export interface AQIDetails {
  aqi: number;
  city: {
    name: string;
    geo: [number, number];
  };
  dominentpol: string;
  iaqi: {
    pm25?: { v: number };
    pm10?: { v: number };
    no2?: { v: number };
    so2?: { v: number };
    co?: { v: number };
    o3?: { v: number };
    t?: { v: number };
    h?: { v: number };
    w?: { v: number };
  };
  time: {
    s: string;
    iso: string;
  };
  forecast?: {
    daily?: {
      pm25?: Array<{ avg: number; day: string; max: number; min: number }>;
      pm10?: Array<{ avg: number; day: string; max: number; min: number }>;
      o3?: Array<{ avg: number; day: string; max: number; min: number }>;
    };
  };
}

export type AQILevel = 'good' | 'satisfactory' | 'moderate' | 'poor' | 'very-poor' | 'hazardous';

export interface AQIInfo {
  level: AQILevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  healthImplications: string;
  cautionaryStatement: string;
}

export interface HealthAdvisory {
  general: string;
  sensitiveGroups: string;
  outdoor: string;
  indoor: string;
  mask: string;
}
