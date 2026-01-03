import { AQILevel, AQIInfo, HealthAdvisory } from '@/types/aqi';

// Delhi NCR monitoring stations with coordinates
export const DELHI_STATIONS = [
  { id: 'delhi-anand-vihar', name: 'Anand Vihar', lat: 28.6469, lng: 77.3160 },
  { id: 'delhi-ito', name: 'ITO', lat: 28.6289, lng: 77.2405 },
  { id: 'delhi-mandir-marg', name: 'Mandir Marg', lat: 28.6369, lng: 77.2010 },
  { id: 'delhi-punjabi-bagh', name: 'Punjabi Bagh', lat: 28.6683, lng: 77.1167 },
  { id: 'delhi-r-k-puram', name: 'R.K. Puram', lat: 28.5633, lng: 77.1861 },
  { id: 'delhi-shadipur', name: 'Shadipur', lat: 28.6519, lng: 77.1478 },
  { id: 'delhi-dwarka-sec-8', name: 'Dwarka Sector 8', lat: 28.5708, lng: 77.0711 },
  { id: 'delhi-ashok-vihar', name: 'Ashok Vihar', lat: 28.6950, lng: 77.1817 },
  { id: 'delhi-bawana', name: 'Bawana', lat: 28.7761, lng: 77.0511 },
  { id: 'delhi-jawaharlal-nehru-stadium', name: 'JLN Stadium', lat: 28.5833, lng: 77.2333 },
  { id: 'delhi-lodhi-road', name: 'Lodhi Road', lat: 28.5918, lng: 77.2273 },
  { id: 'delhi-major-dhyan-chand-stadium', name: 'Major Dhyan Chand Stadium', lat: 28.6117, lng: 77.2378 },
  { id: 'delhi-mathura-road', name: 'Mathura Road', lat: 28.5558, lng: 77.2506 },
  { id: 'delhi-mundka', name: 'Mundka', lat: 28.6833, lng: 77.0333 },
  { id: 'delhi-narela', name: 'Narela', lat: 28.8528, lng: 77.0928 },
  { id: 'delhi-nehru-nagar', name: 'Nehru Nagar', lat: 28.5678, lng: 77.2500 },
  { id: 'delhi-north-campus', name: 'North Campus DU', lat: 28.6879, lng: 77.2089 },
  { id: 'delhi-okhla', name: 'Okhla', lat: 28.5310, lng: 77.2690 },
  { id: 'delhi-patparganj', name: 'Patparganj', lat: 28.6236, lng: 77.2878 },
  { id: 'delhi-pusa', name: 'PUSA', lat: 28.6400, lng: 77.1467 },
  { id: 'delhi-rohini', name: 'Rohini', lat: 28.7328, lng: 77.1089 },
  { id: 'delhi-siri-fort', name: 'Siri Fort', lat: 28.5503, lng: 77.2156 },
  { id: 'delhi-sonia-vihar', name: 'Sonia Vihar', lat: 28.7108, lng: 77.2489 },
  { id: 'delhi-vivek-vihar', name: 'Vivek Vihar', lat: 28.6722, lng: 77.3156 },
  { id: 'delhi-wazirpur', name: 'Wazirpur', lat: 28.6989, lng: 77.1658 },
];

// Get AQI level and info based on AQI value
export function getAQIInfo(aqi: number): AQIInfo {
  if (aqi <= 50) {
    return {
      level: 'good',
      label: 'Good',
      description: 'Air quality is satisfactory',
      color: 'hsl(var(--aqi-good))',
      bgColor: 'bg-aqi-good',
      healthImplications: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      cautionaryStatement: 'None',
    };
  } else if (aqi <= 100) {
    return {
      level: 'satisfactory',
      label: 'Satisfactory',
      description: 'Acceptable air quality',
      color: 'hsl(var(--aqi-satisfactory))',
      bgColor: 'bg-aqi-satisfactory',
      healthImplications: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
      cautionaryStatement: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
    };
  } else if (aqi <= 150) {
    return {
      level: 'moderate',
      label: 'Moderate',
      description: 'May cause breathing discomfort',
      color: 'hsl(var(--aqi-moderate))',
      bgColor: 'bg-aqi-moderate',
      healthImplications: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease should limit prolonged outdoor exertion.',
    };
  } else if (aqi <= 200) {
    return {
      level: 'poor',
      label: 'Poor',
      description: 'Breathing discomfort likely',
      color: 'hsl(var(--aqi-poor))',
      bgColor: 'bg-aqi-poor',
      healthImplications: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease should avoid prolonged outdoor exertion.',
    };
  } else if (aqi <= 300) {
    return {
      level: 'very-poor',
      label: 'Very Poor',
      description: 'Respiratory illness likely',
      color: 'hsl(var(--aqi-very-poor))',
      bgColor: 'bg-aqi-very-poor',
      healthImplications: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
      cautionaryStatement: 'Everyone should avoid all outdoor exertion.',
    };
  } else {
    return {
      level: 'hazardous',
      label: 'Hazardous',
      description: 'Serious health effects',
      color: 'hsl(var(--aqi-hazardous))',
      bgColor: 'bg-aqi-hazardous',
      healthImplications: 'Health alert: everyone may experience more serious health effects.',
      cautionaryStatement: 'Everyone should avoid all outdoor physical activity.',
    };
  }
}

