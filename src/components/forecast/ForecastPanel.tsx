import { useState } from 'react';
import { ForecastData } from '@/types/forecast';
import { ForecastChart } from './ForecastChart';
import { ForecastStationList } from './ForecastStationList';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">5-Year AQI Forecast</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered predictions for Delhi NCR livability zones
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Station List */}
            <div className="lg:col-span-1">
              <ForecastStationList
                forecast={forecast}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                selectedYear={selectedYear}
                onSelectYear={setSelectedYear}
              />
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 overflow-y-auto">
              <ForecastChart
                forecast={forecast}
                selectedStationId={selectedStationId || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
