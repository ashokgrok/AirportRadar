import React from 'react';
import { EMBEDDED_SCENARIOS } from '../../data/kpiLibrary';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Filter, 
  Flame, 
  Building2, 
  Plane,
  Calendar
} from 'lucide-react';

interface FilterRibbonProps {
  dateRange: string;
  setDateRange: (d: string) => void;
  terminal: string;
  setTerminal: (t: string) => void;
  airline: string;
  setAirline: (a: string) => void;
  activeScenarioId: string | null;
  setActiveScenarioId: (s: string | null) => void;
  simulationPlaying: boolean;
  setSimulationPlaying: (p: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (s: number) => void;
}

export const GlobalFilterRibbon: React.FC<FilterRibbonProps> = ({
  dateRange,
  setDateRange,
  terminal,
  setTerminal,
  airline,
  setAirline,
  activeScenarioId,
  setActiveScenarioId,
  simulationPlaying,
  setSimulationPlaying,
  simulationSpeed,
  setSimulationSpeed
}) => {
  const activeScenario = EMBEDDED_SCENARIOS.find(s => s.id === activeScenarioId);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* Global Dimension Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Grain */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-slate-200">Period:</span>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-0.5 shadow-xs">
            {['today', '7d', '30d', '90d', '24m'].map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-2 py-0.5 uppercase font-mono font-bold rounded transition-colors ${
                  dateRange === d
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal filter */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-slate-200">Terminal:</span>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-0.5 shadow-xs">
            {['ALL', 'T1', 'T2'].map(t => (
              <button
                key={t}
                onClick={() => setTerminal(t)}
                className={`px-2 py-0.5 font-bold rounded transition-colors ${
                  terminal === t
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Airline filter */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
          <Plane className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-slate-200">Carrier:</span>
          <select
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-2 py-1 text-slate-900 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-1 focus:ring-cyan-500 shadow-xs"
          >
            <option value="ALL">All Airlines (46)</option>
            <option value="6E">IndiGo (6E) · Home Base</option>
            <option value="AI">Air India (AI) · Home Base</option>
            <option value="SG">SpiceJet (SG)</option>
            <option value="QP">Akasa Air (QP)</option>
            <option value="EK">Emirates (EK)</option>
            <option value="SQ">Singapore Airlines (SQ)</option>
            <option value="LH">Lufthansa (LH)</option>
            <option value="BA">British Airways (BA)</option>
          </select>
        </div>
      </div>

      {/* Scenario & Replay Simulation Controls */}
      <div className="flex items-center gap-3">
        {/* Scenario Selector */}
        <div className="flex items-center gap-1.5">
          <Flame className={`w-3.5 h-3.5 ${activeScenarioId ? 'text-amber-600 dark:text-amber-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
          <span className="font-bold text-slate-900 dark:text-slate-200">Scenario:</span>
          <select
            value={activeScenarioId || ''}
            onChange={(e) => setActiveScenarioId(e.target.value || null)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-2 py-1 text-slate-900 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500 max-w-[210px] truncate shadow-xs"
          >
            <option value="">Baseline Operations (Calibrated)</option>
            {EMBEDDED_SCENARIOS.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Demo Clock Replay Controls */}
        <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-800 pl-3">
          <button
            onClick={() => setSimulationPlaying(!simulationPlaying)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-colors ${
              simulationPlaying
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 hover:text-cyan-700 shadow-xs'
            }`}
          >
            {simulationPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
            <span>{simulationPlaying ? 'Simulating' : 'Play Clock'}</span>
          </button>

          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-1.5 py-1 font-mono text-slate-900 dark:text-slate-200 font-bold shadow-xs"
          >
            <option value={1}>1x</option>
            <option value={5}>5x</option>
            <option value={15}>15x</option>
            <option value={60}>60x</option>
          </select>

          {activeScenarioId && (
            <button
              onClick={() => setActiveScenarioId(null)}
              title="Reset to baseline"
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
