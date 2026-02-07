import { useEffect, useRef } from 'react';
import { StationForecastResult } from '@/lib/forecasting-engine';
import { LIVABILITY_COLORS } from '@/types/livability';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TrendingUp, TrendingDown, Minus, Info, X } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { AQIContributors } from '@/components/aqi-contributors';
import { TrendExplanation } from '@/components/trend-explanation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivabilitySidePanelProps {
  forecast: StationForecastResult | null;
  onClose: () => void;
}

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    case 'declining':
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-yellow-500" />;
  }
}

function getAqiCategory(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Satisfactory', color: '#84cc16' };
  if (aqi <= 200) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 300) return { label: 'Poor', color: '#f97316' };
  if (aqi <= 400) return { label: 'Very Poor', color: '#ef4444' };
  return { label: 'Severe', color: '#7f1d1d' };
}

function MiniChart({ data }: { data: Array<{ year: number; aqi: number; type: string }> }) {
  return (
    <div className="w-full h-36">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <RechartsTooltip 
            contentStyle={{ fontSize: 11, padding: '4px 8px' }}
            labelStyle={{ fontSize: 10 }}
            formatter={(value: number) => [value, 'AQI']}
          />
          <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="3 3" />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="aqi" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle
                key={`dot-${payload.year}`}
                cx={cx}
                cy={cy}
                r={payload.type === 'forecast' ? 5 : 3}
                fill={payload.type === 'forecast' ? '#8b5cf6' : '#3b82f6'}
                stroke={payload.type === 'forecast' ? '#7c3aed' : '#2563eb'}
                strokeWidth={1}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PanelContent({ forecast, onClose }: LivabilitySidePanelProps) {
  if (!forecast) return null;

  const chartData = [
    ...forecast.historicalData.map(h => ({ 
      year: h.year, 
      aqi: h.avgAqi, 
      type: 'historical' 
    })),
    ...forecast.forecasts.map(f => ({ 
      year: f.year, 
      aqi: f.predictedAqi, 
      type: 'forecast' 
    })),
  ];

  const currentAqi = forecast.historicalData[forecast.historicalData.length - 1]?.avgAqi || 0;
  const predictedAqi = forecast.forecasts[0]?.predictedAqi || 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h3 className="font-bold text-base">{forecast.stationName}</h3>
          <span className="text-xs text-muted-foreground capitalize">
            {forecast.stationType} area
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Score Badge */}
          <div className="flex items-center justify-between">
            <span 
              className="px-3 py-1.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: LIVABILITY_COLORS[forecast.livabilityClass].fill }}
            >
              Score: {forecast.livabilityScore}/100
            </span>
            <div className="flex items-center gap-1">
              <TrendIcon trend={forecast.overallTrend} />
              <span className="text-xs capitalize">{forecast.overallTrend}</span>
            </div>
          </div>

          {/* Livability Classification */}
          <div 
            className="flex items-center gap-2 p-3 rounded-lg" 
            style={{ backgroundColor: `${LIVABILITY_COLORS[forecast.livabilityClass].fill}15` }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LIVABILITY_COLORS[forecast.livabilityClass].fill }}
            />
            <span className="font-semibold text-sm">
              {LIVABILITY_COLORS[forecast.livabilityClass].label}
            </span>
          </div>

          {/* Chart */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Historical + 5-Year Forecast
            </p>
            <MiniChart data={chartData} />
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>Historical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>Predicted
              </span>
            </div>
          </div>

          {/* 5-Year Forecast Details */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">5-Year AQI Forecast</p>
            <div className="space-y-2">
              {forecast.forecasts.map(f => {
                const category = getAqiCategory(f.predictedAqi);
                return (
                  <div key={f.year} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{f.year}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{f.predictedAqi}</span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-white text-[10px]"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.label}
                      </span>
                      <span className="text-muted-foreground">
                        ({Math.round(f.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AQI Contributing Factors */}
          <div className="border-t border-border pt-4">
            <AQIContributors 
              stationId={forecast.stationId} 
              aqi={forecast.forecasts[0]?.predictedAqi || 0} 
              trend={forecast.overallTrend}
            />
          </div>

          {/* Trend Explanation */}
          <div className="border-t border-border pt-4">
            <TrendExplanation
              trend={forecast.overallTrend}
              currentAqi={currentAqi}
              predictedAqi={predictedAqi}
              stationId={forecast.stationId}
            />
          </div>

          {/* Suitability Answer */}
          <div 
            className="p-3 rounded-lg border-2" 
            style={{ 
              borderColor: LIVABILITY_COLORS[forecast.livabilityClass].fill,
              backgroundColor: `${LIVABILITY_COLORS[forecast.livabilityClass].fill}10`
            }}
          >
            <p className="text-xs font-semibold mb-1">
              Is this place suitable for the next 5 years?
            </p>
            <p 
              className="text-sm font-bold" 
              style={{ color: LIVABILITY_COLORS[forecast.livabilityClass].fill }}
            >
              {forecast.livabilityClass === 'highly-livable' 
                ? '✓ Yes, Recommended' 
                : forecast.livabilityClass === 'moderately-livable'
                ? '△ Yes, with precautions'
                : '✗ Not Recommended'}
            </p>
          </div>

          {/* Recommendation */}
          <div className="p-3 bg-muted rounded-lg text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">{forecast.recommendation}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

export function LivabilitySidePanel({ forecast, onClose }: LivabilitySidePanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside and escape key to close
  useEffect(() => {
    if (!forecast) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Close if clicked on map or empty area
        if (target.closest('.leaflet-container') || !target.closest('[data-radix-popper-content-wrapper]')) {
          onClose();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding click listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [forecast, onClose]);

  if (!forecast) return null;

  // Mobile/Tablet: render as bottom sheet overlay
  if (isMobile) {
    return (
      <Sheet open={!!forecast} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>{forecast.stationName} Livability Details</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full overflow-hidden">
            <PanelContent forecast={forecast} onClose={onClose} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as fixed right sidebar below header (h-16 = 4rem = 64px)
  return (
    <div 
      ref={panelRef}
      className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-card border-l border-border shadow-2xl z-[1001] flex flex-col animate-in slide-in-from-right duration-200"
    >
      <PanelContent forecast={forecast} onClose={onClose} />
    </div>
  );
}
