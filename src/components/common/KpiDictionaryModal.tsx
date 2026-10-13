import React, { useState } from 'react';
import { KEY_KPIS } from '../../data/kpiLibrary';
import { KpiDefinition } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';
import { 
  X, 
  Search, 
  BookOpen, 
  Filter, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';

interface KpiDictionaryModalProps {
  onClose: () => void;
  onSelectKpiForDrilldown?: (kpiCode: string) => void;
}

export const KpiDictionaryModal: React.FC<KpiDictionaryModalProps> = ({
  onClose,
  onSelectKpiForDrilldown
}) => {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedKpi, setSelectedKpi] = useState<KpiDefinition>(KEY_KPIS[0]);

  const domains = ['ALL', ...Array.from(new Set(KEY_KPIS.map(k => k.domain)))];

  const filteredKpis = KEY_KPIS.filter(k => {
    const matchSearch = k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.code.toLowerCase().includes(search.toLowerCase()) ||
      k.formulaText.toLowerCase().includes(search.toLowerCase());
    const matchDomain = selectedDomain === 'ALL' || k.domain === selectedDomain;
    const matchTier = selectedTier === 'ALL' || k.tier.toString() === selectedTier;
    return matchSearch && matchDomain && matchTier;
  });

  const handleExportAll = () => {
    const headers = [
      'Code', 'Name', 'Domain', 'Subdomain', 'Tier', 'Polarity', 'Unit',
      'Formula', 'Target 2025', 'Target 2026', 'Tolerance', 'Standard', 'Owner', 'Controllability'
    ];
    const rows = filteredKpis.map(k => [
      k.code, k.name, k.domain, k.subdomain, k.tier, k.polarity, k.unit,
      k.formulaText, k.target2025, k.target2026, k.tolerance, k.standard, k.ownerFunction, k.controllability
    ]);
    exportToCsv('AIONOS_ZZA_KPI_Library_Catalogue', headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AIONOS Airport KPI Library Catalogue</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                  FR-1 Master (624 KPIs · 94 Tier 1)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Governed semantic specifications, mathematical formulas, and lineage standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Library (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by KPI name, code, formula..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs"
            >
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono"
            >
              <option value="ALL">All Tiers</option>
              <option value="1">Tier 1 (Executive)</option>
              <option value="2">Tier 2 (Departmental)</option>
              <option value="3">Tier 3 (Operational)</option>
            </select>
          </div>
        </div>

        {/* 2-Column Split: KPI List + Selected KPI Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left list */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-800 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredKpis.map(k => {
              const isSelected = selectedKpi.id === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => setSelectedKpi(k)}
                  className={`w-full p-4 text-left transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-l-2 border-cyan-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">{k.code}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Tier {k.tier}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400">{k.unit}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {k.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {k.domain}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right detail */}
          <div className="w-1/2 p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400 font-bold mb-1">
                <span>{selectedKpi.code}</span>
                <span>·</span>
                <span>{selectedKpi.domain}</span>
                <span>·</span>
                <span>Tier {selectedKpi.tier}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedKpi.name}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                Subdomain: {selectedKpi.subdomain} · Sensitivity: {selectedKpi.sensitivity}
              </p>
            </div>

            {/* Formula Block */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs space-y-2">
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Governed Formula</div>
              <div className="text-cyan-200 leading-relaxed font-semibold">{selectedKpi.formulaText}</div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div>Numerator: {selectedKpi.numeratorDesc}</div>
                <div>Denominator: {selectedKpi.denominatorDesc}</div>
              </div>
            </div>

            {/* Target and Polarity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono font-bold">Polarity & Unit</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedKpi.polarity}
                </div>
                <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">{selectedKpi.unit}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono font-bold">FY2026-27 Target</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {selectedKpi.target2026} {selectedKpi.unit}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-400 font-semibold">Tolerance: ±{(selectedKpi.tolerance * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Standards and AI opportunity */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-slate-700 dark:text-slate-400 font-mono text-[11px] font-bold">Governing Standard / Baseline</div>
                <div className="text-slate-900 dark:text-slate-200 font-bold mt-0.5">{selectedKpi.standard}</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-slate-700 dark:text-slate-400 font-mono text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                  <span>AI / ML Optimization Opportunity</span>
                </div>
                <div className="text-slate-900 dark:text-slate-200 font-medium mt-0.5">{selectedKpi.aiOpportunity}</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-slate-700 dark:text-slate-400 font-mono text-[11px] font-bold">Controllability Assessment</div>
                <div className="text-slate-900 dark:text-slate-200 font-bold mt-0.5">{selectedKpi.controllability}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