// Get zone classification based on AQI
export function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

// Get zone info
export function getZoneInfo(zone: 'blue' | 'yellow' | 'red') {
  const zoneMap = {
    blue: {
      label: 'Blue Zone',
      description: 'Safe for all - Good air quality',
      recommendation: 'Excellent for residential living and outdoor activities',
    },
    yellow: {
      label: 'Yellow Zone',
      description: 'Caution advised - Moderate air quality',
      recommendation: 'Consider air purifiers for sensitive individuals',
    },
    red: {
      label: 'Red Zone',
      description: 'Health risk - Poor air quality',
      recommendation: 'Not recommended for long-term residence without precautions',
    },
  };
  return zoneMap[zone];
}

// Get health advisory based on AQI
export function getHealthAdvisory(aqi: number): HealthAdvisory {
  if (aqi <= 50) {
    return {
      general: 'Air quality is ideal for most activities.',
      sensitiveGroups: 'No precautions needed.',
      outdoor: 'Great day for outdoor exercise and activities.',
      indoor: 'Open windows for fresh air.',
      mask: 'No mask required.',
    };
  } else if (aqi <= 100) {
    return {
      general: 'Air quality is acceptable for most people.',
      sensitiveGroups: 'Unusually sensitive people may want to reduce prolonged outdoor exertion.',
      outdoor: 'Good for outdoor activities with minor precautions.',
      indoor: 'Normal activities recommended.',
      mask: 'Optional for sensitive individuals.',
    };
  } else if (aqi <= 150) {
    return {
      general: 'Moderate health concern for sensitive groups.',
      sensitiveGroups: 'People with respiratory conditions, elderly, and children should limit outdoor exposure.',
      outdoor: 'Reduce prolonged outdoor exertion.',
      indoor: 'Consider running air purifiers.',
      mask: 'N95 mask recommended for prolonged outdoor exposure.',
    };
  } else if (aqi <= 200) {
    return {
      general: 'Unhealthy for sensitive groups, concerning for all.',
      sensitiveGroups: 'Avoid outdoor activities. Keep medications handy.',
      outdoor: 'Avoid prolonged outdoor exertion.',
      indoor: 'Keep windows closed. Use air purifiers.',
      mask: 'N95/N99 mask required outdoors.',
    };
  } else if (aqi <= 300) {
    return {
      general: 'Health alert - everyone may experience effects.',
      sensitiveGroups: 'Stay indoors. Seek medical attention if symptoms occur.',
      outdoor: 'Avoid all outdoor activities.',
      indoor: 'Keep all windows and doors sealed. Run air purifiers on high.',
      mask: 'N95/N99 mask essential for any outdoor exposure.',
    };
  } else {
    return {
      general: 'Health emergency - serious risk to all.',
      sensitiveGroups: 'Emergency conditions. Stay indoors at all times.',
      outdoor: 'Do not go outdoors under any circumstances.',
      indoor: 'Seal all openings. Use maximum air filtration.',
      mask: 'Avoid any outdoor exposure. If unavoidable, use N99 or P100 respirator.',
    };
  }
}

// Format AQI value
export function formatAQI(aqi: number | string): number {
  if (typeof aqi === 'string') {
    if (aqi === '-' || aqi === '') return 0;
    return parseInt(aqi, 10) || 0;
  }
  return Math.round(aqi);
}
