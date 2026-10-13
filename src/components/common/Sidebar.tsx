import React from 'react';
import { DASHBOARDS } from '../../data/kpiLibrary';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Radar, 
  PlaneTakeoff, 
  Clock, 
  Users, 
  HeartHandshake, 
  Accessibility, 
  Luggage, 
  Package, 
  ShieldAlert, 
  Lock, 
  Wrench, 
  Car, 
  ShoppingBag, 
  TrendingUp, 
  UserCheck, 
  Server, 
  Leaf, 
  FileCheck,
  Scale,
  BookOpen,
  Compass,
  FileText,
  CheckSquare,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  openKpiDictionary: () => void;
  openActionCenter: () => void;
  openKpiExplorer: () => void;
  openBoardPack: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  Radar,
  PlaneTakeoff,
  Clock,
  Users,
  HeartHandshake,
  Accessibility,
  Luggage,
  Package,
  ShieldAlert,
  Lock,
  Wrench,
  Car,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Server,
  Leaf,
  FileCheck,
  Scale
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeDashboardId,
  setActiveDashboardId,
  openKpiDictionary,
  openActionCenter,
  openKpiExplorer,
  openBoardPack
}) => {
  const { currentUser } = useAuth();

  // Group dashboards by category
  const categories = Array.from(new Set(DASHBOARDS.map(d => d.category)));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col h-[calc(100vh-61px-41px)] overflow-y-auto">
      {/* Role Home Recommendation Badge */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="text-[11px] font-mono text-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
          Role Home View
        </div>
        <button
          onClick={() => setActiveDashboardId(currentUser.homeDashboardId)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300 text-xs font-bold text-left hover:bg-cyan-100 transition-colors"
        >
          <span className="truncate">
            {DASHBOARDS.find(d => d.id === currentUser.homeDashboardId)?.name || 'Home Scorecard'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-500 shrink-0" />
        </button>
      </div>

      {/* Global Utilities */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
        <div className="text-[11px] font-mono text-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
          Catalog & Analytics
        </div>
        <button
          onClick={openKpiDictionary}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-cyan-700 dark:text-cyan-500" />
          <span>KPI Dictionary (624)</span>
        </button>
        <button
          onClick={openKpiExplorer}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Compass className="w-4 h-4 text-amber-700 dark:text-amber-500" />
          <span>Self-Service Explorer</span>
        </button>
        <button
          onClick={openBoardPack}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FileText className="w-4 h-4 text-blue-700 dark:text-blue-500" />
          <span>Executive Board Pack</span>
        </button>
        <button
          onClick={openActionCenter}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
          <span>Governance & Targets</span>
        </button>
      </div>

      {/* 20 Dashboards Nav */}
      <div className="p-3 space-y-4 flex-1">
        {categories.map(cat => {
          const catDashboards = DASHBOARDS.filter(d => d.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-mono text-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider px-2">
                {cat}
              </div>
              {catDashboards.map(dash => {
                const IconComponent = ICON_MAP[dash.iconName] || LayoutDashboard;
                const isActive = activeDashboardId === dash.id;
                const isHome = currentUser.homeDashboardId === dash.id;

                return (
                  <button
                    key={dash.id}
                    onClick={() => setActiveDashboardId(dash.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold shadow-xs'
                        : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400 dark:text-slate-950' : 'text-slate-600 dark:text-slate-400'}`} />
                    <span className="truncate flex-1">{dash.name}</span>
                    {isHome && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white dark:bg-slate-950' : 'bg-cyan-600'}`} title="Mapped to your current role" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
