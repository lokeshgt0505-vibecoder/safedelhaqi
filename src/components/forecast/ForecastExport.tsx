import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import { ForecastData } from '@/types/forecast';
import { toast } from 'sonner';

interface ForecastExportProps {
  forecast: ForecastData;
}

function generateCSV(forecast: ForecastData): string {
  const headers = [
    'Station Name',
    'Station Type',
    'Year',
    'Predicted AQI',
    'Zone',
    'Livability',
    'Best Month',
    'Best Month AQI',
    'Worst Month',
    'Worst Month AQI',
    'Trend',
    'Confidence %',
    'Recommendation',
  ];

  const rows: string[][] = [];

  forecast.forecasts.forEach((station) => {
    station.yearlyPredictions.forEach((pred) => {
      rows.push([
        station.stationName,
        station.stationType,
        pred.year.toString(),
        Math.round(pred.avgAqi).toString(),
        pred.zone.toUpperCase(),
        pred.livability,
        pred.bestMonth.month,
        pred.bestMonth.aqi.toString(),
        pred.worstMonth.month,
        pred.worstMonth.aqi.toString(),
        station.trend,
        pred.confidence.toString(),
        `"${station.recommendation}"`,
      ]);
    });
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function generatePDFContent(forecast: ForecastData): string {
  const currentYear = new Date().getFullYear();
  
  let content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delhi AQI Forecast Report ${currentYear}-${currentYear + 5}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #1a1a1a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    h3 { color: #4b5563; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .zone-blue { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; }
    .zone-yellow { background: #fef9c3; color: #854d0e; padding: 4px 12px; border-radius: 12px; }
    .zone-red { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    .recommendation { background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
    .insight { background: #faf5ff; padding: 10px 15px; margin: 5px 0; border-radius: 4px; }
    .improving { color: #059669; }
    .stable { color: #d97706; }
    .declining { color: #dc2626; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>🏠 Delhi AQI Forecast Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Forecast Period:</strong> ${currentYear} - ${currentYear + 5}</p>
  
  <div class="summary">
    <h2>City Overview</h2>
    <p><strong>Overall Trend:</strong> ${forecast.cityOverview.overallTrend}</p>
    <h3>Key Insights</h3>
    ${forecast.cityOverview.keyInsights.map((i) => `<div class="insight">• ${i}</div>`).join('')}
  </div>

  <h2>Real Estate Recommendations by Zone</h2>
  
  <h3>🟢 Best for Living (Blue Zone)</h3>
  <table>
    <tr><th>Station</th><th>2026 AQI</th><th>2030 AQI</th><th>Trend</th><th>Recommendation</th></tr>
    ${forecast.forecasts
      .filter((s) => s.yearlyPredictions[0]?.zone === 'blue')
      .map((s) => {
        const first = s.yearlyPredictions[0];
        const last = s.yearlyPredictions[s.yearlyPredictions.length - 1];
        return `<tr>
          <td>${s.stationName}</td>
          <td>${Math.round(first?.avgAqi || 0)}</td>
          <td>${Math.round(last?.avgAqi || 0)}</td>
          <td class="${s.trend}">${s.trend}</td>
          <td>${s.recommendation}</td>
        </tr>`;
      })
      .join('')}
  </table>

  <h3>🟡 Moderate (Yellow Zone)</h3>
  <table>
    <tr><th>Station</th><th>2026 AQI</th><th>2030 AQI</th><th>Trend</th><th>Recommendation</th></tr>
    ${forecast.forecasts
      .filter((s) => s.yearlyPredictions[0]?.zone === 'yellow')
      .map((s) => {
        const first = s.yearlyPredictions[0];
        const last = s.yearlyPredictions[s.yearlyPredictions.length - 1];
        return `<tr>
          <td>${s.stationName}</td>
          <td>${Math.round(first?.avgAqi || 0)}</td>
          <td>${Math.round(last?.avgAqi || 0)}</td>
          <td class="${s.trend}">${s.trend}</td>
          <td>${s.recommendation}</td>
        </tr>`;
      })
      .join('')}
  </table>

  <h3>🔴 Not Recommended (Red Zone)</h3>
  <table>
    <tr><th>Station</th><th>2026 AQI</th><th>2030 AQI</th><th>Trend</th><th>Recommendation</th></tr>
    ${forecast.forecasts
      .filter((s) => s.yearlyPredictions[0]?.zone === 'red')
      .map((s) => {
        const first = s.yearlyPredictions[0];
        const last = s.yearlyPredictions[s.yearlyPredictions.length - 1];
        return `<tr>
          <td>${s.stationName}</td>
          <td>${Math.round(first?.avgAqi || 0)}</td>
          <td>${Math.round(last?.avgAqi || 0)}</td>
          <td class="${s.trend}">${s.trend}</td>
          <td>${s.recommendation}</td>
        </tr>`;
      })
      .join('')}
  </table>

  <h2>Detailed Station Forecasts</h2>
  ${forecast.forecasts
    .map(
      (s) => `
    <div style="page-break-inside: avoid; margin-bottom: 30px;">
      <h3>${s.stationName}</h3>
      <p><strong>Type:</strong> ${s.stationType} | <strong>Trend:</strong> <span class="${s.trend}">${s.trend}</span></p>
      <div class="recommendation">${s.recommendation}</div>
      <table>
        <tr><th>Year</th><th>Avg AQI</th><th>Zone</th><th>Best Month</th><th>Worst Month</th><th>Confidence</th></tr>
        ${s.yearlyPredictions
          .map(
            (p) => `<tr>
          <td>${p.year}</td>
          <td>${Math.round(p.avgAqi)}</td>
          <td><span class="zone-${p.zone}">${p.zone.toUpperCase()}</span></td>
          <td>${p.bestMonth.month} (${p.bestMonth.aqi})</td>
          <td>${p.worstMonth.month} (${p.worstMonth.aqi})</td>
          <td>${p.confidence}%</td>
        </tr>`
          )
          .join('')}
      </table>
    </div>
  `
    )
    .join('')}

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
    <p>This report is generated using AI-powered predictions based on current AQI data and historical patterns.</p>
    <p>For real estate decisions, please also consider other factors like connectivity, amenities, and future development plans.</p>
  </footer>
</body>
</html>`;

  return content;
}

export function ForecastExport({ forecast }: ForecastExportProps) {
  const handleExportCSV = () => {
    const csv = generateCSV(forecast);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delhi-aqi-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded');
  };

  const handleExportPDF = () => {
    const html = generatePDFContent(forecast);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast.success('PDF report opened - use browser print dialog to save');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="h-4 w-4 mr-2" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
