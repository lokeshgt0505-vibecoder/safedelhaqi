export const SYSTEM_ARCHITECTURE = `graph TB
    subgraph CLIENT["Frontend - React + Vite + TypeScript"]
        UI["User Interface"]
        
        subgraph PAGES["Pages"]
            HOME["/ Dashboard"]
            ALERTS["/alerts Alerts"]
            NBHD["/neighborhoods"]
            AUTH["/auth Login/Signup"]
            GUIDE["/project-guide"]
            DOCS["/product-docs"]
        end
        
        subgraph HOOKS["React Hooks - Data Layer"]
            H1["useAQIData"]
            H2["useAQIForecast"]
            H3["useWeeklyForecast"]
            H4["useHistoricalAQI"]
            H5["useLivabilityData"]
            H6["useSeasonalAnalysis"]
            H7["useAlertSubscriptions"]
            H8["useAuth"]
        end
        
        subgraph LIBS["Client Libraries"]
            FE["forecasting-engine.ts\\nDeterministic Fallback"]
            AQU["aqi-utils.ts\\nZone Classification"]
            AQC["aqi-contributors.ts"]
            ASM["area-station-mapping.ts"]
        end
        
        subgraph VIZ["Visualizations"]
            MAP["React-Leaflet Map"]
            HEAT["Heatmap Layer"]
            VOR["Voronoi Layer"]
            FCHART["Forecast Charts\\nRecharts"]
            WCHART["Weekly Forecast Charts"]
        end
    end
    
    subgraph SUPABASE["Lovable Cloud Backend"]
        subgraph EDGE["Edge Functions"]
            EF1["fetch-aqi\\nLive AQI Data Proxy"]
            EF2["forecast-aqi\\nAI ML Forecast"]
        end
        
        subgraph DB["Database Tables"]
            T1["profiles"]
            T2["saved_locations"]
            T3["alert_subscriptions"]
            T4["historical_aqi"]
        end
        
        SAUTH["Auth Service\\nEmail + Password"]
    end
    
    subgraph EXTERNAL["External Services"]
        WAQI["WAQI API\\nWorld Air Quality Index"]
        AIGATE["Lovable AI Gateway\\nGemini 2.5 Flash"]
    end
    
    UI --> PAGES
    HOME --> H1
    HOME --> H2
    HOME --> H3
    HOME --> H4
    HOME --> H5
    HOME --> H6
    ALERTS --> H7
    AUTH --> H8
    
    H1 -->|"invoke fetch-aqi"| EF1
    H2 -->|"invoke forecast-aqi"| EF2
    H2 -->|"Fallback"| FE
    H3 --> FE
    H4 -->|"SELECT"| T4
    H1 -->|"INSERT"| T4
    H7 -->|"CRUD"| T3
    H8 -->|"signUp / signIn"| SAUTH
    
    EF1 -->|"HTTP GET"| WAQI
    EF2 -->|"POST completions"| AIGATE
    
    H1 --> MAP
    H1 --> HEAT
    H1 --> VOR
    H2 --> FCHART
    H3 --> WCHART`;

export const AI_PREDICTION_FLOW = `sequenceDiagram
    participant User
    participant Dashboard
    participant Hook as useAQIForecast
    participant Client as Supabase Client
    participant EdgeFn as forecast-aqi
    participant AI as AI Gateway Gemini

    User->>Dashboard: Click Generate Forecast
    Dashboard->>Hook: generateForecast(stations)
    
    Note over Hook: Prepare payload<br/>id, name, aqi, lat, lng
    
    Hook->>Client: functions.invoke forecast-aqi
    Client->>EdgeFn: POST stations + forecastYears=11
    
    Note over EdgeFn: Enrich with HISTORICAL_BASELINES<br/>4 years yearly AQI per station<br/>Station type classification
    
    EdgeFn->>AI: POST /v1/chat/completions
    
    Note over AI: XGBoost Pipeline Simulation<br/>Feature Engineering<br/>lag features + rolling means<br/>seasonal indices<br/>Tool Calling: submit_ml_forecast

    AI-->>EdgeFn: Structured JSON via tool call
    
    Note over EdgeFn: Parse tool_calls arguments<br/>Extract forecast data
    
    EdgeFn-->>Client: JSON response
    Client-->>Hook: ForecastData object

    alt AI Success
        Hook->>Dashboard: setForecast with ML metrics
        Note over Dashboard: Show RMSE MAE R2<br/>Feature importance<br/>11-year forecasts
    else AI Failure
        Hook->>Hook: Local fallback engine
        Note over Hook: Deterministic coefficients<br/>5-year horizon
        Hook->>Dashboard: setForecast fallback
    end
    
    Dashboard->>User: Display forecast panel`;

