import React, { useState } from 'react';
import { KEY_KPIS } from '../../data/kpiLibrary';
import { KpiDefinition } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';
import { 
  X, 
  Compass, 
  BarChart3, 
  Table, 
  Download, 
  Filter, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

interface KpiExplorerModalProps {
  onClose: () => void;
}

export const KpiExplorerModal: React.FC<KpiExplorerModalProps> = ({ onClose }) => {
  const [selectedKpiId, setSelectedKpiId] = useState<string>(KEY_KPIS[0].id);
  const [selectedDimension, setSelectedDimension] = useState<'terminal' | 'airline' | 'aircraft' | 'time_band'>('terminal');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const activeKpi = KEY_KPIS.find(k => k.id === selectedKpiId) || KEY_KPIS[0];

  // Dimension slices data generation
  const getDimensionSlices = () => {
    const base = activeKpi.target2026;
    if (selectedDimension === 'terminal') {
      return [
        { label: 'Terminal 1 (Domestic LCC)', value: Number((base * 0.98).toFixed(1)), count: 284 },
        { label: 'Terminal 2 (FSC & International)', value: Number((base * 1.02).toFixed(1)), count: 278 }
      ];
    }
    if (selectedDimension === 'airline') {
      return [
        { label: 'IndiGo (6E)', value: Number((base * 1.01).toFixed(1)), count: 240 },
        { label: 'Air India (AI)', value: Number((base * 0.96).toFixed(1)), count: 160 },
        { label: 'SpiceJet (SG)', value: Number((base * 0.92).toFixed(1)), count: 48 },
        { label: 'Akasa Air (QP)', value: Number((base * 1.03).toFixed(1)), count: 36 },
        { label: 'Emirates (EK)', value: Number((base * 1.04).toFixed(1)), count: 14 },
        { label: 'Singapore Airlines (SQ)', value: Number((base * 1.05).toFixed(1)), count: 12 },
        { label: 'British Airways (BA)', value: Number((base * 0.99).toFixed(1)), count: 8 }
      ];
    }
    if (selectedDimension === 'aircraft') {
      return [
        { label: 'Airbus A320neo', value: Number((base * 1.01).toFixed(1)), count: 210 },
        { label: 'Airbus A321neo', value: Number((base * 1.00).toFixed(1)), count: 180 },
        { label: 'Boeing 737-8 MAX', value: Number((base * 0.97).toFixed(1)), count: 64 },
        { label: 'Boeing 787-9 Dreamliner', value: Number((base * 0.99).toFixed(1)), count: 38 },
        { label: 'Boeing 777-300ER', value: Number((base * 0.95).toFixed(1)), count: 24 },
        { label: 'ATR 72-600', value: Number((base * 1.04).toFixed(1)), count: 46 }
      ];
    }
    return [
      { label: 'Morning Peak Bank (06:00 - 09:00)', value: Number((base * 0.94).toFixed(1)), count: 145 },
      { label: 'Midday Operations (09:00 - 17:00)', value: Number((base * 1.02).toFixed(1)), count: 195 },
      { label: 'Evening Peak Bank (18:00 - 22:00)', value: Number((base * 0.96).toFixed(1)), count: 162 },
      { label: 'Night Red-Eye (22:00 - 06:00)', value: Number((base * 1.05).toFixed(1)), count: 60 }
    ];
  };

  const slices = getDimensionSlices();
  const maxVal = Math.max(...slices.map(s => s.value)) || 1;

  const handleExport = () => {
    const headers = ['Dimension', 'Category', 'Value', 'Unit', 'Sample Count'];
    const rows = slices.map(s => [
      selectedDimension,
      s.label,
      s.value,
      activeKpi.unit,
      s.count
    ]);
    exportToCsv(`${activeKpi.code}_by_${selectedDimension}`, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Self-Service KPI Explorer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                  FR-2.6 Ad-Hoc Dimensional Slicer
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-tabulate any governed KPI against conformed dimensions in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Builder Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-800 dark:text-slate-400 font-mono text-[11px] font-bold mb-1">
              Select Metric:
            </label>
            <select
              value={selectedKpiId}
              onChange={(e) => setSelectedKpiId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold shadow-xs"
            >
              {KEY_KPIS.map(k => (
                <option key={k.id} value={k.id}>
                  {k.code} · {k.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-800 dark:text-slate-400 font-mono text-[11px] font-bold mb-1">
              Cross-Tabulate By Dimension:
            </label>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold shadow-xs"
            >
              <option value="terminal">dim_location · Terminal (T1 vs T2)</option>
              <option value="airline">dim_airline · Carrier Pairings</option>
              <option value="aircraft">dim_aircraft_type · Aircraft Category</option>
              <option value="time_band">dim_time · Banked Hourly Waves</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-800 dark:text-slate-400 font-mono text-[11px] font-bold mb-1">
              Display Format:
            </label>
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-cyan-700 text-white font-bold shadow-xs'
                    : 'text-slate-800 dark:text-slate-400 font-semibold hover:text-slate-950'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  viewMode === 'table'
                    ? 'bg-cyan-700 text-white font-bold shadow-xs'
                    : 'text-slate-800 dark:text-slate-400 font-semibold hover:text-slate-950'
                }`}
              >
                Data Grid
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Analyzing <strong className="text-cyan-500">{activeKpi.code}</strong> ({activeKpi.name})
            </span>
            <span>Target: {activeKpi.target2026} {activeKpi.unit}</span>
          </div>

          {viewMode === 'chart' ? (
            <div className="space-y-3 pt-2">
              {slices.map((slice, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{slice.label}</span>
                    <span className="font-bold text-cyan-500">{slice.value} {activeKpi.unit}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center">
                    <div
                      className="h-full bg-cyan-500 rounded-lg transition-all duration-500"
                      style={{ width: `${Math.min((slice.value / maxVal) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-right">
                    Sample: {slice.count} recorded observations
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Conformed Slice</th>
                    <th className="px-4 py-2.5 text-right">Calculated Value</th>
                    <th className="px-4 py-2.5 text-right">Delta to Target</th>
                    <th className="px-4 py-2.5 text-right">Observation Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {slices.map((slice, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{slice.label}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-cyan-500">{slice.value} {activeKpi.unit}</td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {Number((slice.value - activeKpi.target2026).toFixed(1))} {activeKpi.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{slice.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
