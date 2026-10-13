import React from 'react';
import { KpiValueResult } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  BarChart3
} from 'lucide-react';

interface ScorecardViewProps {
  kpis: KpiValueResult[];
  onDrilldown: (kpi: KpiValueResult) => void;
}

export const EnterpriseScorecardView: React.FC<ScorecardViewProps> = ({ kpis, onDrilldown }) => {
  // Sort movers
  const sortedMovers = [...kpis].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  const topMovers = sortedMovers.slice(0, 5);

  // Group KPIs by domain
  const domains = Array.from(new Set(kpis.map(k => k.domain)));

  return (
    <div className="space-y-6">
      {/* Executive Briefing Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>AIONOS Enterprise Executive Scorecard</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
              FY2026-27 YTD
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Whole-airport governed health across 21 functional domains · Calibrated for 32M Annual Passengers (ZZA)
          </p>
        </div>

        {/* Global RAG count summary */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{kpis.filter(k => k.status === 'green').length} On Target</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{kpis.filter(k => k.status === 'amber').length} Warning</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{kpis.filter(k => k.status === 'red').length} Breaches</span>
          </div>
        </div>
      </div>

      {/* RAG Domain Heat Strip */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-300 font-bold">
          Domain RAG Heat Strip (Governed Semantic Health)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {domains.slice(0, 14).map(dom => {
            const domainKpis = kpis.filter(k => k.domain === dom);
            const redCount = domainKpis.filter(k => k.status === 'red').length;
            const amberCount = domainKpis.filter(k => k.status === 'amber').length;

            let badgeColor = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20';
            if (redCount > 0) {
              badgeColor = 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/20';
            } else if (amberCount > 0) {
              badgeColor = 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/20';
            }

            return (
              <div
                key={dom}
                className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col justify-between ${badgeColor}`}
              >
                <div className="line-clamp-1 font-semibold text-[11px]">{dom}</div>
                <div className="text-[10px] font-mono mt-1 opacity-90 font-medium">
                  {domainKpis.length} KPIs {redCount > 0 ? `· ${redCount} Breaches` : '· Stable'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Tier 1 Metric Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
            Primary Enterprise Tier 1 Indicators
          </h3>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
            {kpis.length} Governed Metrics Rendered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map(kpi => (
            <KpiCard key={kpi.kpiId} kpi={kpi} onDrilldown={onDrilldown} />
          ))}
        </div>
      </div>

      {/* Top 5 Movers Table & Capital Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Movers */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Top 5 Metric Movers (Period Variance)</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
            {topMovers.map(m => (
              <div key={m.kpiId} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{m.code} · {m.name}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{m.domain}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{m.currentValue} {m.unit}</div>
                  <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                    m.changePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {m.changePct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{m.changePct > 0 ? '+' : ''}{m.changePct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capital Projects Section (Projects Director Home Integration) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Strategic Capital Projects (CAP Programme)</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">Terminal 1 Expansion Phase 2</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">SPI: 1.04 · CPI: 0.99</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                Progress: 68% · On-track for Q1 2027 handover · ₹4.2B Capitalized
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">Runway 09R Rapid Exit Taxiway (RET-3)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">SPI: 1.01 · CPI: 1.02</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                Progress: 92% · Target ROT reduction: -12s per narrowbody
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">15MW Solar Canopy Apron Project</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">Commissioned May 2026</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                Achieved ACA Level 4 standard transition with 65.4% green power
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
