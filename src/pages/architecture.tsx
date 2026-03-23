import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { MermaidDiagram } from '@/components/architecture/mermaid-diagram';
import { SYSTEM_ARCHITECTURE, AI_PREDICTION_FLOW, DATA_FLOW, API_CALLS } from '@/lib/architecture-diagrams';
import { Network, Brain, GitBranch, Plug } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Hero */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-3 text-sm px-4 py-1">Interactive Diagrams</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            System Architecture
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zoom, pan, and expand each diagram. Scroll to zoom, drag to pan, click expand for full-screen view.
          </p>
        </div>

        <MermaidDiagram
          id="system-architecture"
          title="System Architecture"
          description="Full-stack overview: frontend pages, hooks, libraries, backend edge functions, database, and external APIs"
          chart={SYSTEM_ARCHITECTURE}
          icon={<Network className="h-5 w-5" />}
          badge="Overview"
        />

        <MermaidDiagram
          id="ai-prediction-flow"
          title="AI Prediction Pipeline"
          description="Step-by-step sequence from user click to AI-powered XGBoost forecast with deterministic fallback"
          chart={AI_PREDICTION_FLOW}
          icon={<Brain className="h-5 w-5" />}
          badge="Sequence"
        />

        <MermaidDiagram
          id="data-flow"
          title="Data Flow Pipelines"
          description="Real-time AQI ingestion, 11-year AI forecast, 7-day local forecast, and authentication flows"
          chart={DATA_FLOW}
          icon={<GitBranch className="h-5 w-5" />}
          badge="Flowchart"
        />

        <MermaidDiagram
          id="api-calls"
          title="API Calls Reference"
          description="Every frontend-to-backend call: edge functions, database queries, auth calls, and external API endpoints"
          chart={API_CALLS}
          icon={<Plug className="h-5 w-5" />}
          badge="Reference"
        />
      </main>
    </div>
  );
}
