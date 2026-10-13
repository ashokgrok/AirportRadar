# AIONOS Airport KPI Intelligence Platform (ZZA)

Architectural blueprint and phased delivery plan for building the complete in-browser AIONOS Airport KPI Intelligence App for AIONOS Demo International (Code: ZZA), running an authentic PostgreSQL engine in WebAssembly (PGlite) backed by IndexedDB, TanStack Query caching, role-based access control across 24 roles, all 20 operational and departmental dashboards, an interactive demo scenario simulator, and an AI KPI assistant.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been established based on your operational answers and the AIONOS PRD specifications:

- **PostgreSQL WASM Engine**: Configured `@electric-sql/pglite` embedded directly in the browser with persistent IndexedDB storage (`idb://aionos-zza-db`) alongside an in-memory L1 cache for sub-second analytical aggregations.
- **Data Generation & Volume**: Multi-stage synthetic generator initializing the Kimball star constellation (26 conformed dimensions, 54 fact tables, and cfg reference tables) across a 24-month operational horizon (1 Oct 2024 – 30 Sep 2026) plus 60-day forward schedules, with automated batch-worker streaming to maintain fluid 60fps UI performance without main-thread blocking.
- **Dashboard Implementation Strategy**: Phase 1 simultaneously implements the complete fleet of **all 20 operational dashboards** (Executive Scorecard, Live Ops AOCC, Airside & Stands, Punctuality & Turnaround, Terminal Queues, CX, PRM, Baggage, Cargo, Safety, Security, Asset Health, Landside & Parking, Commercial, Finance, People & WFM, IT & Cyber, Environment, Airline & Handler Portal, and Regulatory Pack), backed by unified conformed dimension filters and 3-level drilldowns.

***

## 1. Overview & Core Concept

- **What It Does**: AIONOS Airport KPI Intelligence provides a single, governed semantic KPI layer for the entire airport ecosystem. It computes the 624 airport KPIs defined in the AIONOS KPI Library from underlying dimensional facts. Every KPI links to its mathematical formula, lineage, data quality index, owner function, and underlying raw flight, passenger, bag, asset, or financial records.
- **Target Audience / Personas**: 24 airport roles grouped into Executive Leadership (CEO, COO, CFO), Operational Control (AOCC Duty Manager, Airside, Terminal, Baggage), Support Functions (Engineering, Safety, Security, Landside, Commercial, Cargo, HR, IT, Sustainability, Regulatory), and External Partners (Airlines, Ground Handlers, Concessionaires).
- **Key Value**: Replaces 30+ disparate airport silos with an authoritative single source of truth that enforces strict role-based access control, row-level security (RLS), column masking for PII/revenue, and real-time operational situation awareness.

***

## 2. User Experience & Visual Design

### Key User Flows
1. **Authentication & Role Switching**: Users log in via a dedicated credentials screen or use the rapid 1-click **Demo Role Switcher** to immediately inspect the system as any of the 24 seeded personas (e.g., AOCC Duty Manager, CFO, Airline Partner). Scopes and permissions adapt dynamically across every query and navigation view.
2. **Personalized Role Landing**: Landing on the user's role template renders their department's Tier 1 and Tier 2 KPIs, breach watchlist, assigned corrective actions, and recent alert markers.
3. **Interactive Live Operations & 3-Level Drilldown**: Users can explore the dynamic terminal/stand layout, flight arrival/departure timelines, and queue gauges, then drill down 3 levels:
   $$\text{KPI Tile Summary} \quad\longrightarrow\quad \text{Dimensional Breakdown (by Terminal/Airline/Hour)} \quad\longrightarrow\quad \text{Underlying Atomic Records (Flights, Bags, Work Orders)}$$
