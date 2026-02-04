/**
 * AQI Contributing Factors Analysis
 * 
 * Generates dynamic explanations for why a station/zone has a particular AQI level
 * based on available datasets: station type, traffic, industrial proximity, green cover, and trends.
 */

import { STATION_COEFFICIENTS } from './forecasting-engine';
import { StationData } from '@/types/aqi';

export interface AQIContributor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  icon: 'traffic' | 'industry' | 'population' | 'greenery' | 'weather' | 'trend';
}

// Population density estimates by station (relative scale 0-1)
const POPULATION_DENSITY: Record<string, number> = {
  'delhi-anand-vihar': 0.85,
  'delhi-ito': 0.90,
  'delhi-mandir-marg': 0.70,
  'delhi-punjabi-bagh': 0.80,
  'delhi-r-k-puram': 0.75,
  'delhi-shadipur': 0.78,
  'delhi-dwarka-sec-8': 0.65,
  'delhi-ashok-vihar': 0.72,
  'delhi-bawana': 0.55,
  'delhi-jawaharlal-nehru-stadium': 0.60,
  'delhi-lodhi-road': 0.55,
  'delhi-major-dhyan-chand-stadium': 0.58,
  'delhi-mathura-road': 0.82,
  'delhi-mundka': 0.50,
  'delhi-narela': 0.45,
  'delhi-nehru-nagar': 0.75,
  'delhi-north-campus': 0.68,
  'delhi-okhla': 0.72,
  'delhi-patparganj': 0.78,
  'delhi-pusa': 0.50,
  'delhi-rohini': 0.70,
  'delhi-siri-fort': 0.62,
  'delhi-sonia-vihar': 0.65,
  'delhi-vivek-vihar': 0.75,
  'delhi-wazirpur': 0.60,
};

// Traffic intensity estimates (relative scale 0-1)
const TRAFFIC_INTENSITY: Record<string, number> = {
  'delhi-anand-vihar': 0.95,
  'delhi-ito': 0.92,
  'delhi-mandir-marg': 0.60,
  'delhi-punjabi-bagh': 0.70,
  'delhi-r-k-puram': 0.75,
  'delhi-shadipur': 0.72,
  'delhi-dwarka-sec-8': 0.55,
  'delhi-ashok-vihar': 0.65,
  'delhi-bawana': 0.45,
  'delhi-jawaharlal-nehru-stadium': 0.50,
  'delhi-lodhi-road': 0.55,
  'delhi-major-dhyan-chand-stadium': 0.52,
  'delhi-mathura-road': 0.88,
  'delhi-mundka': 0.48,
  'delhi-narela': 0.42,
  'delhi-nehru-nagar': 0.68,
  'delhi-north-campus': 0.58,
  'delhi-okhla': 0.72,
  'delhi-patparganj': 0.70,
  'delhi-pusa': 0.45,
  'delhi-rohini': 0.65,
  'delhi-siri-fort': 0.50,
  'delhi-sonia-vihar': 0.55,
  'delhi-vivek-vihar': 0.80,
  'delhi-wazirpur': 0.62,
};

// Industrial proximity score (0-1, higher = more industrial activity nearby)
const INDUSTRIAL_PROXIMITY: Record<string, number> = {
  'delhi-anand-vihar': 0.70,
  'delhi-ito': 0.40,
  'delhi-mandir-marg': 0.20,
  'delhi-punjabi-bagh': 0.35,
  'delhi-r-k-puram': 0.30,
  'delhi-shadipur': 0.45,
  'delhi-dwarka-sec-8': 0.25,
  'delhi-ashok-vihar': 0.35,
  'delhi-bawana': 0.90,
  'delhi-jawaharlal-nehru-stadium': 0.15,
  'delhi-lodhi-road': 0.10,
  'delhi-major-dhyan-chand-stadium': 0.15,
  'delhi-mathura-road': 0.55,
  'delhi-mundka': 0.85,
  'delhi-narela': 0.88,
  'delhi-nehru-nagar': 0.40,
  'delhi-north-campus': 0.20,
  'delhi-okhla': 0.82,
  'delhi-patparganj': 0.60,
  'delhi-pusa': 0.15,
  'delhi-rohini': 0.35,
  'delhi-siri-fort': 0.15,
  'delhi-sonia-vihar': 0.45,
  'delhi-vivek-vihar': 0.50,
  'delhi-wazirpur': 0.92,
};

interface ContributorScore {
  factor: string;
  score: number;
  icon: AQIContributor['icon'];
  getDescription: (score: number, aqi: number) => string;
}

/**
 * Analyze and return top contributing factors for a station's AQI
 */
