// =============================================================================
// SafeDelhiAQI — Complete Product Documentation
// Full UI, Feature, and Data Visualization Audit
// =============================================================================

export function getProductDocsMarkdown(): string {
  return `# SafeDelhiAQI — Complete Product Documentation
## AI-Powered Air Quality & Livability Intelligence Platform
### Full UI, Feature & Data Visualization Audit

**Version:** 2.0  
**Date:** ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}  
**Platform:** Web Application (React + TypeScript)

---

# Table of Contents

1. Product Overview
2. Application Sitemap
3. Page-by-Page Deep Analysis
4. Full UI Component Inventory
5. Buttons & User Actions
6. Charts, Graphs & Data Visualizations
7. Tables & Data Grid Explanation
8. Filters, Sliders & Controls
9. Navigation System
10. User Journey / Workflow
11. Data & Backend Architecture
12. UX / UI Design Rationale
13. Edge Cases & System States

---

# 1. Product Overview

## What SafeDelhiAQI Does

SafeDelhiAQI is a comprehensive air quality intelligence platform designed for Delhi NCR. It combines real-time AQI monitoring from 35+ government stations with AI-powered 5-year forecasting, geospatial mapping, livability scoring, and health advisory systems.

## The Problem It Solves

Delhi consistently ranks among the world's most polluted cities. Citizens lack accessible tools for:
- Understanding real-time pollution levels across different neighborhoods
- Making informed decisions about where to live based on long-term air quality trends
- Planning outdoor activities around seasonal pollution patterns
- Receiving timely alerts when air quality deteriorates

## Target Users

| User Type | Primary Need |
|-----------|-------------|
| Delhi Residents | Real-time AQI checks, health advisories |
| Home Buyers / Renters | Neighborhood livability comparisons |
| Health-conscious Individuals | Outdoor activity planning, mask advisories |
| Urban Planners | Zone-level pollution analysis, trend data |
| Researchers | Historical data, ML model insights |
| Parents & Caregivers | Safe areas identification, alert notifications |

## Key Capabilities

1. **Real-time AQI Monitoring** — Live data from 35+ CPCB/DPCC stations
2. **Interactive GIS Map** — Leaflet map with 6 toggleable layers
3. **5-Year AI Forecast** — XGBoost-based predictions (2025–2035)
4. **Livability Scoring** — 0–100 score for every map location
5. **Seasonal Analysis** — Monthly patterns & outdoor activity calendar
6. **Neighborhood Rankings** — Ranked areas by livability score
7. **Alert Subscriptions** — Configurable AQI threshold notifications
8. **Health Advisories** — Dynamic guidance based on current AQI
9. **Data Export** — PDF, CSV, and Markdown reports

## Data Displayed

- Air Quality Index (AQI) values per station
- Individual pollutant readings: PM2.5, PM10, NO₂, SO₂, CO, O₃
- Zone classification: Blue (Good), Yellow (Moderate), Red (Poor)
- Forecast predictions with confidence intervals
- Livability scores and classifications
- Seasonal AQI patterns by month and season

---

# 2. Application Sitemap

## Pages & Routes

| Route | Page Name | Auth Required | Purpose |
|-------|-----------|--------------|---------|
| \`/\` | Dashboard (Home) | No | Main map + AQI monitoring + controls |
| \`/neighborhoods\` | Neighborhood Recommendations | No | Ranked livability comparison of areas |
| \`/documentation\` | Technical Documentation | No | System architecture & technical details |
| \`/project-guide\` | Project Guide | No | Downloadable comprehensive project handbook |
| \`/auth\` | Authentication | No | Sign in / Sign up forms |
| \`/alerts\` | My Alerts | Yes | Manage AQI alert subscriptions |
| \`/*\` | 404 Not Found | No | Fallback for invalid routes |

## Modals & Overlays

| Name | Trigger | Type |
|------|---------|------|
| Forecast Panel | "5-Year Forecast" button | Full-screen overlay |
| Comparison View | "Compare" button | Full-screen overlay |
| Seasonal Analysis | "Seasonal" button | Full-screen overlay |
| Stations Sheet | "Stations" button on map | Right-side sheet drawer |
| Livability Side Panel | Click map in livability mode | Right sidebar (desktop) / Bottom sheet (mobile) |
| Area Info Popup | Click map in default mode | Floating card on map |
| Area Livability Card | Click map in livability mode | Floating card on map |
| Layer Controls Dropdown | "Layers" button on map | Dropdown menu |
| Zone Filter Popover | Zone legend buttons | Inline toggle buttons |
| Station Search Dropdown | Search input focus | Autocomplete dropdown |

---

# 3. Page-by-Page Deep Analysis

## 3.1 Dashboard (Home Page — \`/\`)

**Page Purpose:** Central command center for real-time AQI monitoring and analysis  
**Target User:** All users  
**Main Features:** Interactive map, station cards, forecast generation, layer controls, search  
**Data Sources:** CPCB/DPCC live API (via edge function), local fallback data  
**User Goals:** Check current AQI, explore map layers, generate forecasts, subscribe to alerts

### Layout Structure
- **Header (sticky top):** Logo, navigation links, theme toggle, auth button
- **Control Bar (below header):** Stats summary, zone counters, search, action buttons
- **Main Content Area (flex layout):** Map (fills remaining space) + optional livability sidebar

### Top Control Bar Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Avg AQI Display | Left side | Shows city-wide average AQI with Wind icon |
| Zone Counter Badges | Left side | Shows count of Blue/Yellow/Red stations as colored pills |
| Live/Demo Indicator | Left side | Green "Live" badge when using real API, grey "Demo" otherwise |
| Last Updated Timestamp | Left side | Clock icon + time of last data refresh |
| Station Search | Right side | Search stations by name, pincode, or coordinates |
| Zone Filter Buttons | Right side | Filter visible stations by zone color |
| Refresh Button | Right side | RefreshCw icon, re-fetches AQI data |
| 5-Year Forecast Button | Right side | Primary button, triggers AI forecast generation |
| Compare Button | Right side | Appears after forecast, opens comparison view |
| Seasonal Button | Right side | Opens seasonal analysis modal |

### Map Area Components

| Component | Z-Index | Purpose |
|-----------|---------|---------|
| Leaflet Map Container | Base | Full-screen OpenStreetMap with station markers |
| Layer Controls Dropdown | 1000 | Toggle 6 map layers |
| Stations Sheet Button | 1000 | Opens right-side station list drawer |
| Selected Station Card | 1000 | Floating card showing selected station details |
| Area Info Popup | 500 | Shows nearest station + estimated AQI on map click |
| Area Livability Card | 500 | Shows livability score on map click (livability mode) |
| Year Slider | 500 | Slider for forecast year selection |
| Livability Legend | 500 | Color legend for livability layer |

---

## 3.2 Neighborhoods Page (\`/neighborhoods\`)

**Page Purpose:** Ranked neighborhood comparison for residential decisions  
**Target User:** Home buyers, renters, urban planners  
**Main Features:** Livability-ranked cards, tabbed views, trend indicators  
**Data Sources:** AI forecast data (generated on page load)  
**User Goals:** Find best/worst areas to live, compare neighborhoods

### Layout Structure
- **Header:** Same global header
- **Page Title:** "Neighborhood Recommendations" with MapPin icon
- **Refresh Button:** Re-generates forecasts
- **Tab Navigation:** Rankings | Top Picks | Avoid
- **Card Grid:** 2-3 column responsive grid of neighborhood cards

### Neighborhood Card Anatomy

Each card contains:

| Element | Data | Purpose |
|---------|------|---------|
| Rank Badge | "#1 Recommended" (top 3 only) | Green corner badge for top-ranked areas |
| Building Icon | Colored by zone | Visual zone indicator |
| Station Name | Station name text | Location identifier |
| Zone Badge | "Best for Living" / "Moderate" / "Not Recommended" | Livability classification |
| Trend Indicator | Arrow + "Improving" / "Stable" / "Declining" | Direction of AQI change |
| Livability Score | 0-100 numeric | Composite quality score |
| Current AQI | Live AQI number | Present air quality |
| 5-Year Avg Forecast | Predicted average AQI | Future air quality |
| Progress Bar | Colored by zone | Visual score representation |
| Best Year | Year + AQI | Lowest predicted AQI year |
| Worst Year | Year + AQI | Highest predicted AQI year |
| Recommendation | Text | AI-generated guidance |
| Confidence | Percentage | Model prediction confidence |

### Tab Content

| Tab | Icon | Content |
|-----|------|---------|
| Rankings | Star | All neighborhoods sorted by livability score |
| Top Picks | ThumbsUp | Top 5 + improving areas, with info banners |
| Avoid | ThumbsDown | Red-zone areas, with warning banner |

---

## 3.3 Documentation Page (\`/documentation\`)

**Page Purpose:** Technical system documentation  
**Target User:** Developers, researchers, evaluators  
**Main Features:** 7-tab technical documentation  
**Data Sources:** Static content  
**User Goals:** Understand system architecture, algorithms, and technology

### Tab Structure

| Tab | Sections Covered |
|-----|-----------------|
| Overview | Project introduction, objectives, real-world applications |
| Features | Real-time monitoring, zone classification, mapping, analytics, alerts |
| Technology | Frontend stack, backend services, data visualization, ML libraries |
| Data & ML | AQI data pipeline, XGBoost model, feature engineering, evaluation |
| Mapping | Leaflet setup, Voronoi, heatmap, IDW, coordinate systems |
| Architecture | System design, data flow, component hierarchy |
| Future | Planned improvements and research directions |

---

## 3.4 Project Guide Page (\`/project-guide\`)

**Page Purpose:** Downloadable comprehensive project handbook  
**Target User:** Students, developers rebuilding the project  
**Main Features:** 13-section guide overview, PDF/Markdown download  
**Data Sources:** Static content  
**User Goals:** Download complete technical handbook

### Components

| Component | Purpose |
|-----------|---------|
| Hero Section | Title, badge "Complete Technical Handbook", description |
| Download Card | Two buttons: "Download as PDF" + "Download as Markdown" |
| Table of Contents | 13 numbered sections with icons and descriptions |
| Guide Highlights | 8 key topics with CheckCircle icons |
| Bottom Download CTA | Repeated download buttons |

---

## 3.5 Authentication Page (\`/auth\`)

**Page Purpose:** User sign-in and registration  
**Target User:** Users wanting alert subscriptions  
**Main Features:** Sign In / Sign Up tabbed forms  
**Data Sources:** Authentication system  
**User Goals:** Create account or sign in

### Form Fields

| Form | Fields | Validation |
|------|--------|-----------|
| Sign In | Email (with Mail icon), Password (with Lock icon) | Email format, min 6 char password |
| Sign Up | Full Name (User icon), Email (Mail icon), Password (Lock icon) | All above + name required |

### Visual Elements
- Wind icon logo in gradient circle
- "Delhi AQI Dashboard" branding
- Tab switcher: Sign In | Sign Up
- Error messages in red below fields
- Loading spinner on submit buttons

---

## 3.6 Alerts Page (\`/alerts\`)

**Page Purpose:** Manage AQI alert subscriptions  
**Target User:** Authenticated users  
**Main Features:** Subscription list, threshold editing, toggle/delete  
**Data Sources:** Database (alert_subscriptions table)  
**User Goals:** Configure, edit, or remove alert subscriptions

### Alert Subscription Card Anatomy

| Element | Purpose |
|---------|---------|
| Bell/BellOff Icon | Active vs inactive visual indicator |
| Station Name | MapPin icon + station name |
| AQI Threshold Badge | Colored badge showing threshold value |
| Active Toggle Switch | Enable/disable the subscription |
| Edit Threshold Button | Opens inline slider editor |
| AQI Slider | Range 50-400, step 10 |
| Remove Button | Red trash icon, deletes subscription |

### Empty State
- Bell icon in circle
- "No Alert Subscriptions" heading
- Guidance text pointing to dashboard
- "Browse Stations" CTA button

### Info Card
- AlertTriangle icon
- Explains email alert rate limiting (1 per station per hour)

---

# 4. Full UI Component Inventory

## 4.1 Header Component

| Element | Type | Location | Purpose | Interaction |
|---------|------|----------|---------|-------------|
| Logo (Wind icon) | Icon + Text | Left | Brand identity | Click → navigate to \`/\` |
| "Delhi AQI" title | Text | Left | App name | Part of logo link |
| "Zoning & Forecast" | Subtitle | Left | Tagline | Decorative |
| Neighborhoods Link | Ghost Button | Center nav | Navigate to rankings | Click → \`/neighborhoods\` |
| Docs Link | Ghost Button | Center nav | Navigate to docs | Click → \`/documentation\` |
| Guide Link | Ghost Button | Center nav | Navigate to guide | Click → \`/project-guide\` |
| Theme Toggle | Icon Button | Right | Switch dark/light mode | Click → toggles theme |
| Sign In Button | Primary Button | Right (logged out) | Authenticate | Click → \`/auth\` |
| User Menu | Dropdown | Right (logged in) | Account actions | Click → shows menu |
| My Alerts | Menu Item | Dropdown | Navigate to alerts | Click → \`/alerts\` |
| Sign Out | Menu Item | Dropdown | Log out | Click → signs out |

## 4.2 Map Layer Controls

| Layer | Icon | Default | Description |
|-------|------|---------|-------------|
| Station Markers | MapPin | ON | Colored circles on station locations |
| AQI Heatmap | Thermometer | ON | Heat gradient overlay showing pollution density |
| Voronoi Zones | Hexagon | OFF | Tessellated polygons dividing influence areas |
| Influence Buffers | Circle | OFF | Concentric circles around stations (5km, 10km) |
| Livability Index | Home | OFF | Voronoi overlay colored by livability score |
| AI Forecast Zones | TrendingUp | OFF* | Forecast-colored markers (*auto-enabled after forecast) |

## 4.3 Station Card Component

| Element | Type | Data | Interaction |
|---------|------|------|-------------|
| MapPin Icon | Icon | — | Decorative |
| Station Name | Text | station.name | Truncated if long |
| Zone Badge | Badge | "Blue Zone" / "Yellow Zone" / "Red Zone" | Color-coded |
| AQI Circle | Circle | station.aqi + "AQI" label | Color matches AQI severity |
| AQI Description | Text | "Good - Air quality is satisfactory" etc. | Category + description |
| PM2.5 Reading | Stat | station.pollutants.pm25 | Shows with Wind icon |
| PM10 Reading | Stat | station.pollutants.pm10 | Shows with Droplets icon |
| NO₂ Reading | Stat | station.pollutants.no2 | Text only |
| AQI Contributors | Chart | Contributing factors | Bar chart of pollutant contributions |
| Get Alerts Button | Button | Subscribe/Unsubscribe | Bell icon, toggles subscription |

## 4.4 Station Search Component

| Element | Type | Purpose | Interaction |
|---------|------|---------|-------------|
| Search Input | Text Input | Find stations | Type to filter |
| Search Icon | Icon | Affordance | Decorative |
| Clear Button (X) | Icon Button | Clear query | Resets input |
| Station Results | List | Matching stations | Click to select + fly to |
| Station Name | Text | Identifier | Bold text |
| Station AQI/Zone | Subtitle | Quick info | Shows AQI + zone |
| Zone Dot | Colored Circle | Zone indicator | Blue/Yellow/Red |
| Custom Location | List Item | Add coordinates/pincode | Navigation icon |
| Empty State | Text | No results guidance | Suggests coordinates |

## 4.5 Zone Legend / Filter

| Button | Color | AQI Range | Label |
|--------|-------|-----------|-------|
| All | Primary (when active) | All | "All (count)" |
| Blue | Green/Blue | 0–100 | "Blue Zone (count)" |
| Yellow | Yellow | 101–200 | "Yellow Zone (count)" |
| Red | Red | 201+ | "Red Zone (count)" |

Interaction: Click to filter map stations. Click active zone to deselect (show all).

---

# 5. Buttons & User Actions

## 5.1 Dashboard Buttons

| Button | Label | Style | Location | Click Action | Loading State | Backend |
|--------|-------|-------|----------|-------------|---------------|---------|
| Refresh | RefreshCw icon only | Outline, sm | Control bar | Re-fetches AQI data | Icon spins | Calls fetch-aqi edge function |
| 5-Year Forecast | "5-Year Forecast" | Primary, sm | Control bar | Generates AI forecast | Loader2 spinner + disabled | Calls forecast-aqi edge function |
| Compare | "Compare" | Outline, sm | Control bar | Opens comparison overlay | — | No API call |
| Seasonal | "Seasonal" | Outline, sm | Control bar | Opens seasonal analysis | Loader2 spinner | Local computation |
| Stations | "Stations" | Secondary, sm | Map overlay | Opens station list sheet | — | No API call |
| Layers | "Layers" | Secondary, sm | Map overlay | Opens layer dropdown | — | No API call |
| Close Station (X) | X icon | Ghost, icon | Station card | Dismisses selected station | — | No API call |
| Get Alerts | "Get Alerts" / "Subscribed" | Outline/Secondary | Station card | Subscribes/unsubscribes | — | Inserts/deletes alert_subscriptions |

## 5.2 Forecast Panel Buttons

| Button | Label | Style | Action |
|--------|-------|-------|--------|
| Close (X) | X icon | Ghost, icon | Closes forecast overlay |
| Export | Download icon | Various | Exports forecast as PDF/CSV |
| Forecast Tab | "Forecast" | Tab trigger | Shows chart + station list |
| ML Model Tab | "ML Model" | Tab trigger | Shows model metrics + feature importance |

## 5.3 Comparison View Buttons

| Button | Label | Style | Action |
|--------|-------|-------|--------|
| Close (X) | X icon | Ghost, icon | Closes comparison overlay |
| Year Selector | Dropdown | Select | Changes forecast comparison year |

## 5.4 Auth Page Buttons

| Button | Label | Style | Action | States |
|--------|-------|-------|--------|--------|
| Sign In | "Sign In" | Primary, full-width | Submits sign-in form | Loading (spinner), Disabled |
| Create Account | "Create Account" | Primary, full-width | Submits sign-up form | Loading (spinner), Disabled |
| Sign In Tab | "Sign In" | Tab trigger | Switches to sign-in form | Active/Inactive |
| Sign Up Tab | "Sign Up" | Tab trigger | Switches to sign-up form | Active/Inactive |

## 5.5 Alerts Page Buttons

| Button | Label | Style | Action |
|--------|-------|-------|--------|
| Edit Threshold | "Edit Threshold" | Outline, sm | Opens inline slider editor |
| Save | "Save" | Primary, sm | Saves new threshold value |
| Cancel | "Cancel" | Ghost, sm | Cancels editing |
| Remove | "Remove" (with Trash2 icon) | Ghost, sm (destructive) | Deletes subscription |
| Browse Stations | "Browse Stations" | Primary | Navigates to dashboard |
| Active Toggle | Switch | — | Enables/disables subscription |

## 5.6 Download Buttons

| Button | Label | Location | Action |
|--------|-------|----------|--------|
| Download as PDF | "Download as PDF" (FileText icon) | Project Guide | Opens HTML in new tab for print-to-PDF |
| Download as Markdown | "Download as Markdown" (Download icon) | Project Guide | Downloads .md file directly |
| Download as PDF | "Download as PDF" | Product Docs | Generates styled HTML for print |
| Download as Markdown | "Download as Markdown" | Product Docs | Downloads .md file |
| Download as DOCX | "Download as DOCX" | Product Docs | Downloads .docx file |

---

# 6. Charts, Graphs & Data Visualizations

## 6.1 Forecast Line Chart (Forecast Panel → Forecast Tab)

**Chart Title:** Station-level AQI forecast  
**Chart Type:** Line chart (Recharts LineChart)  
**Data Represented:** Yearly predicted AQI values per station (2025–2029+)  
**X-Axis:** Year (2025, 2026, 2027, 2028, 2029)  
**Y-Axis:** AQI value  
**Lines:**
- Solid line: Predicted AQI per year
- Shaded area: Upper/lower confidence bounds (95% CI)

**Legend:**
- Blue line: Predicted AQI
- Shaded band: Confidence interval

**Interactive Behavior:**
- Hover: Tooltip shows year, predicted AQI, upper/lower bounds
- Station selection: Chart updates when a different station is selected from the list

**Insights:** Shows whether a station's air quality is expected to improve or deteriorate over the forecast horizon.

## 6.2 Zone Distribution Pie Chart (Comparison View)

**Chart Title:** "Zone Distribution for [Year]"  
**Chart Type:** Pie/Donut chart  
**Data Represented:** Proportion of stations in each AQI zone for the selected forecast year  
**Segments:**
- Blue/Green: Stations in Good zone (AQI ≤ 100)
- Yellow: Stations in Moderate zone (AQI 101–200)
- Red: Stations in Poor zone (AQI 201+)

**Data Calculation:** Count of stations per zone ÷ total stations × 100  
**Interactive Behavior:** Hover shows segment count and percentage  
**Insights:** "The pie chart visualizes the proportion of monitoring stations within different AQI categories. A larger red segment indicates most stations are predicted to have poor air quality."

## 6.3 Trend Distribution Bar Chart (Comparison View)

**Chart Title:** "Trend Distribution (2025–2029)"  
**Chart Type:** Stacked or grouped bar chart  
**Data Represented:** Count of stations by trend category across forecast years  
**Categories:**
- Green bars: Improving (predicted AQI drops by >10 from current)
- Yellow bars: Stable (within ±10 of current AQI)
- Red bars: Declining (predicted AQI rises by >10 from current)

**X-Axis:** Forecast years  
**Y-Axis:** Number of stations  
**Insights:** Shows aggregate trend direction across all stations over time.

## 6.4 Livability Mini Line Chart (Livability Side Panel)

**Chart Title:** "Historical + 5-Year Forecast"  
**Chart Type:** Line chart with dot markers  
**Data Represented:** Historical AQI + forecast AQI for a single station  
**X-Axis:** Year  
**Y-Axis:** AQI  
**Reference Lines:**
- Green dashed line at AQI 100 (Good threshold)
- Red dashed line at AQI 200 (Poor threshold)

**Dot Colors:**
- Blue dots: Historical data points
- Purple dots (larger): Forecast predictions

**Legend:**
- Blue circle = Historical
- Purple circle = Predicted

**Interactive Behavior:** Tooltip shows year and AQI value on hover

## 6.5 Monthly Pattern Bar Chart (Seasonal Analysis → Monthly Tab)

**Chart Title:** "City-Wide Monthly AQI Patterns"  
**Chart Type:** Bar chart  
**Data Represented:** Average AQI for each month (January–December)  
**X-Axis:** Month names  
**Y-Axis:** Average AQI  
**Bar Colors:** Colored by AQI severity level for each month  
**Insights:** November–January typically show worst air quality; July–September are best.

## 6.6 Seasonal Overview Cards (Seasonal Analysis → Overview Tab)

**Type:** Summary cards with statistics  
**Data:** Average AQI per season (Winter, Summer, Monsoon, Post-Monsoon)  
**Visual:** Large AQI number + trend indicator + color coding  
**Insights:** Monsoon months have cleanest air due to rain washing pollutants.

## 6.7 Outdoor Activity Calendar (Seasonal Analysis → Activities Tab)

**Type:** Calendar/grid visualization  
**Data:** Month-by-month activity safety ratings  
**Color Coding:**
- Green: Safe for outdoor activities
- Yellow: Moderate, exercise caution
- Red: Avoid outdoor activities

**Insights:** Helps users plan outdoor events around pollution patterns.

## 6.8 AQI Heatmap Layer (Map)

**Type:** Leaflet.heat gradient overlay  
**Data:** Station coordinates weighted by AQI value  
**Color Gradient:** Green → Yellow → Red (low → high AQI)  
**Purpose:** Shows pollution density distribution across Delhi  
**Interactive:** Layer can be toggled on/off via Layer Controls

## 6.9 Voronoi Diagram Layer (Map)

**Type:** D3-Delaunay Voronoi tessellation  
**Data:** Station coordinates as generator points  
**Polygon Colors:** Colored by station's AQI zone (blue/yellow/red)  
**Purpose:** Defines influence regions — every map point assigned to its nearest station  
**Mathematical Basis:** Region(i) = { p | distance(p, station_i) < distance(p, station_j) for all j ≠ i }

## 6.10 Livability Voronoi Layer (Map)

**Type:** On-demand Voronoi overlay  
**Data:** Station livability scores computed from forecast data  
**Color Gradient:** Green (highly livable) → Yellow (moderate) → Red (not livable)  
**Purpose:** Shows livability classification for every area of Delhi  
**Interactive:** Click any polygon to see livability details in side panel

## 6.11 Influence Buffer Circles (Map)

**Type:** Concentric circle overlays  
**Data:** Station locations with 5km and 10km radius buffers  
**Purpose:** Visualizes each station's area of measurement influence  
**Color:** Matches station zone color with reduced opacity

## 6.12 Forecast Markers Layer (Map)

**Type:** Circle markers  
**Data:** Forecast predictions for selected year  
**Color:** Based on predicted AQI zone  
**Interactive:** Click to view station details

## 6.13 Model Metrics Display (Forecast Panel → ML Model Tab)

**Type:** Cards with statistics  
**Data Displayed:**

| Metric | Meaning |
|--------|---------|
| RMSE | Root Mean Squared Error — average prediction error magnitude |
| MAE | Mean Absolute Error — average absolute deviation |
| R² Score | Coefficient of determination — model fit quality (0-1) |
| Training Size | Number of training samples |
| Test Size | Number of test samples |
| n_estimators | Number of XGBoost trees |
| max_depth | Maximum tree depth |
| Learning Rate | XGBoost learning rate |

## 6.14 Feature Importance Bar Chart (Forecast Panel → ML Model Tab)

**Type:** Horizontal bar chart with progress bars  
**Data:** Ranked list of features by importance score  
**Features may include:** lag_1, lag_2, rolling_mean_3, month, season, year, pm25, pm10  
**Color:** Primary color fill with percentage labels  
**Insights:** Shows which input features most influence AQI predictions

---

# 7. Tables & Data Grid Explanation

## 7.1 Comparison Table (Comparison View)

**Table Purpose:** Side-by-side comparison of current vs. predicted AQI for every station

| Column | Data Type | Meaning | Calculation |
|--------|-----------|---------|-------------|
| Station | String | Monitoring station name | Direct from data |
| Zone Change Badge | Badge | "Zone Change" if zone differs | Compares current vs predicted zone |
| Current (Live) | Number + Badge | Current AQI reading + zone | Live data from API |
| → Arrow | Icon | Visual separator | Decorative |
| [Year] (Predicted) | Number + Badge | Predicted AQI + zone | From AI forecast model |
| Change | Signed Number | Difference (predicted - current) | predicted - current AQI |
| Trend | Badge | "Improving" / "Stable" / "Declining" | Based on ±10 threshold |
| Confidence | Percentage | Model confidence | From forecast data |
| Recommendation | Collapsible text | AI-generated guidance | Expandable section |

**Row Interpretation:** Each row represents one monitoring station. Green change values indicate improvement; red indicates deterioration. Rows without prediction data are greyed out.

**Sorting:** Stations with predictions first, then sorted by improvement potential (best improvements at top).

## 7.2 Forecast Station List (Forecast Panel)

**Purpose:** Selectable list of all stations with forecast summaries

| Column | Data |
|--------|------|
| Station Name | Name + type badge |
| Trend Icon | Arrow indicating direction |
| Year Predictions | AQI per forecast year |
| Recommendation | Brief text |

## 7.3 5-Year Forecast Details (Livability Side Panel)

| Column | Data |
|--------|------|
| Year | 2025, 2026, 2027, 2028, 2029 |
| AQI | Predicted AQI value |
| Category Badge | "Good" / "Moderate" / "Poor" etc. |
| Confidence | Percentage in parentheses |

---

# 8. Filters, Sliders & Controls

## 8.1 Zone Filter Buttons

**Location:** Dashboard control bar  
**Type:** Pill-shaped toggle buttons  
**Options:** All | Blue Zone | Yellow Zone | Red Zone  
**Behavior:** Selecting a zone filters map markers and station list. Clicking active zone deselects (shows all).  
**Visual:** Active zone uses solid fill color; inactive uses background tint with border.

## 8.2 Year Selector Dropdown (Comparison View)

**Location:** Comparison view header  
**Type:** Select dropdown  
**Options:** Available forecast years (e.g., 2025, 2026, 2027, 2028, 2029)  
**Behavior:** Changes the predicted year column in comparison table and zone distribution chart.

## 8.3 Year Slider (Map)

**Location:** Bottom-left of map  
**Type:** Custom slider component  
**Visibility:** Only when forecast layer is active  
**Options:** Forecast years  
**Behavior:** Changes which year's forecast is displayed on the forecast layer markers.

## 8.4 Livability Year Slider (Livability Side Panel)

**Location:** Top of livability side panel  
**Type:** Slider component  
**Options:** 2025–2029  
**Behavior:** Updates livability score, classification, and chart for selected year.

## 8.5 AQI Threshold Slider (Alerts Page)

**Location:** Inline within subscription card (edit mode)  
**Type:** Slider (Radix UI)  
**Range:** 50–400, step 10  
**Labels:** "Good (50)" — "Hazardous (400)"  
**Behavior:** Changes the AQI value that triggers an alert notification.

## 8.6 Map Layer Toggles

**Location:** Layer controls dropdown on map  
**Type:** Checkbox menu items  
**Behavior:** Each toggle shows/hides a specific map layer independently.

## 8.7 Active/Inactive Toggle (Alerts)

**Location:** Each alert subscription card  
**Type:** Switch component  
**Behavior:** Enables or disables the alert without deleting it. Disabled cards appear at 60% opacity.

## 8.8 Theme Toggle

**Location:** Header, right side  
**Type:** Icon button (Sun/Moon)  
**Behavior:** Switches between light and dark modes. Persists via localStorage.

---

# 9. Navigation System

## 9.1 Top Navigation (Header)

**Type:** Horizontal navigation bar (sticky, glassmorphism effect)  
**Structure:**
- **Left:** Logo (Wind icon + "Delhi AQI" text) → links to \`/\`
- **Center-Right:** Navigation links (hidden on mobile)
  - Neighborhoods (MapPin icon)
  - Docs (FileText icon)
  - Guide (BookOpen icon)
- **Right:** Theme toggle + Auth button/User menu

## 9.2 Tab Navigation

Used in multiple contexts:

| Context | Tabs |
|---------|------|
| Neighborhoods Page | Rankings, Top Picks, Avoid |
| Documentation Page | Overview, Features, Technology, Data & ML, Mapping, Architecture, Future |
| Forecast Panel | Forecast, ML Model |
| Seasonal Analysis | Overview, Monthly, Activities, Stations |
| Auth Page | Sign In, Sign Up |

## 9.3 Route Navigation

**Type:** React Router v6 with BrowserRouter  
**Route Protection:** \`/alerts\` requires authentication (redirects to \`/auth\`)  
**Auth Redirect:** \`/auth\` redirects to \`/\` if already authenticated

## 9.4 Keyboard Navigation

| Key | Context | Action |
|-----|---------|--------|
| Escape | Dashboard | Closes topmost overlay/panel |
| Escape | Livability panel | Closes side panel |
| Escape | Forecast/Comparison/Seasonal | Closes overlay |
| Arrow Up/Down | Station search | Navigate search results |
| Enter | Station search | Select highlighted result |
| Escape | Station search | Close dropdown |

---

# 10. User Journey / Workflow

## Workflow 1: Check Current Air Quality

\`\`\`
User opens dashboard
→ Views average AQI + zone counters in control bar
→ Scans map for color-coded station markers
→ Clicks a station marker on map
→ Views station card with AQI, pollutants, zone
→ (Optional) Clicks "Get Alerts" to subscribe
\`\`\`

## Workflow 2: Generate and Analyze Forecast

\`\`\`
User clicks "5-Year Forecast" button
→ System calls AI edge function (shows loading spinner)
→ Forecast Panel opens as full-screen overlay
→ User browses station list on left
→ Selects a station to see its forecast chart
→ Switches to "ML Model" tab for model metrics
→ Clicks "Compare" button for current vs. predicted view
→ Adjusts year dropdown to compare different years
→ Reviews zone distribution pie chart and trend bar chart
→ Exports data via export button
\`\`\`

## Workflow 3: Find Best Neighborhood to Live

\`\`\`
User navigates to /neighborhoods
→ System auto-generates forecasts
→ Reviews ranked list in "Rankings" tab
→ Switches to "Top Picks" for best areas
→ Checks "Avoid" tab for worst areas
→ Compares livability scores, trends, best/worst years
→ Makes informed residential decision
\`\`\`

## Workflow 4: Explore Livability on Map

\`\`\`
User clicks "Layers" button on map
→ Enables "Livability Index" layer
→ Map shows livability-colored Voronoi regions
→ Clicks on a colored region
→ Livability Side Panel opens on right
→ Views score, trend, forecast chart, year slider
→ Adjusts year to see score evolution
→ Reads suitability recommendation
\`\`\`

## Workflow 5: Seasonal Activity Planning

\`\`\`
User clicks "Seasonal" button
→ Seasonal Analysis Panel opens
→ Reviews Overview tab for seasonal averages
→ Switches to Monthly tab for month-by-month chart
→ Checks Activities tab for outdoor calendar
→ Plans outdoor events in green-marked months
\`\`\`

## Workflow 6: Set Up Alerts

\`\`\`
User clicks "Sign In" in header
→ Creates account or signs in
→ Returns to dashboard
→ Clicks station marker → views station card
→ Clicks "Get Alerts" button
→ Navigates to /alerts via user menu
→ Adjusts AQI threshold with slider
→ Saves configuration
→ Receives email when AQI exceeds threshold
\`\`\`

---

# 11. Data & Backend Architecture

## 11.1 Data Sources

| Source | Type | Frequency | Purpose |
|--------|------|-----------|---------|
| CPCB/DPCC Stations | Live API | ~5 min refresh | Real-time AQI readings |
| Historical CSV | Static file | Pre-loaded | Training data for forecasts |
| historical_aqi table | Database | Hourly inserts | Accumulated readings |
| AI Model (Gemini) | Edge function | On-demand | Forecast generation |

## 11.2 Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| profiles | User information | user_id, email, full_name |
| saved_locations | Favorite stations | user_id, station_id, lat, lng |
| alert_subscriptions | Alert configs | user_id, station_id, aqi_threshold, is_active |
| historical_aqi | AQI history | station_id, aqi, pm25, pm10, recorded_at, zone |

## 11.3 Edge Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| fetch-aqi | /fetch-aqi | Fetches live AQI from CPCB API |
| forecast-aqi | /forecast-aqi | Generates AI-powered 5-year forecasts |

## 11.4 Authentication System

- Email/password authentication
- Protected routes for alert management
- Session-based user identification
- Profile auto-creation on signup

## 11.5 ML Pipeline (AI-Powered)

| Component | Implementation |
|-----------|---------------|
| Model Concept | XGBoost Regression |
| Actual Engine | Gemini AI with ML-context prompting |
| Features | Lag values, rolling means, seasonality, trend |
| Output | Year-by-year AQI predictions + confidence intervals |
| Evaluation | RMSE, MAE, R² metrics |
| Fallback | Local deterministic forecasting engine |

---

# 12. UX / UI Design Rationale

## Why Summary Cards Are Used
Cards provide scannable, modular information units. The Avg AQI card and zone counters give users immediate situational awareness without interacting with the map.

## Why Pie Charts Show Distribution
Zone distribution as a pie chart immediately communicates the proportion of good vs. bad areas. A majority red segment is visually alarming, prompting action.

## Why Bar Charts Show Yearly Trends
Bar charts effectively compare discrete time periods (years). Stacked bars show how the distribution of improving/stable/declining stations evolves.

## Why Tables Show Station-Level Data
Comparison tables enable row-by-row analysis of every station, supporting detailed evaluation that charts cannot provide. The 12-column grid layout maximizes information density.

## Why the Map Is Full-Screen
Air quality is inherently spatial. A full-screen map maximizes the geographic context and allows users to explore areas intuitively through familiar map interactions.

## Why Voronoi Diagrams Are Used
Voronoi tessellation mathematically divides the map so every point belongs to its nearest station, providing complete coverage without gaps or overlaps.

## Why Livability Uses a Side Panel
The side panel provides detailed analysis without navigating away from the map, maintaining spatial context while showing time-series data.

## Why Zone Colors Are Blue/Yellow/Red
This follows established traffic-light convention: Blue/Green = safe, Yellow = caution, Red = danger. Universally understood without explanation.

## Why Dark Mode Is Supported
Many users check AQI early morning or late evening. Dark mode reduces eye strain and battery consumption on OLED screens.

---

# 13. Edge Cases & System States

## 13.1 Loading States

| Context | Indicator | Message |
|---------|-----------|---------|
| Initial page load | Loader2 spinner | — |
| AQI data fetch | RefreshCw spinning | — |
| Forecast generation | Loader2 + disabled button | "Opening..." |
| Neighborhood analysis | Loader2 + text | "Analyzing neighborhood data..." |
| Auth form submit | Loader2 in button | Button disabled |
| Alert operations | — | Toast notifications |

## 13.2 Error States

| Context | Handling |
|---------|---------|
| AQI fetch fails | Falls back to demo/fallback data |
| Forecast AI fails | Falls back to local deterministic engine |
| Auth invalid credentials | Toast: "Invalid email or password" |
| Auth duplicate email | Toast: "This email is already registered" |
| No stations loaded | Toast: "No station data available" |
| Alert subscribe while logged out | Toast: "Please sign in to subscribe to alerts" |

## 13.3 Empty States

| Context | Display |
|---------|---------|
| No alert subscriptions | Bell icon + message + "Browse Stations" CTA |
| No forecast data | AlertTriangle icon + "Generate Forecasts" button |
| No search results | "No stations found" + coordinate suggestion |
| No red-zone areas | ThumbsUp icon + "Good News!" message |
| Stations list empty | Empty container |

## 13.4 Permission Restrictions

| Resource | Restriction | Handling |
|----------|-------------|---------|
| /alerts page | Requires authentication | Redirects to /auth |
| Alert subscription | Requires authentication | Toast error message |
| /auth page | Redirects if authenticated | Navigates to / |

## 13.5 Data Availability

| Scenario | Behavior |
|----------|----------|
| Live API available | Shows green "Live" indicator |
| Live API unavailable | Shows grey "Demo" indicator, uses fallback data |
| Prediction unavailable for station | Row greyed out, "Unavailable" text + info tooltip |
| Missing pollutant data | Pollutant fields not rendered |

---

# Appendix A: Color System Reference

## AQI Color Scale
| AQI Range | Label | Color |
|-----------|-------|-------|
| 0–50 | Good | #22c55e (Green) |
| 51–100 | Satisfactory | #84cc16 (Lime) |
| 101–200 | Moderate | #eab308 (Yellow) |
| 201–300 | Poor | #f97316 (Orange) |
| 301–400 | Very Poor | #ef4444 (Red) |
| 401+ | Severe | #7f1d1d (Dark Red) |

## Zone Colors
| Zone | Background | Text |
|------|-----------|------|
| Blue | bg-zone-blue | White |
| Yellow | bg-zone-yellow | Foreground |
| Red | bg-zone-red | White |

## Trend Colors
| Trend | Color | Icon |
|-------|-------|------|
| Improving | Green (#22c55e) | TrendingDown |
| Stable | Yellow (#eab308) | Minus |
| Declining | Red (#ef4444) | TrendingUp |

---

# Appendix B: Keyboard Shortcuts

| Shortcut | Context | Action |
|----------|---------|--------|
| ESC | Any overlay | Close topmost modal/panel |
| ↑ / ↓ | Station search | Navigate results |
| Enter | Station search | Select result |
| ESC | Search dropdown | Close dropdown |

---

*End of Product Documentation*
*SafeDelhiAQI — AI-Powered Air Quality & Livability Intelligence Platform*
`;
}

