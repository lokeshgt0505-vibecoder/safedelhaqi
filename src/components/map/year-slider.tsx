import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface YearSliderProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  compact?: boolean;
}

export function YearSlider({ years, selectedYear, onYearChange, compact = false }: YearSliderProps) {
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  const handleSliderChange = (value: number[]) => {
    onYearChange(value[0]);
  };

  // Compact inline version for header integration
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Year:</span>
        <div className="flex items-center gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                year === selectedYear 
                  ? 'bg-primary text-primary-foreground font-semibold' 
                  : 'hover:bg-muted-foreground/20 text-muted-foreground'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full slider version (for panel integration)
  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-sm p-3 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Forecast Year</span>
        </div>
        <Badge variant="outline" className="font-mono font-bold">
          {selectedYear}
        </Badge>
      </div>
      
      <Slider
        value={[selectedYear]}
        onValueChange={handleSliderChange}
        min={minYear}
        max={maxYear}
        step={1}
        className="w-full"
      />
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {years.map((year) => (
          <span
            key={year}
            className={year === selectedYear ? 'text-primary font-semibold' : ''}
          >
            {year}
          </span>
        ))}
      </div>
    </div>
  );
}