4. **Scenario Switcher & Replay Clock**: Users can toggle between the 8 scripted PRD scenarios (Winter Fog & Low Visibility, Diwali Peak, BHS Sorter Outage, Monsoon Thunderstorm, Security Staffing Shortfall, Ransomware Contained, Long-Haul Route Launch, and ACA Level Upgrade) and run the replay clock at $1\times$ to $60\times$ speed.
5. **KPI Dictionary & Self-Service Explorer**: Browse all 624 governed KPIs, inspect formula trees, run ad-hoc dimensional cross-tabulations, and export governed CSV/PDF briefs.

### Visual Identity & Theme
- **Aesthetic Direction**: High-precision aeronautical command center; clean architectural typography, zero-pill metadata discipline, and high-density tabular alignment.
- **Color Palette & Themes**:
  - **Dark Mode (Default AOCC Control Wall)**: Deep Obsidian canvas (`#0B0F19`), Navy slate container surfaces (`#111827`), hairline borders (`#1F2937`), cyan/violet primary brand accents (`#06B6D4`, `#8B5CF6`).
  - **Light Mode (Executive Brief & Board Pack)**: Crisp off-white canvas (`#F8FAFC`), pure white container surfaces (`#FFFFFF`), neutral dividers (`#E2E8F0`), deep navy typography (`#0F172A`).
  - **Status Semantics (Color-Blind Safe RAG)**: Normal/Green (`#10B981` with checkmark icon), Warning/Amber (`#F59E0B` with alert triangle icon), Critical/Red (`#EF4444` with octagon alert icon), Monitor-Only (`#64748B` with neutral trend arrow).
- **Typography & Tabular Numerals**:
  - Display & Headings: `Plus Jakarta Sans` for crisp titles and structural labels.
  - Body & Microcopy: `DM Sans` for high legibility at 12–14px.
  - Metrics & Telemetry: Strictly tabular monospace (`font-mono tabular-nums`, `JetBrains Mono` / `Space Mono`) to eliminate visual jitter during real-time replay.

### Interactive Feedback & Motion
- Staggered card entry reveals ($240\text{ms}$ with $30\text{ms}$ stagger).
- Number count morphing on metric updates ($600\text{ms}$ ease-out-cubic).
- Shared element transitions on drilldown overlays.
- Full respect for `prefers-reduced-motion` with instantaneous state shifts when enabled.

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side PostgreSQL via PGlite WASM**:
  - *Chosen Approach*: Execute real PostgreSQL 16 directly inside the browser using `@electric-sql/pglite` backed by browser IndexedDB.
  - *Why*: Allows true SQL execution, joins across conformed dimensions, window functions for percentile calculations (P50/P90), exact reconciliation tests, and offline capability without requiring external database hosting.
  - *Alternatives Considered*: In-memory SQLite (`sql.js`) was rejected because it lacks PostgreSQL native syntax, arrays, JSON functions, and advanced window functions.
- **Decision 2: Governed Semantic Layer & TanStack Query**:
  - *Chosen Approach*: All UI surfaces query through a unified semantic query API client (`semanticClient.queryKpi(...)`). TanStack Query manages query keys, stale-time caching, mutations, and optimistic updates.
  - *Why*: Prevents any chart from calculating its own conflicting metric logic; ensures 100% mathematical reconciliation across all 20 dashboards.
- **Decision 3: Layered Seed Generation (Instant Boot + Background Hydration)**:
  - *Chosen Approach*: Instant boot loads essential dimensions, reference tables, pre-aggregated 24-month metric values, and active flight schedules within 1.2 seconds, while a dedicated Web Worker asynchronously streams the deep multi-million raw fact history into IndexedDB.
  - *Why*: Guarantees instant sub-2-second cold load (NFR-1) while still supporting full volumetric queries for deep historical drilldowns.

