import React, { useState, useEffect } from 'react';
import { 
  KpiValueResult, 
  UserRole, 
  FlightRecord, 
  QueueRecord,
  CommercialConcessionRecord,
  ParkingSessionRecord 
} from '../../types';
import { 
  fetchLiveFlights, 
  fetchLiveQueues,
  fetchCommercialConcessions,
  fetchParkingSessions
} from '../../services/semanticApi';
import { exportToCsv } from '../../utils/exportUtils';
import { 
  X, 
  Download, 
  Table, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Layers, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Car,
  Plane,
  Lock
} from 'lucide-react';

interface RawDataGridModalProps {
  kpi: KpiValueResult | null;
  onClose: () => void;
  user: UserRole;
}

export const RawDataGridModal: React.FC<RawDataGridModalProps> = ({ kpi, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'periods' | 'atomic' | 'sql'>('periods');
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [queues, setQueues] = useState<QueueRecord[]>([]);
  const [concessions, setConcessions] = useState<CommercialConcessionRecord[]>([]);
  const [parkingSessions, setParkingSessions] = useState<ParkingSessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const isCommercial = Boolean(kpi && (kpi.domain.includes('Commercial') || kpi.code.startsWith('COM-')));
  const isParking = Boolean(kpi && (kpi.code === 'COM-07' || kpi.code === 'COM-08'));

  useEffect(() => {
    if (!kpi) return;
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
      Promise.all([
        fetchLiveFlights(user),
        fetchLiveQueues('ALL')
      ]).then(([flts, q]) => {
        setFlights(flts);
        setQueues(q);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [kpi, user, isCommercial, isParking]);

  if (!kpi) return null;

  // Generate 13 historical period raw records matching the trend
  const periodRows = kpi.trend.map((val, idx) => {
    const periodNumber = idx + 1;
    const isCurrent = idx === kpi.trend.length - 1;
    const dateLabel = isCurrent ? 'Current Shift' : `Shift T-${13 - periodNumber} (M-${13 - periodNumber})`;
    const target = kpi.target;
    const variancePct = Number((((val - target) / target) * 100).toFixed(1));
    
    // Scale numerator and denominator proportionately
    let denom = 42000;
    let numer = Math.round(val * denom);
    if (kpi.code === 'COM-01') {
      denom = 48500;
      numer = Math.round(val * denom);
    } else if (kpi.code === 'COM-02' || kpi.code === 'COM-10') {
      denom = 44200000;
      numer = Math.round((val / 100) * denom);
    } else if (kpi.code === 'COM-03' || kpi.code === 'COM-06' || kpi.code === 'COM-09') {
      denom = 92000;
      numer = kpi.code === 'COM-03' ? Math.round((val / 100) * denom) : Math.round(val * denom);
    } else if (kpi.code === 'COM-04') {
      denom = 8400;
      numer = Math.round(val * denom);
    } else if (kpi.code === 'COM-05') {
      denom = 44800;
      numer = Math.round(val * denom);
    } else if (kpi.code === 'COM-07') {
      denom = 48500;
      numer = Math.round(val * denom);
    } else if (kpi.code === 'COM-08') {
      denom = 10800;
      numer = Math.round(val * denom);
    } else if (kpi.unit === '%') {
      denom = 480;
      numer = Math.round((val / 100) * denom);
    } else if (kpi.unit.includes('min')) {
      denom = 340;
      numer = Math.round(val * denom);
    }

    let status = 'green';
    if (kpi.polarity === 'Higher is Better') {
      status = val >= target ? 'green' : val >= target * 0.95 ? 'amber' : 'red';
    } else if (kpi.polarity === 'Lower is Better') {
      status = val <= target ? 'green' : val <= target * 1.05 ? 'amber' : 'red';
    } else {
      status = Math.abs(val - target) <= target * 0.05 ? 'green' : 'amber';
    }

    const dq = Math.min(100, Math.max(88, Math.round(kpi.dataQuality - (12 - idx) * 0.4)));

    return {
      periodNumber,
      dateLabel,
      val,
      target,
      variancePct,
      numer,
      denom,
      dq,
      status,
      isCurrent
    };
  });

  const filteredPeriods = periodRows.filter(p => 
    p.dateLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.val.toString().includes(searchQuery) ||
    p.variancePct.toString().includes(searchQuery)
  );

  const filteredFlights = flights.filter(f => 
    f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.airlineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.originDest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.terminal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.stand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConcessions = concessions.filter(c =>
    c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.outletId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.stream.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.terminal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParking = parkingSessions.filter(p =>
    p.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.terminal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.occupancyStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    if (activeTab === 'periods') {
      const headers = ['Period #', 'Period Description', `Actual (${kpi.unit})`, `Target (${kpi.unit})`, 'Variance %', 'Numerator Fact', 'Denominator Fact', 'Data Quality %', 'Status'];
      const rows = periodRows.map(r => [
        r.periodNumber,
        r.dateLabel,
        r.val,
        r.target,
        r.variancePct,
        r.numer,
        r.denom,
        r.dq,
        r.status.toUpperCase()
      ]);
      exportToCsv(`${kpi.code}_Period_Raw_Data_Grid`, headers, rows);
    } else if (isParking) {
      const headers = ['Ticket ID', 'Terminal', 'Zone Name', 'Vehicle Type', 'Duration (Hrs)', 'Revenue Amount', 'Status'];
      const rows = parkingSessions.map(p => [
        p.ticketId, p.terminal, p.zoneName, p.vehicleType, p.durationHours, p.revenueAmount, p.occupancyStatus
      ]);
      exportToCsv(`${kpi.code}_Parking_Raw_Facts`, headers, rows);
    } else if (isCommercial) {
      const headers = ['Outlet ID', 'Concessionaire', 'Stream', 'Category', 'Terminal', 'Zone', 'Area (m²)', 'Gross Sales', 'Fee (MAG)', 'Customers', 'ATV', 'Pax Type', 'Persona', 'Dwell Min'];
      const rows = concessions.map(c => [
        c.outletId, c.tenantName, c.stream, c.subCategory, c.terminal, c.locationZone, c.sqmArea, c.grossSales, c.concessionFee, c.transactingCustomers, c.averageTransactionValue, c.passengerType, c.passengerProfile, c.averageDwellMinutes
      ]);
      exportToCsv(`${kpi.code}_Concession_Raw_Facts`, headers, rows);
    } else {
      const headers = ['Flight Number', 'Airline', 'Type', 'Route', 'Terminal', 'Stand', 'Runway', 'Passengers', 'Delay Minutes', 'Controllability', 'Status'];
      const rows = flights.map(f => [
        f.flightNumber,
        f.airlineName,
        f.movementType,
        f.originDest,
        f.terminal,
        f.stand,
        f.runway,
        f.paxCount,
        f.delayMinutes,
        f.delayControllable,
        f.status
      ]);
      exportToCsv(`${kpi.code}_Atomic_Source_Facts`, headers, rows);
    }
  };

  const getConformedSql = () => {
    if (kpi.code === 'COM-01') {
      return `-- Governed CBI Lineage for COM-01: Non-Aeronautical Revenue per Passenger (SVP)
SELECT 
    DATE_TRUNC('day', c.period_timestamp) AS operational_date,
    SUM(c.gross_sales) AS total_gross_sales,
    SUM(c.concession_fee) AS numerator_non_aero_revenue,
    SUM(f.pax_count) AS denominator_enplaned_passengers,
    ROUND(SUM(c.concession_fee)::NUMERIC / NULLIF(SUM(f.pax_count), 0), 2) AS calculated_svp_per_pax,
    420.0 AS target_benchmark_2026,
    98.2 AS governed_dq_score
FROM fact_concession_sales c
CROSS JOIN (
    SELECT SUM(pax_count) AS pax_count 
    FROM fact_flight_movement 
    WHERE movement_type = 'Departure'
) f
GROUP BY 1
ORDER BY operational_date DESC;`;
    }

    if (kpi.code === 'COM-03') {
      return `-- Governed CBI Lineage for COM-03: Sales Capture / Penetration Rate
SELECT 
    DATE_TRUNC('day', c.period_timestamp) AS operational_date,
    c.terminal,
    SUM(c.transacting_customers) AS numerator_transacting_retail_customers,
    SUM(pax.total_pax) AS denominator_terminal_passengers,
    ROUND((SUM(c.transacting_customers)::NUMERIC / NULLIF(SUM(pax.total_pax), 0)) * 100, 2) AS calculated_capture_rate_pct,
    22.5 AS target_capture_rate_2026
FROM fact_concession_sales c
CROSS JOIN (SELECT SUM(pax_count) AS total_pax FROM fact_flight_movement) pax
WHERE c.stream = 'Retail & Duty-Free'
GROUP BY 1, 2
ORDER BY operational_date DESC;`;
    }

    if (kpi.code === 'COM-04') {
      return `-- Governed CBI Lineage for COM-04: Commercial Yield per Square Metre
SELECT 
    c.terminal,
    c.stream,
    SUM(c.concession_fee) AS numerator_retail_concession_revenue,
    SUM(c.sqm_area) AS denominator_retail_floor_area_sqm,
    ROUND(SUM(c.concession_fee)::NUMERIC / NULLIF(SUM(c.sqm_area), 0), 2) AS commercial_yield_per_sqm,
    18500.0 AS target_yield_2026
FROM fact_concession_sales c
WHERE c.stream = 'Retail & Duty-Free'
GROUP BY 1, 2;`;
    }

    if (kpi.code === 'COM-05') {
      return `-- Governed CBI Lineage for COM-05: Average Transaction Value (ATV)
SELECT 
    c.outlet_id,
    c.tenant_name,
    SUM(c.gross_sales) AS numerator_retail_sales_revenue,
    SUM(c.transaction_count) AS denominator_retail_transactions,
    ROUND(SUM(c.gross_sales)::NUMERIC / NULLIF(SUM(c.transaction_count), 0), 2) AS calculated_atv,
    1450.0 AS target_atv_2026
FROM fact_concession_sales c
WHERE c.stream = 'Retail & Duty-Free'
GROUP BY 1, 2;`;
    }

    if (kpi.code === 'COM-06') {
      return `-- Governed CBI Lineage for COM-06: Food & Beverage Revenue per Passenger
SELECT 
    c.terminal,
    SUM(c.concession_fee) AS numerator_fb_concession_revenue,
    SUM(pax.total_pax) AS denominator_terminal_passengers,
    ROUND(SUM(c.concession_fee)::NUMERIC / NULLIF(SUM(pax.total_pax), 0), 2) AS fb_revenue_per_pax,
    135.0 AS target_fb_per_pax_2026
FROM fact_concession_sales c
CROSS JOIN (SELECT SUM(pax_count) AS total_pax FROM fact_flight_movement) pax
WHERE c.stream = 'Food & Beverage'
GROUP BY 1;`;
    }

    if (kpi.code === 'COM-07' || kpi.code === 'COM-08') {
      return `-- Governed CBI Lineage for ${kpi.code}: Parking & Ground Transportation Metrics
SELECT 
    p.terminal,
    p.zone_name,
    SUM(p.revenue_amount) AS total_parking_revenue,
    COUNT(p.id) AS parked_vehicles_count,
    ROUND(SUM(p.revenue_amount)::NUMERIC / NULLIF(COUNT(p.id), 0), 2) AS arpos_per_occupied_space,
    ROUND(SUM(p.revenue_amount)::NUMERIC / NULLIF(MAX(dep.dep_pax), 0), 2) AS parking_revenue_per_enplanement
FROM fact_parking_sessions p
CROSS JOIN (SELECT SUM(pax_count) AS dep_pax FROM fact_flight_movement WHERE movement_type = 'Departure') dep
GROUP BY 1, 2;`;
    }

    return `-- Governed Semantic SQL Lineage for ${kpi.code}: ${kpi.name}
SELECT 
    DATE_TRUNC('hour', flight_actual_time) AS operational_window,
    terminal_code,
    airline_code,
    COUNT(CASE WHEN delay_minutes <= 15 THEN 1 END)::NUMERIC AS numerator_ontime_movements,
    COUNT(flight_id)::NUMERIC AS denominator_total_movements,
    ROUND((COUNT(CASE WHEN delay_minutes <= 15 THEN 1 END)::NUMERIC / NULLIF(COUNT(flight_id), 0)) * 100, 2) AS calculated_value,
    ${kpi.target} AS governed_target_2026,
    AVG(data_quality_score) AS avg_dq_score
FROM fct_flights
WHERE flight_actual_time >= NOW() - INTERVAL '13 shifts'
  AND terminal_code IN ('T1', 'T2')
GROUP BY 1, 2, 3
ORDER BY operational_window DESC;`;
  };

  const sampleSql = getConformedSql();

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {isParking ? <Car className="w-5 h-5" /> : isCommercial ? <ShoppingBag className="w-5 h-5" /> : <Table className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                <span>{kpi.code}</span>
                <span aria-hidden="true">·</span>
                <span>{kpi.domain}</span>
                <span aria-hidden="true">·</span>
                <span>Tier {kpi.tier}</span>
                <span aria-hidden="true">·</span>
                <span>Owner: {kpi.owner}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Raw Data Grid: {kpi.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('periods')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'periods'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>13-Period Raw Grid ({periodRows.length} Shifts)</span>
            </button>

            <button
              onClick={() => setActiveTab('atomic')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'atomic'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>
                {isParking 
                  ? `Atomic Parking Sessions (${parkingSessions.length})` 
                  : isCommercial 
                    ? `Atomic Concession Outlets (${concessions.length})` 
                    : `Atomic Flight Facts (${flights.length})`}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'sql'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Governed SQL Lineage</span>
            </button>
          </div>

          {activeTab !== 'sql' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isParking ? "Search tickets, zones..." : isCommercial ? "Search outlets, categories..." : "Search shifts, values..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-56 font-mono"
              />
            </div>
          )}
        </div>

        {/* Tab 1: 13-Period Raw Grid */}
        {activeTab === 'periods' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>Time-Series Governed Fact Table · Polarity: <strong className="text-slate-900 dark:text-slate-200">{kpi.polarity}</strong></span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">Standard: {kpi.standard}</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Period #</th>
                    <th className="px-3 py-2.5 font-bold">Temporal Window</th>
                    <th className="px-3 py-2.5 font-bold text-right">Governed Actual</th>
                    <th className="px-3 py-2.5 font-bold text-right">Target</th>
                    <th className="px-3 py-2.5 font-bold text-right">Variance</th>
                    <th className="px-3 py-2.5 font-bold text-right">Numerator Fact</th>
                    <th className="px-3 py-2.5 font-bold text-right">Denominator Fact</th>
                    <th className="px-3 py-2.5 font-bold text-center">Quality</th>
                    <th className="px-3 py-2.5 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredPeriods.map(row => (
                    <tr 
                      key={row.periodNumber} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        row.isCurrent ? 'bg-cyan-50/50 dark:bg-cyan-950/20 font-bold' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-slate-400 font-semibold">{row.periodNumber}</td>
                      <td className="px-3 py-2.5 text-slate-900 dark:text-white font-sans font-bold flex items-center gap-2">
                        <span>{row.dateLabel}</span>
                        {row.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 uppercase font-mono">
                            Latest
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {row.val.toLocaleString()} <span className="text-slate-500 font-normal text-[11px]">{kpi.unit}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {row.target.toLocaleString()} {kpi.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span className={`inline-flex items-center gap-0.5 font-bold ${
                          row.variancePct >= 0 
                            ? kpi.polarity === 'Higher is Better' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            : kpi.polarity === 'Higher is Better' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {row.variancePct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {row.variancePct > 0 ? '+' : ''}{row.variancePct}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400 tabular-nums font-semibold">
                        {row.numer.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                        {row.denom.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{row.dq}%</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.status === 'green' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : row.status === 'amber' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Atomic Fact Records */}
        {activeTab === 'atomic' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>
                {isParking 
                  ? `Showing individual parking session records (${filteredParking.length} of ${parkingSessions.length})`
                  : isCommercial 
                    ? `Showing commercial concessionaire outlet performance records (${filteredConcessions.length} of ${concessions.length})`
                    : `Showing underlying operational flight records aggregated for this metric (${filteredFlights.length} of ${flights.length})`}
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-500" />
                <span>RLS Role: {user.name} ({user.scopeType})</span>
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400">Loading atomic records from PostgreSQL WASM...</div>
            ) : isParking ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Ticket ID</th>
                      <th className="px-3 py-2.5 font-bold">Terminal</th>
                      <th className="px-3 py-2.5 font-bold">Zone Name</th>
                      <th className="px-3 py-2.5 font-bold">Vehicle Type</th>
                      <th className="px-3 py-2.5 font-bold text-right">Duration (Hrs)</th>
                      <th className="px-3 py-2.5 font-bold text-right">Revenue (₹)</th>
                      <th className="px-3 py-2.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredParking.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{p.ticketId}</td>
                        <td className="px-3 py-2">{p.terminal}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{p.zoneName}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{p.vehicleType}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.durationHours} hrs</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600 tabular-nums">₹{p.revenueAmount}</td>
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
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Outlet / Tenant</th>
                      <th className="px-3 py-2.5 font-bold">Stream</th>
                      <th className="px-3 py-2.5 font-bold">Sub-Category</th>
                      <th className="px-3 py-2.5 font-bold">Terminal</th>
                      <th className="px-3 py-2.5 font-bold text-right">Area (m²)</th>
                      <th className="px-3 py-2.5 font-bold text-right">Gross Sales</th>
                      <th className="px-3 py-2.5 font-bold text-right">Airport Fee</th>
                      <th className="px-3 py-2.5 font-bold text-right">ATV</th>
                      <th className="px-3 py-2.5 font-bold text-right">Yield / m²</th>
                      <th className="px-3 py-2.5 font-bold">Pax Persona</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredConcessions.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white font-sans">
                          {c.tenantName}
                          <span className="block text-[10px] text-slate-500 font-mono font-normal">{c.outletId} · {c.locationZone}</span>
                        </td>
                        <td className="px-3 py-2 text-cyan-600 font-semibold">{c.stream}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-[11px]">{c.subCategory}</td>
                        <td className="px-3 py-2 font-bold">{c.terminal}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{c.sqmArea}</td>
                        <td className="px-3 py-2 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                          ₹{(c.grossSales / 100000).toFixed(1)}L
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600 tabular-nums">
                          {user.canViewTenantRevenue ? `₹${(c.concessionFee / 100000).toFixed(1)}L` : '••••••'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">₹{c.averageTransactionValue}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">₹{c.salesPerSqm.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[11px]">
                          <span className="font-semibold text-slate-900 dark:text-white">{c.passengerType}</span>
                          <span className="text-slate-500"> ({c.passengerProfile})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Flight #</th>
                      <th className="px-3 py-2.5 font-bold">Airline</th>
                      <th className="px-3 py-2.5 font-bold">Movement</th>
                      <th className="px-3 py-2.5 font-bold">Route</th>
                      <th className="px-3 py-2.5 font-bold">Terminal</th>
                      <th className="px-3 py-2.5 font-bold">Stand</th>
                      <th className="px-3 py-2.5 font-bold">Runway</th>
                      <th className="px-3 py-2.5 font-bold text-right">Passengers</th>
                      <th className="px-3 py-2.5 font-bold text-right">Delay Min</th>
                      <th className="px-3 py-2.5 font-bold">Controllable</th>
                      <th className="px-3 py-2.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredFlights.slice(0, 30).map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{f.flightNumber}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-sans font-semibold">{f.airlineName}</td>
                        <td className="px-3 py-2 text-slate-500">{f.movementType}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{f.originDest}</td>
                        <td className="px-3 py-2">{f.terminal}</td>
                        <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">{f.stand}</td>
                        <td className="px-3 py-2 text-slate-500">{f.runway}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{f.paxCount}</td>
                        <td className={`px-3 py-2 text-right tabular-nums ${f.delayMinutes > 15 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {f.delayMinutes}m
                        </td>
                        <td className="px-3 py-2 text-slate-500">{f.delayControllable}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            f.status === 'On Time' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
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

        {/* Tab 3: SQL Lineage */}
        {activeTab === 'sql' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600" />
                  <span>Governed SQL Query Definition</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Semantic Layer compilation generating this raw data grid from DuckDB / PostgreSQL WASM tables
                </p>
              </div>

              <button
                onClick={copySqlToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy Query'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              <code>{sampleSql}</code>
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="text-slate-600 dark:text-slate-400 font-mono">
            Metric Formula: <strong className="text-slate-900 dark:text-slate-200">{kpi.formula}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
