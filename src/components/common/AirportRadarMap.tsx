import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Layers,
  Info
} from 'lucide-react';

interface StandInfo {
  id: string;
  terminal: 'T1' | 'T2';
  isContact: boolean;
  occupiedBy?: string;
  airline?: string;
  aircraft?: string;
  status: 'nominal' | 'delayed' | 'empty' | 'turnaround';
  delayMin?: number;
}

export const AirportRadarMap: React.FC<{ activeScenarioId: string | null }> = ({ activeScenarioId }) => {
  const [selectedStand, setSelectedStand] = useState<StandInfo | null>(null);

  // Generate 64 contact + sample remote stands
  const stands: StandInfo[] = Array.from({ length: 64 }, (_, i) => {
    const standNum = i + 1;
    const term = standNum <= 26 ? 'T1' : 'T2';
    const isOccupied = standNum % 5 !== 0;

    let status: 'nominal' | 'delayed' | 'empty' | 'turnaround' = 'nominal';
    let delayMin = 0;

    if (!isOccupied) {
      status = 'empty';
    } else if (activeScenarioId === 'winter-fog' && standNum % 3 === 0) {
      status = 'delayed';
      delayMin = 45 + (standNum % 30);
    } else if (activeScenarioId === 'bhs-outage' && term === 'T1' && standNum % 2 === 0) {
      status = 'delayed';
      delayMin = 35 + (standNum % 20);
    } else if (standNum % 7 === 0) {
      status = 'delayed';
      delayMin = 22;
    } else if (standNum % 4 === 0) {
      status = 'turnaround';
    }

    const airlines = ['6E', 'AI', 'SG', 'EK', 'SQ', 'LH'];
    const airline = airlines[i % airlines.length];

    return {
      id: `Stand ${standNum}`,
      terminal: term,
      isContact: true,
      occupiedBy: isOccupied ? `${airline}-${100 + standNum}` : undefined,
      airline: isOccupied ? airline : undefined,
      aircraft: isOccupied ? (standNum % 3 === 0 ? 'B787-9' : 'A321neo') : undefined,
      status,
      delayMin: delayMin > 0 ? delayMin : undefined
    };
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>AeroSurface Tactical Stand & Gate Radar</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500">
              Runway 09L/27R & 09R/27L Active
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time contact gate occupancy across Terminal 1 (Stands 1–26) and Terminal 2 (Stands 27–64)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>On Schedule</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span>Turnaround Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>Gate Delay</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 dark:bg-slate-700 inline-block" />
            <span>Vacant</span>
          </div>
        </div>
      </div>

      {/* Interactive Airport Stand Matrix */}
      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
        {stands.map(stand => {
          let bg = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400';
          if (stand.status === 'nominal') bg = 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold';
          if (stand.status === 'turnaround') bg = 'bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900 font-bold';
          if (stand.status === 'delayed') bg = 'bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700/60 hover:bg-rose-100 dark:hover:bg-rose-900 font-bold animate-pulse';

          return (
            <button
              key={stand.id}
              onClick={() => setSelectedStand(stand)}
              title={`${stand.id} (${stand.terminal}) - ${stand.occupiedBy || 'Vacant'}`}
              className={`h-10 rounded border text-[10px] font-mono font-semibold flex flex-col items-center justify-center transition-all ${bg}`}
            >
              <span>{stand.id.replace('Stand ', '')}</span>
              {stand.airline && (
                <span className="text-[8px] font-bold opacity-90">{stand.airline}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Stand Detail Drawer */}
      {selectedStand && (
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold">
              {selectedStand.id.replace('Stand ', '')}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedStand.id} · {selectedStand.terminal} Aerobridge (Contact)
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-medium">
                {selectedStand.occupiedBy ? (
                  <span>Flight <strong className="text-cyan-700 dark:text-cyan-400">{selectedStand.occupiedBy}</strong> ({selectedStand.aircraft})</span>
                ) : (
                  <span>Stand currently vacant and sanitized</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedStand.delayMin && (
              <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                +{selectedStand.delayMin} min Gate Delay
              </span>
            )}
            <button
              onClick={() => setSelectedStand(null)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