***

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Browser UI Layer                                │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              Top Navigation (Brand · Global Filters · Auth)         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│   ┌──────────────────────┐  ┌───────────────────────────────────────────┐   │
│   │   Sidebar Nav (20)   │  │   Active Dashboard Viewport (TanStack)    │   │
│   │   • Enterprise Score │  │   ┌─────────────────┐ ┌─────────────────┐ │   │
│   │   • Live Ops (AOCC)  │  │   │  KPI Tile Grid  │ │  Charts & Maps  │ │   │
│   │   • Departmental (16)│  │   └─────────────────┘ └─────────────────┘ │   │
│   │   • Partner & Reg (2)│  │   ┌─────────────────────────────────────┐ │   │
│   │   • KPI Dictionary   │  │   │   3-Level Drilldown / Records Modal │ │   │
│   │   • Scenario Player  │  │   └─────────────────────────────────────┘ │   │
│   └──────────────────────┘  └───────────────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Application State & Data Access Layer                    │
│   ┌───────────────────────┐   ┌─────────────────────────────────────────┐   │
│   │  Auth & RBAC Store    │   │      TanStack Query Client & Cache      │   │
│   │  (24 Seeded Roles)    │   │      (5 min stale time, deduplication)  │   │
│   └──────────┬────────────┘   └────────────────────┬────────────────────┘   │
│              │                                     │                        │
│              ▼                                     ▼                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                 Semantic Layer Gateway & Policy Filter              │   │
│   │  • Enforces RLS (airline, handler, tenant, terminal)                │   │
│   │  • Masking (PII, tenant revenue)                                    │   │
│   │  • Metric formula execution (Ratio of sums, percentiles, rates)     │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                PostgreSQL WASM Engine (PGlite + IndexedDB)                  │
│   ┌───────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐   │
│   │  cfg_* (Config & Ref) │ │ dim_* (26 Dimensions)│ │ fact_* (54 Facts)│   │
│   │  • airport_profile    │ │ • dim_date, dim_time │ │ • flight_movement│   │
│   │  • kpi_definition     │ │ • dim_airline, stand │ │ • queue_interval │   │
│   │  • kpi_measure        │ │ • dim_asset, tenant  │ │ • bhs_hour, bag  │   │
│   │  • kpi_target         │ │ • dim_delay_code     │ │ • gl_month, pax  │   │
│   └───────────────────────┘ └──────────────────────┘ └──────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │       Metrics Layer: fact_kpi_value, fact_alert, fact_kpi_comment   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model Architecture
- **26 Conformed Dimensions**: `dim_date`, `dim_time`, `dim_airline`, `dim_aircraft_type`, `dim_airport_od`, `dim_route`, `dim_flight_service`, `dim_location`, `dim_stand`, `dim_runway`, `dim_checkpoint`, `dim_asset`, `dim_delay_code`, `dim_department`, `dim_cost_centre`, `dim_gl_account`, `dim_tenant`, `dim_outlet`, `dim_parking_product`, `dim_handler`, `dim_employee`, `dim_event_type`, `dim_severity`, `dim_weather`, `dim_scenario`, `dim_kpi`.
- **54 Core Fact Tables**: Covering Flights (movements, delays, A-CDM, turnarounds, forward schedules, slots), Airside (runway hours, stand occupancy, works permits), Passenger (queues, journeys, self-service, PRM, audits, surveys, complaints, assistant sessions), Baggage (flights, mishandled bags, BHS telemetry), Cargo (shipments, truck visits), Safety & Security (events, inspections, drills, permits), Assets (asset days, maintenance work orders), Landside (road intervals, parking days, ground transport), Commercial (concessions, leases, media), Finance (GL months, invoices, treasury, POs), People (roster shifts, HR monthly, competency records), IT & Cyber (incidents, system days, cyber snapshots), Environment (utility days, emissions, noise), and Projects/SLA (project months, SLA measurements, disruption events, actions).
- **Configuration & Reference Tables**: `cfg_airport_profile` (ZZA defaults), `cfg_kpi_domain`, `cfg_kpi_subdomain`, `cfg_kpi_definition`, `cfg_kpi_measure`, `cfg_kpi_department_map`, `cfg_kpi_target`, `cfg_role`, `cfg_permission`, `cfg_user_scope`, `cfg_alert_rule`, `cfg_service_standard`, and `cfg_rag_palette`.