export function getProductDocsHTML(markdown: string): string {
  // Convert markdown to basic HTML
  let html = markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  // Handle tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.every(c => /^[\s-:]+$/.test(c))) return '';
    const tag = 'td';
    return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
  });

  // Handle code blocks
  html = html.replace(/```[a-z]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Wrap paragraphs
  html = html.replace(/^(?!<[h|l|t|p|u|o|d|b|c|s|i|r])((?!\s*$).+)$/gm, '<p>$1</p>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SafeDelhiAQI — Complete Product Documentation</title>
<style>
  @media print { body { margin: 0; } @page { size: A4; margin: 1.5cm; } }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 900px; margin: 0 auto; padding: 40px 30px; background: white; }
  h1 { font-size: 28px; color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; margin-top: 40px; page-break-after: avoid; }
  h2 { font-size: 22px; color: #1e40af; margin-top: 32px; page-break-after: avoid; }
  h3 { font-size: 17px; color: #334155; margin-top: 24px; }
  p { margin: 8px 0; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.9em; }
  pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
  pre code { background: transparent; color: inherit; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; page-break-inside: avoid; }
  th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
  tr:nth-child(even) { background: #fafbfc; }
  hr { border: none; border-top: 2px solid #e2e8f0; margin: 32px 0; }
  li { margin: 4px 0; }
  strong { color: #0f172a; }
  blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #475569; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

export function generateDocxBlob(markdown: string): Blob {
  // Generate a simple DOCX-compatible HTML with Word-specific styles
  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; }
  h1 { font-size: 20pt; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; }
  h2 { font-size: 16pt; color: #1e40af; }
  h3 { font-size: 13pt; color: #334155; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 10pt; }
  th { background: #f0f0f0; }
  code { font-family: Consolas, monospace; background: #f5f5f5; padding: 1px 4px; }
  pre { background: #1e293b; color: #e2e8f0; padding: 12px; font-family: Consolas, monospace; font-size: 9pt; }
  hr { border: none; border-top: 1px solid #ddd; }
</style>
</head>
<body>
${markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/```[a-z]*\n([\s\S]*?)```/g, '<pre>$1</pre>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return '';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/^(?!<[h|l|t|p|u|o|d|b|c|s|i|r])((?!\s*$).+)$/gm, '<p>$1</p>')}
</body>
</html>`;

  return new Blob([docHtml], { type: 'application/vnd.ms-word;charset=utf-8' });
}
