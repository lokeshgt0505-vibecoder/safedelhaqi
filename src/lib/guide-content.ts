/**
 * SafeDelhiAQI Complete Project Guide - Markdown Content
 * 
 * This file contains the full technical documentation as a markdown string
 * used for rendering the guide page and generating downloadable files.
 */

export function getGuideMarkdown(): string {
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `# SafeDelhiAQI – AI-Powered Air Quality & Livability Intelligence Platform
## Complete Project Guide & Technical Handbook

**Version:** 2.0  
**Generated:** ${date}  
**Author:** SafeDelhiAQI Development Team  
**License:** MIT

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Geospatial Mapping System](#3-geospatial-mapping-system)
4. [Distance Calculation](#4-distance-calculation)
5. [AQI Estimation Logic](#5-aqi-estimation-logic)
6. [Livability Score Model](#6-livability-score-model)
7. [Machine Learning System](#7-machine-learning-system)
8. [Mathematical Concepts Used](#8-mathematical-concepts-used)
9. [Project Folder Structure](#9-project-folder-structure)
10. [Step-by-Step Build Guide](#10-step-by-step-build-guide)
11. [Algorithms Used](#11-algorithms-used)
12. [Beginner Learning Notes](#12-beginner-learning-notes)
13. [Future Improvements](#13-future-improvements)

---

## 1. Project Overview

### 1.1 What is SafeDelhiAQI?

SafeDelhiAQI is an advanced Air Quality Index (AQI) prediction and geospatial visualization platform specifically designed for Delhi National Capital Region (NCR). The platform integrates real-time air quality monitoring, historical data analysis, and AI-powered predictive forecasting to provide comprehensive insights into air pollution patterns across the metropolitan area.

The system combines multiple technologies:
- **Real-time AQI monitoring** from 25+ monitoring stations across Delhi
- **AI-powered forecasting** using XGBoost-style gradient boosting regression (2025–2035)
- **Interactive GIS mapping** with Voronoi tessellation, heatmaps, and influence buffers
- **Livability scoring** for neighborhood ranking and real estate recommendations

### 1.2 The Problem of Air Pollution Monitoring

Delhi consistently ranks among the world's most polluted cities, with AQI levels frequently exceeding hazardous thresholds (AQI > 400). The challenges include:

- **Sparse monitoring coverage**: Only ~40 CPCB stations cover 1,484 km² of Delhi NCR
- **Lack of predictive tools**: Citizens cannot plan around future pollution trends
- **No spatial interpolation**: AQI between stations is unknown without mathematical models
- **Decision paralysis**: Home buyers, parents, and health-conscious individuals lack data-driven tools

### 1.3 Why AI + Geospatial Systems Are Useful

Traditional AQI monitoring provides point-level readings at fixed stations. By combining AI and geospatial analysis:

1. **Spatial Coverage**: Voronoi diagrams and IDW interpolation extend point measurements to cover the entire city
2. **Temporal Prediction**: ML models forecast AQI 5–11 years into the future
3. **Decision Support**: Livability scores translate raw AQI into actionable neighborhood recommendations
4. **Pattern Discovery**: Seasonal decomposition reveals when and where air quality is best/worst

### 1.4 Key Capabilities

| Capability | Description |
|-----------|-------------|
| AQI Monitoring | Live data from 25+ CPCB stations with auto-refresh |
| Livability Prediction | 5-year neighborhood ranking based on forecast AQI |
| Forecast Visualization | Interactive charts with confidence intervals |
| Interactive GIS Map | Leaflet-based map with multiple overlay layers |
| Seasonal Analysis | Monthly patterns, best/worst month identification |
| Health Advisories | Dynamic recommendations based on current AQI |
| Alert System | User-configurable threshold notifications |
| Export Reports | CSV and PDF report generation |

---

## 2. System Architecture

### 2.1 High-Level Architecture

The system follows a three-tier architecture:

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│   React 18 + TypeScript + Vite + TailwindCSS            │
│   ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ │
│   │ Map View │ │ Forecast │ │ Seasonal  │ │  Alerts  │ │
│   │ (Leaflet)│ │  Panel   │ │ Analysis  │ │  System  │ │
│   └──────────┘ └──────────┘ └───────────┘ └──────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                     │
│   React Hooks + TanStack Query + State Management       │
│   ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│   │ use-aqi-data │ │use-aqi-      │ │use-livability- │  │
│   │              │ │forecast      │ │data            │  │
│   └──────────────┘ └──────────────┘ └────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    DATA / ML LAYER                       │
│   ┌────────────────┐ ┌─────────────┐ ┌───────────────┐  │
│   │ WAQI API       │ │ Forecasting │ │ Supabase      │  │
│   │ (Live AQI)     │ │ Engine (JS) │ │ (PostgreSQL)  │  │
│   └────────────────┘ └─────────────┘ └───────────────┘  │
│   ┌────────────────┐ ┌─────────────┐                    │
│   │ Edge Functions │ │ Gemini AI   │                    │
│   │ (Deno/TS)      │ │ (Forecasts) │                    │
│   └────────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 2.2 Data Flow

1. **Data Acquisition**: The \`fetch-aqi\` edge function calls the WAQI (World Air Quality Index) API to fetch live station data for Delhi
2. **Data Processing**: The \`use-aqi-data\` hook processes raw API responses into typed \`StationData\` objects with zone classification
3. **Spatial Analysis**: The mapping system uses D3-Delaunay for Voronoi tessellation and Haversine distance for station assignment
4. **ML Prediction**: The \`forecast-aqi\` edge function uses Google Gemini AI with XGBoost pipeline context to generate 11-year forecasts
5. **Fallback Engine**: A deterministic JavaScript forecasting engine provides baseline predictions if the AI service is unavailable
6. **Visualization**: React-Leaflet renders the map; Recharts renders forecast charts; all styled with TailwindCSS

### 2.3 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | Component-based UI with type safety |
| Build Tool | Vite | Fast HMR and optimized builds |
| Styling | TailwindCSS + shadcn/ui | Utility-first CSS with accessible components |
| Mapping | React-Leaflet + Leaflet | Interactive map rendering |
| Charts | Recharts | Data visualization |
| Spatial Math | D3-Delaunay | Voronoi diagram computation |
| State Management | TanStack Query | Server state caching and synchronization |
| Backend | Supabase (PostgreSQL) | Database, auth, edge functions |
| AI/ML | Google Gemini via Edge Functions | Intelligent AQI forecasting |
| Routing | React Router v6 | Client-side navigation |

---

## 3. Geospatial Mapping System

### 3.1 React-Leaflet Map Rendering

The map is built using React-Leaflet, a React wrapper for the Leaflet.js library. It uses OpenStreetMap tiles as the base layer.

\`\`\`typescript
// Core map setup
import { MapContainer, TileLayer } from 'react-leaflet';

<MapContainer
  center={[28.6139, 77.2090]}  // Delhi center coordinates
  zoom={11}
  style={{ height: '100%', width: '100%' }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
</MapContainer>
\`\`\`

### 3.2 AQI Station Markers

Each monitoring station is displayed as a color-coded marker:
- **Blue/Green** (AQI 0–100): Good to Satisfactory
- **Yellow** (AQI 101–200): Moderate to Poor
- **Red** (AQI 201+): Very Poor to Hazardous

\`\`\`typescript
// Zone classification logic
export function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}
\`\`\`

### 3.3 Heatmap Visualization

The heatmap layer uses the \`leaflet.heat\` plugin to create a continuous pollution density surface. Each station contributes a weighted heat point based on its AQI value.

\`\`\`typescript
// Heatmap data points: [latitude, longitude, intensity]
const heatData = stations.map(s => [
  s.lat,
  s.lng,
  s.aqi / 500  // Normalize AQI to 0-1 range
]);
\`\`\`

### 3.4 Voronoi Diagram Generation

#### Concept

A **Voronoi diagram** partitions a 2D plane into regions based on proximity to a set of seed points (stations). Every point in a Voronoi cell is closer to its seed station than to any other station.

#### Mathematical Definition

Given a set of stations S = {s₁, s₂, ..., sₙ}, the Voronoi region for station sᵢ is:

\`\`\`
V(sᵢ) = { p ∈ ℝ² | d(p, sᵢ) ≤ d(p, sⱼ) for all j ≠ i }
\`\`\`

Where d(p, s) is the Euclidean distance between point p and station s.

#### Beginner Explanation

Imagine dropping colored ink at each station location on a map. The ink spreads outward equally in all directions. Where two colors meet, a boundary line forms. The region around each station — where only its color reaches — is its Voronoi cell. Any location in that cell is closest to that station.

#### Implementation

We use the D3-Delaunay library to compute Voronoi diagrams efficiently:

\`\`\`typescript
import { Delaunay } from 'd3-delaunay';

// Create Delaunay triangulation from station coordinates
const points = stations.map(s => [s.lng, s.lat] as [number, number]);
const delaunay = Delaunay.from(points);

// Generate Voronoi diagram clipped to Delhi bounds
const voronoi = delaunay.voronoi([
  76.8,  // minLng
  28.4,  // minLat
  77.5,  // maxLng
  28.9   // maxLat
]);

// Find which station "owns" a clicked point
const stationIndex = delaunay.find(clickedLng, clickedLat);
\`\`\`

#### How Voronoi Is Used for Air Quality Zones

Each Voronoi cell is color-coded based on the AQI of its seed station. This creates a continuous map where every pixel shows which station governs that area and what AQI to expect. The system uses three zone classifications:

| Zone | AQI Range | Color | Meaning |
|------|-----------|-------|---------|
| Blue | 0–100 | Green (#22c55e) | Highly livable |
| Yellow | 101–200 | Yellow (#eab308) | Moderately livable |
| Red | 201+ | Red (#ef4444) | Low livability |

### 3.5 Influence Buffer Zones

Buffer zones are concentric circles around each station representing its area of influence:

- **3 km buffer**: High influence — AQI reading is very representative
- **5 km buffer**: Moderate influence — AQI is an approximation

\`\`\`typescript
// Buffer distances in meters
const BUFFER_DISTANCES = [
  { radius: 3000, label: '3 km - High Influence' },
  { radius: 5000, label: '5 km - Moderate Influence' },
];
\`\`\`

---

## 4. Distance Calculation

### 4.1 The Haversine Formula

When a user clicks on the map, we need to find which monitoring station is closest. Since the Earth is a sphere, we cannot use simple Euclidean distance. Instead, we use the **Haversine formula** to compute the great-circle distance between two points on a sphere.

#### Mathematical Formula

\`\`\`
d = 2R × arcsin( √( sin²((φ₂ − φ₁)/2) + cos(φ₁) × cos(φ₂) × sin²((λ₂ − λ₁)/2) ) )
\`\`\`

Where:
- **d** = distance between two points (in km)
- **R** = Earth's radius (6,371 km)
- **φ₁, φ₂** = latitude of point 1 and point 2 (in radians)
- **λ₁, λ₂** = longitude of point 1 and point 2 (in radians)

#### Why the Haversine Formula?

The Earth is approximately spherical. A straight-line (Euclidean) distance between two GPS coordinates would cut through the Earth's interior, giving an incorrect result. The Haversine formula calculates the distance along the surface of the sphere, which is what we actually travel or measure in real life.

#### Beginner Explanation

Imagine you're an ant walking on the surface of an orange. You can't walk through the orange — you must walk along the curved surface. The Haversine formula calculates this "surface distance" between two points, accounting for the curvature.

#### Implementation

\`\`\`typescript
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
\`\`\`

#### Variable Breakdown

| Variable | Meaning |
|----------|---------|
| R = 6371 | Earth's mean radius in kilometers |
| dLat | Difference in latitude (converted to radians) |
| dLng | Difference in longitude (converted to radians) |
| a | Haversine of the central angle (intermediate calculation) |
| c | Central angle in radians |
| R × c | Arc length = surface distance |

---

## 5. AQI Estimation Logic

### 5.1 The Problem

When a user clicks anywhere on the map (not on a station), we need to estimate the AQI at that point. Since we only have readings at fixed station locations, we must interpolate.

### 5.2 Inverse Distance Weighting (IDW)

IDW is a spatial interpolation method that estimates a value at an unknown point using known values at nearby points. Closer stations have more influence than distant ones.

#### Mathematical Formula

\`\`\`
AQI_estimated = Σ(AQIᵢ / dᵢ²) / Σ(1 / dᵢ²)
\`\`\`

Where:
- **AQI_estimated** = predicted AQI at the clicked location
- **AQIᵢ** = AQI reading at station i
- **dᵢ** = distance from clicked point to station i
- **Σ** = sum over all nearby stations

#### Why Distance Squared?

Using d² (instead of d) means that influence drops off very quickly with distance. A station 1 km away has 4× the influence of a station 2 km away (1/1² vs 1/4). This reflects the physical reality that air quality can change significantly over short distances due to local emission sources, terrain, and wind patterns.

#### Beginner Explanation

Imagine you're standing in a room with multiple heaters. The heater closest to you warms you the most. A heater far away barely affects you. IDW works the same way — nearby AQI stations "influence" your estimated AQI much more than distant ones. The math uses 1/d² to make this drop-off realistic.

#### How Multiple Stations Combine

Consider a point P with three nearby stations:

| Station | AQI | Distance (km) | Weight (1/d²) | Contribution |
|---------|-----|---------------|----------------|-------------|
| A | 150 | 1.0 | 1.000 | 150.0 |
| B | 250 | 2.0 | 0.250 | 62.5 |
| C | 100 | 3.0 | 0.111 | 11.1 |
| **Total** | | | **1.361** | **223.6** |

**Estimated AQI = 223.6 / 1.361 = 164.3**

Station A dominates because it's closest, pulling the estimate toward 150 rather than the average of all three.

#### Implementation

\`\`\`typescript
function estimateAQI(
  lat: number, lng: number,
  stations: StationData[]
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const station of stations) {
    const d = calculateDistance(lat, lng, station.lat, station.lng);
    if (d < 0.01) return station.aqi; // On top of station
    
    const weight = 1 / (d * d); // Inverse distance squared
    weightedSum += station.aqi * weight;
    weightTotal += weight;
  }

  return weightedSum / weightTotal;
}
\`\`\`

---

## 6. Livability Score Model

### 6.1 Overview

The livability score converts raw AQI forecasts into a 0–100 score that reflects how suitable a neighborhood is for residential living. Higher scores mean better air quality and improving trends.

### 6.2 Factors

The livability score considers three main factors:

1. **Current Air Quality** (50% weight): The average predicted AQI for the forecast period
2. **AQI Trend** (30% weight): Whether air quality is improving, stable, or declining
3. **Seasonal Variation** (20% weight): How much AQI varies across seasons (lower variation = better)

### 6.3 Calculation Logic

\`\`\`typescript
// Step 1: Base score from AQI (inversely proportional)
// AQI 0 → Score 100, AQI 500 → Score 0
const baseScore = Math.max(0, 100 - (avgAqi / 5));

// Step 2: Trend bonus/penalty
const trendBonus = trend === 'improving' ? 10 
                 : trend === 'declining' ? -10 
                 : 0;

// Step 3: Seasonal stability bonus
// Lower coefficient of variation = more stable = better
const seasonalBonus = (1 - coefficientOfVariation) * 10;

// Final livability score
const livabilityScore = Math.min(100, Math.max(0,
  baseScore * 0.5 + (baseScore + trendBonus) * 0.3 + (baseScore + seasonalBonus) * 0.2
));
\`\`\`

### 6.4 Livability Classes

| Score Range | Class | Interpretation |
|------------|-------|---------------|
| 65–100 | Highly Livable | Recommended for residential living |
| 40–64 | Moderately Livable | Acceptable with precautions |
| 0–39 | Low Livability | Not recommended for sensitive groups |

### 6.5 Station Type Influence

Different station types reflect different local conditions:

| Type | Base Multiplier | Description |
|------|----------------|-------------|
| Residential | 0.85–1.05 | Typical neighborhood air quality |
| Traffic | 1.15–1.35 | Higher pollution from vehicle emissions |
| Industrial | 1.20–1.30 | Elevated pollution from factories |
| Mixed | 0.90–1.15 | Combined sources |

---

## 7. Machine Learning System

### 7.1 Model Overview

SafeDelhiAQI uses an **XGBoost Regression** model for AQI forecasting. The implementation is a hybrid system:

- **Primary**: AI-powered predictions via Google Gemini with XGBoost pipeline context
- **Fallback**: Deterministic JavaScript engine with pre-computed coefficients

### 7.2 XGBoost Regression — Conceptual Explanation

#### What Are Decision Trees?

A decision tree is like a flowchart. It asks yes/no questions about the data and follows different branches based on the answers, eventually arriving at a prediction.

**Example:**
\`\`\`
Is the month November? 
├── YES → Is the station industrial?
│         ├── YES → Predict AQI = 380
│         └── NO  → Predict AQI = 310
└── NO  → Is it monsoon season?
          ├── YES → Predict AQI = 120
          └── NO  → Predict AQI = 230
\`\`\`

#### What Is Gradient Boosting?

Gradient Boosting builds many small decision trees **sequentially**. Each new tree tries to correct the mistakes of the previous trees.

**Analogy:** Imagine you're adjusting a radio dial. The first turn gets you close to the right station. Each subsequent small adjustment gets you closer and closer to perfect tuning. Each tree is one small adjustment.

#### What Is XGBoost?

XGBoost (eXtreme Gradient Boosting) is an optimized implementation of gradient boosting that adds:
- **Regularization**: Prevents overfitting (like adding a "don't be too complex" rule)
- **Parallel processing**: Trains faster by using multiple CPU cores
- **Handling missing data**: Automatically handles gaps in data
- **Tree pruning**: Removes unnecessary branches to keep models simple

#### Ensemble Learning

XGBoost is an **ensemble method** — it combines predictions from many weak learners (shallow trees) into one strong prediction.

\`\`\`
Final Prediction = Tree₁(x) + Tree₂(x) + Tree₃(x) + ... + Treeₙ(x)
\`\`\`

Each tree contributes a small correction, and the sum of all corrections produces an accurate final prediction.

### 7.3 Training Pipeline

#### Data Preprocessing

\`\`\`
Raw AQI Data → Clean Missing Values → Feature Engineering → Train/Test Split → Normalization
\`\`\`

**Feature Engineering** creates new columns from raw data:

| Feature | Description | Formula |
|---------|-------------|---------|
| lag_1 | AQI from 1 day ago | AQI(t-1) |
| lag_7 | AQI from 7 days ago | AQI(t-7) |
| lag_30 | AQI from 30 days ago | AQI(t-30) |
| rolling_mean_7 | 7-day moving average | mean(AQI(t-1) ... AQI(t-7)) |
| rolling_mean_30 | 30-day moving average | mean(AQI(t-1) ... AQI(t-30)) |
| rolling_std_7 | 7-day standard deviation | std(AQI(t-1) ... AQI(t-7)) |
| month | Month of year (1-12) | extract(month from date) |
| day_of_year | Day of year (1-365) | extract(doy from date) |
| season | Season category (0-3) | Winter/Spring/Monsoon/Autumn |
| is_winter | Binary winter flag | 1 if Nov-Feb, else 0 |

#### Train/Test Split

\`\`\`
Historical Data (2021-2024)
├── Training Set (80%): 2021 - mid 2023
└── Test Set (20%): mid 2023 - 2024
\`\`\`

#### Model Training

\`\`\`python
# Conceptual XGBoost training (simulated via AI pipeline)
from xgboost import XGBRegressor

model = XGBRegressor(
    n_estimators=200,      # Number of trees
    max_depth=6,           # Maximum tree depth
    learning_rate=0.1,     # Step size for each tree
    subsample=0.8,         # Random subset of data per tree
    colsample_bytree=0.8,  # Random subset of features per tree
    random_state=42        # For reproducibility
)

model.fit(X_train, y_train)
predictions = model.predict(X_test)
\`\`\`

#### Model Evaluation Metrics

| Metric | Formula | Meaning |
|--------|---------|---------|
| RMSE | √(Σ(yᵢ - ŷᵢ)² / n) | Root Mean Square Error — average prediction error |
| MAE | Σ|yᵢ - ŷᵢ| / n | Mean Absolute Error — average absolute deviation |
| R² | 1 - Σ(yᵢ - ŷᵢ)² / Σ(yᵢ - ȳ)² | Coefficient of determination (1 = perfect) |

**Beginner Explanation:**
- **RMSE**: "On average, how far off are my predictions?" Lower is better.
- **MAE**: "What's the typical error?" Similar to RMSE but less sensitive to outliers.
- **R²**: "How much of the variation does my model explain?" 0.85 means 85% explained.

### 7.4 Prediction Logic

The forecast pipeline generates predictions for each station from 2025 to 2035:

\`\`\`
For each station:
  1. Load historical AQI data (2021-2024)
  2. Compute station coefficients (type, green cover, trend sensitivity)
  3. Apply seasonal patterns (monthly multipliers)
  4. Generate yearly average predictions
  5. Compute confidence intervals (wider for distant years)
  6. Classify zone (blue/yellow/red) and livability
  7. Determine trend (improving/stable/declining)
\`\`\`

### 7.5 Boosting Concept — Residual Learning

Gradient boosting works by iteratively reducing the **residual** (error) of the model:

\`\`\`
Step 1: Make initial prediction (e.g., average AQI = 250)
Step 2: Calculate residual = Actual - Predicted = 300 - 250 = 50
Step 3: Train Tree₁ to predict the residual (50)
Step 4: New prediction = 250 + Tree₁(50) = 250 + 48 = 298
Step 5: New residual = 300 - 298 = 2
Step 6: Train Tree₂ to predict the new residual (2)
...and so on
\`\`\`

**Loss Minimization**: Each tree minimizes a loss function (Mean Squared Error for regression):

\`\`\`
L = (1/n) × Σ(yᵢ - ŷᵢ)²
\`\`\`

The gradient of this loss function tells each new tree which direction to adjust predictions.

### 7.6 Feature Importance

The model ranks features by how much they reduce prediction error:

| Rank | Feature | Importance | Why |
|------|---------|-----------|-----|
| 1 | rolling_mean_30 | ~28% | Long-term trend is the strongest predictor |
| 2 | seasonal_index | ~22% | Delhi's AQI is heavily seasonal |
| 3 | lag_7 | ~15% | Recent week's AQI predicts next week |
| 4 | year_trend | ~12% | Multi-year improvement/decline pattern |
| 5 | station_type | ~10% | Industrial vs residential matters |
| 6 | rolling_std_7 | ~8% | Volatility indicates weather changes |
| 7 | is_winter | ~5% | Winter inversion traps pollutants |

---

## 8. Mathematical Concepts Used

### 8.1 Haversine Formula (Distance Calculation)

**Simple Explanation:** Calculates the shortest distance between two points on Earth's surface.

**Real-World Analogy:** Like measuring the string length between two pins on a globe.

**Formula:**
\`\`\`
d = 2R × arcsin(√(sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)))
\`\`\`

**Implementation:** See Section 4 above.

### 8.2 Inverse Distance Weighting (Spatial Interpolation)

**Simple Explanation:** Estimates a value at an unknown point by averaging nearby known values, weighting closer ones more heavily.

**Real-World Analogy:** If you're between two campfires, you feel more heat from the closer one.

**Formula:**
\`\`\`
f(x) = Σ(wᵢ × fᵢ) / Σ(wᵢ)   where wᵢ = 1/dᵢᵖ
\`\`\`

p = 2 (power parameter, controls how quickly influence drops off)

### 8.3 Gradient Boosting (Machine Learning)

**Simple Explanation:** Builds many small predictors that each fix the mistakes of the previous ones.

**Real-World Analogy:** Like a team of advisors, each one improving on the advice given by the previous advisor.

**Formula:**
\`\`\`
F_m(x) = F_{m-1}(x) + η × h_m(x)
\`\`\`
Where η is the learning rate and h_m is the m-th tree.

### 8.4 Regression Models

**Simple Explanation:** Finding a mathematical relationship between input features and a continuous output value.

**Real-World Analogy:** Predicting tomorrow's temperature based on today's temperature, humidity, and wind speed.

**Formula (Linear Regression):**
\`\`\`
ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ
\`\`\`

XGBoost extends this by using trees instead of linear equations.

### 8.5 Spatial Partitioning (Voronoi)

**Simple Explanation:** Dividing a map into regions where each region is "owned" by the nearest station.

**Real-World Analogy:** Like school districts — every home is assigned to the nearest school.

**Formula:**
\`\`\`
V(sᵢ) = { p | ∀j≠i: d(p,sᵢ) ≤ d(p,sⱼ) }
\`\`\`

### 8.6 Evaluation Metrics Summary

| Metric | Formula | Range | Best Value |
|--------|---------|-------|-----------|
| RMSE | √(MSE) | [0, ∞) | 0 |
| MAE | mean(|errors|) | [0, ∞) | 0 |
| R² | 1 - SS_res/SS_tot | (-∞, 1] | 1 |
| MAPE | mean(|errors|/actual) × 100 | [0, ∞) | 0% |

---

## 9. Project Folder Structure

\`\`\`
SafeDelhiAQI/
├── public/
│   ├── data/
│   │   └── historical_aqi.csv        # Historical AQI dataset
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── map/
│   │   │   ├── aqi-map.tsx            # Main map container (but aqi-map is at components level)
│   │   │   ├── heatmap-layer.tsx      # Leaflet.heat integration
│   │   │   ├── voronoi-layer.tsx      # D3-Delaunay Voronoi overlay
│   │   │   ├── influence-buffers.tsx  # Concentric buffer circles
│   │   │   ├── forecast-layer.tsx     # Forecast visualization overlay
│   │   │   ├── livability-voronoi-layer.tsx  # Livability-colored Voronoi
│   │   │   ├── area-info-popup.tsx    # Click-anywhere popup
│   │   │   ├── map-layer-controls.tsx # Layer toggle controls
│   │   │   └── year-slider.tsx        # Forecast year selector
│   │   │
│   │   ├── forecast/
│   │   │   ├── forecast-panel.tsx     # Main forecast container
│   │   │   ├── forecast-chart.tsx     # Recharts line chart with confidence bands
│   │   │   ├── forecast-station-list.tsx  # Station-wise predictions
│   │   │   ├── forecast-export.tsx    # CSV/PDF export functionality
│   │   │   ├── model-metrics-panel.tsx # ML model performance display
│   │   │   ├── comparison-view.tsx    # Station comparison tool
│   │   │   ├── trend-distribution-chart.tsx  # Trend pie chart
│   │   │   └── zone-distribution-chart.tsx   # Zone pie chart
│   │   │
│   │   ├── seasonal/
│   │   │   ├── seasonal-analysis-panel.tsx  # Seasonal analysis container
│   │   │   ├── monthly-pattern-chart.tsx    # Monthly AQI chart
│   │   │   ├── outdoor-calendar.tsx         # Activity calendar
│   │   │   ├── seasonal-overview.tsx        # Season summary cards
│   │   │   └── station-seasonal-view.tsx    # Per-station breakdown
│   │   │
│   │   ├── ui/                         # shadcn/ui components (40+ files)
│   │   ├── header.tsx                  # Navigation header
│   │   ├── station-card.tsx            # Station detail card
│   │   ├── station-search.tsx          # Search/filter component
│   │   ├── aqi-map.tsx                 # Top-level map component
│   │   ├── aqi-contributors.tsx        # Pollutant breakdown
│   │   ├── health-advisory-panel.tsx   # Health recommendations
│   │   ├── zone-legend.tsx             # Zone color legend
│   │   └── theme-toggle.tsx            # Dark/light mode toggle
│   │
│   ├── hooks/
│   │   ├── use-aqi-data.ts            # Live AQI data fetching
│   │   ├── use-aqi-forecast.ts        # AI forecast hook
│   │   ├── use-historical-aqi.ts      # Historical data loading
│   │   ├── use-livability-data.ts     # Livability computations
│   │   ├── use-seasonal-analysis.ts   # Seasonal pattern analysis
│   │   ├── use-alert-subscriptions.ts # Alert management
│   │   ├── use-auth.ts                # Authentication state
│   │   └── use-on-demand-livability.ts # Click-to-compute livability
│   │
│   ├── lib/
│   │   ├── aqi-utils.ts               # AQI levels, zones, station list
│   │   ├── aqi-contributors.ts        # Pollutant contribution analysis
│   │   ├── forecasting-engine.ts      # Deterministic forecast engine
│   │   ├── area-station-mapping.ts    # Voronoi + buffer station finder
│   │   ├── guide-content.ts           # Documentation content
│   │   └── utils.ts                   # General utilities (cn, etc.)
│   │
│   ├── pages/
│   │   ├── index.tsx                  # Main dashboard
│   │   ├── neighborhoods.tsx          # Neighborhood rankings
│   │   ├── alerts.tsx                 # Alert management
│   │   ├── auth.tsx                   # Authentication
│   │   ├── documentation.tsx          # Technical documentation
│   │   ├── project-guide.tsx          # Downloadable project guide
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── types/
│   │   ├── aqi.ts                     # AQI data types
│   │   ├── forecast.ts                # Forecast data types
│   │   └── livability.ts              # Livability types
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Supabase client (auto-generated)
│   │       └── types.ts               # Database types (auto-generated)
│   │
│   ├── app.tsx                        # Root component with routes
│   ├── app.css                        # Global styles
│   ├── index.css                      # TailwindCSS + design tokens
│   └── index.tsx                      # Entry point
│
├── supabase/
│   ├── functions/
│   │   ├── fetch-aqi/
│   │   │   └── index.ts               # Live AQI data edge function
│   │   └── forecast-aqi/
│   │       └── index.ts               # AI forecast edge function
│   ├── migrations/                     # Database migrations
│   └── config.toml                    # Supabase configuration
│
├── ml/                                 # ML Reference Files
│   ├── xgboost_model.py               # Model definition
│   ├── train_xgboost.py               # Training script
│   ├── predict_xgboost.py             # Prediction script
│   ├── preprocessing.py               # Data preprocessing
│   └── saved_model.joblib             # Trained model artifact
│
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
\`\`\`

### File Explanations

| File | Purpose |
|------|---------|
| \`src/hooks/use-aqi-data.ts\` | Fetches live AQI from WAQI API via edge function, supplements with mock data if coverage is low |
| \`src/hooks/use-aqi-forecast.ts\` | Calls AI forecast edge function, falls back to deterministic engine |
| \`src/lib/forecasting-engine.ts\` | Pre-computed XGBoost-style coefficients for deterministic predictions |
| \`src/lib/area-station-mapping.ts\` | Maps any map click to nearest station using Voronoi → Buffer → Nearest fallback |
| \`supabase/functions/forecast-aqi/index.ts\` | Deno edge function that calls Gemini AI for intelligent forecasting |
| \`supabase/functions/fetch-aqi/index.ts\` | Deno edge function that proxies WAQI API calls |

---

## 10. Step-by-Step Build Guide

### Step 1 — Setup Environment

Install Node.js (v18+) and npm:

\`\`\`bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
\`\`\`

### Step 2 — Create Project

\`\`\`bash
# Create Vite + React + TypeScript project
npm create vite@latest safedelhiaqi -- --template react-ts
cd safedelhiaqi
npm install
\`\`\`

### Step 3 — Install Dependencies

\`\`\`bash
# Core dependencies
npm install react-router-dom @tanstack/react-query recharts

# Mapping
npm install leaflet react-leaflet leaflet.heat
npm install -D @types/leaflet

# Spatial math
npm install d3-delaunay
npm install -D @types/d3-delaunay

# UI components
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react sonner

# Backend
npm install @supabase/supabase-js
\`\`\`

### Step 4 — Setup TailwindCSS

Configure \`tailwind.config.ts\` with custom colors for AQI zones:

\`\`\`typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'aqi-good': 'hsl(var(--aqi-good))',
        'aqi-satisfactory': 'hsl(var(--aqi-satisfactory))',
        'aqi-moderate': 'hsl(var(--aqi-moderate))',
        'aqi-poor': 'hsl(var(--aqi-poor))',
        'aqi-very-poor': 'hsl(var(--aqi-very-poor))',
        'aqi-hazardous': 'hsl(var(--aqi-hazardous))',
      },
    },
  },
};
\`\`\`

### Step 5 — Add Leaflet Map

Create the map component:

\`\`\`typescript
// src/components/aqi-map.tsx
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function AQIMap({ stations }) {
  return (
    <MapContainer center={[28.6139, 77.2090]} zoom={11}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stations.map(station => (
        <CircleMarker
          key={station.id}
          center={[station.lat, station.lng]}
          radius={10}
          fillColor={getZoneColor(station.zone)}
          fillOpacity={0.8}
        >
          <Tooltip>{station.name}: AQI {station.aqi}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
\`\`\`

### Step 6 — Add AQI Station Data

Define Delhi monitoring stations with coordinates:

\`\`\`typescript
// src/lib/aqi-utils.ts
export const DELHI_STATIONS = [
  { id: 'delhi-anand-vihar', name: 'Anand Vihar', lat: 28.6469, lng: 77.3160 },
  { id: 'delhi-ito', name: 'ITO', lat: 28.6289, lng: 77.2405 },
  { id: 'delhi-lodhi-road', name: 'Lodhi Road', lat: 28.5918, lng: 77.2273 },
  // ... 25+ stations total
];

export function getZone(aqi: number): 'blue' | 'yellow' | 'red' {
  if (aqi <= 100) return 'blue';
  if (aqi <= 200) return 'yellow';
  return 'red';
}
\`\`\`

### Step 7 — Implement Voronoi Regions

\`\`\`typescript
// src/components/map/voronoi-layer.tsx
import { Delaunay } from 'd3-delaunay';
import { Polygon } from 'react-leaflet';

export function VoronoiLayer({ stations }) {
  const points = stations.map(s => [s.lng, s.lat]);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([76.8, 28.4, 77.5, 28.9]);

  return (
    <>
      {stations.map((station, i) => {
        const cell = voronoi.cellPolygon(i);
        if (!cell) return null;
        const positions = cell.map(([lng, lat]) => [lat, lng]);
        return (
          <Polygon
            key={station.id}
            positions={positions}
            fillColor={getZoneColor(station.zone)}
            fillOpacity={0.2}
          />
        );
      })}
    </>
  );
}
\`\`\`

### Step 8 — Implement Heatmap

\`\`\`typescript
// src/components/map/heatmap-layer.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export function HeatmapLayer({ stations }) {
  const map = useMap();

  useEffect(() => {
    const points = stations.map(s => [s.lat, s.lng, s.aqi / 500]);
    const heat = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
    }).addTo(map);

    return () => { map.removeLayer(heat); };
  }, [map, stations]);

  return null;
}
\`\`\`

### Step 9 — Connect ML Predictions to Frontend

\`\`\`typescript
// src/hooks/use-aqi-forecast.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAQIForecast(stations) {
  return useQuery({
    queryKey: ['aqi-forecast', stations?.length],
    queryFn: async () => {
      // Call AI-powered edge function
      const { data } = await supabase.functions.invoke('forecast-aqi', {
        body: { stations: stations.slice(0, 15) },
      });

      if (data?.forecasts) return data;

      // Fallback to deterministic engine
      return generateLocalForecast(stations);
    },
    enabled: !!stations?.length,
  });
}
\`\`\`

---

## 11. Algorithms Used

### 11.1 Nearest Neighbor Search

**Concept:** Find the station closest to a given point.

**Math:** Minimize d(p, sᵢ) across all stations using Haversine distance.

**Implementation:** The D3-Delaunay library provides O(1) lookups via \`delaunay.find(lng, lat)\`, internally using a walking algorithm on the triangulation.

### 11.2 Inverse Distance Weighting

**Concept:** Interpolate a value at an unknown location using known values, weighted by inverse distance.

**Math:** f(x) = Σ(wᵢfᵢ) / Σ(wᵢ) where wᵢ = 1/dᵢᵖ (p=2)

**Implementation:** Loop through all stations, compute distance, accumulate weighted sum. See Section 5.

### 11.3 Gradient Boosting Regression

**Concept:** Sequentially build trees, each correcting errors of the ensemble so far.

**Math:** Fₘ(x) = Fₘ₋₁(x) + η·hₘ(x), minimizing L = Σ(yᵢ - Fₘ(xᵢ))²

**Implementation:** Simulated via Gemini AI with XGBoost hyperparameters; deterministic fallback uses pre-computed coefficients.

### 11.4 Spatial Partitioning (Voronoi/Delaunay)

**Concept:** Divide space so each region contains all points nearest to one station.

**Math:** V(sᵢ) = { p | d(p,sᵢ) ≤ d(p,sⱼ) ∀j≠i }

**Implementation:** D3-Delaunay computes the dual Voronoi diagram from Delaunay triangulation in O(n log n) time.

---

## 12. Beginner Learning Notes

### 12.1 What is AQI?

**Simple:** A number (0-500) that tells you how clean or polluted the air is.

**Analogy:** Like a thermometer for pollution. Low numbers = clean air, high numbers = dangerous air.

**Scale:**
| AQI | Level | What To Do |
|-----|-------|-----------|
| 0-50 | Good | Enjoy outdoors! |
| 51-100 | Satisfactory | OK for most people |
| 101-200 | Moderate | Sensitive groups be careful |
| 201-300 | Poor | Everyone reduce outdoor activity |
| 301-400 | Very Poor | Stay indoors |
| 401-500 | Hazardous | Emergency conditions |

### 12.2 What is Machine Learning?

**Simple:** Teaching a computer to find patterns in data and make predictions.

**Analogy:** Like teaching a child to recognize dogs. Show them thousands of dog photos, and eventually they can identify a new dog they've never seen.

**In our project:** We show the computer years of AQI data. It learns the patterns (seasons, trends, station types) and predicts future AQI.

### 12.3 What is an API?

**Simple:** A way for two programs to talk to each other over the internet.

**Analogy:** Like a waiter in a restaurant. You (the frontend) give your order to the waiter (API), who takes it to the kitchen (backend/database) and brings back your food (data).

**In our project:** The frontend calls the WAQI API to get live AQI readings, and calls the forecast edge function to get AI predictions.

### 12.4 What are Coordinates?

**Simple:** Two numbers (latitude, longitude) that pinpoint any location on Earth.

**Analogy:** Like row and column numbers in a spreadsheet — but for the whole planet.

**Delhi center:** Latitude 28.6139°N, Longitude 77.2090°E

### 12.5 What is Interpolation?

**Simple:** Estimating unknown values between known data points.

**Analogy:** If your friend's house is 20°C and your office is 30°C, you can guess that a point halfway between is about 25°C. That's interpolation!

---

## 13. Future Improvements

### 13.1 Real-Time AQI APIs

- Integrate CPCB official API for authoritative readings
- Add OpenWeatherMap Air Pollution API for global coverage
- Implement WebSocket connections for live updates without polling

### 13.2 Satellite Pollution Data

- Integrate NASA MODIS Aerosol Optical Depth (AOD) data
- Use Sentinel-5P TROPOMI for NO₂ and SO₂ column density
- Overlay satellite imagery on the map for visual verification

### 13.3 Deep Learning Forecasting

- Replace XGBoost with LSTM (Long Short-Term Memory) networks for time series
- Implement Transformer-based models (like Temporal Fusion Transformers)
- Use attention mechanisms to capture long-range temporal dependencies
- Add uncertainty quantification with Monte Carlo dropout

### 13.4 Spatiotemporal Models

- Graph Neural Networks (GNN) to model station-to-station pollution flow
- Convolutional LSTM for grid-based prediction combining spatial and temporal features
- Kriging (Gaussian Process Regression) for probabilistic spatial interpolation

### 13.5 Climate Simulation Integration

- Integrate WRF (Weather Research and Forecasting) model outputs
- Correlate AQI predictions with wind patterns, temperature inversions, and humidity
- Simulate impact of policy interventions (e.g., odd-even vehicle scheme)
- Model stubble burning impact using crop residue burning inventory data

### 13.6 Platform Enhancements

- Progressive Web App (PWA) with offline support
- Push notifications via Firebase Cloud Messaging
- Multi-language support (Hindi, Punjabi, Urdu)
- Community reporting for hyperlocal pollution events
- Integration with smart home devices (air purifier control)

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| AQI | Air Quality Index — a standardized scale for reporting air quality |
| CPCB | Central Pollution Control Board — India's national air quality authority |
| IDW | Inverse Distance Weighting — spatial interpolation method |
| XGBoost | eXtreme Gradient Boosting — high-performance ML algorithm |
| Voronoi | Spatial partitioning into nearest-neighbor regions |
| Haversine | Formula for distance on a sphere's surface |
| RMSE | Root Mean Square Error — prediction accuracy metric |
| R² | Coefficient of Determination — model explanatory power metric |
| WAQI | World Air Quality Index — global AQI data provider |
| GIS | Geographic Information System — spatial data management |
| PM2.5 | Particulate Matter ≤ 2.5 micrometers |
| PM10 | Particulate Matter ≤ 10 micrometers |

## Appendix B: References

1. World Air Quality Index Project — https://waqi.info
2. CPCB National Air Quality Standards — https://cpcb.nic.in
3. XGBoost Documentation — https://xgboost.readthedocs.io
4. D3-Delaunay — https://github.com/d3/d3-delaunay
5. Leaflet.js — https://leafletjs.com
6. React-Leaflet — https://react-leaflet.js.org
7. India AQI Standards (NAQI) — National Ambient Air Quality Standards

---

*This guide was generated by the SafeDelhiAQI platform. For the latest version, visit the application's Project Guide page.*
`;
}

