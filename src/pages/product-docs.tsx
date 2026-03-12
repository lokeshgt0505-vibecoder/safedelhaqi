import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Download, FileText, BookOpen, CheckCircle2, Monitor, BarChart3, Layers, Map, Bell, Users, Palette, AlertTriangle, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { getProductDocsMarkdown, getProductDocsHTML, generateDocxBlob } from '@/lib/product-docs-content';

export default function ProductDocs() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadMD = () => {
    setDownloading('md');
    try {
      const md = getProductDocsMarkdown();
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SafeDelhiAQI_ProductDocs.md';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Markdown documentation downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = () => {
    setDownloading('pdf');
    try {
      const md = getProductDocsMarkdown();
      const html = getProductDocsHTML(md);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      }
      toast.success('PDF opened — use Ctrl+P / Cmd+P to save as PDF');
    } catch {
      toast.error('Export failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDOCX = () => {
    setDownloading('docx');
    try {
      const md = getProductDocsMarkdown();
      const blob = generateDocxBlob(md);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SafeDelhiAQI_ProductDocs.doc';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('DOCX documentation downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const sections = [
    { num: '1', title: 'Product Overview', desc: 'What the platform does, target users, key capabilities', icon: Monitor },
    { num: '2', title: 'Application Sitemap', desc: 'All pages, modals, overlays, and hidden views', icon: Map },
    { num: '3', title: 'Page-by-Page Deep Analysis', desc: 'Purpose, features, data sources for every page', icon: FileText },
    { num: '4', title: 'Full UI Component Inventory', desc: 'Every button, card, chart, input, dropdown documented', icon: Layers },
    { num: '5', title: 'Buttons & User Actions', desc: 'Every button with style, function, and backend action', icon: Monitor },
    { num: '6', title: 'Charts & Data Visualizations', desc: 'All 14 charts with axes, legends, calculations explained', icon: BarChart3 },
    { num: '7', title: 'Tables & Data Grids', desc: 'Column-by-column breakdown of every table', icon: FileText },
    { num: '8', title: 'Filters, Sliders & Controls', desc: 'Every interactive control and what it changes', icon: Layers },
    { num: '9', title: 'Navigation System', desc: 'Header, tabs, routes, keyboard shortcuts', icon: Map },
    { num: '10', title: 'User Journey / Workflow', desc: '6 detailed user workflows step-by-step', icon: Users },
    { num: '11', title: 'Data & Backend Architecture', desc: 'Database tables, edge functions, ML pipeline', icon: Monitor },
    { num: '12', title: 'UX / UI Design Rationale', desc: 'Why every design decision was made', icon: Palette },
    { num: '13', title: 'Edge Cases & System States', desc: 'Loading, error, empty states, permission restrictions', icon: AlertTriangle },
  ];

  const highlights = [
    '14 charts & visualizations documented with axes, legends, and data calculations',
    'Every button catalogued with style, click action, loading state, and backend process',
    '6 complete user workflows mapped step-by-step',
    'Full comparison table with column-by-column data type breakdown',
    'All 6 map layers documented with toggle behavior and visual description',
    'Complete color system reference (AQI scale, zones, trends)',
    'Keyboard shortcuts and accessibility features listed',
    'Edge cases: loading, error, empty states, and permission handling',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
            Complete Product Audit
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Product Documentation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
            Full UI, Feature & Data Visualization Audit
          </p>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Every page, component, button, chart, filter, and interaction documented in detail.
          </p>
        </div>

        {/* Download Buttons */}
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownloadDOCX}
                disabled={downloading === 'docx'}
                className="w-full sm:w-auto gap-2"
              >
                <FileDown className="h-5 w-5" />
                {downloading === 'docx' ? 'Downloading...' : 'Download as DOCX'}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              PDF opens in a new tab — use Ctrl+P / Cmd+P to save. MD and DOCX download directly.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Documentation Sections
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <s.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">What's Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item, i) => (
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
          <h2 className="text-xl font-bold text-foreground">Download the Full Documentation</h2>
          <p className="text-muted-foreground text-sm">
            Get the complete product audit as a portable document.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleDownloadPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              SafeDelhiAQI_ProductDocs.pdf
            </Button>
            <Button variant="outline" onClick={handleDownloadMD} className="gap-2">
              <Download className="h-4 w-4" />
              SafeDelhiAQI_ProductDocs.md
            </Button>
            <Button variant="outline" onClick={handleDownloadDOCX} className="gap-2">
              <FileDown className="h-4 w-4" />
              SafeDelhiAQI_ProductDocs.doc
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