export const DATA_FLOW = `flowchart TB
    subgraph REALTIME["Real-Time AQI Data Flow"]
        direction TB
        A1["App Loads / 5-min Interval"] --> A2["useAQIData Hook"]
        A2 -->|"supabase.functions.invoke"| A3["fetch-aqi Edge Function"]
        A3 -->|"WAQI_API_TOKEN"| A4["WAQI API /map/bounds/"]
        A4 -->|"uid, name, aqi, lat, lon"| A3
        A3 -->|"Filter + Transform"| A2
        A2 --> A5{"stations >= 5?"}
        A5 -->|"Yes"| A6["Use Live Data"]
        A5 -->|"No"| A7["Merge with Mock Data"]
        A6 --> A8["Store historical_aqi\\n1x per hour"]
        A6 --> A9["Render on Map"]
        A7 --> A9
    end

    subgraph YEARLY["11-Year AI Forecast Flow"]
        direction TB
        B1["User clicks Generate Forecast"] --> B2["useAQIForecast Hook"]
        B2 --> B3["forecast-aqi Edge Function"]
        B3 --> B4["Build Station Context\\n+ Historical Baselines"]
        B4 --> B5["AI Gateway Gemini 2.5 Flash"]
        B5 --> B6["Tool Calling: submit_ml_forecast"]
        B6 --> B7["Structured Output:\\nmodelMetrics + featureImportance\\nforecasts + cityOverview"]
        B7 --> B8["ForecastPanel Component"]
    end

    subgraph WEEKLY["7-Day Forecast Flow"]
        direction TB
        C1["User clicks 7-Day button"] --> C2["useWeeklyForecast Hook"]
        C2 --> C3["Local Deterministic Engine"]
        C3 --> C4["Per station:\\nSTATION_COEFFICIENTS\\nSEASONAL_PATTERNS\\nDaily AQI + weather"]
        C4 --> C5["WeeklyForecastPanel"]
    end

    subgraph AUTH_FLOW["Authentication Flow"]
        direction TB
        E1["Auth Page"] --> E2["useAuth Hook"]
        E2 -->|"signUp / signIn"| E3["Auth Service"]
        E3 -->|"handle_new_user trigger"| E4["INSERT profiles"]
        E3 -->|"Session"| E5["Protected Routes"]
    end`;

export const API_CALLS = `flowchart LR
    subgraph EDGE_CALLS["Edge Function Invocations"]
        F1["fetch-aqi\\ngetStations"]
        F2["fetch-aqi\\ngetStationDetails"]
        F3["fetch-aqi\\nsearchStation"]
        F4["forecast-aqi\\nstations + years"]
    end
    
    subgraph DB_CALLS["Direct Database Queries"]
        D1["historical_aqi SELECT"]
        D2["alert_subscriptions SELECT"]
        D3["alert_subscriptions INSERT/UPDATE/DELETE"]
        D4["historical_aqi INSERT"]
        D5["saved_locations CRUD"]
        D6["profiles SELECT/UPDATE"]
    end
    
    subgraph AUTH_CALLS["Auth API Calls"]
        A1["auth.signUp"]
        A2["auth.signInWithPassword"]
        A3["auth.signOut"]
        A4["auth.getSession"]
        A5["auth.onAuthStateChange"]
    end

    subgraph EXTERNAL["External API Calls from Backend"]
        B1["WAQI API\\nGET /map/bounds/\\nGET /feed/:id\\nGET /search/"]
        B2["AI Gateway\\nPOST /v1/chat/completions\\nBearer LOVABLE_API_KEY\\nModel: gemini-2.5-flash"]
    end
    
    F1 --> B1
    F2 --> B1
    F3 --> B1
    F4 --> B2`;
