import React, { useState } from 'react';
import { querySql } from '../../db/pglite';
import { 
  X, 
  Play, 
  Terminal, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface SqlConsoleModalProps {
  onClose: () => void;
}

export const SqlConsoleModal: React.FC<SqlConsoleModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('SELECT flight_number, airline_code, terminal, stand, delay_minutes, status FROM fact_flight_movement LIMIT 15;');
  const [results, setResults] = useState<any[] | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: 'Active Flights', sql: 'SELECT flight_number, airline_code, terminal, stand, delay_minutes, status FROM fact_flight_movement LIMIT 15;' },
    { label: 'Queue Intervals', sql: 'SELECT timestamp, checkpoint, terminal, lanes_open, wait_p90, pax_served FROM fact_queue_interval LIMIT 15;' },
    { label: 'Airport Profile', sql: 'SELECT * FROM cfg_airport_profile;' },
    { label: 'Baggage Flights', sql: 'SELECT flight_number, terminal, first_bag_minutes, total_bags, carousel FROM fact_baggage_flight LIMIT 10;' },
    { label: 'Audit Log', sql: 'SELECT * FROM audit_log ORDER BY id DESC LIMIT 10;' },
    { label: 'Flight Counts by Terminal', sql: 'SELECT terminal, count(*) as count, avg(delay_minutes) as avg_delay FROM fact_flight_movement GROUP BY terminal;' }
  ];

  const handleRun = async (sqlToRun?: string) => {
    const q = sqlToRun || query;
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const rows = await querySql(q);
      setResults(rows);
      setExecTime(Math.round(performance.now() - start));
    } catch (err: any) {
      setError(err?.message || 'SQL execution failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>In-Browser PostgreSQL WASM Console</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PGlite v16 · IndexedDB Ready
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Execute live SQL queries directly against the in-browser database engine
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Presets */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase">Presets:</span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setQuery(p.sql);
                handleRun(p.sql);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Query Editor & Action */}
        <div className="p-6 border-b border-slate-800 space-y-3">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              placeholder="Write SQL query..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              {execTime !== null && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Executed in {execTime} ms</span>
                </span>
              )}
              {results && (
                <span>· {results.length} rows returned</span>
              )}
            </div>

            <button
              onClick={() => handleRun()}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-xs text-white shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{loading ? 'Running...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/30">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    {Object.keys(results[0]).map(key => (
                      <th key={key} className="px-3 py-2">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      {Object.values(row).map((val: any, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 text-slate-300 truncate max-w-[200px]">
                          {val === null ? 'NULL' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {results && results.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">Query returned 0 rows.</div>
          )}

          {!results && !error && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">Click "Run Query" or pick a preset above to inspect the database.</div>
          )}
        </div>
      </div>
    </div>
  );
};
