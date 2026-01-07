import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import {
  FileText,
  Target,
  Lightbulb,
  Cpu,
  Database,
  Calculator,
  Brain,
  TrendingUp,
  Map,
  Hexagon,
  Clock,
  Server,
  AlertTriangle,
  Rocket,
  CheckCircle2,
  Code,
  Globe,
  Activity,
  Shield,
  Users,
  Building2,
  Leaf
} from 'lucide-react';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Technical Documentation v1.0</Badge>
          <h1 className="text-4xl font-bold mb-4">SafeDelhAQI</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Air Quality Index Prediction and Geospatial Visualization System for Delhi NCR
          </p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <Badge>Machine Learning</Badge>
            <Badge>Geospatial Analysis</Badge>
            <Badge>Real-time Monitoring</Badge>
            <Badge>Predictive Analytics</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full h-auto gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="data">Data & ML</TabsTrigger>
            <TabsTrigger value="mapping">Mapping</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="future">Future</TabsTrigger>
          </TabsList>

          {/* 1. Project Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  1. Project Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">What is SafeDelhAQI?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    SafeDelhAQI is an advanced Air Quality Index (AQI) prediction and geospatial visualization 
                    system specifically designed for Delhi National Capital Region (NCR). The platform integrates 
                    real-time air quality monitoring, historical data analysis, and machine learning-based 
                    predictive forecasting to provide comprehensive insights into air pollution patterns across 
                    the metropolitan area.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Problem Statement</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Delhi consistently ranks among the world's most polluted cities, with AQI levels frequently 
                    exceeding hazardous thresholds. Citizens lack accessible tools for understanding long-term 
                    air quality trends and making informed decisions about residential locations, outdoor 
                    activities, and health precautions. This system addresses the critical need for actionable, 
                    data-driven air quality intelligence.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Motivation</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-1 text-green-500" />
                      <span><strong>Public Health Protection:</strong> Enable citizens to minimize exposure to harmful pollutants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-1 text-blue-500" />
                      <span><strong>Urban Planning:</strong> Support evidence-based residential and commercial development decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 mt-1 text-emerald-500" />
                      <span><strong>Environmental Monitoring:</strong> Track pollution patterns and assess intervention effectiveness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-1 text-purple-500" />
                      <span><strong>Community Awareness:</strong> Democratize access to air quality intelligence</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  2. Project Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Short-term Objectives</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        Real-time AQI data acquisition from monitoring stations
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        Interactive geospatial visualization with zone classification
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        Station-wise AQI monitoring and comparison
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        Health advisory generation based on current conditions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Long-term Objectives</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500" />
                        5-year AQI trend prediction using ML models
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500" />
                        Neighborhood livability scoring and ranking
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500" />
                        Seasonal pattern analysis for activity planning
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500" />
                        Alert subscription system for threshold notifications
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  3. Real-World Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Government Policy', desc: 'Data-driven policy formulation for pollution control measures', icon: Building2 },
                    { title: 'Urban Development', desc: 'Zoning decisions based on long-term air quality projections', icon: Map },
                    { title: 'Public Health', desc: 'Early warning systems and health advisory dissemination', icon: Shield },
                    { title: 'Real Estate', desc: 'Property valuation insights based on environmental quality', icon: Building2 },
                    { title: 'Smart City', desc: 'Integration with IoT infrastructure for automated responses', icon: Cpu },
                    { title: 'Research', desc: 'Academic analysis of pollution patterns and interventions', icon: FileText },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card">
                      <item.icon className="h-8 w-8 mb-2 text-primary" />
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Key Features */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  4. Key Features of the System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Real-time Monitoring</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Live AQI data from 35+ Delhi monitoring stations</li>
                        <li>• Auto-refresh every 5 minutes with manual refresh option</li>
                        <li>• Individual pollutant breakdown (PM2.5, PM10, NO₂, SO₂, CO, O₃)</li>
                        <li>• Station-wise detailed views with historical context</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Zone Classification</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• <span className="text-blue-500 font-medium">Blue Zone:</span> AQI 0-100 (Good/Satisfactory)</li>
                        <li>• <span className="text-yellow-500 font-medium">Yellow Zone:</span> AQI 101-200 (Moderate/Poor)</li>
                        <li>• <span className="text-red-500 font-medium">Red Zone:</span> AQI 201+ (Very Poor/Hazardous)</li>
                        <li>• Dynamic color-coded markers and influence areas</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Interactive Mapping</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Full-screen interactive Leaflet map</li>
                        <li>• Voronoi tessellation for influence zones</li>
                        <li>• Heatmap layer for pollution density visualization</li>
                        <li>• Click-anywhere for nearest station AQI estimation</li>
                        <li>• Forecast overlay with year slider (2025-2029)</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Predictive Analytics</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 5-year AQI forecasting (2025-2029)</li>
                        <li>• Station-wise trend analysis (improving/stable/declining)</li>
                        <li>• Best/worst month predictions per station</li>
                        <li>• Confidence intervals for predictions</li>
                        <li>• City-wide trend aggregation</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Seasonal Analysis</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Monthly AQI pattern visualization</li>
                        <li>• Seasonal comparison (Winter/Summer/Monsoon/Post-Monsoon)</li>
                        <li>• Outdoor activity calendar with recommendations</li>
                        <li>• Best months for outdoor activities identification</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Neighborhood Rankings</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Livability scoring based on 5-year forecasts</li>
                        <li>• Ranked list of Delhi areas by air quality</li>
                        <li>• Recommended vs. areas to avoid categorization</li>
                        <li>• Trend indicators (improving/declining)</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Alert System</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• User-configurable AQI threshold alerts</li>
                        <li>• Station subscription management</li>
                        <li>• Email notification support</li>
                        <li>• Alert history and management</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Health Advisory</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Dynamic health recommendations based on AQI</li>
                        <li>• Guidance for sensitive groups</li>
                        <li>• Indoor/outdoor activity suggestions</li>
                        <li>• Mask requirement advisories</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Technology Stack */}
          <TabsContent value="technology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  5. Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Frontend
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'React 18', desc: 'Component-based UI framework' },
                        { name: 'TypeScript', desc: 'Type-safe JavaScript' },
                        { name: 'Vite', desc: 'Next-generation build tool' },
                        { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
                        { name: 'shadcn/ui', desc: 'Accessible component library' },
                        { name: 'React Router', desc: 'Client-side routing' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4" /> Backend
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Supabase', desc: 'Backend-as-a-Service' },
                        { name: 'PostgreSQL', desc: 'Relational database' },
                        { name: 'Edge Functions', desc: 'Serverless compute (Deno)' },
                        { name: 'Row Level Security', desc: 'Database access control' },
                        { name: 'Realtime', desc: 'Live data subscriptions' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Map className="h-4 w-4" /> Mapping & Visualization
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Leaflet', desc: 'Interactive map library' },
                        { name: 'React-Leaflet', desc: 'React bindings for Leaflet' },
                        { name: 'Leaflet.heat', desc: 'Heatmap visualization' },
                        { name: 'D3-Delaunay', desc: 'Voronoi tessellation' },
                        { name: 'Recharts', desc: 'Chart components' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI/ML Integration
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Lovable AI Gateway', desc: 'AI model access' },
                        { name: 'Google Gemini', desc: 'LLM for forecasting' },
                        { name: 'Tool Calling', desc: 'Structured output extraction' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" /> Data Sources
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'WAQI API', desc: 'World Air Quality Index' },
                        { name: 'CPCB Stations', desc: 'Delhi monitoring network' },
                        { name: 'Historical DB', desc: 'Stored AQI records' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> DevOps
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Lovable', desc: 'AI-powered development' },
                        { name: 'Git/GitHub', desc: 'Version control' },
                        { name: 'Automatic Deploy', desc: 'CI/CD pipeline' },
                      ].map((tech, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{tech.name}</span>
                          <span className="text-muted-foreground">{tech.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Data & ML */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  6. Dataset Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Data Source</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Primary data is sourced from the World Air Quality Index (WAQI) API, which aggregates 
                      readings from Central Pollution Control Board (CPCB) and Delhi Pollution Control 
                      Committee (DPCC) monitoring stations across Delhi NCR.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Pollutants Monitored</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><Badge variant="outline">PM2.5</Badge> Fine particulate matter</div>
                        <div><Badge variant="outline">PM10</Badge> Coarse particulate</div>
                        <div><Badge variant="outline">NO₂</Badge> Nitrogen dioxide</div>
                        <div><Badge variant="outline">SO₂</Badge> Sulfur dioxide</div>
                        <div><Badge variant="outline">CO</Badge> Carbon monoxide</div>
                        <div><Badge variant="outline">O₃</Badge> Ground-level ozone</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Data Characteristics</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Monitoring Stations</span>
                        <span className="font-medium">35+ stations</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Update Frequency</span>
                        <span className="font-medium">Every 5 minutes</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Historical Data Range</span>
                        <span className="font-medium">Up to 5 years</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Geographic Coverage</span>
                        <span className="font-medium">Delhi NCR (28.4°-28.9°N)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Data Preprocessing</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-1">1. Cleaning</h5>
                      <p className="text-muted-foreground">Handle missing values, remove outliers, validate ranges (0-500 AQI)</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-1">2. Normalization</h5>
                      <p className="text-muted-foreground">Standardize pollutant readings to AQI scale using EPA formulas</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-1">3. Aggregation</h5>
                      <p className="text-muted-foreground">Hourly → Daily → Monthly → Seasonal patterns</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-1">4. Storage</h5>
                      <p className="text-muted-foreground">PostgreSQL with indexed queries for efficient retrieval</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  7. Mathematical Foundations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">AQI Calculation Formula</h4>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <p>AQI = ((IHi - ILo) / (BPHi - BPLo)) × (Cp - BPLo) + ILo</p>
                    <div className="mt-3 text-muted-foreground font-sans">
                      <p><strong>Where:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Cp = Concentration of pollutant</li>
                        <li>BPHi, BPLo = Breakpoint concentrations</li>
                        <li>IHi, ILo = AQI values corresponding to breakpoints</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">AQI Categories (Indian Standards)</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { range: '0-50', label: 'Good', color: 'bg-green-500' },
                        { range: '51-100', label: 'Satisfactory', color: 'bg-lime-500' },
                        { range: '101-200', label: 'Moderate', color: 'bg-yellow-500' },
                        { range: '201-300', label: 'Poor', color: 'bg-orange-500' },
                        { range: '301-400', label: 'Very Poor', color: 'bg-red-500' },
                        { range: '401-500', label: 'Hazardous', color: 'bg-red-900' },
                      ].map((cat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${cat.color}`} />
                          <span className="w-20">{cat.range}</span>
                          <span className="text-muted-foreground">{cat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Statistical Methods</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Mean/Median:</strong> Central tendency for daily/monthly aggregation</li>
                      <li>• <strong>Standard Deviation:</strong> Variability assessment for zone stability</li>
                      <li>• <strong>Trend Analysis:</strong> Linear regression for slope calculation</li>
                      <li>• <strong>Seasonal Decomposition:</strong> Identify cyclical patterns</li>
                      <li>• <strong>Moving Averages:</strong> Smooth short-term fluctuations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  8. Machine Learning Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Model Architecture</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The forecasting system utilizes a Large Language Model (LLM) through Lovable AI Gateway, 
                      specifically Google Gemini, configured for structured output generation. The model 
                      processes current AQI readings along with historical Delhi pollution patterns to 
                      generate 5-year forecasts.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm">
                      <h5 className="font-medium mb-2">Model Selection Rationale</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Capable of understanding complex temporal patterns</li>
                        <li>• Incorporates domain knowledge about Delhi's pollution</li>
                        <li>• Generates human-readable recommendations alongside predictions</li>
                        <li>• Structured output via tool calling ensures data consistency</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Input Features</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-muted/50 rounded">Current AQI readings per station</div>
                      <div className="p-2 bg-muted/50 rounded">Station geographic coordinates</div>
                      <div className="p-2 bg-muted/50 rounded">Station type classification (Residential/Industrial/Commercial)</div>
                      <div className="p-2 bg-muted/50 rounded">Historical seasonal patterns (Winter spike, Monsoon dip)</div>
                      <div className="p-2 bg-muted/50 rounded">Delhi-specific yearly trend data</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Output Structure</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">Per Station</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Yearly average AQI (2025-2029)</li>
                        <li>• Best/worst month predictions</li>
                        <li>• Zone classification per year</li>
                        <li>• Trend direction</li>
                        <li>• Livability recommendation</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">City Overview</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Average AQI by year</li>
                        <li>• Overall trend assessment</li>
                        <li>• Key insights (3-5 points)</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">Confidence Metrics</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Confidence score (0-1)</li>
                        <li>• Decreasing with forecast horizon</li>
                        <li>• Station-specific adjustments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  9. Prediction Logic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Forecasting Methodology</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">1. Baseline Establishment</h5>
                        <p className="text-sm text-muted-foreground">
                          Current AQI readings serve as the baseline (Year 0). Historical Delhi patterns 
                          indicate average yearly trends (slight improvement expected due to policy interventions).
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">2. Seasonal Pattern Application</h5>
                        <p className="text-sm text-muted-foreground">
                          Known Delhi seasonal multipliers are applied: Winter (Nov-Jan) shows 1.8-2.0x increase, 
                          Monsoon (Jul-Sep) shows 0.6-0.7x decrease from baseline.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">3. Station-Type Adjustment</h5>
                        <p className="text-sm text-muted-foreground">
                          Industrial areas assume slower improvement, residential areas moderate improvement, 
                          background stations best improvement trajectory.
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">4. Trend Extrapolation</h5>
                        <p className="text-sm text-muted-foreground">
                          5-year projection with decreasing confidence: Year 1 (90%), Year 2 (82%), 
                          Year 3 (75%), Year 4 (68%), Year 5 (60%).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Historical Data Usage</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      The system incorporates 5 years of historical Delhi AQI patterns (2019-2024) to establish:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <li>• Seasonal variation coefficients by month</li>
                      <li>• Year-over-year trend direction (-2% to +1% annually)</li>
                      <li>• Station-specific baseline multipliers</li>
                      <li>• Extreme event frequency (Diwali, stubble burning)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Assumptions & Limitations</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 border border-yellow-500/50 rounded-lg">
                      <h5 className="font-medium text-yellow-600 mb-2">Assumptions</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Policy interventions continue at current rate</li>
                        <li>• No major industrial expansion in study area</li>
                        <li>• Climate patterns remain consistent</li>
                        <li>• Vehicle emission standards progress as planned</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-red-500/50 rounded-lg">
                      <h5 className="font-medium text-red-600 mb-2">Limitations</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Cannot predict exceptional events (e.g., construction projects)</li>
                        <li>• Confidence degrades beyond 3 years</li>
                        <li>• Micro-location variations not captured</li>
                        <li>• Model updates required annually</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. Mapping */}
          <TabsContent value="mapping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  10. Geospatial Mapping & Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Map Implementation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The interactive map is built using Leaflet.js with React-Leaflet bindings, providing 
                      a full-screen, pan-and-zoom capable visualization of Delhi NCR's air quality landscape.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-muted/50 rounded flex justify-between">
                        <span>Base Layer</span>
                        <span className="text-muted-foreground">OpenStreetMap tiles</span>
                      </div>
                      <div className="p-2 bg-muted/50 rounded flex justify-between">
                        <span>Default Center</span>
                        <span className="text-muted-foreground">28.6139°N, 77.2090°E</span>
                      </div>
                      <div className="p-2 bg-muted/50 rounded flex justify-between">
                        <span>Zoom Range</span>
                        <span className="text-muted-foreground">10-18</span>
                      </div>
                      <div className="p-2 bg-muted/50 rounded flex justify-between">
                        <span>Bounds</span>
                        <span className="text-muted-foreground">28.4°-28.9°N, 76.8°-77.5°E</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Map Layers</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="p-2 bg-muted/50 rounded">
                        <strong>Station Markers:</strong> CircleMarkers colored by zone with popup details
                      </li>
                      <li className="p-2 bg-muted/50 rounded">
                        <strong>Voronoi Layer:</strong> Tessellated influence zones per station
                      </li>
                      <li className="p-2 bg-muted/50 rounded">
                        <strong>Heatmap Layer:</strong> Continuous pollution density visualization
                      </li>
                      <li className="p-2 bg-muted/50 rounded">
                        <strong>Influence Buffers:</strong> Circular zones showing station coverage
                      </li>
                      <li className="p-2 bg-muted/50 rounded">
                        <strong>Forecast Layer:</strong> Future predictions with year slider
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Interactive Features</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">Station Click</h5>
                      <p className="text-muted-foreground">
                        Clicking a station marker opens a popup with current AQI, pollutant breakdown, 
                        and time of last update.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">Area Click</h5>
                      <p className="text-muted-foreground">
                        Clicking anywhere on the map triggers inverse distance weighting to estimate 
                        AQI from nearby stations.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">Layer Toggle</h5>
                      <p className="text-muted-foreground">
                        Control panel allows enabling/disabling individual visualization layers 
                        (Heatmap, Voronoi, Buffers, Forecast).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hexagon className="h-5 w-5 text-primary" />
                  11. Polygon Creation & Zone Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Voronoi Tessellation</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Voronoi diagrams partition the Delhi map into regions where each point within 
                        a region is closest to a particular monitoring station. This creates natural 
                        "influence zones" for each station.
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs">
                        <p className="mb-2">// D3-Delaunay Implementation</p>
                        <p>const delaunay = Delaunay.from(points);</p>
                        <p>const voronoi = delaunay.voronoi([</p>
                        <p>  minLng, minLat, maxLng, maxLat</p>
                        <p>]);</p>
                        <p>const cell = voronoi.cellPolygon(index);</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Algorithm Steps</h5>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Extract station coordinates as point set</li>
                        <li>2. Compute Delaunay triangulation</li>
                        <li>3. Generate dual Voronoi diagram</li>
                        <li>4. Clip polygons to Delhi bounding box</li>
                        <li>5. Assign AQI-based colors to each polygon</li>
                        <li>6. Render as Leaflet Polygon components</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Zone Classification Logic</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-blue-500 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <h5 className="font-semibold text-blue-600">Blue Zone</h5>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">AQI: 0-100</p>
                      <p className="text-sm">
                        Consistently low and stable AQI. Recommended for residential consideration.
                        Good for sensitive groups.
                      </p>
                    </div>
                    <div className="p-4 border-2 border-yellow-500 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <h5 className="font-semibold text-yellow-600">Yellow Zone</h5>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">AQI: 101-200</p>
                      <p className="text-sm">
                        Moderate or fluctuating AQI. Livable with precautions. 
                        Sensitive groups should limit outdoor activities.
                      </p>
                    </div>
                    <div className="p-4 border-2 border-red-500 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <h5 className="font-semibold text-red-600">Red Zone</h5>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">AQI: 201+</p>
                      <p className="text-sm">
                        High or worsening AQI. Not recommended for residential purposes.
                        Health risks for all groups.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">IDW (Inverse Distance Weighting)</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      For any point clicked on the map, AQI is estimated using inverse distance weighting 
                      from the 5 nearest stations:
                    </p>
                    <div className="font-mono text-sm mb-3">
                      AQI(p) = Σ(AQIᵢ / dᵢ²) / Σ(1 / dᵢ²)
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Where dᵢ is the distance from point p to station i. Closer stations have 
                      quadratically higher influence on the estimated value.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  12. Data Age & Temporal Aspects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Real-time Data</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Updated every 5 minutes from WAQI API</li>
                      <li>• Timestamp displayed on each station popup</li>
                      <li>• Manual refresh available</li>
                      <li>• Live indicator shows data freshness</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Historical Data</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Stored in PostgreSQL database</li>
                      <li>• Hourly snapshots preserved</li>
                      <li>• 30-day rolling window for station history</li>
                      <li>• 5-year pattern data for forecasting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. Architecture */}
          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  13. System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">High-Level Data Flow</h4>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>WAQI API</strong>
                        <p className="text-xs text-muted-foreground">External Data</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>Edge Function</strong>
                        <p className="text-xs text-muted-foreground">fetch-aqi</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>PostgreSQL</strong>
                        <p className="text-xs text-muted-foreground">historical_aqi</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>React Frontend</strong>
                        <p className="text-xs text-muted-foreground">Visualization</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm mt-6">
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>Station Data</strong>
                        <p className="text-xs text-muted-foreground">Current AQI</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>Edge Function</strong>
                        <p className="text-xs text-muted-foreground">forecast-aqi</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>Lovable AI</strong>
                        <p className="text-xs text-muted-foreground">Gemini Model</p>
                      </div>
                      <span>→</span>
                      <div className="p-3 border rounded-lg bg-background">
                        <strong>Forecast UI</strong>
                        <p className="text-xs text-muted-foreground">5-Year Predictions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Database Schema</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">historical_aqi</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          station_id, station_name, aqi, zone, pm25, pm10, recorded_at
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">alert_subscriptions</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          user_id, station_id, aqi_threshold, notify_email, is_active
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">profiles</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          user_id, email, full_name, created_at
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">saved_locations</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          user_id, station_id, station_name, latitude, longitude
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Edge Functions</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">fetch-aqi</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          Proxies requests to WAQI API with token management
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium">forecast-aqi</h5>
                        <p className="text-muted-foreground text-xs mt-1">
                          Generates 5-year predictions using Lovable AI Gateway
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  14. Limitations & Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Data Limitations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Station coverage gaps in some Delhi areas</li>
                      <li>• Sensor maintenance can cause data gaps</li>
                      <li>• API rate limits may affect refresh frequency</li>
                      <li>• Historical data limited to available records</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Model Limitations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Predictions are estimates, not guarantees</li>
                      <li>• Cannot account for unpredictable events</li>
                      <li>• Accuracy decreases with forecast horizon</li>
                      <li>• Requires periodic model updates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Geographic Limitations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Micro-location variations not captured</li>
                      <li>• IDW assumes uniform terrain</li>
                      <li>• Building-level effects not modeled</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Technical Constraints</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Browser performance with large datasets</li>
                      <li>• Mobile optimization ongoing</li>
                      <li>• Offline functionality not supported</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. Future Scope */}
          <TabsContent value="future" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  15. Future Scope & Enhancements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Planned Enhancements</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="p-3 border rounded-lg">
                        <strong>Real-time Push Notifications</strong>
                        <p className="text-muted-foreground">Mobile push alerts when thresholds are breached</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Deep Learning Models</strong>
                        <p className="text-muted-foreground">LSTM/Transformer models for improved accuracy</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Mobile Application</strong>
                        <p className="text-muted-foreground">Native iOS/Android apps with offline support</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Multi-City Expansion</strong>
                        <p className="text-muted-foreground">Extend coverage to other Indian metros</p>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Research Directions</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="p-3 border rounded-lg">
                        <strong>Satellite Data Integration</strong>
                        <p className="text-muted-foreground">Combine ground sensors with satellite imagery</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Health Impact Modeling</strong>
                        <p className="text-muted-foreground">Correlate AQI with health outcomes data</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Source Attribution</strong>
                        <p className="text-muted-foreground">Identify primary pollution sources per zone</p>
                      </li>
                      <li className="p-3 border rounded-lg">
                        <strong>Policy Simulation</strong>
                        <p className="text-muted-foreground">Model impact of proposed interventions</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  16. Conclusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="mb-4">
                    SafeDelhAQI represents a comprehensive approach to air quality monitoring and prediction 
                    for one of the world's most polluted metropolitan regions. By combining real-time data 
                    acquisition, advanced geospatial visualization, and machine learning-based forecasting, 
                    the system provides actionable intelligence for citizens, policymakers, and researchers.
                  </p>
                  <p className="mb-4">
                    The three-zone classification system (Blue/Yellow/Red) offers an intuitive framework for 
                    understanding long-term livability implications, while the 5-year forecasting capability 
                    enables informed decision-making for residential and commercial planning.
                  </p>
                  <p className="mb-4">
                    As air quality continues to be a critical public health concern in urban India, platforms 
                    like SafeDelhAQI serve an essential role in democratizing access to environmental 
                    intelligence and supporting evidence-based urban development.
                  </p>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-center font-medium text-foreground">
                      "Empowering Delhi's residents with data-driven insights for healthier living decisions."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground pt-8">
              <p>SafeDelhAQI Technical Documentation v1.0</p>
              <p>© {new Date().getFullYear()} | Built with Lovable</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
