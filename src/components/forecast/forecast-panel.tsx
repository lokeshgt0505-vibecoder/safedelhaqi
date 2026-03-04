import { useState } from 'react';
import { ForecastData } from '@/types/forecast';
import { ForecastChart } from './forecast-chart';
import { ForecastStationList } from './forecast-station-list';
import { ForecastExport } from './forecast-export';
import { ModelMetricsPanel } from './model-metrics-panel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Brain, BarChart3, Map } from 'lucide-react';

interface ForecastPanelProps {
  forecast: ForecastData;
  onClose: () => void;
}

export function ForecastPanel({ forecast, onClose }: ForecastPanelProps) {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    forecast.forecasts[0]?.stationId || null
  );
  const [selectedYear, setSelectedYear] = useState(
    forecast.forecasts[0]?.yearlyPredictions[0]?.year || new Date().getFullYear()
  );

  const hasMLMetrics = !!forecast.modelMetrics || (forecast.featureImportance && forecast.featureImportance.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered AQI Forecast
            </h2>
            <p className="text-sm text-muted-foreground">
              XGBoost ML pipeline — {forecast.forecasts[0]?.yearlyPredictions?.length || 5}-year predictions with 95% confidence intervals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ForecastExport forecast={forecast} />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {hasMLMetrics ? (
            <Tabs defaultValue="forecast" className="h-full flex flex-col">
              <TabsList className="mb-3">
                <TabsTrigger value="forecast" className="flex items-center gap-1.5">
                  <Map className="h-4 w-4" />
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="model" className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  ML Model
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forecast" className="flex-1 overflow-hidden mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  <div className="lg:col-span-1">
                    <ForecastStationList
                      forecast={forecast}
                      selectedStationId={selectedStationId}
                      onSelectStation={setSelectedStationId}
                      selectedYear={selectedYear}
                      onSelectYear={setSelectedYear}
                    />
                  </div>
                  <div className="lg:col-span-2 overflow-y-auto">
                    <ForecastChart
                      forecast={forecast}
                      selectedStationId={selectedStationId || undefined}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="model" className="flex-1 overflow-y-auto mt-0">
                <ModelMetricsPanel
                  metrics={forecast.modelMetrics}
                  featureImportance={forecast.featureImportance}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <div className="lg:col-span-1">
                <ForecastStationList
                  forecast={forecast}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                  selectedYear={selectedYear}
                  onSelectYear={setSelectedYear}
                />
              </div>
              <div className="lg:col-span-2 overflow-y-auto">
                <ForecastChart
                  forecast={forecast}
                  selectedStationId={selectedStationId || undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
