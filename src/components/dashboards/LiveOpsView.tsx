import React, { useState, useEffect } from 'react';
import { KpiValueResult, UserRole, FlightRecord, QueueRecord, OperationalEvent } from '../../types';
import { AirportRadarMap } from '../common/AirportRadarMap';
import { 
  Radar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Plane, 
  Luggage,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Flame,
  Radio
} from 'lucide-react';

interface LiveOpsViewProps {
  kpis: KpiValueResult[];
  flights: FlightRecord[];
  queues: QueueRecord[];
  activeScenarioId: string | null;
  onDrilldown: (kpi: KpiValueResult) => void;
  user: UserRole;
}

export const LiveOpsView: React.FC<LiveOpsViewProps> = ({
  kpis,
  flights,
  queues,
  activeScenarioId,
  onDrilldown,
  user
}) => {
  const delayedFlights = flights.filter(f => f.delayMinutes > 15);
  const [selectedEventCat, setSelectedEventCat] = useState<string>('all');

  // Real-time operational event stream (ticking stream)
  const [eventStream, setEventStream] = useState<OperationalEvent[]>([
    {
      id: 'EV-01',
      timestamp: '14:28:10 IST',
      category: 'flight',
      message: '6E-142 (A320neo) touched down on Runway 09L from BOM. Vacated via RET-2.',
      severity: 'nominal'
    },
    {
      id: 'EV-02',
      timestamp: '14:26:45 IST',
      category: 'stand',
      message: 'Stand 18 pushback clearance approved for AI-108 to DXB. Tug underway.',
      severity: 'nominal'
    },
    {
      id: 'EV-03',
      timestamp: '14:24:12 IST',
      category: 'baggage',
      message: 'Terminal 2 Reclaim Carousel 6 first bag delivered in 10.8 min for SQ-402.',
      severity: 'nominal'
    },
    {
      id: 'EV-04',
      timestamp: '14:21:30 IST',
      category: 'queue',
      message: 'Terminal 1 Security Checkpoint Alpha wait time rose to 11.2 min. Lane 17 opened.',
      severity: 'warning'
    },
    {
      id: 'EV-05',
      timestamp: '14:18:05 IST',
      category: 'flight',
      message: 'EK-512 (B777-300ER) docked at Stand 44 (PBB 44 connected, 400Hz GPU energized).',
      severity: 'nominal'
    }
  ]);

  // Inject scenario events when scenario changes
  useEffect(() => {
    if (activeScenarioId === 'winter-fog') {
      setEventStream(prev => [
        {
          id: `EV-FOG-${Date.now()}`,
          timestamp: '14:30:00 IST',
          category: 'safety',
          message: 'LVP CAT III-B initiated. Runway visual range (RVR) drops to 125m. Declared rate set to 34/hr.',
          severity: 'critical'
        },
        ...prev
      ]);
    } else if (activeScenarioId === 'bhs-outage') {
      setEventStream(prev => [
        {
          id: `EV-BHS-${Date.now()}`,
          timestamp: '14:30:00 IST',
          category: 'baggage',
          message: 'T1 Matrix Sorter 2 main drive motor trip alarm! Manual fallback induction activated.',
          severity: 'critical'
        },
        ...prev
      ]);
    } else if (activeScenarioId === 'monsoon-storm') {
      setEventStream(prev => [
        {
          id: `EV-STORM-${Date.now()}`,
          timestamp: '14:30:00 IST',
          category: 'flight',
          message: 'Severe gust front (52 kts) over airfield. Runway 09R suspended; ground stop called.',
          severity: 'critical'
        },
        ...prev
      ]);
    }
  }, [activeScenarioId]);

  const filteredEvents = selectedEventCat === 'all' 
    ? eventStream 
    : eventStream.filter(e => e.category === selectedEventCat);

  return (
    <div className="space-y-6">
      {/* AOCC Header Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>AOCC Tactical Operations Control (Live 120-Min Horizon)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20 animate-pulse">
              LIVE 1-MIN SYNC
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Surface surveillance, gate allocation conflicts, baggage delivery milestones, and checkpoint wait times
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-400 font-medium">Total Monitored Flights: </span>
            <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{flights.length}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-400 font-medium">Tactical Delays: </span>
            <strong className="text-rose-700 dark:text-rose-400 font-bold">{delayedFlights.length}</strong>
          </div>
        </div>
      </div>

      {/* Surface Radar Map */}
      <AirportRadarMap activeScenarioId={activeScenarioId} />

      {/* Queue Gauges & Baggage Delivery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* T1 Security Queue */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            <span>T1 Security Alpha</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">16 Lanes Open</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>11</span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-bold">min P90 Wait</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono flex justify-between font-semibold">
            <span>Target: 10 min</span>
            <span>Flow: 1,420 pax/hr</span>
          </div>
        </div>

        {/* T2 Central Security */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            <span>T2 Central Screening</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">26 Lanes Open</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>9</span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-bold">min P90 Wait</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '38%' }} />
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono flex justify-between font-semibold">
            <span>Target: 10 min</span>
            <span>Flow: 2,150 pax/hr</span>
          </div>
        </div>

        {/* First Bag Delivery */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            <span>First Bag on Belt</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">SLA: 12 min</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>11.4</span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-bold">min Avg</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono flex justify-between font-semibold">
            <span>Last 20 Inbounds</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">95% SLA Met</span>
          </div>
        </div>

        {/* Runway Throughput */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            <span>Runway Throughput</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-bold">58 Declared</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>54</span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-bold">mvmt / hr</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '93%' }} />
          </div>
          <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono flex justify-between font-semibold">
            <span>RWY 09L (Arr)</span>
            <span>RWY 09R (Dep)</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Flight Timeline + Streaming Operational Event Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Operations Radar Table (2 cols) */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              <span>Active Flight Timeline & Turnaround Milestones</span>
            </h3>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-400 font-semibold">
              Filtered for {user.name} ({user.scopeType})
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-100 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Flight</th>
                  <th className="px-3 py-2.5">Airline</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Route</th>
                  <th className="px-3 py-2.5">Terminal</th>
                  <th className="px-3 py-2.5">Stand</th>
                  <th className="px-3 py-2.5">Delay</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {flights.slice(0, 14).map(flt => (
                  <tr key={flt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{flt.flightNumber}</td>
                    <td className="px-3 py-2 text-cyan-700 dark:text-cyan-400 font-bold">{flt.airlineName}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-400 font-medium">{flt.movementType}</td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">{flt.originDest}</td>
                    <td className="px-3 py-2 text-slate-800 dark:text-slate-300 font-medium">{flt.terminal}</td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-200">{flt.stand}</td>
                    <td className={`px-3 py-2 font-bold ${flt.delayMinutes > 15 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-400'}`}>
                      {flt.delayMinutes > 0 ? `+${flt.delayMinutes}m` : '0m'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        flt.status === 'On Time' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20' 
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/20'
                      }`}>
                        {flt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Operational Event Ticker (1 col) - PRD Section 8 #2 & FR-6.2 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600 dark:text-rose-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Tactical Event Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Live Feed
            </span>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono pb-1 border-b border-slate-200 dark:border-slate-800">
            {['all', 'flight', 'stand', 'baggage', 'queue', 'safety'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedEventCat(cat)}
                className={`px-2 py-0.5 rounded capitalize font-bold transition-colors ${
                  selectedEventCat === cat
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stream Item List */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {filteredEvents.map(ev => {
              let tagColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              if (ev.severity === 'critical') tagColor = 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20';
              if (ev.severity === 'warning') tagColor = 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20';

              return (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 text-xs space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">{ev.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] border ${tagColor}`}>
                      {ev.category}
                    </span>
                  </div>
                  <p className="text-slate-900 dark:text-slate-200 font-medium leading-snug">
                    {ev.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
