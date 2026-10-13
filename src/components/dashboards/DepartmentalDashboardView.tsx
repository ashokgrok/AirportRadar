import React, { useState } from 'react';
import { KpiValueResult, UserRole, DashboardMeta, FlightRecord, QueueRecord } from '../../types';
import { DASHBOARDS } from '../../data/kpiLibrary';
import { KpiCard } from '../common/KpiCard';
import { 
  Clock, 
  Layers, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  TrendingUp,
  BarChart2,
  Table,
  Zap,
  Activity,
  Luggage,
  ShieldAlert,
  Flame,
  Leaf,
  Plane,
  HeartHandshake,
  Accessibility,
  Package,
  Shield,
  Lock,
  Wrench,
  Car,
  ShoppingBag,
  UserCheck,
  Server,
  Scale,
  Gauge,
  Utensils,
  Tv,
  Building2,
  Users,
  ArrowUpRight,
  Percent
} from 'lucide-react';

interface DepartmentalViewProps {
  dashboardId: string;
  kpis: KpiValueResult[];
  flights: FlightRecord[];
  queues: QueueRecord[];
  onDrilldown: (kpi: KpiValueResult) => void;
  onOpenBoardPack: () => void;
  user: UserRole;
}

export const DepartmentalDashboardView: React.FC<DepartmentalViewProps> = ({
  dashboardId,
  kpis,
  flights,
  queues,
  onDrilldown,
  onOpenBoardPack,
  user
}) => {
  const meta: DashboardMeta = DASHBOARDS.find(d => d.id === dashboardId) || DASHBOARDS[0];

  // Domain-specific KPI matching
  const domainKpiMap: Record<string, string[]> = {
    'airside-stands': ['ASD-01', 'ASD-02', 'ASD-03', 'PUN-01'],
    'punctuality-turnaround': ['PUN-01', 'PUN-02', 'PUN-03', 'ASD-02'],
    'terminal-queues': ['PAX-01', 'PAX-02', 'PAX-03', 'WFM-01'],
    'passenger-experience': ['PAX-02', 'PAX-01', 'PAX-03', 'COM-01'],
    'accessibility-prm': ['PAX-03', 'PAX-01', 'PAX-02'],
    'baggage-ops': ['BAG-01', 'BAG-02', 'BAG-03', 'AST-01'],
    'cargo-ops': ['CGO-01', 'ASD-01', 'PUN-01'],
    'safety-compliance': ['SAF-01', 'SAF-02', 'GOV-01', 'AST-01'],
    'security-emergency': ['SEC-01', 'PAX-01', 'SAF-01', 'ITD-02'],
    'asset-health': ['AST-01', 'AST-02', 'BAG-03', 'ITD-01'],
    'landside-parking': ['LND-01', 'COM-07', 'COM-08', 'PAX-02'],
    'commercial-retail': [
      'COM-01', 'COM-02', 'COM-03', 'COM-04', 'COM-05', 
      'COM-06', 'COM-07', 'COM-08', 'COM-09', 'COM-10'
    ],
    'finance-productivity': ['FIN-01', 'FIN-02', 'COM-01', 'COM-02', 'COM-10'],
    'workforce-people': ['WFM-01', 'SAF-02', 'PAX-01'],
    'digital-cyber': ['ITD-01', 'ITD-02', 'AST-01', 'PUN-03'],
    'environment-community': ['ENV-01', 'ENV-02', 'FIN-01'],
    'airline-handler-portal': ['PUN-01', 'PUN-02', 'PUN-03', 'BAG-01'],
    'regulatory-pack': ['GOV-01', 'PAX-01', 'BAG-01', 'SAF-01']
  };

  const [commercialStreamFilter, setCommercialStreamFilter] = useState<string>('ALL');

  const targetedCodes = domainKpiMap[dashboardId] || ['PUN-01', 'ASD-01', 'PAX-01', 'BAG-01'];
  const relevantKpis = kpis.filter(k => targetedCodes.includes(k.code));

  const commercialKpis = kpis.filter(k => k.code.startsWith('COM-'));
  const filteredCommercialKpis = commercialKpis.filter(k => {
    if (commercialStreamFilter === 'RETAIL') return ['COM-03', 'COM-04', 'COM-05'].includes(k.code);
    if (commercialStreamFilter === 'FB') return ['COM-06'].includes(k.code);
    if (commercialStreamFilter === 'PARKING') return ['COM-07', 'COM-08'].includes(k.code);
    if (commercialStreamFilter === 'MEDIA') return ['COM-09', 'COM-10'].includes(k.code);
    if (commercialStreamFilter === 'OVERALL') return ['COM-01', 'COM-02'].includes(k.code);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold mb-1">
            <span>{meta.category}</span>
            <span aria-hidden="true">·</span>
            <span>Refresh: {meta.refreshRate}</span>
            <span aria-hidden="true">·</span>
            <span>Primary: {meta.primaryRole}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {meta.name}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            Key Question: <strong className="text-slate-900 dark:text-white">"{meta.coreQuestion}"</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBoardPack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Executive Brief (PDF)</span>
          </button>
        </div>
      </div>

      {/* Signature Domain Visual Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
            Signature Visual: {meta.signatureVisual}
          </span>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Governed Semantic Model Verified</span>
          </span>
        </div>

        {/* 1. Airside & Stands */}
        {dashboardId === 'airside-stands' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Runway Capacity vs Throughput */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Runway Hourly Movements</span>
                  <span className="text-cyan-600 dark:text-cyan-400">56 / 58 Declared</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-medium">
                      <span>09L/27R (CAT III-B Main):</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">32 mvmt/hr (94%)</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300 font-medium">
                      <span>09R/27L (CAT II Secondary):</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">24 mvmt/hr (100%)</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-800">
                  Separation: Wake turbulence RECAT-EU compliant
                </div>
              </div>

              {/* Taxi Additional Time Gantt */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>GANP KPI02 Taxi Time</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">+4.2 min delta</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Inbound Taxi (Actual vs Unimpeded):</span>
                    <strong className="text-slate-900 dark:text-slate-100">6.2m vs 4.8m (+1.4m)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Outbound Taxi (Actual vs Unimpeded):</span>
                    <strong className="text-amber-600 dark:text-amber-400">14.8m vs 9.8m (+5.0m)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Holding Pad Congestion:</span>
                    <strong className="text-slate-900 dark:text-slate-100">2.1 min avg holding</strong>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-800">
                  Target: &le; 4.2 min unimpeded excess
                </div>
              </div>

              {/* Stand Allocation Ratio */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Stand Allocation (118 Total)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">81.2% Contact PBB</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Contact Stands (64):</span>
                    <strong className="text-slate-900 dark:text-slate-100">52 Active Docked (81%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote Stands (54):</span>
                    <strong className="text-slate-900 dark:text-slate-100">22 Active Apron Bus (41%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stand Conflict Re-allocations:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1 logged today (Low)</strong>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-800">
                  Target: &ge; 82.0% contact bridge ratio
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Punctuality & Turnaround */}
        {dashboardId === 'punctuality-turnaround' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* IATA Delay Code Pareto */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>IATA Delay-Code Pareto Breakdown</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">Total: 412 min</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Code 89: Airport Apron / Gate Congestion (Airport)</span>
                      <span className="font-bold">142m (34%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '34%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Code 41: Airline Cabin Cleaning & Catering (Airline)</span>
                      <span className="font-bold">110m (27%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '27%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Code 71: ATC En-Route Airway Restriction (ATC)</span>
                      <span className="font-bold">88m (21%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Code 33: Baggage Sorter Sorting Delay (Airport)</span>
                      <span className="font-bold">72m (18%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '18%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Turnaround Task Swimlanes */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>A-CDM Turnaround Milestone Swimlanes</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Benchmark: 45 min target</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold">1. Deboarding</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[25%]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">00:00 - 00:10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold">2. Fuel & Tech</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[40%] ml-[20%]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">00:08 - 00:25</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold">3. Cabin Clean</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[35%] ml-[30%]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">00:12 - 00:28</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold">4. Boarding</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[45%] ml-[50%]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">00:22 - 00:42</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 dark:text-slate-300 font-semibold">5. Pushback</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[10%] ml-[90%]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">00:42 - 00:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Terminal & Queues */}
        {dashboardId === 'terminal-queues' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
              <span>Hour × Peak Bank Checkpoint P90 Wait Time Heatmap (Minutes)</span>
              <span className="text-cyan-600 dark:text-cyan-400">T1 Alpha & T2 Central</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-18 gap-1 p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800">
              {Array.from({ length: 18 }, (_, i) => {
                const hour = i + 5; // 05:00 to 22:00
                const isPeak = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
                const wait = isPeak ? 11 + (i % 3) : 5 + (i % 4);
                let color = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/40';
                if (wait > 10) color = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/40';
                if (wait > 18) color = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/40';

                return (
                  <div key={hour} className={`p-2 rounded border text-center ${color}`}>
                    <div className="text-[9px] opacity-80 font-bold">{hour}:00</div>
                    <div className="font-extrabold text-xs mt-0.5">{wait}m</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Passenger Experience (CX) */}
        {dashboardId === 'passenger-experience' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ASQ Touchpoints */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>ACI ASQ Touchpoint Ratings</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">4.58 Composite</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                  {[
                    { label: 'Terminal Cleanliness', score: '4.68', target: '4.50' },
                    { label: 'Security Courtesy & Speed', score: '4.52', target: '4.40' },
                    { label: 'Wayfinding & Signage', score: '4.60', target: '4.50' },
                    { label: 'Dining & Retail Variety', score: '4.44', target: '4.35' },
                    { label: 'Baggage Delivery Comfort', score: '4.38', target: '4.30' }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span>{item.label}:</span>
                      <strong className="text-slate-900 dark:text-slate-100">{item.score} / 5.0</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaint Taxonomy */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Complaint Root Cause Taxonomy</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">38 Logged (Weekly)</span>
                </div>
                <div className="space-y-2 pt-1 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-0.5 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Baggage carousel wait duration</span>
                      <span className="font-bold">14 (37%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '37%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-slate-800 dark:text-slate-200 font-medium">
                      <span>T1 Peak security queue bottleneck</span>
                      <span className="font-bold">11 (29%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Forecourt curb congestion / App cabs</span>
                      <span className="font-bold">8 (21%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Stream */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Passenger Sentiment Index</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+68 NPS</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                  <div className="flex justify-between">
                    <span>Positive Sentiment:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">74% of survey responses</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Neutral Sentiment:</span>
                    <strong className="text-slate-800 dark:text-slate-200">19%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Negative Sentiment:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-bold">7% (Resolved within 24h)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>First Contact Resolution:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">94.2%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Accessibility (PRM) */}
        {dashboardId === 'accessibility-prm' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Hourly Booking Curve */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>PRM Assistance Demand</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">342 Daily Pax</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Pre-Notified (&gt;48 hrs):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">302 pax (88.3%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ad-Hoc / Walk-in Requests:</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">40 pax (11.7%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Morning Peak Bank (06:00 - 09:00):</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">118 requests</strong>
                  </div>
                </div>
              </div>

              {/* Wait Time Distribution vs SLA */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>DGCA CAR Compliance</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">98.2% on SLA</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-0.5 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Wait &le; 5 min (Pre-notified)</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">76% of passengers</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5 text-slate-800 dark:text-slate-200 font-medium">
                      <span>Wait 6 - 10 min (Regulatory SLA band)</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">22% of passengers</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fleet & Attendant Dispatch */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>PRM Fleet & Attendant Assets</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Certified</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Wheelchairs Dispatched:</span>
                    <strong className="text-slate-900 dark:text-slate-100">48 units in service</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Electric Terminal Buggies:</span>
                    <strong className="text-slate-900 dark:text-slate-100">14 buggies operational</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendant DGCA Training:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% Recurrent pass</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Baggage Operations */}
        {dashboardId === 'baggage-ops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Arrival Bag Delivery SLA Compliance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">96.4% Met</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                <div className="flex justify-between">
                  <span>First Bag &le; 12 min:</span>
                  <strong className="text-slate-900 dark:text-slate-100">11.4 min avg (97.2% SLA)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Last Bag &le; 25 min:</span>
                  <strong className="text-slate-900 dark:text-slate-100">22.8 min avg (95.6% SLA)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mishandled Bags:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">2.8 per 1,000 pax (Target: 3.2)</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>BHS High-Speed Matrix Sorter Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.8% Available</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                <div className="flex justify-between">
                  <span>T1 Matrix Sorter 1:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% (Nominal)</span>
                </div>
                <div className="flex justify-between">
                  <span>T1 Matrix Sorter 2:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.7% (Nominal)</span>
                </div>
                <div className="flex justify-between">
                  <span>T2 North Sorter:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% (Nominal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Optical Tag Read Rate:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-bold">99.1% First-Pass</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Cargo Operations */}
        {dashboardId === 'cargo-ops' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Import/Export Dwell Box Plot Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cargo Velocity & Dwell Time</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">14.2h avg dwell</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Pharma & Perishables:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">4.2 hours (Rapid release)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Air Courier:</span>
                    <strong className="text-slate-900 dark:text-slate-100">6.8 hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>General Import Dwell:</span>
                    <strong className="text-slate-900 dark:text-slate-100">14.2h (Target: &le; 18h)</strong>
                  </div>
                </div>
              </div>

              {/* Truck Turnaround & Docks */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cargo Truck Bay Operations</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">42 min turnaround</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Dock Bay Occupancy (32 Bays):</span>
                    <strong className="text-slate-900 dark:text-slate-100">82% active load/unload</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Customs EDI Release Speed:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">98.4% processed under 1hr</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ANPR Truck Gate Queue:</span>
                    <strong className="text-slate-900 dark:text-slate-100">3 trucks buffered</strong>
                  </div>
                </div>
              </div>

              {/* Cold-Chain Storage Health */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cool-Chain Pharma Storage</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Compliant</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Zone A (+2°C to +8°C Active):</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">+4.2°C (Calibrated)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Zone B (-20°C Deep Freeze):</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">-20.4°C (Calibrated)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Thermal Excursion Alarms:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0 in last 30 days</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Aerodrome Safety */}
        {dashboardId === 'safety-compliance' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* SPI Control Chart */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>SPI Statistical Process Control</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">&plusmn;3&sigma; Nominal</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Runway Incursions (Cat A-C):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0.02 / 10k mvmt (UCL 0.15)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>FOD Observations Rate:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0.4 per 1k mvmt</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Airside Vehicle Speed Breaches:</span>
                    <strong className="text-slate-900 dark:text-slate-100">2 logged (Citations issued)</strong>
                  </div>
                </div>
              </div>

              {/* Inspections & Wildlife */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Runway Inspections & Wildlife</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">All Clear</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Daily Runway Sweeps Completed:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">8 / 8 scheduled runs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface Friction Mu:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0.78 Mu (Min: 0.60)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bird Hazard Dispersal Events:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">14 active acoustic sweeps</strong>
                  </div>
                </div>
              </div>

              {/* CAPA Status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Corrective Actions (CAPA)</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">18 Active Tracked</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Closed On-Time (YTD):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">96.8% compliance</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Under Joint Review with DGCA:</span>
                    <strong className="text-slate-900 dark:text-slate-100">2 observations</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue Action Items:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0 overdue</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. Security & Emergency */}
        {dashboardId === 'security-emergency' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Screening Quality */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Screening & Threat Detection</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.4% Pass</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Covert QC Threat Intercepts:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.4% (Target: &ge;99.2%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Explosive Trace Random Sampling:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">12.4% pax sampled</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Biometric Digiyatra Lane Share:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">48.2% seamless entry</strong>
                  </div>
                </div>
              </div>

              {/* ARFF Category 9 Emergency */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>ARFF Cat 9 Response Time</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">2m 14s (Record)</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Regulatory Mandate (Runway Midpoint):</span>
                    <strong className="text-slate-900 dark:text-slate-100">&le; 3 min 00 sec</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Crash Fire Tenders (CFTs):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">6 / 6 Combat-Ready</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Firefighting Aqueous Foam Stock:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">45,000L (&gt;200% reserve)</strong>
                  </div>
                </div>
              </div>

              {/* BCAS Audit Burndown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>BCAS Statutory Audit Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">94/94 Met</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Severe Non-Conformances:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0 recorded</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Perimeter Intrusion (PIDS) Uptime:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">99.98% active perimeter</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Airside Pass Verification Rate:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% biometric verified</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. Asset Health & Engineering */}
        {dashboardId === 'asset-health' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
              <span>Critical Asset Classes Availability Matrix (18 Regulated Classes)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Composite: 99.4% Uptime</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { name: 'PBB Aerobridges', uptime: 99.4, mtbf: '340h' },
                { name: 'BHS Sorters', uptime: 99.8, mtbf: '520h' },
                { name: 'Central Chillers', uptime: 100, mtbf: '890h' },
                { name: 'Substations 33kV', uptime: 100, mtbf: '1200h' },
                { name: 'Elevators / Trax', uptime: 99.1, mtbf: '280h' },
                { name: 'PCA / 400Hz GPU', uptime: 98.9, mtbf: '190h' }
              ].map(a => (
                <div key={a.name} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">{a.name}</div>
                  <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{a.uptime}%</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">MTBF: {a.mtbf}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. Landside & Parking */}
        {dashboardId === 'landside-parking' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Curb Dwell Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Forecourt Curb Dwell</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">4.4 min avg</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>&le; 5 min (Free Drop Band):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">76% of all vehicles</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>5 to 10 min:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">19%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; 10 min (Penalty Congestion):</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-bold">5% (ANPR billed)</strong>
                  </div>
                </div>
              </div>

              {/* Multi-Storey Car Park Live Occupancy */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>MLCP Parking Bay Occupancy</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">72% Overall</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>T1 Premium (1,700 Bays):</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">84% (1,428 occupied)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>T2 General (3,500 Bays):</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">68% (2,380 occupied)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>EV Fast Chargers (48 Bays):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">38 active charging</strong>
                  </div>
                </div>
              </div>

              {/* Ride-Hail & Taxi Staging Buffer */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>App Cab & Taxi Staging</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">3.8 min passenger wait</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Ola / Uber Buffer Lot Queue:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">182 cabs staged</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pre-paid Airport Taxi Turnaround:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">5.2 min average</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Feeder Metro / City Bus Share:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">14.6% pax modal split</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12. Commercial & Non-Aeronautical Intelligence Hub */}
        {dashboardId === 'commercial-retail' && (
          <div className="space-y-5 font-mono text-xs">
            {/* Core Commercial Non-Aeronautical KPI Cards (Active with Trends, Raw Grid, Alerts & Drilldown) */}
            <div className="space-y-3 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5 font-mono">
                      <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Commercial & Non-Aero Governed KPI Cards</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-bold">
                      {filteredCommercialKpis.length} Cards · Trends & Grids Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mt-0.5">
                    Interactive KPI cards with 13-period trend curves, in-card raw data tables, configurable threshold alerts, and 4-level drilldowns.
                  </p>
                </div>

                {/* Commercial Stream Filter */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  {[
                    { id: 'ALL', label: 'All Streams (10)' },
                    { id: 'RETAIL', label: 'Retail & Duty-Free (3)' },
                    { id: 'FB', label: 'Food & Beverage (1)' },
                    { id: 'PARKING', label: 'Parking & Landside (2)' },
                    { id: 'MEDIA', label: 'Media & Real Estate (2)' },
                    { id: 'OVERALL', label: 'Overall Non-Aero (2)' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCommercialStreamFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        commercialStreamFilter === tab.id
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 font-sans">
                {filteredCommercialKpis.map(kpi => (
                  <KpiCard key={kpi.kpiId} kpi={kpi} onDrilldown={onDrilldown} />
                ))}
              </div>
            </div>

            {/* Key Driving Variables That Affect CBIs (From Industry Reference Brief) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Key Driving Variables That Affect Commercial Indicators</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Traffic Mix, Passenger Travel Persona, and Security Post-Dwell Time conversion elasticity
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  Empirical Elasticity Model
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                {/* 1. Traffic Mix (International vs Domestic) */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-sans">
                      <Plane className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Traffic Mix (Intl vs Dom)</span>
                    </span>
                    <span className="text-[10px] text-cyan-600 font-bold">4.0x Spend Delta</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <div className="flex justify-between mb-0.5 text-slate-700 dark:text-slate-300 font-medium">
                        <span>International (26.5% pax):</span>
                        <strong className="text-cyan-700 dark:text-cyan-400 font-bold">₹1,180 / pax (34.2% capture)</strong>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5 text-slate-700 dark:text-slate-300 font-medium">
                        <span>Domestic (73.5% pax):</span>
                        <strong className="text-slate-900 dark:text-slate-200 font-bold">₹295 / pax (14.8% capture)</strong>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                    International flyers account for 82% of duty-free perfume, tobacco, and high-margin luxury fashion concession sales.
                  </p>
                </div>

                {/* 2. Passenger Profile (Business vs Leisure) */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-sans">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Passenger Profile Dynamics</span>
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold">Dwell & Persona</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>Business (32% pax)</span>
                        <span className="text-purple-600 dark:text-purple-400">ATV: ₹520</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                        38 min dwell · Prioritizes lounge access, rapid grab-and-go espresso, tech gadgets.
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>Leisure (68% pax)</span>
                        <span className="text-emerald-600 dark:text-emerald-400">ATV: ₹1,850</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                        76 min dwell · Prioritizes discovery retail, regional confectionery, experiential gifts.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Post-Security Dwell Time vs Sales Conversion */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-sans">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Dwell Time Conversion Curve</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">+₹42 / 10m dwell</span>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span>&lt; 30 min dwell:</span>
                      <strong className="text-slate-600 dark:text-slate-400">₹112 / pax (11% capture)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span>30 - 60 min dwell:</span>
                      <strong className="text-slate-800 dark:text-slate-300">₹310 / pax (22% capture)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span>60 - 90 min dwell:</span>
                      <strong className="text-cyan-700 dark:text-cyan-400 font-bold">₹625 / pax (38% capture)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>&gt; 90 min dwell:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">₹1,140 / pax (51% capture)</strong>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/30 text-[10px] text-amber-900 dark:text-amber-200 font-sans font-medium border border-amber-200 dark:border-amber-800/60">
                    Faster security screening directly increases cleared airside dwell, accelerating high-margin concession spend.
                  </div>
                </div>
              </div>
            </div>

            {/* Concessionaires & Outlets Multi-Dimensional Table */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                    Governed Commercial Concessionaire Outlets Matrix
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Total Active Leased Area: 14,240 m² · YTD Royalty Collection: ₹118.4 Cr
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto text-[11px]">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[9px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Outlet / Concessionaire</th>
                      <th className="px-3 py-2">Stream</th>
                      <th className="px-3 py-2">Terminal</th>
                      <th className="px-3 py-2 text-right">Area (m²)</th>
                      <th className="px-3 py-2 text-right">Gross Sales</th>
                      <th className="px-3 py-2 text-right">Airport Fee (MAG)</th>
                      <th className="px-3 py-2 text-right">Yield / m²</th>
                      <th className="px-3 py-2 text-right">Capture %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        1. Dufry Duty Free MegaStore
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Central Intl Plaza</span>
                      </td>
                      <td className="px-3 py-2 text-cyan-700 dark:text-cyan-400 font-semibold">Retail & Duty-Free</td>
                      <td className="px-3 py-2">T2</td>
                      <td className="px-3 py-2 text-right">420 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹48.2 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹9.64 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹22,952</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">34.2%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        2. Starbucks Reserve & Bakery
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Airside Concourse</span>
                      </td>
                      <td className="px-3 py-2 text-amber-700 dark:text-amber-400 font-semibold">Food & Beverage</td>
                      <td className="px-3 py-2">T2</td>
                      <td className="px-3 py-2 text-right">85 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹14.6 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹2.92 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹34,352</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">47.6%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        3. Hugo Boss & Tumi Travel
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">International Luxury Ave</span>
                      </td>
                      <td className="px-3 py-2 text-cyan-700 dark:text-cyan-400 font-semibold">Retail & Duty-Free</td>
                      <td className="px-3 py-2">T2</td>
                      <td className="px-3 py-2 text-right">110 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹16.8 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹3.36 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹30,545</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">11.8%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        4. Haldiram's & Street Food
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Domestic Food Mezzanine</span>
                      </td>
                      <td className="px-3 py-2 text-amber-700 dark:text-amber-400 font-semibold">Food & Beverage</td>
                      <td className="px-3 py-2">T1</td>
                      <td className="px-3 py-2 text-right">160 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹11.2 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹2.24 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹14,000</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">40.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        5. Forest Essentials Ayurveda
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Departure Pier Alpha</span>
                      </td>
                      <td className="px-3 py-2 text-cyan-700 dark:text-cyan-400 font-semibold">Retail & Duty-Free</td>
                      <td className="px-3 py-2">T2</td>
                      <td className="px-3 py-2 text-right">60 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹9.8 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹1.96 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹32,666</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">20.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        6. Times OOH / JCDecaux Screens
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Terminal Curved Synced DOOH</span>
                      </td>
                      <td className="px-3 py-2 text-purple-700 dark:text-purple-400 font-semibold">Advertising & Media</td>
                      <td className="px-3 py-2">T1/T2</td>
                      <td className="px-3 py-2 text-right">180 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹24.0 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹12.0 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹66,666</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">96.2%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                        7. Aerotropolis Commercial City
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Cargo Warehousing & Hotel Lease</span>
                      </td>
                      <td className="px-3 py-2 text-emerald-700 dark:text-emerald-400 font-semibold">Property & Real Estate</td>
                      <td className="px-3 py-2">Landside</td>
                      <td className="px-3 py-2 text-right">12,500 m²</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white">₹82.0 Cr</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">₹82.0 Cr</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">₹6,560</td>
                      <td className="px-3 py-2 text-right font-bold text-cyan-600">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 13. Finance & Productivity */}
        {dashboardId === 'finance-productivity' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Aero Revenue / Pax</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹492 / pax</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">AERA tariff yield</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Non-Aero Revenue / Pax</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹418 / pax</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">46.0% Total Share</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Operating Cost / Pax</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">₹395 / pax</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">-3.6% Unit Cost Improvement</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>EBITDA Margin & Cost Variances</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">64.0% EBITDA Margin (Target: &ge;62.5%)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-700 dark:text-slate-300 font-bold">Gross Operating Revenue:</div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">₹2,912 Cr Annualized</div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-700 dark:text-slate-300 font-bold">Total Operating Expenses:</div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">₹1,264 Cr (Under budget)</div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-700 dark:text-slate-300 font-bold">EBITDA Earnings:</div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">₹1,648 Cr (+8.4% YoY)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 14. Workforce & People */}
        {dashboardId === 'workforce-people' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Roster Shift Coverage */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Shift Roster Fulfillment</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">98.1% Attended</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Security Screening Shifts:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">97.4% full attendance</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Terminal Guest Experience:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">98.8%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Airside Marshallers & Apron:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% full roster</strong>
                  </div>
                </div>
              </div>

              {/* FRMS Overtime */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Fatigue Risk Management</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">4.2% Overtime Rate</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Target Overtime Ceiling:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">&le; 6.0% of standard hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Consecutive Shift Violations:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0 breaches recorded</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mandatory Rest Adherence:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% compliant</strong>
                  </div>
                </div>
              </div>

              {/* Recurrent Certification */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>DGCA Mandatory Certifications</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.4% Current</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>AVSEC Basic & Refresher:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.2% certified</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Airside Driving Permits (ADP):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">98.6% valid</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dangerous Goods (DGR Cat 7/8):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% current</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 15. Digital & Cyber Systems */}
        {dashboardId === 'digital-cyber' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Mission-Critical Systems Availability */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Critical Airport Systems Uptime</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.98% Composite</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>AODB Operational Database:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100.0% (Zero downtime)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>FIDS Flight Information Displays:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.98%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CUTE / CUSS Check-in Gates:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.95%</strong>
                  </div>
                </div>
              </div>

              {/* SOC Incident Telemetry */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cybersecurity SOC Telemetry</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">MTTD: 4.2 min</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>Threat Detection Target (MTTD):</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">&le; 8.0 min (Met)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Containment Time (MTTC):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">12.5 min avg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Malicious Probes Blocked (24h):</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">1,420 blocked</strong>
                  </div>
                </div>
              </div>

              {/* OT Airgap & SCADA Security */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Operational Technology (OT) Health</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Air-Gap Secure</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>BHS SCADA Boundary Firewall:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Nominal (Zero breaches)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Firmware Patch Currency:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-bold">98.4% up-to-date</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Unauthorized MAC Device Alerts:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">0 detections</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 16. Environment & Sustainability */}
        {dashboardId === 'environment-community' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Decarbonization Trajectory (Scope 1+2)</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">ACA Level 4 Pathway</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                <div className="flex justify-between">
                  <span>Scope 1 Direct (Apron Vehicles/Gas):</span>
                  <strong className="text-slate-900 dark:text-slate-100">0.42 kg CO2e / pax</strong>
                </div>
                <div className="flex justify-between">
                  <span>Scope 2 Indirect (Grid Power):</span>
                  <strong className="text-slate-900 dark:text-slate-100">1.33 kg CO2e / pax</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Carbon Intensity:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1.75 kg CO2e / pax (-22% YoY)</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Renewable Energy & Water Circularity</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">65.4% Solar Power</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                <div className="flex justify-between">
                  <span>Apron Solar PV Array:</span>
                  <strong className="text-slate-900 dark:text-slate-100">15 MW Installed Peak</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sewage Treatment Recycling (STP):</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">92% Reclaimed for HVAC</strong>
                </div>
                <div className="flex justify-between">
                  <span>Waste Diverted from Landfill:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-bold">74% Composted / Recycled</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 17. External Partner SLA Portal */}
        {dashboardId === 'airline-handler-portal' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg border border-cyan-300 dark:border-cyan-800/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-300 font-semibold shadow-xs">
              <strong>External Partner Scope Enforced: </strong>
              Showing flight turnaround records and first-bag SLA milestones for carrier <strong className="text-cyan-700 dark:text-cyan-300 underline">{user.scopeValue || '6E'}</strong>. Other airline rows are masked by Row-Level Security.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Carrier Departure OTP-15</span>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">88.4%</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Target: 87.0% (+1.4% ahead of airport avg)</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">First-Bag SLA Compliance</span>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">98.1% Met</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Avg arrival delivery: 10.8 min</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Turnaround Milestone Accuracy</span>
                <div className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">92.4% TOBT</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Zero ground handling penalty points</div>
              </div>
            </div>
          </div>
        )}

        {/* 18. Regulatory Compliance Pack */}
        {dashboardId === 'regulatory-pack' && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2">Regulated Standard</th>
                  <th className="px-3 py-2">Benchmark SLA</th>
                  <th className="px-3 py-2">Actual (ZZA)</th>
                  <th className="px-3 py-2">Compliance Status</th>
                  <th className="px-3 py-2">Rebate Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Security Wait P90</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">&le; 10.0 min</td>
                  <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">9.4 min</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">Compliant</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">₹0</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">First Bag on Carousel</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">&le; 12.0 min</td>
                  <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">11.4 min</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">Compliant</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">₹0</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">PRM Service Wait Time</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">&ge; 98.0% within SLA</td>
                  <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">98.2%</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">Compliant</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">₹0</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Terminal Washroom Cleanliness</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">&ge; 4.5 / 5.0 CSAT</td>
                  <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">4.62</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">Compliant</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">₹0</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Relevant Governed KPI Card Grid (for other departmental sections) */}
      {dashboardId !== 'commercial-retail' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantKpis.map(kpi => (
            <KpiCard key={kpi.kpiId} kpi={kpi} onDrilldown={onDrilldown} />
          ))}
        </div>
      )}
    </div>
  );
};