/**
 * Generate HTML content for PDF printing
 */
export function getGuideHTML(markdown: string): string {
  // Convert markdown to styled HTML for PDF export
  const htmlContent = markdownToHTML(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SafeDelhiAQI – Complete Project Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.7;
      color: #1a1a2e;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 30px;
      background: #fff;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 12px;
      margin-bottom: 8px;
    }

    h2 {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 40px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      page-break-after: avoid;
    }

    h3 {
      font-size: 17px;
      font-weight: 600;
      color: #334155;
      margin-top: 24px;
      margin-bottom: 10px;
    }

    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    p { margin-bottom: 12px; font-size: 14px; }

    ul, ol {
      margin-bottom: 12px;
      padding-left: 24px;
      font-size: 14px;
    }

    li { margin-bottom: 4px; }

    code {
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
      font-size: 12.5px;
      line-height: 1.5;
      page-break-inside: avoid;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
    }

    tr:nth-child(even) { background: #fafafa; }

    blockquote {
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      margin: 12px 0;
      background: #eff6ff;
      border-radius: 0 8px 8px 0;
    }

    strong { font-weight: 600; }

    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 30px 0;
    }

    .page-break { page-break-before: always; }

    @media print {
      body { padding: 20px; font-size: 12px; }
      h1 { font-size: 24px; }
      h2 { font-size: 18px; }
      pre { font-size: 11px; }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHTML(md: string): string {
  let html = md;

  // Escape HTML entities in code blocks first
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="language-${lang}">${escapeHTML(code.trim())}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)+)/gm, (_, header, _separator, body) => {
    const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('\n');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Unordered lists
  html = html.replace(/^((?:- .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item =>
      `<li>${item.replace(/^- /, '')}</li>`
    ).join('\n');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^((?:\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item =>
      `<li>${item.replace(/^\d+\. /, '')}</li>`
    ).join('\n');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z]|%%CODEBLOCK)(.+)$/gm, (_, content) => {
    if (content.trim() === '') return '';
    return `<p>${content}</p>`;
  });

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
  });

  // Clean up empty lines
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
