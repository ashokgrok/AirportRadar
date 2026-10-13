import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TopBar } from './components/common/TopBar';
import { GlobalFilterRibbon } from './components/common/GlobalFilterRibbon';
import { Sidebar } from './components/common/Sidebar';
import { DrilldownModal } from './components/common/DrilldownModal';
import { SqlConsoleModal } from './components/common/SqlConsoleModal';
import { AuthModal } from './components/common/AuthModal';
import { AiAssistantDrawer } from './components/common/AiAssistantDrawer';
import { KpiDictionaryModal } from './components/common/KpiDictionaryModal';
import { ActionCenterModal } from './components/common/ActionCenterModal';
import { KpiExplorerModal } from './components/common/KpiExplorerModal';
import { BoardPackModal } from './components/common/BoardPackModal';
import { MyWatchlistStrip } from './components/common/MyWatchlistStrip';
import { AdminConsoleModal } from './components/common/AdminConsoleModal';
import { OnboardingTourModal } from './components/common/OnboardingTourModal';

import { EnterpriseScorecardView } from './components/dashboards/EnterpriseScorecardView';
import { LiveOpsView } from './components/dashboards/LiveOpsView';
import { DepartmentalDashboardView } from './components/dashboards/DepartmentalDashboardView';

import { fetchKpiValues, fetchLiveFlights, fetchLiveQueues } from './services/semanticApi';
import { KpiValueResult } from './types';
import { getDb } from './db/pglite';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      refetchOnWindowFocus: false
    }
  }
});

