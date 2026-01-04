import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Historical AQI data for Delhi stations (simulated multi-year data based on real patterns)
const HISTORICAL_DATA = {
  // Seasonal patterns: Winter (Nov-Feb) worst, Monsoon (Jul-Sep) best
  seasonal_multipliers: {
    jan: 1.4, feb: 1.3, mar: 1.1, apr: 0.9, may: 0.85,
    jun: 0.75, jul: 0.6, aug: 0.55, sep: 0.65, oct: 0.9,
    nov: 1.5, dec: 1.6
  },
  // Year-over-year trend (slight improvement due to policies)
  yearly_trend: -0.02, // 2% improvement per year
  // Base AQI by station type
  station_profiles: {
    industrial: { base: 220, variance: 50 },
    residential: { base: 160, variance: 40 },
    commercial: { base: 180, variance: 45 },
    green: { base: 120, variance: 30 }
  },
  // Station classifications
  stations: {
    'delhi-anand-vihar': { type: 'industrial', name: 'Anand Vihar' },
    'delhi-ito': { type: 'commercial', name: 'ITO' },
    'delhi-mandir-marg': { type: 'residential', name: 'Mandir Marg' },
    'delhi-punjabi-bagh': { type: 'residential', name: 'Punjabi Bagh' },
    'delhi-r-k-puram': { type: 'residential', name: 'R.K. Puram' },
    'delhi-shadipur': { type: 'industrial', name: 'Shadipur' },
    'delhi-dwarka-sec-8': { type: 'green', name: 'Dwarka Sector 8' },
    'delhi-ashok-vihar': { type: 'residential', name: 'Ashok Vihar' },
    'delhi-bawana': { type: 'industrial', name: 'Bawana' },
    'delhi-jawaharlal-nehru-stadium': { type: 'green', name: 'JLN Stadium' },
    'delhi-lodhi-road': { type: 'green', name: 'Lodhi Road' },
    'delhi-major-dhyan-chand-stadium': { type: 'green', name: 'Major Dhyan Chand Stadium' },
    'delhi-mathura-road': { type: 'commercial', name: 'Mathura Road' },
    'delhi-mundka': { type: 'industrial', name: 'Mundka' },
    'delhi-narela': { type: 'industrial', name: 'Narela' },
    'delhi-nehru-nagar': { type: 'residential', name: 'Nehru Nagar' },
    'delhi-north-campus': { type: 'green', name: 'North Campus DU' },
    'delhi-okhla': { type: 'industrial', name: 'Okhla' },
    'delhi-patparganj': { type: 'industrial', name: 'Patparganj' },
    'delhi-pusa': { type: 'green', name: 'PUSA' },
    'delhi-rohini': { type: 'residential', name: 'Rohini' },
    'delhi-siri-fort': { type: 'green', name: 'Siri Fort' },
    'delhi-sonia-vihar': { type: 'residential', name: 'Sonia Vihar' },
    'delhi-vivek-vihar': { type: 'industrial', name: 'Vivek Vihar' },
    'delhi-wazirpur': { type: 'industrial', name: 'Wazirpur' }
  }
};

function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}

function getZoneLabel(zone: 'blue' | 'yellow' | 'red'): string {
  switch (zone) {
    case 'blue': return 'Best for Living';
    case 'yellow': return 'Moderate - Caution Advised';
    case 'red': return 'Poor - Not Recommended';
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stations, currentYear = 2025 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate historical context for AI
    const stationData = stations.map((s: any) => {
      const profile = HISTORICAL_DATA.stations[s.id as keyof typeof HISTORICAL_DATA.stations] || 
        { type: 'residential', name: s.name };
      return {
        id: s.id,
        name: s.name || profile.name,
        currentAqi: s.aqi,
        type: profile.type,
        lat: s.lat,
        lng: s.lng
      };
    });

    // Use AI to generate intelligent forecasts
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an environmental scientist specializing in air quality forecasting for Delhi NCR. 
You analyze AQI patterns and predict future air quality based on:
- Historical seasonal patterns (Winter worst: Nov-Feb, Monsoon best: Jul-Sep)
- Urban development trends
- Policy implementations (odd-even, construction bans, stubble burning regulations)
- Climate change impacts
- Station type (industrial, residential, commercial, green areas)

Provide realistic AQI predictions considering:
- Industrial areas tend to have 30-50% higher AQI than green areas
- Year-over-year improvement of 1-3% due to policies
- Seasonal variation can cause 100-150 point swings
- Green zones near parks show 20-30% lower AQI

Return ONLY valid JSON with no markdown formatting.`
          },
          {
            role: "user",
            content: `Generate 5-year AQI forecast (${currentYear} to ${currentYear + 4}) for these Delhi stations:

${JSON.stringify(stationData, null, 2)}

For each station, predict:
1. Average annual AQI for each of the 5 years
2. Best month AQI and worst month AQI for each year
3. Zone classification (blue: ≤100, yellow: 101-200, red: >200)
4. Livability recommendation
5. Confidence level (0-100%)

Return JSON in this exact format:
{
  "forecasts": [
    {
      "stationId": "station-id",
      "stationName": "Station Name",
      "stationType": "industrial|residential|commercial|green",
      "yearlyPredictions": [
        {
          "year": 2025,
          "avgAqi": 185,
          "bestMonth": { "month": "August", "aqi": 95 },
          "worstMonth": { "month": "November", "aqi": 320 },
          "zone": "yellow",
          "livability": "Moderate - Air purifiers recommended",
          "confidence": 85
        }
      ],
      "trend": "improving|stable|declining",
      "recommendation": "Brief livability recommendation for real estate"
    }
  ],
  "cityOverview": {
    "avgAqiByYear": { "2025": 175, "2026": 170, ... },
    "overallTrend": "improving",
    "keyInsights": ["insight1", "insight2"]
  }
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_aqi_forecast",
              description: "Generate structured AQI forecasts for Delhi stations",
              parameters: {
                type: "object",
                properties: {
                  forecasts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        stationId: { type: "string" },
                        stationName: { type: "string" },
                        stationType: { type: "string" },
                        yearlyPredictions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              year: { type: "number" },
                              avgAqi: { type: "number" },
                              bestMonth: {
                                type: "object",
                                properties: {
                                  month: { type: "string" },
                                  aqi: { type: "number" }
                                }
                              },
                              worstMonth: {
                                type: "object",
                                properties: {
                                  month: { type: "string" },
                                  aqi: { type: "number" }
                                }
                              },
                              zone: { type: "string" },
                              livability: { type: "string" },
                              confidence: { type: "number" }
                            }
                          }
                        },
                        trend: { type: "string" },
                        recommendation: { type: "string" }
                      }
                    }
                  },
                  cityOverview: {
                    type: "object",
                    properties: {
                      avgAqiByYear: { type: "object" },
                      overallTrend: { type: "string" },
                      keyInsights: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                required: ["forecasts", "cityOverview"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_aqi_forecast" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const forecastData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(forecastData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from content if no tool call
    const content = aiResponse.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse AI response:", content);
      }
    }

    throw new Error("Invalid AI response format");

  } catch (error) {
    console.error("Forecast error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
