import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { KpiValueResult } from '../../types';
import { 
  Bookmark, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  User,
  ShieldAlert,
  Pin
} from 'lucide-react';

interface MyWatchlistStripProps {
  kpis: KpiValueResult[];
  pinnedCodes: string[];
  onTogglePin: (code: string) => void;
  onDrilldown: (kpi: KpiValueResult) => void;
  onOpenActionCenter: () => void;
}

export const MyWatchlistStrip: React.FC<MyWatchlistStripProps> = ({
  kpis,
  pinnedCodes,
  onTogglePin,
  onDrilldown,
  onOpenActionCenter
}) => {
  const { currentUser } = useAuth();

  // Find KPIs owned by user's function or department
  const ownedKpis = kpis.filter(k => 
    k.owner.toLowerCase().includes(currentUser.department.toLowerCase()) ||
    (currentUser.id === 'aocc-duty-mgr' && (k.code === 'PUN-01' || k.code === 'PUN-02')) ||
    (currentUser.id === 'cfo' && (k.code === 'FIN-01' || k.code === 'FIN-02' || k.code === 'COM-02')) ||
    (currentUser.id === 'cso' && (k.code === 'SEC-01' || k.code === 'PAX-01')) ||
    (currentUser.id === 'baggage-mgr' && (k.code === 'BAG-01' || k.code === 'BAG-02' || k.code === 'BAG-03')) ||
    (currentUser.id === 'cx-lead' && (k.code === 'PAX-02' || k.code === 'PAX-03')) ||
    (currentUser.id === 'airside-mgr' && (k.code === 'ASD-01' || k.code === 'ASD-02' || k.code === 'ASD-03')) ||
    (currentUser.id === 'head-safety' && (k.code === 'SAF-01' || k.code === 'SAF-02')) ||
    (currentUser.id === 'head-eng' && (k.code === 'AST-01' || k.code === 'AST-02')) ||
    (currentUser.id === 'comm-dir' && (k.code === 'COM-01' || k.code === 'COM-02')) ||
    (currentUser.id === 'sustainability-lead' && (k.code === 'ENV-01' || k.code === 'ENV-02')) ||
    (currentUser.id === 'cio-ciso' && (k.code === 'ITD-01' || k.code === 'ITD-02')) ||
    (currentUser.id === 'regulatory-lead' && k.code === 'GOV-01')
  );

  // Breaching KPIs
  const breaches = kpis.filter(k => k.status === 'red' || k.status === 'amber');

  // Combined Watchlist: Pinned + Owned + Breaches (deduplicated)
  const watchlistItems = Array.from(new Set([
    ...kpis.filter(k => pinnedCodes.includes(k.code)),
    ...ownedKpis,
    ...breaches.slice(0, 3)
  ]));

  if (watchlistItems.length === 0) return null;

  return (
    <div className="mb-6 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            My Watchlist Strip
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {currentUser.name} ({currentUser.department})
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {breaches.length > 0 && (
            <button
              onClick={onOpenActionCenter}
              className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{breaches.length} In-Scope Breaches · View Actions</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Watchlist Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {watchlistItems.map(item => {
          const isBreach = item.status === 'red';
          const isWarning = item.status === 'amber';
          const isPinned = pinnedCodes.includes(item.code);

          let borderTone = 'border-slate-200 dark:border-slate-800';
          let badgeTone = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium';

          if (isBreach) {
            borderTone = 'border-rose-400 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20';
            badgeTone = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
          } else if (isWarning) {
            borderTone = 'border-amber-400 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20';
            badgeTone = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold';
          }

          return (
            <div
              key={item.kpiId}
              className={`shrink-0 min-w-[210px] p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shadow-xs ${borderTone}`}
            >
              <div className="space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700 dark:text-slate-400 font-semibold">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400">{item.code}</span>
                  <span>·</span>
                  <span className="truncate max-w-[100px]">{item.domain}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {item.name}
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.currentValue}</span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">{item.unit}</span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-400 ml-1 font-bold">tgt: {item.target}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  onClick={() => onTogglePin(item.code)}
                  title={isPinned ? 'Unpin from Watchlist' : 'Pin to Watchlist'}
                  className={`p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white ${isPinned ? 'text-cyan-600 dark:text-cyan-400' : ''}`}
                >
                  <Pin className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDrilldown(item)}
                  title="Drilldown"
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200"
                >
                  Drill
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