function AirportDashboardApp() {
  const { currentUser } = useAuth();
  const [activeDashboardId, setActiveDashboardId] = useState<string>(currentUser.homeDashboardId || 'enterprise-scorecard');

  // Sync home dashboard when switching roles
  useEffect(() => {
    if (currentUser?.homeDashboardId) {
      setActiveDashboardId(currentUser.homeDashboardId);
    }
  }, [currentUser.id]);

  // Global filters
  const [dateRange, setDateRange] = useState('today');
  const [terminal, setTerminal] = useState('ALL');
  const [airline, setAirline] = useState('ALL');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Simulation clock
  const [simulationPlaying, setSimulationPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Modals & Drawers state
  const [selectedDrilldownKpi, setSelectedDrilldownKpi] = useState<KpiValueResult | null>(null);
  const [isSqlConsoleOpen, setIsSqlConsoleOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isKpiDictionaryOpen, setIsKpiDictionaryOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [isKpiExplorerOpen, setIsKpiExplorerOpen] = useState(false);
  const [isBoardPackOpen, setIsBoardPackOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState(() => {
    return !localStorage.getItem('aionos_tour_completed');
  });

  // Pinned KPIs state (PRD Section 2 #2 & #3)
  const [pinnedKpiCodes, setPinnedKpiCodes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('aionos_pinned_kpis') || '["PUN-01", "PAX-01"]');
    } catch {
      return ['PUN-01', 'PAX-01'];
    }
  });

  const handleTogglePin = (code: string) => {
    setPinnedKpiCodes(prev => {
      const updated = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      localStorage.setItem('aionos_pinned_kpis', JSON.stringify(updated));
      return updated;
    });
  };

  // Initialize DB in background
  useEffect(() => {
    getDb().catch(console.error);
  }, []);

  // TanStack Query for KPI values
  const { data: kpiValues = [], isLoading: kpiLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['kpiValues', dateRange, terminal, airline, activeScenarioId, currentUser.id],
    queryFn: () => fetchKpiValues({ dateRange, terminal, airline, activeScenarioId }, currentUser)
  });

  // TanStack Query for Live Flights
  const { data: flights = [], refetch: refetchFlights } = useQuery({
    queryKey: ['liveFlights', currentUser.id, terminal, airline],
    queryFn: () => fetchLiveFlights(currentUser)
  });

  // TanStack Query for Live Queues
  const { data: queues = [] } = useQuery({
    queryKey: ['liveQueues', terminal],
    queryFn: () => fetchLiveQueues(terminal)
  });

  // Simulation tick loop
  useEffect(() => {
    if (!simulationPlaying) return;
    const interval = setInterval(() => {
      refetchKpis();
      refetchFlights();
    }, Math.max(1000 / simulationSpeed, 200));

    return () => clearInterval(interval);
  }, [simulationPlaying, simulationSpeed, refetchKpis, refetchFlights]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      {/* Strict Top Bar */}
      <TopBar
        activeDashboardId={activeDashboardId}
        setActiveDashboardId={setActiveDashboardId}
        openAiAssistant={() => setIsAiAssistantOpen(true)}
        openSqlConsole={() => setIsSqlConsoleOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openAdminConsole={() => setIsAdminConsoleOpen(true)}
        openTourModal={() => setIsOnboardingTourOpen(true)}
      />

      {/* Global Filter Ribbon (Conformed dimensions, scenarios, simulation clock) */}
      <GlobalFilterRibbon
        dateRange={dateRange}
        setDateRange={setDateRange}
        terminal={terminal}
        setTerminal={setTerminal}
        airline={airline}
        setAirline={setAirline}
        activeScenarioId={activeScenarioId}
        setActiveScenarioId={setActiveScenarioId}
        simulationPlaying={simulationPlaying}
        setSimulationPlaying={setSimulationPlaying}
        simulationSpeed={simulationSpeed}
        setSimulationSpeed={setSimulationSpeed}
      />

      {/* Main Body: Sidebar + Active Dashboard Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeDashboardId={activeDashboardId}
          setActiveDashboardId={setActiveDashboardId}
          openKpiDictionary={() => setIsKpiDictionaryOpen(true)}
          openActionCenter={() => setIsActionCenterOpen(true)}
          openKpiExplorer={() => setIsKpiExplorerOpen(true)}
          openBoardPack={() => setIsBoardPackOpen(true)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* My Watchlist Strip (PRD Section 2 #3) */}
            <MyWatchlistStrip
              kpis={kpiValues}
              pinnedCodes={pinnedKpiCodes}
              onTogglePin={handleTogglePin}
              onDrilldown={(kpi) => setSelectedDrilldownKpi(kpi)}
              onOpenActionCenter={() => setIsActionCenterOpen(true)}
            />

            {activeDashboardId === 'enterprise-scorecard' && (
              <EnterpriseScorecardView
                kpis={kpiValues}
                onDrilldown={(kpi) => setSelectedDrilldownKpi(kpi)}
              />
            )}

            {activeDashboardId === 'live-ops' && (
              <LiveOpsView
                kpis={kpiValues}
                flights={flights}
                queues={queues}
                activeScenarioId={activeScenarioId}
                onDrilldown={(kpi) => setSelectedDrilldownKpi(kpi)}
                user={currentUser}
              />
            )}

            {activeDashboardId !== 'enterprise-scorecard' && activeDashboardId !== 'live-ops' && (
              <DepartmentalDashboardView
                dashboardId={activeDashboardId}
                kpis={kpiValues}
                flights={flights}
                queues={queues}
                onDrilldown={(kpi) => setSelectedDrilldownKpi(kpi)}
                onOpenBoardPack={() => setIsBoardPackOpen(true)}
                user={currentUser}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <DrilldownModal
        kpi={selectedDrilldownKpi}
        onClose={() => setSelectedDrilldownKpi(null)}
        user={currentUser}
      />

      {isSqlConsoleOpen && (
        <SqlConsoleModal onClose={() => setIsSqlConsoleOpen(false)} />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        activeScenarioId={activeScenarioId}
      />

      {isKpiDictionaryOpen && (
        <KpiDictionaryModal
          onClose={() => setIsKpiDictionaryOpen(false)}
          onSelectKpiForDrilldown={(code) => {
            const found = kpiValues.find(k => k.code === code);
            if (found) setSelectedDrilldownKpi(found);
            setIsKpiDictionaryOpen(false);
          }}
        />
      )}

      {isActionCenterOpen && (
        <ActionCenterModal onClose={() => setIsActionCenterOpen(false)} />
      )}

      {isKpiExplorerOpen && (
        <KpiExplorerModal onClose={() => setIsKpiExplorerOpen(false)} />
      )}

      {isBoardPackOpen && (
        <BoardPackModal
          onClose={() => setIsBoardPackOpen(false)}
          kpis={kpiValues}
          user={currentUser}
        />
      )}

      {isAdminConsoleOpen && (
        <AdminConsoleModal onClose={() => setIsAdminConsoleOpen(false)} />
      )}

      {isOnboardingTourOpen && (
        <OnboardingTourModal onClose={() => setIsOnboardingTourOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AirportDashboardApp />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
