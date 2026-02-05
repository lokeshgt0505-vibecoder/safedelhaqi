import { TrendingUp, TrendingDown, Leaf, Factory, Car, Cloud, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendExplanationProps {
  trend: 'improving' | 'stable' | 'declining';
  currentAqi: number;
  predictedAqi: number;
  stationId: string;
  className?: string;
}

interface TrendReason {
  icon: React.ReactNode;
  text: string;
}

function getImprovingReasons(currentAqi: number, predictedAqi: number, stationId: string): TrendReason[] {
  const reasons: TrendReason[] = [];
  const aqiDiff = currentAqi - predictedAqi;
  
  // Always show if predicted is lower than current
  if (predictedAqi < currentAqi) {
    reasons.push({
      icon: <TrendingDown className="h-3.5 w-3.5" />,
      text: `Predicted AQI (${predictedAqi}) is ${aqiDiff} points lower than current levels`
    });
  }

  // Station-specific reasons based on characteristics
  const stationLower = stationId.toLowerCase();
  
  if (stationLower.includes('nehru') || stationLower.includes('lodhi') || stationLower.includes('siri')) {
    reasons.push({
      icon: <Leaf className="h-3.5 w-3.5" />,
      text: 'Green cover influence is expected to increase air purification'
    });
  }
  
  if (stationLower.includes('anand') || stationLower.includes('ito') || stationLower.includes('punjabi')) {
    reasons.push({
      icon: <Car className="h-3.5 w-3.5" />,
      text: 'Traffic management improvements are projected to reduce emissions'
    });
  }
  
  if (stationLower.includes('narela') || stationLower.includes('bawana') || stationLower.includes('wazirpur')) {
    reasons.push({
      icon: <Factory className="h-3.5 w-3.5" />,
      text: 'Industrial emission controls are expected to take effect'
    });
  }

  // Add weather/policy reason if we have less than 3
  if (reasons.length < 3) {
    reasons.push({
      icon: <Cloud className="h-3.5 w-3.5" />,
      text: 'Policy interventions and seasonal patterns favor better air quality'
    });
  }

  return reasons.slice(0, 4);
}

function getDecliningReasons(currentAqi: number, predictedAqi: number, stationId: string): TrendReason[] {
  const reasons: TrendReason[] = [];
  const aqiDiff = predictedAqi - currentAqi;
  
  // Always show if predicted is higher than current
  if (predictedAqi > currentAqi) {
    reasons.push({
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      text: `Predicted AQI (${predictedAqi}) is ${aqiDiff} points higher than current levels`
    });
  }

  // Station-specific reasons based on characteristics
  const stationLower = stationId.toLowerCase();
  
  if (stationLower.includes('anand') || stationLower.includes('ito') || stationLower.includes('punjabi') || stationLower.includes('ashok')) {
    reasons.push({
      icon: <Car className="h-3.5 w-3.5" />,
      text: 'Traffic congestion is projected to increase in this zone'
    });
  }
  
  if (stationLower.includes('narela') || stationLower.includes('bawana') || stationLower.includes('wazirpur') || stationLower.includes('okhla')) {
    reasons.push({
      icon: <Factory className="h-3.5 w-3.5" />,
      text: 'Industrial activity growth expected to add particulate matter'
    });
  }

  // Add urbanization/construction reason
  if (reasons.length < 3) {
    reasons.push({
      icon: <Cloud className="h-3.5 w-3.5" />,
      text: 'Urban development and construction activities increasing dust levels'
    });
  }

  return reasons.slice(0, 4);
}

export function TrendExplanation({ trend, currentAqi, predictedAqi, stationId, className }: TrendExplanationProps) {
  if (trend === 'stable') {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Future Outlook
        </p>
        <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 text-xs">
          <Minus className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <span className="text-foreground/90">No significant change expected in air quality levels</span>
        </div>
      </div>
    );
  }

  const isImproving = trend === 'improving';
  const reasons = isImproving 
    ? getImprovingReasons(currentAqi, predictedAqi, stationId)
    : getDecliningReasons(currentAqi, predictedAqi, stationId);

  const bgColor = isImproving ? 'bg-green-500/10' : 'bg-red-500/10';
  const textColor = isImproving 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {isImproving ? 'Why It Is Improving' : 'Why It Is Declining'}
      </p>
      <div className="space-y-1.5">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className={cn('flex items-start gap-2 p-1.5 rounded text-xs', bgColor)}
          >
            <div className={cn('mt-0.5 flex-shrink-0', textColor)}>
              {reason.icon}
            </div>
            <span className="text-foreground/90 leading-tight">{reason.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
