import { ModelMetrics, FeatureImportanceItem } from '@/types/forecast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, BarChart3, Target, TrendingUp } from 'lucide-react';

interface ModelMetricsPanelProps {
  metrics?: ModelMetrics;
  featureImportance?: FeatureImportanceItem[];
}

export function ModelMetricsPanel({ metrics, featureImportance }: ModelMetricsPanelProps) {
  if (!metrics && !featureImportance) return null;

  return (
    <div className="space-y-4">
      {/* Model Performance Card */}
      {metrics && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              XGBoost Model Performance
            </CardTitle>
            <CardDescription>
              Gradient Boosting Regressor — {metrics.nEstimators || 500} trees, depth {metrics.maxDepth || 6}, lr {metrics.learningRate || 0.05}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label="RMSE"
                value={metrics.rmse.toFixed(2)}
                description="Root Mean Square Error"
                icon={<Target className="h-4 w-4" />}
                quality={metrics.rmse < 30 ? 'good' : metrics.rmse < 50 ? 'moderate' : 'poor'}
              />
              <MetricCard
                label="MAE"
                value={metrics.mae.toFixed(2)}
                description="Mean Absolute Error"
                icon={<BarChart3 className="h-4 w-4" />}
                quality={metrics.mae < 20 ? 'good' : metrics.mae < 40 ? 'moderate' : 'poor'}
              />
              <MetricCard
                label="R² Score"
                value={metrics.r2Score.toFixed(3)}
                description="Coefficient of Determination"
                icon={<TrendingUp className="h-4 w-4" />}
                quality={metrics.r2Score > 0.85 ? 'good' : metrics.r2Score > 0.7 ? 'moderate' : 'poor'}
              />
            </div>
            {(metrics.trainingSize || metrics.testSize) && (
              <p className="text-xs text-muted-foreground mt-3">
                Train/Test split: {metrics.trainingSize || '—'} / {metrics.testSize || '—'} samples
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Importance Card */}
      {featureImportance && featureImportance.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Feature Importance
            </CardTitle>
            <CardDescription>
              Top features ranked by XGBoost gain-based importance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {featureImportance.slice(0, 8).map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium truncate max-w-[200px]">
                      {feat.feature}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {feat.importance.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={feat.importance} className="h-1.5" />
                  {feat.description && (
                    <p className="text-xs text-muted-foreground">{feat.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, description, icon, quality }: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  quality: 'good' | 'moderate' | 'poor';
}) {
  const qualityColors = {
    good: 'text-green-500 border-green-500/30 bg-green-500/10',
    moderate: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    poor: 'text-red-500 border-red-500/30 bg-red-500/10',
  };

  return (
    <div className={`rounded-lg border p-3 text-center ${qualityColors[quality]}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{description}</p>
    </div>
  );
}
