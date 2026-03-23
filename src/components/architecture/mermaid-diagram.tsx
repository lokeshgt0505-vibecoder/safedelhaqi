import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MermaidDiagramProps {
  id: string;
  title: string;
  description: string;
  chart: string;
  icon: React.ReactNode;
  badge?: string;
}

let mermaidInitialized = false;

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
      padding: 20,
      nodeSpacing: 30,
      rankSpacing: 50,
    },
    sequence: {
      useMaxWidth: true,
      actorMargin: 40,
      messageMargin: 30,
      boxMargin: 10,
      noteMargin: 10,
    },
  });
  mermaidInitialized = true;
}

export function MermaidDiagram({ id, title, description, chart, icon, badge }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = document.documentElement.classList.contains('dark');

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      setError(null);
      initMermaid(isDark);
      const uniqueId = `mermaid-${id}-${Date.now()}`;
      containerRef.current.innerHTML = '';
      const { svg } = await mermaid.render(uniqueId, chart);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        // Make SVG responsive
        const svgEl = containerRef.current.querySelector('svg');
        if (svgEl) {
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
          svgEl.removeAttribute('height');
        }
        setRendered(true);
      }
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  }, [id, chart, isDark]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wrapperClass = isExpanded
    ? 'fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col'
    : '';

  return (
    <div className={wrapperClass}>
      <Card className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'flex-1 flex flex-col m-4 border-primary/30' : 'border-border'
      )}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {title}
                  {badge && <Badge variant="secondary" className="text-xs font-normal">{badge}</Badge>}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadSVG} title="Download SVG">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsExpanded(!isExpanded); handleReset(); }} title={isExpanded ? 'Collapse' : 'Expand'}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Diagram */}
        <CardContent className={cn('p-0', isExpanded ? 'flex-1 overflow-hidden' : '')}>
          {error ? (
            <div className="flex items-center justify-center p-8 text-destructive text-sm">
              <p>Failed to render diagram: {error}</p>
            </div>
          ) : (
            <div
              className={cn(
                'overflow-hidden border-t border-border bg-muted/30',
                isExpanded ? 'h-full' : 'max-h-[500px]',
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="transition-transform duration-75 origin-center p-6"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  minHeight: isExpanded ? '100%' : '300px',
                }}
              >
                <div ref={containerRef} className="flex items-center justify-center" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