***

## 5. Phased Delivery Roadmap & Action Items

### Phase 1: Core Engine, In-Browser PostgreSQL WASM & Star Constellation
- **P1.1**: Install `@electric-sql/pglite`, `@tanstack/react-query`, `zod`, and styling utilities.
- **P1.2**: Author complete PostgreSQL DDL scripts setting up `cfg_*`, `dim_*`, and `fact_*` tables with indices and primary keys.
- **P1.3**: Initialize deterministic synthetic data generator producing realistic multi-year operational data calibrated for 32m annual pax airport ZZA.
- **P1.4**: Build the Semantic Layer Query Engine executing governed formulas (Ratios of Sums, P90/P50 percentiles, Exposure Rates, Snapshots) and RAG evaluation against effective-dated targets.

### Phase 2: RBAC Policy Engine & Authentication System
- **P2.1**: Implement user authentication state with session persistence and 1-click **Demo Role Switcher** across all 24 seeded roles.
- **P2.2**: Implement Row-Level Security (RLS) enforcement (e.g., Airline Partner restricted strictly to own airline carrier flights, Ground Handler to own turnarounds, Concessionaire to own retail units).
- **P2.3**: Implement Column-Level Data Masking for PII (employee names, passenger feedback text) and restricted tenant revenue.

### Phase 3: The 20 Operational & Departmental Dashboards
- **P3.1**: Build **Enterprise Scorecard** (Executive & CFO view with domain heat strips, top 5 movers, sparklines, bullet bars).
- **P3.2**: Build **Live Ops (AOCC)** (Interactive airport map with stands, gates, checkpoints, belts, flight radar timeline, queue gauges, and live alert feed).
- **P3.3**: Build **Airside & Stands** and **Punctuality & Turnaround** (Runway throughput vs declared capacity, taxi additional-time Gantt, delay Pareto, turnaround swimlanes).
- **P3.4**: Build **Terminal & Queues**, **Passenger Experience**, and **Accessibility (PRM)** (Hour $\times$ Day queue heatmaps, wait-time distributions, CSAT sentiments).
- **P3.5**: Build **Baggage Operations** and **Cargo Operations** (First/last bag SLA delivery curves, BHS sorter uptime, cargo dwell times).
- **P3.6**: Build **Safety & Compliance**, **Security & Emergency**, and **Asset Health** (SPI control charts with $\pm 3\sigma$ limits, work order backlogs, asset availability matrix).
- **P3.7**: Build **Landside & Parking**, **Commercial**, and **Finance** (Curb occupancy, concession spend bridges, revenue/OPEX per pax, budget variance waterfalls).
- **P3.8**: Build **People & WFM**, **Digital & Cyber**, and **Environment & Community** (Roster coverage, MTTR/MTTD, Scope 1/2/3 decarbonization pathways).
- **P3.9**: Build **Airline & Handler Portal** (RLS-filtered partner portal) and **Regulatory Pack** (AERA standard compliance matrix, rebate exposure).

### Phase 4: Drilldowns, KPI Dictionary, Scenario Player & AI Assistant
- **P4.1**: Build 3-level interactive record drilldowns (KPI summary $\rightarrow$ dimensional breakdown $\rightarrow$ raw transaction table).
- **P4.2**: Implement the complete searchable **KPI Dictionary** with formula inspector and export capabilities.
- **P4.3**: Implement the **Demo Scenario Switcher** with 8 scripted events and variable-speed replay clock ($1\times$ to $60\times$).
- **P4.4**: Implement the governed **AI KPI Assistant** answering natural language queries over semantic measures respecting user RBAC scopes.
- **P4.5**: Implement light/dark theme switcher and verify accessibility (WCAG AA tabular figures, color-blind safe palettes).
