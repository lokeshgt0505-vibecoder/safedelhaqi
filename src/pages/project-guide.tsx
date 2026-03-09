import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Download, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getGuideMarkdown, getGuideHTML } from '@/lib/guide-content';

export default function ProjectGuide() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadMD = () => {
    setDownloading('md');
    try {
      const md = getGuideMarkdown();
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SafeDelhiAQI_Guide.md';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Markdown guide downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = () => {
    setDownloading('pdf');
    try {
      const md = getGuideMarkdown();
      const html = getGuideHTML(md);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      }
      toast.success('PDF report opened — use browser print dialog to save as PDF');
    } catch {
      toast.error('Export failed');
    } finally {
      setDownloading(null);
    }
  };

  const sections = [
    { num: '1', title: 'Project Overview', desc: 'What SafeDelhiAQI is, the problem it solves, and key capabilities' },
    { num: '2', title: 'System Architecture', desc: 'Three-tier architecture, data flow, and technology stack diagram' },
    { num: '3', title: 'Geospatial Mapping System', desc: 'Leaflet maps, Voronoi diagrams, heatmaps, and influence buffers' },
    { num: '4', title: 'Distance Calculation', desc: 'Haversine formula with full mathematical derivation' },
    { num: '5', title: 'AQI Estimation Logic', desc: 'Inverse Distance Weighting (IDW) with worked examples' },
    { num: '6', title: 'Livability Score Model', desc: 'How AQI is converted to livability scores and classes' },
    { num: '7', title: 'Machine Learning System', desc: 'XGBoost regression, gradient boosting, feature engineering, and evaluation' },
    { num: '8', title: 'Mathematical Concepts', desc: 'All formulas explained with beginner + advanced explanations' },
    { num: '9', title: 'Project Folder Structure', desc: 'Complete file tree with explanations for every file' },
    { num: '10', title: 'Step-by-Step Build Guide', desc: '9-step tutorial to rebuild the entire project from scratch' },
    { num: '11', title: 'Algorithms Used', desc: 'Nearest neighbor, IDW, gradient boosting, spatial partitioning' },
    { num: '12', title: 'Beginner Learning Notes', desc: 'Simple explanations with real-world analogies for every concept' },
    { num: '13', title: 'Future Improvements', desc: 'Deep learning, satellite data, spatiotemporal models, and more' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
            Complete Technical Handbook
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            SafeDelhiAQI Project Guide
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
            AI-Powered Air Quality & Livability Intelligence Platform
          </p>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            A complete guide covering architecture, mathematics, ML pipeline, geospatial systems, and step-by-step build instructions.
          </p>
        </div>

        {/* Download Buttons */}
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                disabled={downloading === 'pdf'}
                className="w-full sm:w-auto gap-2"
              >
                <FileText className="h-5 w-5" />
                {downloading === 'pdf' ? 'Opening...' : 'Download as PDF'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownloadMD}
                disabled={downloading === 'md'}
                className="w-full sm:w-auto gap-2"
              >
                <Download className="h-5 w-5" />
                {downloading === 'md' ? 'Downloading...' : 'Download as Markdown'}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              PDF opens in a new tab — use Ctrl+P / Cmd+P to save. Markdown downloads directly.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              What's Inside
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {sections.map((s) => (
                <div
                  key={s.num}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Guide Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Full Haversine formula derivation & implementation',
                'Inverse Distance Weighting with worked numerical example',
                'XGBoost gradient boosting explained from first principles',
                'Voronoi diagram mathematics & D3-Delaunay usage',
                'Complete 9-step tutorial to rebuild from scratch',
                'Livability scoring algorithm with factor weights',
                'Feature importance ranking for ML model',
                'Beginner-friendly analogies for every complex concept',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Bottom Download */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Ready to Download?</h2>
          <p className="text-muted-foreground text-sm">
            Get the complete guide as a portable document you can read offline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleDownloadPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              SafeDelhiAQI_Guide.pdf
            </Button>
            <Button variant="outline" onClick={handleDownloadMD} className="gap-2">
              <Download className="h-4 w-4" />
              SafeDelhiAQI_Guide.md
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
