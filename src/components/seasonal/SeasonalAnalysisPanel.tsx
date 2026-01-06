import { useState } from 'react';
import { SeasonalAnalysis } from '@/hooks/useSeasonalAnalysis';
import { MonthlyPatternChart } from './MonthlyPatternChart';
import { SeasonalOverview } from './SeasonalOverview';
import { OutdoorCalendar } from './OutdoorCalendar';
import { StationSeasonalView } from './StationSeasonalView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Calendar, BarChart3, MapPin, Sun } from 'lucide-react';

interface SeasonalAnalysisPanelProps {
  analysis: SeasonalAnalysis;
  onClose: () => void;
}

export function SeasonalAnalysisPanel({ analysis, onClose }: SeasonalAnalysisPanelProps) {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    analysis.stations[0]?.stationId || null
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Sun className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Seasonal AQI Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Monthly patterns & best times for outdoor activities
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Monthly</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Activities</span>
                </TabsTrigger>
                <TabsTrigger value="stations" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Stations</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="overview" className="mt-0 h-full">
                <SeasonalOverview analysis={analysis} />
              </TabsContent>

              <TabsContent value="monthly" className="mt-0 h-full">
                <MonthlyPatternChart 
                  monthlyPatterns={analysis.cityWideMonthly}
                  title="City-Wide Monthly AQI Patterns"
                />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0 h-full">
                <OutdoorCalendar calendar={analysis.outdoorActivityCalendar} />
              </TabsContent>

              <TabsContent value="stations" className="mt-0 h-full">
                <StationSeasonalView
                  stations={analysis.stations}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
