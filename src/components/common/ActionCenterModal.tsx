import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActionItem, TargetProposal } from '../../types';
import { KEY_KPIS } from '../../data/kpiLibrary';
import { 
  fetchActionItems, 
  createActionItem, 
  fetchAuditLogs,
  fetchTargetProposals,
  createTargetProposal,
  reviewTargetProposal
} from '../../services/semanticApi';
import { 
  X, 
  CheckSquare, 
  Plus, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ListFilter,
  History,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ActionCenterModalProps {
  onClose: () => void;
}

export const ActionCenterModal: React.FC<ActionCenterModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<'actions' | 'targets' | 'audits' | 'new_action' | 'new_target'>('actions');
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [proposals, setProposals] = useState<TargetProposal[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New action form state
  const [newTitle, setNewTitle] = useState('');
  const [newKpiId, setNewKpiId] = useState('kpi-pun-01');
  const [newOwner, setNewOwner] = useState(currentUser.name);
  const [newDept, setNewDept] = useState(currentUser.department);
  const [newDueDate, setNewDueDate] = useState('2026-11-30');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newRootCause, setNewRootCause] = useState('');

  // New target proposal state
  const [propKpiCode, setPropKpiCode] = useState('PUN-01');
  const [proposedVal, setProposedVal] = useState<number>(88.5);
  const [propJustification, setPropJustification] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchActionItems(), 
      fetchTargetProposals(), 
      fetchAuditLogs()
    ]).then(([acts, props, auds]) => {
      setActions(acts);
      setProposals(props);
      setAudits(auds);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: ActionItem = {
      id: `ACT-2026-00${actions.length + 5}`,
      kpiId: newKpiId,
      title: newTitle,
      owner: newOwner,
      department: newDept,
      dueDate: newDueDate,
      status: 'Open',
      priority: newPriority,
      rootCause: newRootCause
    };

    await createActionItem(item, currentUser);
    setTab('actions');
    setNewTitle('');
    setNewRootCause('');
    loadData();
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedKpi = KEY_KPIS.find(k => k.code === propKpiCode) || KEY_KPIS[0];

    await createTargetProposal({
      kpiId: matchedKpi.id,
      kpiCode: matchedKpi.code,
      kpiName: matchedKpi.name,
      currentValue: matchedKpi.target2026 * 0.98,
      currentTarget: matchedKpi.target2026,
      proposedTarget: proposedVal,
      unit: matchedKpi.unit,
      proposerId: currentUser.id,
      proposerName: currentUser.name,
      department: currentUser.department,
      justification: propJustification
    }, currentUser);

    setTab('targets');
    setPropJustification('');
    loadData();
  };

  const handleReviewProposal = async (id: string, status: 'Approved' | 'Rejected') => {
    await reviewTargetProposal(id, status, currentUser);
    loadData();
  };

  const canApprove = currentUser.canEditTargets === 'approve' || currentUser.canEditTargets === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Airport Governance & Action Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  FR-3.3 Maker-Checker · FR-4.3
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <strong className="text-slate-700 dark:text-slate-300">{currentUser.name}</strong> ({currentUser.department}) · Authority: <strong className="font-mono text-cyan-500">{currentUser.canEditTargets}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('actions')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                tab === 'actions'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Corrective Actions ({actions.length})
            </button>
            <button
              onClick={() => setTab('targets')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                tab === 'targets'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Maker-Checker Targets ({proposals.length})
            </button>
            <button
              onClick={() => setTab('audits')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                tab === 'audits'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                  : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Audit Log ({audits.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('new_target')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Propose Target</span>
            </button>
            <button
              onClick={() => setTab('new_action')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Subtab 1: Corrective Actions */}
          {tab === 'actions' && (
            <div className="space-y-3">
              {actions.map(act => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">
                      <span>{act.id}</span>
                      <span>·</span>
                      <span>{act.kpiId}</span>
                      <span>·</span>
                      <span className="text-slate-400">{act.department}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        act.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {act.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {act.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {act.title}
                  </h4>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <strong className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">Root Cause: </strong>
                    {act.rootCause}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div>Owner: <span className="text-slate-700 dark:text-slate-300 font-medium">{act.owner}</span></div>
                    <div className="font-mono">Due: {act.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 2: Maker-Checker Target Proposals */}
          {tab === 'targets' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Department managers propose KPI targets; Executives and CFO review and approve with visible audit logging.
              </div>

              <div className="space-y-3">
                {proposals.map(prop => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{prop.kpiCode}</span>
                        <span>·</span>
                        <span className="text-slate-400">{prop.id}</span>
                        <span>·</span>
                        <span className="text-slate-500">{prop.department}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        prop.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        prop.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                      }`}>
                        {prop.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Current Target: </span>
                        <strong className="text-slate-800 dark:text-slate-200">{prop.currentTarget} {prop.unit}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Proposed: </span>
                        <strong className="text-cyan-500 text-sm font-bold">{prop.proposedTarget} {prop.unit}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <strong className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">Justification: </strong>
                      {prop.justification}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div>Proposer: <strong className="text-slate-700 dark:text-slate-300">{prop.proposerName}</strong></div>

                      {prop.status === 'Pending' && canApprove ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewProposal(prop.id, 'Approved')}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReviewProposal(prop.id, 'Rejected')}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          {prop.reviewedBy && (
                            <span>Reviewed by <strong className="text-slate-700 dark:text-slate-300">{prop.reviewedBy}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 3: Audit Log */}
          {tab === 'audits' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {audits.map(aud => (
                    <tr key={aud.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 text-slate-400">{aud.timestamp}</td>
                      <td className="px-3 py-2 font-semibold text-cyan-500">{aud.user_name}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{aud.action}</td>
                      <td className="px-3 py-2 text-slate-500 max-w-[300px] truncate">{aud.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subtab 4: New Action Form */}
          {tab === 'new_action' && (
            <form onSubmit={handleCreateAction} className="space-y-4 max-w-xl mx-auto text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Terminal 1 Boarding Bus Handover Bottleneck..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Linked KPI
                  </label>
                  <select
                    value={newKpiId}
                    onChange={(e) => setNewKpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="kpi-pun-01">PUN-01 (Departure OTP-15)</option>
                    <option value="kpi-pax-01">PAX-01 (Security Wait P90)</option>
                    <option value="kpi-bag-01">BAG-01 (First Bag Delivery)</option>
                    <option value="kpi-ast-01">AST-01 (Critical Asset Index)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Root Cause Description
                </label>
                <textarea
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  rows={3}
                  placeholder="Explain contributing factors, telemetry spikes, and planned remedy..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('actions')}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-xs"
                >
                  Save Corrective Action
                </button>
              </div>
            </form>
          )}

          {/* Subtab 5: New Target Proposal Form */}
          {tab === 'new_target' && (
            <form onSubmit={handleCreateProposal} className="space-y-4 max-w-xl mx-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Select KPI
                  </label>
                  <select
                    value={propKpiCode}
                    onChange={(e) => {
                      setPropKpiCode(e.target.value);
                      const f = KEY_KPIS.find(k => k.code === e.target.value);
                      if (f) setProposedVal(f.target2026);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  >
                    {KEY_KPIS.map(k => (
                      <option key={k.id} value={k.code}>
                        {k.code} · {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Proposed New Target
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={proposedVal}
                    onChange={(e) => setProposedVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Business Justification (Maker-Checker Mandate)
                </label>
                <textarea
                  value={propJustification}
                  onChange={(e) => setPropJustification(e.target.value)}
                  rows={3}
                  placeholder="Outline regulatory reason, seasonal shift, airline agreement, or capital improvements..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('targets')}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-white shadow-xs"
                >
                  Submit Target Proposal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
