import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface YearSliderProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearSlider({ years, selectedYear, onYearChange }: YearSliderProps) {
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  const handleSliderChange = (value: number[]) => {
    onYearChange(value[0]);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
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
