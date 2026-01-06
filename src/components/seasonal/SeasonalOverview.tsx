import { SeasonalAnalysis } from '@/hooks/useSeasonalAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface SeasonalOverviewProps {
  analysis: SeasonalAnalysis;
}

const SEASON_COLORS: Record<string, string> = {
  Winter: 'hsl(210, 70%, 50%)',
  Spring: 'hsl(120, 60%, 45%)',
  Summer: 'hsl(45, 90%, 50%)',
  Monsoon: 'hsl(180, 60%, 45%)',
};

const SEASON_ICONS: Record<string, string> = {
  Winter: '❄️',
  Spring: '🌸',
  Summer: '☀️',
  Monsoon: '🌧️',
};

function getZoneBadgeVariant(zone: string): 'default' | 'secondary' | 'destructive' {
  switch (zone) {
    case 'blue': return 'default';
    case 'yellow': return 'secondary';
    case 'red': return 'destructive';
    default: return 'default';
  }
}

export function SeasonalOverview({ analysis }: SeasonalOverviewProps) {
  const radarData = analysis.cityWideSeasonal.map(season => ({
    season: season.season,
    aqi: season.avgAqi,
    fullMark: 400,
  }));

  const pieData = analysis.cityWideSeasonal.map(season => ({
    name: season.season,
    value: 400 - season.avgAqi, // Invert for better visualization
    aqi: season.avgAqi,
    color: SEASON_COLORS[season.season],
  }));

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysis.bestMonthsOverall.map((month, i) => (
          <Card key={month.month} className={i === 0 ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <Badge variant={i === 0 ? 'default' : 'secondary'}>
                  AQI: {month.avgAqi}
                </Badge>
              </div>
              <p className="font-semibold">{month.month}</p>
              <p className="text-sm text-muted-foreground">{month.recommendation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seasonal Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analysis.cityWideSeasonal.map(season => (
          <Card key={season.season} className="relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ backgroundColor: SEASON_COLORS[season.season] }}
            />
            <CardContent className="p-4 relative">
              <div className="text-center">
                <span className="text-3xl">{SEASON_ICONS[season.season]}</span>
                <p className="font-semibold mt-2">{season.season}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: SEASON_COLORS[season.season] }}>
                  {season.avgAqi}
                </p>
                <Badge variant={getZoneBadgeVariant(season.zone)} className="mt-2">
                  {season.outdoorRating}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Seasonal AQI Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="season" />
                  <PolarRadiusAxis angle={30} domain={[0, 400]} />
                  <Radar
                    name="AQI"
                    dataKey="aqi"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-semibold">{data.season}</p>
                          <p className="text-sm">Avg AQI: {data.aqi}</p>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Air Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">Avg AQI: {data.aqi}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