export function getAQIContributors(
  stationId: string,
  aqi: number,
  trend?: 'improving' | 'stable' | 'declining'
): AQIContributor[] {
  const coefficients = STATION_COEFFICIENTS[stationId];
  const populationDensity = POPULATION_DENSITY[stationId] ?? 0.6;
  const trafficIntensity = TRAFFIC_INTENSITY[stationId] ?? 0.6;
  const industrialProximity = INDUSTRIAL_PROXIMITY[stationId] ?? 0.4;
  const greenCover = coefficients?.greenCoverScore ?? 0.4;

  // Calculate contribution scores based on AQI level
  // Higher AQI means these factors contribute more to pollution
  const isHighAQI = aqi > 150;
  const isModerateAQI = aqi > 100 && aqi <= 150;
  const isLowAQI = aqi <= 100;

  const contributors: ContributorScore[] = [
    {
      factor: 'Traffic Pollution',
      score: trafficIntensity * (isHighAQI ? 1.3 : 1.0),
      icon: 'traffic',
      getDescription: (score, currentAqi) => {
        if (score > 0.8) return 'Heavy vehicular emissions dominate this zone';
        if (score > 0.6) return 'Moderate traffic contributes to particulate matter';
        return 'Low traffic impact on air quality';
      },
    },
    {
      factor: 'Industrial Activity',
      score: industrialProximity * (isHighAQI ? 1.4 : 1.0),
      icon: 'industry',
      getDescription: (score, currentAqi) => {
        if (score > 0.7) return 'Industrial emissions significantly affect air quality';
        if (score > 0.4) return 'Nearby industrial zones add particulate matter';
        return 'Minimal industrial influence detected';
      },
    },
    {
      factor: 'Population Density',
      score: populationDensity * (isHighAQI ? 1.2 : 0.9),
      icon: 'population',
      getDescription: (score, currentAqi) => {
        if (score > 0.75) return 'High population density increases emissions';
        if (score > 0.5) return 'Moderate urban density affects local air';
        return 'Lower density reduces pollution sources';
      },
    },
    {
      factor: 'Green Cover',
      score: (1 - greenCover) * (isHighAQI ? 1.2 : 0.8), // Inverted: low green = high score
      icon: 'greenery',
      getDescription: (score, currentAqi) => {
        if (score > 0.6) return 'Low green cover reduces natural air purification';
        if (score > 0.4) return 'Moderate vegetation provides some filtration';
        return 'Good green cover helps purify air';
      },
    },
    {
      factor: 'Weather Conditions',
      score: isHighAQI ? 0.75 : (isModerateAQI ? 0.5 : 0.3),
      icon: 'weather',
      getDescription: (score, currentAqi) => {
        if (currentAqi > 200) return 'Atmospheric conditions trap pollutants';
        if (currentAqi > 150) return 'Weather patterns limit pollutant dispersion';
        return 'Favorable conditions for air circulation';
      },
    },
  ];

  // Add trend-based contributor if trend is provided
  if (trend) {
    const trendScore = trend === 'declining' ? 0.8 : (trend === 'stable' ? 0.4 : 0.2);
    contributors.push({
      factor: 'AQI Trend',
      score: trendScore,
      icon: 'trend',
      getDescription: () => {
        if (trend === 'declining') return 'Air quality is worsening over time';
        if (trend === 'stable') return 'Air quality remains relatively unchanged';
        return 'Air quality shows improvement trend';
      },
    });
  }

  // Sort by score and take top 3-5 contributors
  const sorted = contributors.sort((a, b) => b.score - a.score);
  
  // Filter to only show significant contributors
  const significant = sorted.filter(c => c.score > 0.35).slice(0, 5);
  
  // Ensure at least 3 contributors are shown
  const result = significant.length >= 3 ? significant : sorted.slice(0, 3);

  return result.map(c => ({
    factor: c.factor,
    impact: c.score > 0.7 ? 'high' : (c.score > 0.5 ? 'medium' : 'low'),
    description: c.getDescription(c.score, aqi),
    icon: c.icon,
  }));
}

/**
 * Get a summary explanation for the AQI level
 */
export function getAQISummary(aqi: number): string {
  if (aqi <= 50) return 'Air quality is excellent with minimal pollution sources.';
  if (aqi <= 100) return 'Air quality is acceptable with minor pollution factors.';
  if (aqi <= 150) return 'Moderate pollution from multiple sources affects air quality.';
  if (aqi <= 200) return 'Poor air quality due to significant pollution factors.';
  if (aqi <= 300) return 'Very poor air quality with high pollution from multiple sources.';
  return 'Hazardous air quality due to severe pollution levels.';
}
