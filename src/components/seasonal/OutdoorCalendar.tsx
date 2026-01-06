import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarEntry {
  month: string;
  rating: string;
  activities: string[];
  precautions: string[];
}

interface OutdoorCalendarProps {
  calendar: CalendarEntry[];
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'excellent': return 'bg-green-500';
    case 'good': return 'bg-emerald-400';
    case 'moderate': return 'bg-yellow-500';
    case 'poor': return 'bg-orange-500';
    case 'hazardous': return 'bg-red-600';
    default: return 'bg-gray-500';
  }
}

function getRatingBgClass(rating: string): string {
  switch (rating) {
    case 'excellent': return 'border-green-500/30 bg-green-500/5';
    case 'good': return 'border-emerald-400/30 bg-emerald-400/5';
    case 'moderate': return 'border-yellow-500/30 bg-yellow-500/5';
    case 'poor': return 'border-orange-500/30 bg-orange-500/5';
    case 'hazardous': return 'border-red-600/30 bg-red-600/5';
    default: return '';
  }
}

function getRatingEmoji(rating: string): string {
  switch (rating) {
    case 'excellent': return '🌟';
    case 'good': return '😊';
    case 'moderate': return '😐';
    case 'poor': return '😷';
    case 'hazardous': return '☠️';
    default: return '';
  }
}

export function OutdoorCalendar({ calendar }: OutdoorCalendarProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🗓️ Outdoor Activity Guide</h3>
          <p className="text-sm text-muted-foreground">
            Plan your outdoor activities based on historical air quality patterns. 
            Best months are marked with green, while red indicates periods to limit outdoor exposure.
          </p>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendar.map((entry) => (
            <Card key={entry.month} className={`${getRatingBgClass(entry.rating)} transition-all hover:shadow-lg`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getRatingEmoji(entry.rating)}
                    {entry.month}
                  </CardTitle>
                  <Badge className={`${getRatingColor(entry.rating)} text-white`}>
                    {entry.rating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Recommended Activities */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Recommended Activities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {entry.activities.map((activity, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Precautions
                  </p>
                  <ul className="text-xs space-y-1">
                    {entry.precautions.map((precaution, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-muted-foreground">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Rating Guide</p>
          <div className="flex flex-wrap gap-3">
            {['excellent', 'good', 'moderate', 'poor', 'hazardous'].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getRatingColor(rating)}`} />
                <span className="text-xs capitalize">{rating}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
