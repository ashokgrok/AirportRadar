import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  UserCheck, 
  LogOut, 
  Terminal, 
  Sparkles, 
  Database,
  ChevronDown,
  ShieldAlert,
  Settings,
  HelpCircle,
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { getStoredAlertRules } from '../../utils/alertStore';
import { KpiAlertRule } from '../../types/alert';

interface TopBarProps {
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  openAiAssistant: () => void;
  openSqlConsole: () => void;
  openAuthModal: () => void;
  openAdminConsole: () => void;
  openTourModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeDashboardId,
  setActiveDashboardId,
  openAiAssistant,
  openSqlConsole,
  openAuthModal,
  openAdminConsole,
  openTourModal
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, density, toggleDensity } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertRules, setAlertRules] = useState<KpiAlertRule[]>(() => getStoredAlertRules());

  React.useEffect(() => {
    const handleUpdate = () => {
      setAlertRules(getStoredAlertRules());
    };
    window.addEventListener('aionos_alerts_updated', handleUpdate);
    return () => window.removeEventListener('aionos_alerts_updated', handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveDashboardId('enterprise-scorecard'); }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
        >
          AIONOS <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">ZZA</span>
        </a>
        <span className="hidden lg:inline text-xs font-mono text-slate-700 dark:text-slate-400 font-semibold border-l border-slate-300 dark:border-slate-700 pl-3">
          PGSQL WASM · 624 KPIs
        </span>
      </div>

      {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-800 dark:text-slate-300">
        <button
          onClick={() => setActiveDashboardId('enterprise-scorecard')}
          className={`hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDashboardId === 'enterprise-scorecard' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : ''
          }`}
        >
          Scorecard
        </button>
        <button
          onClick={() => setActiveDashboardId('live-ops')}
          className={`hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDashboardId === 'live-ops' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : ''
          }`}
        >
          Live Ops (AOCC)
        </button>
        <button
          onClick={() => setActiveDashboardId('terminal-queues')}
          className={`hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDashboardId === 'terminal-queues' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : ''
          }`}
        >
          Terminal & Queues
        </button>
        <button
          onClick={() => setActiveDashboardId('commercial-retail')}
          className={`hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDashboardId === 'commercial-retail' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : ''
          }`}
        >
          Commercial
        </button>
        <button
          onClick={() => setActiveDashboardId('regulatory-pack')}
          className={`hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeDashboardId === 'regulatory-pack' ? 'text-cyan-700 dark:text-cyan-400 font-bold' : ''
          }`}
        >
          Regulatory Pack
        </button>
      </nav>

      {/* Zone 3: Primary Action & User Scope Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Guided Tour Trigger */}
        <button
          onClick={openTourModal}
          title="Start 4-Step Guided Tour"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-600 transition-colors shadow-xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">Tour</span>
        </button>

        {/* Reference Data Admin Console */}
        <button
          onClick={openAdminConsole}
          title="Open Airport Configuration & Reference Data Admin (FR-5)"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-600 transition-colors shadow-xs"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">Admin</span>
        </button>

        {/* Interactive SQL WASM console */}
        <button
          onClick={openSqlConsole}
          title="Open In-Browser PostgreSQL WASM Console"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-600 transition-colors shadow-xs"
        >
          <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">PG-WASM</span>
        </button>

        {/* KPI Alerts Center Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            title="Configured KPI Alerts"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-600 transition-colors shadow-xs relative"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
            {alertRules.filter(r => r.enabled).length > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white">
                {alertRules.filter(r => r.enabled).length}
              </span>
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-amber-500" />
                  <span>Configured KPI Alerts ({alertRules.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Real-Time Evaluation</span>
              </div>

              <div className="py-2 space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
                {alertRules.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No KPI alerts configured yet. Click the bell on any KPI card to set one up.
                  </div>
                ) : (
                  alertRules.map(rule => (
                    <div
                      key={rule.id}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{rule.kpiCode}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          rule.severity === 'critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">{rule.kpiName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Rule: {rule.condition.replace(/_/g, ' ')}</span>
                        <span className={rule.enabled ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                          {rule.enabled ? '● Active' : '○ Paused'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 text-center">
                Configure customized alert rules by clicking 🔔 on each KPI card.
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={openAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask KPI AI</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
        </button>

        {/* Density Toggle */}
        <button
          onClick={toggleDensity}
          title={`Density: ${density}`}
          className="hidden sm:block px-2 py-1 text-xs font-mono font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 shadow-xs"
        >
          {density === 'compact' ? 'COMPACT' : 'COMFY'}
        </button>

        {/* Role & User Switcher */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <div className="leading-tight truncate max-w-[120px] font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-tight">{currentUser.department}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-xs text-cyan-500 font-medium">{currentUser.department}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Scope: <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.scopeType} {currentUser.scopeValue ? `(${currentUser.scopeValue})` : ''}</span>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => { setProfileOpen(false); openAuthModal(); }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <UserCheck className="w-4 h-4 text-cyan-500" />
                  <span>Switch Role (24 Seeded Personas)</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); logout(); openAuthModal(); }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
