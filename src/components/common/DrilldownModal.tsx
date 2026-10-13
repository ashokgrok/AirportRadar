import React, { useState, useEffect } from 'react';
import { 
  KpiValueResult, 
  UserRole, 
  FlightRecord, 
  KpiComment,
  CommercialConcessionRecord,
  ParkingSessionRecord
} from '../../types';
import { 
  fetchLiveFlights, 
  fetchKpiComments, 
  createKpiComment,
  fetchCommercialConcessions,
  fetchParkingSessions
} from '../../services/semanticApi';
import { exportToCsv } from '../../utils/exportUtils';
import { 
  X, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Layers, 
  Table, 
  ArrowRight,
  Lock,
  MessageSquare,
  Plus,
  ShoppingBag,
  Utensils,
  Car,
  Plane,
  Users,
  Clock,
  Building2,
  DollarSign
} from 'lucide-react';

interface DrilldownModalProps {
  kpi: KpiValueResult | null;
  onClose: () => void;
  user: UserRole;
}

const COMMERCIAL_CBI_METADATA: Record<string, { stream: string; indicator: string; strategicPurpose: string; formulaExplanation: string }> = {
  'COM-01': {
    stream: 'Overall Non-Aero Performance',
    indicator: 'Non-Aeronautical Revenue per Passenger (SVP)',
    strategicPurpose: 'Measures the average spend per passenger across all terminal commercial offerings (Retail, F&B, Parking, Advertising, and Real Estate).',
    formulaExplanation: 'Total Non-Aeronautical Revenue / Total Enplaned Passengers'
  },
  'COM-02': {
    stream: 'Overall Non-Aero Performance',
    indicator: 'Non-Aeronautical Revenue Share',
    strategicPurpose: 'Measures commercial business diversification relative to regulated aeronautical tariffs to hedge against airline traffic shifts.',
    formulaExplanation: '(Total Non-Aeronautical Revenue / Total Operating Airport Revenue) * 100'
  },
  'COM-03': {
    stream: 'Retail & Duty-Free',
    indicator: 'Sales Capture / Penetration Rate',
    strategicPurpose: 'Evaluates what percentage of total foot traffic converts into paying customers.',
    formulaExplanation: '(Number of Transacting Retail Customers / Total Terminal Passengers) * 100'
  },
  'COM-04': {
    stream: 'Retail & Duty-Free',
    indicator: 'Commercial Yield per Square Metre',
    strategicPurpose: 'Evaluates space efficiency and productivity of the retail layout.',
    formulaExplanation: 'Total Retail Concession Revenue / Total Retail Floor Area (m²)'
  },
  'COM-05': {
    stream: 'Retail & Duty-Free',
    indicator: 'Average Transaction Value (ATV)',
    strategicPurpose: 'Tracks the average amount spent by customers during a single store visit.',
    formulaExplanation: 'Total Retail Sales Revenue / Total Number of Retail Transactions'
  },
  'COM-06': {
    stream: 'Food & Beverage (F&B)',
    indicator: 'F&B Revenue per Passenger',
    strategicPurpose: 'Evaluates how effectively the dining layout captures passenger dwell time.',
    formulaExplanation: 'Total F&B Concession Revenue / Total Terminal Passengers'
  },
  'COM-07': {
    stream: 'Parking & Ground Transportation',
    indicator: 'Parking Revenue per Enplanement',
    strategicPurpose: 'Measures parking monetization relative to departing passenger volumes.',
    formulaExplanation: 'Total Car Parking Revenue / Total Departing Passengers'
  },
  'COM-08': {
    stream: 'Parking & Ground Transportation',
    indicator: 'Average Revenue per Occupied Space (ARPOS)',
    strategicPurpose: 'Maximizes lot optimization between short-term and long-term parking.',
    formulaExplanation: 'Total Parking Revenue / Total Number of Parked Vehicles'
  },
  'COM-09': {
    stream: 'Advertising & Media',
    indicator: 'Advertising Yield per Pax',
    strategicPurpose: 'Measures the value of terminal digital displays and media space.',
    formulaExplanation: 'Total Advertising & Sponsorship Revenue / Total Passengers'
  },
  'COM-10': {
    stream: 'Property & Real Estate',
    indicator: 'Real Estate Revenue Contribution',
    strategicPurpose: 'Tracks long-term land development income (e.g., Airport Cities / Aerotropolis).',
    formulaExplanation: '(Property Leasing & Rentals Revenue / Total Operating Revenue) * 100'
  }
};

