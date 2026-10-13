import React, { useState, useEffect } from 'react';
import { KpiValueResult, UserRole } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Info,
  ShieldCheck,
  MessageSquare,
  Pin,
  Table,
  LineChart,
  BarChart2,
  Bell,
  BellRing,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { evaluateAllAlertsForKpi } from '../../utils/alertStore';
import { KpiAlertModal } from './KpiAlertModal';
import { RawDataGridModal } from './RawDataGridModal';
import { useAuth } from '../../context/AuthContext';

interface KpiCardProps {
  kpi: KpiValueResult;
  onDrilldown: (kpi: KpiValueResult) => void;
  onOpenRawGrid?: (kpi: KpiValueResult) => void;
  onConfigureAlert?: (kpi: KpiValueResult) => void;
  isPinned?: boolean;
  onTogglePin?: (kpiCode: string) => void;
  hasCommentary?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  kpi, 
  onDrilldown, 
  onOpenRawGrid,
  onConfigureAlert,
  isPinned, 
  onTogglePin, 
  hasCommentary 
}) => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'metric' | 'trend' | 'grid'>('metric');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isRawGridModalOpen, setIsRawGridModalOpen] = useState(false);
  const [alertState, setAlertState] = useState(() => evaluateAllAlertsForKpi(kpi));

  // Listen to alert updates from local storage or sibling cards
  useEffect(() => {
    const updateAlertState = () => {
      setAlertState(evaluateAllAlertsForKpi(kpi));
    };
    updateAlertState();
    window.addEventListener('aionos_alerts_updated', updateAlertState);
    return () => window.removeEventListener('aionos_alerts_updated', updateAlertState);
  }, [kpi]);

  // RAG visual tokens
  const statusConfig = {
    green: {
      label: 'On Target',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20',
      icon: CheckCircle2,
      bulletColor: '#059669'
    },
    amber: {
      label: 'Near Tolerance',
      bgClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/20',
      icon: AlertTriangle,
      bulletColor: '#d97706'
    },
    red: {
      label: 'Breaching Target',
      bgClass: 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/20',
      icon: AlertOctagon,
      bulletColor: '#dc2626'
    },
    monitor: {
      label: 'Monitoring',
      bgClass: 'bg-slate-100 dark:bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-500/20',
      icon: Minus,
      bulletColor: '#475569'
    }
  }[kpi.status];

  const StatusIcon = statusConfig.icon;

  // Trend statistics
  const minTrend = Math.min(...kpi.trend);
  const maxTrend = Math.max(...kpi.trend);
  const range = maxTrend - minTrend || 1;
  const avgTrend = Number((kpi.trend.reduce((a, b) => a + b, 0) / kpi.trend.length).toFixed(1));
  const netTrend = Number((kpi.trend[kpi.trend.length - 1] - kpi.trend[0]).toFixed(1));

  // Small Sparkline SVG points
  const sparkWidth = 110;
  const sparkHeight = 28;
  const sparkPoints = kpi.trend.map((val, idx) => {
    const x = (idx / (kpi.trend.length - 1)) * sparkWidth;
    const y = sparkHeight - ((val - minTrend) / range) * (sparkHeight - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  // Full Expanded Trend SVG Dimensions
  const fullChartWidth = 320;
  const fullChartHeight = 110;
  const paddingX = 14;
  const paddingY = 16;
  const chartInnerWidth = fullChartWidth - paddingX * 2;
  const chartInnerHeight = fullChartHeight - paddingY * 2;

  // Normalize full trend points
  const fullTrendPoints = kpi.trend.map((val, idx) => {
    const x = paddingX + (idx / (kpi.trend.length - 1)) * chartInnerWidth;
    const y = paddingY + chartInnerHeight - ((val - minTrend) / range) * chartInnerHeight;
    return { x, y, val, idx };
  });

  const fullSvgPointsStr = fullTrendPoints.map(p => `${p.x},${p.y}`).join(' ');
  const fullAreaPointsStr = `${paddingX},${fullChartHeight - 6} ` + fullSvgPointsStr + ` ${fullChartWidth - paddingX},${fullChartHeight - 6}`;

  // Target line Y coordinate on full chart
  const targetY = Math.min(
    Math.max(paddingY + chartInnerHeight - ((kpi.target - minTrend) / range) * chartInnerHeight, paddingY),
    fullChartHeight - paddingY
  );

  // Calculate percentage of target for bullet bar
  const targetPct = Math.min(Math.max((kpi.currentValue / (kpi.target || 1)) * 100, 10), 140);

  const handleOpenAlertModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigureAlert) {
      onConfigureAlert(kpi);
    } else {
      setIsAlertModalOpen(true);
    }
  };

  const handleOpenRawGridModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenRawGrid) {
      onOpenRawGrid(kpi);
    } else {
      setIsRawGridModalOpen(true);
    }
  };

  return (
    <>
      <div className={`p-4 rounded-xl border bg-white dark:bg-slate-900/90 shadow-xs transition-all flex flex-col justify-between group ${
        alertState.isTriggered 
          ? alertState.highestSeverity === 'critical'
            ? 'border-rose-300 dark:border-rose-800/80 ring-1 ring-rose-500/30'
            : 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-500/30'
          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}>
        
        {/* Top Header: Code, Tier, Controllability & Card View Switcher */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 font-mono font-semibold">
              <span>{kpi.code}</span>
              <span aria-hidden="true">·</span>
              <span>T{kpi.tier}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[100px]">{kpi.controllability}</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Alert Bell Trigger button with badge */}
              <button
                type="button"
                onClick={handleOpenAlertModal}
                title={alertState.hasRules ? (alertState.isTriggered ? `Alert triggered: ${alertState.primaryMessage}` : 'Alert configured and active') : 'Configure alert for this KPI'}
                className={`p-1 rounded-md transition-colors relative ${
                  alertState.isTriggered
                    ? alertState.highestSeverity === 'critical'
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                    : alertState.hasRules
                      ? 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {alertState.isTriggered ? (
                  <BellRing className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                {alertState.isTriggered && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Accessible Status Indicator */}
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusConfig.bgClass}`}>
                <StatusIcon className="w-3 h-3 shrink-0" />
                <span>{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Metric Name */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
            {kpi.name}
          </h3>

          {/* Card In-Line View Controls: Metric | Trend | Raw Grid */}
          <div className="mt-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('metric')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewMode === 'metric'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                onClick={() => setViewMode('trend')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  viewMode === 'trend'
                    ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LineChart className="w-2.5 h-2.5" />
                <span>Trend</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Table className="w-2.5 h-2.5" />
                <span>Raw Grid</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenRawGridModal}
              title="Pop out raw data grid modal"
              className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-0.5 transition-colors"
            >
              <span>Pop Out</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Triggered Alert Warning Banner (If active) */}
        {alertState.isTriggered && (
          <div 
            onClick={handleOpenAlertModal}
            className={`my-2 p-2 rounded-lg text-[11px] font-medium flex items-center justify-between cursor-pointer border ${
              alertState.highestSeverity === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{alertState.primaryMessage}</span>
            </div>
            <span className="text-[10px] uppercase font-bold shrink-0 ml-1 underline">Edit</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 1: Standard Metric View */}
        {/* ========================================================================= */}
        {viewMode === 'metric' && (
          <div className="my-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {kpi.currentValue.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">{kpi.unit}</span>
              </div>

              {/* Sparkline (clickable to switch to Trend view) */}
              <div 
                className="relative cursor-pointer group/spark hover:opacity-90 transition-opacity"
                onClick={() => setViewMode('trend')}
                title="Click to view full interactive trend"
              >
                <svg width={sparkWidth} height={sparkHeight} className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke={statusConfig.bulletColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparkPoints}
                  />
                  {kpi.trend.length > 0 && (
                    <circle
                      cx={sparkWidth}
                      cy={sparkHeight - ((kpi.trend[kpi.trend.length - 1] - minTrend) / range) * (sparkHeight - 6) - 3}
                      r="3.5"
                      fill={statusConfig.bulletColor}
                    />
                  )}
                </svg>
                <div className="text-[9px] font-mono text-slate-500 text-right group-hover/spark:text-cyan-600 transition-colors">
                  13-period trend ↗
                </div>
              </div>
            </div>

            {/* Bullet bar comparing actual vs target */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 font-mono font-semibold">
                <span>Target: <strong className="text-slate-900 dark:text-slate-100">{kpi.target} {kpi.unit}</strong></span>
                <span className={kpi.changePct >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                  {kpi.changePct >= 0 ? '+' : ''}{kpi.changePct}% vs prev
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-300/60 dark:border-slate-700/40">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(targetPct, 100)}%`,
                    backgroundColor: statusConfig.bulletColor
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: Full Interactive Trend View */}
        {/* ========================================================================= */}
        {viewMode === 'trend' && (
          <div className="my-2 space-y-2 animate-in fade-in duration-150">
            {/* Trend Summary Header */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400">
                  13-Period Trend History
                </span>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                  <span>{hoveredPointIdx !== null ? kpi.trend[hoveredPointIdx] : kpi.currentValue} {kpi.unit}</span>
                  <span className="text-[10px] text-slate-500 font-sans font-medium">
                    {hoveredPointIdx !== null ? `(Period T-${13 - (hoveredPointIdx + 1)})` : '(Latest)'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-bold font-mono flex items-center justify-end gap-0.5 ${
                  netTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {netTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{netTrend > 0 ? '+' : ''}{netTrend} {kpi.unit}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Net 13-Shift Delta</span>
              </div>
            </div>

            {/* Interactive SVG Trend Chart */}
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 relative">
              <svg 
                viewBox={`0 0 ${fullChartWidth} ${fullChartHeight}`} 
                className="w-full h-24 overflow-visible"
              >
                <defs>
                  <linearGradient id={`trendGrad-${kpi.code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={statusConfig.bulletColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={statusConfig.bulletColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Target dashed line */}
                <line
                  x1={paddingX}
                  y1={targetY}
                  x2={fullChartWidth - paddingX}
                  y2={targetY}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Area under curve */}
                <polygon
                  points={fullAreaPointsStr}
                  fill={`url(#trendGrad-${kpi.code})`}
                />

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke={statusConfig.bulletColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={fullSvgPointsStr}
                />

                {/* Interactive Points */}
                {fullTrendPoints.map((pt) => {
                  const isHovered = hoveredPointIdx === pt.idx;
                  const isLatest = pt.idx === kpi.trend.length - 1;
                  return (
                    <g key={pt.idx} onMouseEnter={() => setHoveredPointIdx(pt.idx)} onMouseLeave={() => setHoveredPointIdx(null)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : isLatest ? 3.5 : 2}
                        fill={isHovered ? '#06b6d4' : statusConfig.bulletColor}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? "2" : "1"}
                        className="transition-all cursor-pointer"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Target Legend */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span>Min: <strong>{minTrend}</strong></span>
                <span>Target: <strong className="text-cyan-600">{kpi.target}</strong></span>
                <span>Avg: <strong>{avgTrend}</strong></span>
                <span>Max: <strong>{maxTrend}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 3: In-Card Raw Data Grid */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="my-2 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300">Raw Facts (13 Periods)</span>
              <button
                type="button"
                onClick={handleOpenRawGridModal}
                className="text-cyan-700 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Full Atomic Grid</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* In-Card Compact Data Table */}
            <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono scrollbar-thin">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-2 py-1">Period</th>
                    <th className="px-2 py-1 text-right">Actual</th>
                    <th className="px-2 py-1 text-right">Target</th>
                    <th className="px-2 py-1 text-right">Var %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {kpi.trend.map((val, idx) => {
                    const isLatest = idx === kpi.trend.length - 1;
                    const periodLabel = isLatest ? 'Current' : `T-${13 - (idx + 1)}`;
                    const varPct = Number((((val - kpi.target) / kpi.target) * 100).toFixed(1));
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          isLatest ? 'bg-cyan-50/40 dark:bg-cyan-950/30 font-bold' : ''
                        }`}
                      >
                        <td className="px-2 py-1 text-slate-800 dark:text-slate-300">
                          {periodLabel}
                        </td>
                        <td className="px-2 py-1 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                          {val} {kpi.unit}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-500 tabular-nums">
                          {kpi.target}
                        </td>
                        <td className={`px-2 py-1 text-right font-bold tabular-nums ${
                          varPct >= 0 
                            ? kpi.polarity === 'Higher is Better' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            : kpi.polarity === 'Higher is Better' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {varPct > 0 ? '+' : ''}{varPct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer: Data Quality score and Explain / Drilldown CTA */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1" title="Data Quality SLA Score">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>DQ: <strong className="text-slate-900 dark:text-slate-100">{kpi.dataQuality}%</strong></span>
            </div>
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(kpi.code)}
                title={isPinned ? 'Unpin tile' : 'Pin tile to top'}
                className={`p-1 rounded hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors ${isPinned ? 'text-cyan-700 font-bold' : 'text-slate-600'}`}
              >
                <Pin className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasCommentary && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold" title="Contains period commentary annotations">
                <MessageSquare className="w-3 h-3" />
              </span>
            )}

            {/* Raw Grid Button */}
            <button
              type="button"
              onClick={handleOpenRawGridModal}
              title="Inspect raw data table and atomic facts"
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 font-bold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
            >
              <Table className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Raw Grid</span>
            </button>

            {/* Drilldown / Explain Number CTA */}
            <button
              type="button"
              onClick={() => onDrilldown(kpi)}
              className="text-xs text-cyan-800 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Drilldown</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-Card Self-Contained Alert Configuration Modal */}
      {isAlertModalOpen && (
        <KpiAlertModal
          kpi={kpi}
          onClose={() => setIsAlertModalOpen(false)}
          onSaved={() => setAlertState(evaluateAllAlertsForKpi(kpi))}
        />
      )}

      {/* In-Card Self-Contained Raw Data Grid Modal */}
      {isRawGridModalOpen && (
        <RawDataGridModal
          kpi={kpi}
          onClose={() => setIsRawGridModalOpen(false)}
          user={currentUser}
        />
      )}
    </>
  );
};
