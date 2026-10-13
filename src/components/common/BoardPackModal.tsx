import React from 'react';
import { KpiValueResult, UserRole } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Plane
} from 'lucide-react';

interface BoardPackModalProps {
  onClose: () => void;
  kpis: KpiValueResult[];
  user: UserRole;
}

export const BoardPackModal: React.FC<BoardPackModalProps> = ({ onClose, kpis, user }) => {
  const handlePrint = () => {
    window.print();
  };

  const topTier1 = kpis.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-4xl bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Modal Controls (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold text-slate-800">
              AIONOS Governed Board Pack & 07:00 IST Morning Brief Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-8 font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2 font-mono">
                <span>AIONOS</span>
                <span className="text-cyan-600 font-bold">ZZA</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">
                AIONOS Demo International Airport · Aerodrome Performance Intelligence
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-600 space-y-0.5">
              <div><strong>Document:</strong> Executive Board Pack (M-07)</div>
              <div><strong>Published:</strong> 07:00 IST · 13 Oct 2026</div>
              <div><strong>Generated for:</strong> {user.name} ({user.department})</div>
              <div><strong>Governance:</strong> 100% Reconciled Fact Model</div>
            </div>
          </div>

          {/* Executive Overview Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Morning Operations Synthesis
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Commercial traffic at AIONOS Demo International handled <strong>94,120 daily passengers</strong> across <strong>562 scheduled movements</strong>. On-Time Departure (OTP-15) tracked at <strong>85.4%</strong> against an 87.0% target. Contact stand utilization held strong at 81.2%, with Terminal 2 Central Security delivering a P90 wait of 9.2 minutes. Aerodrome safety recorded zero incursions, and critical asset electromechanical uptime maintained 99.4% availability.
            </p>
          </div>

          {/* Primary Tier 1 Scorecard Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Core Enterprise Scorecard (Tier 1 Metrics)
            </h3>

            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2.5 border-r border-slate-200">Code</th>
                  <th className="p-2.5 border-r border-slate-200">Metric Name</th>
                  <th className="p-2.5 border-r border-slate-200">Domain</th>
                  <th className="p-2.5 border-r border-slate-200 text-right">Target</th>
                  <th className="p-2.5 border-r border-slate-200 text-right">Actual</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">Status</th>
                  <th className="p-2.5 text-right">Data Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {topTier1.map(k => (
                  <tr key={k.kpiId} className="even:bg-slate-50/50">
                    <td className="p-2.5 font-bold border-r border-slate-200 text-cyan-700">{k.code}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-900 border-r border-slate-200">{k.name}</td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200 text-[11px] font-sans">{k.domain}</td>
                    <td className="p-2.5 text-right border-r border-slate-200">{k.target} {k.unit}</td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200 text-slate-900">
                      {k.currentValue} {k.unit}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        k.status === 'green' ? 'bg-emerald-100 text-emerald-800' :
                        k.status === 'amber' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-semibold text-emerald-700">{k.dataQuality}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Operational Constraints & Key Mitigations */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold font-mono text-[11px] uppercase text-slate-800">
                Top 3 Operational Constraints
              </h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Apron remote bus transfer bottlenecks during 07:30–08:45 peak departure bank.</li>
                <li>T1 Inbound carousel 4 optical diverter maintenance window.</li>
                <li>Midday convective weather holding pattern over northern airspace waypoint.</li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold font-mono text-[11px] uppercase text-slate-800">
                Sign-off & Governance Seal
              </h4>
              <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                <div>Verified by: <strong>AIONOS Semantic Gatekeeper</strong></div>
                <div>Hash: <span className="font-mono text-slate-400">0x7F2A...9B81</span> (Byte-identical)</div>
                <div>Sign-off: <strong>CFO & Executive Office</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