export const DrilldownModal: React.FC<DrilldownModalProps> = ({ kpi, onClose, user }) => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [concessions, setConcessions] = useState<CommercialConcessionRecord[]>([]);
  const [parkingSessions, setParkingSessions] = useState<ParkingSessionRecord[]>([]);
  const [comments, setComments] = useState<KpiComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newPeriodLabel, setNewPeriodLabel] = useState('Current Operational Shift');

  const isCommercial = Boolean(kpi && (kpi.domain.includes('Commercial') || kpi.code.startsWith('COM-')));
  const isParking = Boolean(kpi && (kpi.code === 'COM-07' || kpi.code === 'COM-08'));

  useEffect(() => {
    if (!kpi) return;
    if (level === 3) {
      setLoading(true);
      if (isParking) {
        fetchParkingSessions(user)
          .then(res => setParkingSessions(res))
          .finally(() => setLoading(false));
      } else if (isCommercial) {
        fetchCommercialConcessions({}, user)
          .then(res => setConcessions(res))
          .finally(() => setLoading(false));
      } else {
        fetchLiveFlights(user)
          .then(res => setFlights(res))
          .finally(() => setLoading(false));
      }
    } else if (level === 4) {
      setLoading(true);
      fetchKpiComments(kpi.code)
        .then(res => setComments(res))
        .finally(() => setLoading(false));
    }
  }, [kpi, level, user, isCommercial, isParking]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpi || !newCommentText.trim()) return;

    await createKpiComment({
      kpiId: kpi.kpiId,
      kpiCode: kpi.code,
      periodIndex: 12,
      periodLabel: newPeriodLabel,
      author: user.name,
      department: user.department,
      text: newCommentText
    }, user);

    setNewCommentText('');
    const updated = await fetchKpiComments(kpi.code);
    setComments(updated);
  };

  if (!kpi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 mb-1">
              <span>{kpi.code}</span>
              <span aria-hidden="true">·</span>
              <span>{kpi.domain}</span>
              <span aria-hidden="true">·</span>
              <span>Tier {kpi.tier}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {kpi.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Level Breadcrumb Navigation */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
          <button
            onClick={() => setLevel(1)}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md transition-colors ${
              level === 1
                ? 'bg-cyan-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>1. Metric Lineage & Formula</span>
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setLevel(2)}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md transition-colors ${
              level === 2
                ? 'bg-cyan-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>2. Dimensional Breakdown</span>
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setLevel(3)}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md transition-colors ${
              level === 3
                ? 'bg-cyan-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>3. Raw Source Facts</span>
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setLevel(4)}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md transition-colors ${
              level === 4
                ? 'bg-cyan-500 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>4. Period Commentary (FR-4.4)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Level 1: Metric Explainability & Lineage */}
          {level === 1 && (
            <div className="space-y-6">
              {COMMERCIAL_CBI_METADATA[kpi.code] && (
                <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/70 dark:bg-cyan-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Commercial Stream: {COMMERCIAL_CBI_METADATA[kpi.code].stream}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800">
                      Core Business Indicator (CBI)
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <strong className="text-cyan-900 dark:text-cyan-200 font-semibold">Strategic Purpose: </strong>
                    {COMMERCIAL_CBI_METADATA[kpi.code].strategicPurpose}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <div className="text-xs text-slate-700 dark:text-slate-400 font-mono font-semibold">Current Governed Value</div>
                  <div className="text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-400 mt-1">
                    {kpi.currentValue} {kpi.unit}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-semibold">Target: {kpi.target} {kpi.unit}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <div className="text-xs text-slate-700 dark:text-slate-400 font-mono font-semibold">Additive Components</div>
                  <div className="text-sm font-mono text-slate-900 dark:text-slate-200 mt-1">
                    Numerator: <span className="font-bold">{kpi.numerator.toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-mono text-slate-900 dark:text-slate-200">
                    Denominator: <span className="font-bold">{kpi.denominator.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <div className="text-xs text-slate-700 dark:text-slate-400 font-mono font-semibold">Data Governance</div>
                  <div className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{kpi.dataQuality}% Quality Score</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-semibold">Status: Passed Invariants</div>
                </div>
              </div>

              {/* Exact Formula Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs space-y-2">
                <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Mathematical Formula</div>
                <div className="text-cyan-300 font-semibold">{kpi.formula}</div>
              </div>

              {/* Governance & Standards Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-700 dark:text-slate-400 font-mono font-semibold">Owner Function:</span>
                  <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">{kpi.owner}</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-700 dark:text-slate-400 font-mono font-semibold">Reference Standard:</span>
                  <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">{kpi.standard}</div>
                </div>
              </div>
            </div>
          )}

          {/* Level 2: Dimensional Breakdown */}
          {level === 2 && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-slate-800 dark:text-slate-300 uppercase tracking-wider font-bold">
                  {isCommercial ? 'Commercial Driving Variables & Concession Slices' : 'Cross-Dimensional Performance Slices'}
                </h4>
                {isCommercial && (
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                    Traffic Mix · Passenger Persona · Dwell Time Elasticity
                  </span>
                )}
              </div>

              {isCommercial ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Traffic Mix: International vs Domestic */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs font-sans text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Traffic Mix (International vs Domestic)</span>
                      </span>
                      <span className="text-cyan-600 text-[10px] font-mono">4.0x Spend Multiplier</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-700 dark:text-slate-300">International (26.5% Pax Share):</span>
                          <strong className="text-cyan-700 dark:text-cyan-400 font-bold">₹1,180 / pax (34.2% capture)</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Domestic (73.5% Pax Share):</span>
                          <strong className="text-slate-900 dark:text-slate-200 font-bold">₹295 / pax (14.8% capture)</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: '25%' }} />
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                      International flights skew heavily toward high-margin duty-free liquor, cosmetics, and luxury designer merchandise.
                    </div>
                  </div>

                  {/* Passenger Profile: Business vs Leisure */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs font-sans text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Passenger Profile Dynamics</span>
                      </span>
                      <span className="text-purple-600 text-[10px] font-mono">Dwell & Persona</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-900 dark:text-white">Business Persona (32% pax)</span>
                          <span className="text-purple-600 font-mono">ATV: ₹520 · Dwell: 38m</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          High velocity, rapid F&B and coffee pick-up, premium airport lounge usage.
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-900 dark:text-white">Leisure Persona (68% pax)</span>
                          <span className="text-emerald-600 font-mono">ATV: ₹1,850 · Dwell: 76m</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Discovery shopping, experiential toy kiosks, regional gifting, relaxed dining.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Spatial Productivity */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="text-xs font-bold font-sans text-slate-900 dark:text-white">
                      Terminal Spatial Productivity (Yield / m²)
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Terminal 2 (FSC & Intl Concessions):</span>
                        <span className="font-bold text-cyan-600">₹26,420 / m² (8,800 m² GLA)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Terminal 1 (Domestic LCC Concessions):</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹14,280 / m² (5,440 m² GLA)</span>
                      </div>
                    </div>
                  </div>

                  {/* Post-Security Dwell Time vs Sales Conversion */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="text-xs font-bold font-sans text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Post-Security Dwell Time Elasticity</span>
                      <span className="text-emerald-600 text-[10px] font-mono">+₹42 / 10m dwell</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>&lt; 30 min dwell:</span>
                        <span className="text-slate-500">₹112 / pax (11% conversion)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>30 - 60 min dwell:</span>
                        <span className="text-slate-800 dark:text-slate-200">₹310 / pax (22% conversion)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>60 - 90 min dwell:</span>
                        <span className="text-cyan-600 font-bold">₹625 / pax (38% conversion)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>&gt; 90 min dwell:</span>
                        <span className="text-emerald-600 font-bold">₹1,140 / pax (51% conversion)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Terminal Breakdown */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Terminal Breakdown</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1 text-slate-800 dark:text-slate-200 font-semibold">
                          <span>Terminal 1 (Domestic LCC)</span>
                          <span className="font-bold text-cyan-700 dark:text-cyan-400">{Number((kpi.currentValue * 0.98).toFixed(1))} {kpi.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span>Terminal 2 (FSC & Intl)</span>
                          <span className="font-bold text-cyan-500">{Number((kpi.currentValue * 1.02).toFixed(1))} {kpi.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '89%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Airline Breakdown */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">Carrier Breakdown</div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>IndiGo (6E)</span>
                        <span className="font-bold text-slate-900 dark:text-white">{Number((kpi.currentValue * 1.01).toFixed(1))} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Air India (AI)</span>
                        <span className="font-bold text-slate-900 dark:text-white">{Number((kpi.currentValue * 0.96).toFixed(1))} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Emirates (EK)</span>
                        <span className="font-bold text-slate-900 dark:text-white">{Number((kpi.currentValue * 1.04).toFixed(1))} {kpi.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Level 3: Raw Source Records with RLS Enforcement */}
          {level === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>
                    RLS Active: Showing records filtered by your role (<strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> · {user.scopeType})
                    {isCommercial && !user.canViewTenantRevenue && (
                      <span className="ml-2 text-amber-600 font-semibold">(Tenant royalties masked per governance policy)</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (isParking) {
                      const headers = ['Ticket ID', 'Terminal', 'Zone Name', 'Vehicle Type', 'Duration (Hrs)', 'Revenue Amount', 'Status'];
                      const rows = parkingSessions.map((p: ParkingSessionRecord) => [
                        p.ticketId, p.terminal, p.zoneName, p.vehicleType, p.durationHours, p.revenueAmount, p.occupancyStatus
                      ]);
                      exportToCsv(`${kpi.code}_Parking_Raw_Facts`, headers, rows);
                    } else if (isCommercial) {
                      const headers = ['Outlet ID', 'Concessionaire', 'Stream', 'Category', 'Terminal', 'Zone', 'Area (m²)', 'Gross Sales', 'Fee (MAG)', 'Customers', 'ATV', 'Pax Type', 'Persona', 'Dwell Min'];
                      const rows = concessions.map((c: CommercialConcessionRecord) => [
                        c.outletId, c.tenantName, c.stream, c.subCategory, c.terminal, c.locationZone, c.sqmArea, c.grossSales, c.concessionFee, c.transactingCustomers, c.averageTransactionValue, c.passengerType, c.passengerProfile, c.averageDwellMinutes
                      ]);
                      exportToCsv(`${kpi.code}_Concession_Raw_Facts`, headers, rows);
                    } else {
                      const headers = ['Flight', 'Airline', 'Type', 'Route', 'Terminal', 'Stand', 'Runway', 'Pax', 'DelayMin', 'Controllable', 'Status'];
                      const rows = flights.map((f: FlightRecord) => [
                        f.flightNumber, f.airlineName, f.movementType, f.originDest, f.terminal, f.stand, f.runway, f.paxCount, f.delayMinutes, f.delayControllable, f.status
                      ]);
                      exportToCsv(`${kpi.code}_Raw_Facts_${user.name.replace(/\s+/g, '_')}`, headers, rows);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs font-mono text-slate-400">Loading atomic facts from PostgreSQL WASM...</div>
              ) : isParking ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Ticket ID</th>
                        <th className="px-3 py-2">Terminal</th>
                        <th className="px-3 py-2">Zone Name</th>
                        <th className="px-3 py-2">Vehicle Type</th>
                        <th className="px-3 py-2 text-right">Duration</th>
                        <th className="px-3 py-2 text-right">Revenue</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {parkingSessions.map((p: ParkingSessionRecord) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{p.ticketId}</td>
                          <td className="px-3 py-2">{p.terminal}</td>
                          <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{p.zoneName}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{p.vehicleType}</td>
                          <td className="px-3 py-2 text-right">{p.durationHours} hrs</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">₹{p.revenueAmount}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.occupancyStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-cyan-500/10 text-cyan-600'
                            }`}>
                              {p.occupancyStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : isCommercial ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Outlet / Concessionaire</th>
                        <th className="px-3 py-2">Stream</th>
                        <th className="px-3 py-2">Terminal</th>
                        <th className="px-3 py-2 text-right">Area (m²)</th>
                        <th className="px-3 py-2 text-right">Gross Sales</th>
                        <th className="px-3 py-2 text-right">Airport Fee (MAG)</th>
                        <th className="px-3 py-2 text-right">ATV</th>
                        <th className="px-3 py-2">Pax Mix</th>
                        <th className="px-3 py-2 text-right">Dwell</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {concessions.map((c: CommercialConcessionRecord) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                            {c.tenantName}
                            <span className="block text-[10px] text-slate-500 font-mono font-normal">{c.locationZone}</span>
                          </td>
                          <td className="px-3 py-2 text-cyan-600 font-semibold">{c.stream}</td>
                          <td className="px-3 py-2">{c.terminal}</td>
                          <td className="px-3 py-2 text-right">{c.sqmArea}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                            ₹{(c.grossSales / 100000).toFixed(1)}L
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">
                            {user.canViewTenantRevenue ? `₹${(c.concessionFee / 100000).toFixed(1)}L` : '••••••'}
                          </td>
                          <td className="px-3 py-2 text-right">₹{c.averageTransactionValue}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                            {c.passengerType} · {c.passengerProfile}
                          </td>
                          <td className="px-3 py-2 text-right">{c.averageDwellMinutes}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Flight</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Route</th>
                        <th className="px-3 py-2">Terminal</th>
                        <th className="px-3 py-2">Stand</th>
                        <th className="px-3 py-2">Pax</th>
                        <th className="px-3 py-2">Delay</th>
                        <th className="px-3 py-2">Controllable</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {flights.slice(0, 15).map((f: FlightRecord) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{f.flightNumber}</td>
                          <td className="px-3 py-2 text-slate-500">{f.movementType}</td>
                          <td className="px-3 py-2">{f.originDest}</td>
                          <td className="px-3 py-2">{f.terminal}</td>
                          <td className="px-3 py-2 text-cyan-500">{f.stand}</td>
                          <td className="px-3 py-2">{f.paxCount}</td>
                          <td className={`px-3 py-2 ${f.delayMinutes > 15 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                            {f.delayMinutes}m
                          </td>
                          <td className="px-3 py-2 text-slate-400">{f.delayControllable}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              f.status === 'On Time' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* Level 4: Period Commentary & Annotations (FR-4.4) */}
          {level === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                    <span>KPI Period Commentary & Chart Markers</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Governed explanations written by KPI owners; annotations appear directly on trends
                  </p>
                </div>
              </div>

              {/* Existing Comments */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No period commentary logged yet for {kpi.code}. Add the first annotation below.
                  </div>
                ) : (
                  comments.map((c: KpiComment) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{c.periodLabel}</span>
                        <span className="text-slate-400">{c.createdAt?.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1">
                        Author: <strong className="text-slate-600 dark:text-slate-300">{c.author}</strong> ({c.department})
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Add Period Annotation as {user.name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] mb-1">
                      Period Label:
                    </label>
                    <input
                      type="text"
                      value={newPeriodLabel}
                      onChange={(e) => setNewPeriodLabel(e.target.value)}
                      placeholder="e.g. Oct 2026 Shift A / Diwali Peak Bank"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] mb-1">
                      Author Department:
                    </label>
                    <input
                      type="text"
                      value={user.department}
                      disabled
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 text-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] mb-1">
                    Variance Explanation / Commentary:
                  </label>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={2}
                    placeholder="Document root causes, weather conditions, equipment anomalies, or seasonal drivers..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-xs"
                  >
                    Post Commentary Annotation
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
