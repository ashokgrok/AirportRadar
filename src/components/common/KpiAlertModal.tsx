import React, { useState, useEffect } from 'react';
import { KpiValueResult } from '../../types';
import { KpiAlertRule, AlertCondition, AlertSeverity, AlertChannel } from '../../types/alert';
import { getAlertsForKpi, saveAlertRule, deleteAlertRule, evaluateKpiAlert } from '../../utils/alertStore';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Sliders, 
  Radio, 
  Save, 
  Trash2, 
  Send,
  Zap,
  Info
} from 'lucide-react';

interface KpiAlertModalProps {
  kpi: KpiValueResult | null;
  onClose: () => void;
  onSaved?: () => void;
}

export const KpiAlertModal: React.FC<KpiAlertModalProps> = ({ kpi, onClose, onSaved }) => {
  if (!kpi) return null;

  const existingRules = getAlertsForKpi(kpi.code);
  const existingRule = existingRules[0];

  // Derive smart default thresholds based on polarity & target
  const defaultCondition: AlertCondition = kpi.polarity === 'Lower is Better' ? 'above_threshold' : 'below_threshold';
  const defaultWarning = kpi.polarity === 'Lower is Better' 
    ? Number((kpi.target * 1.05).toFixed(1)) 
    : Number((kpi.target * 0.95).toFixed(1));
  const defaultCritical = kpi.polarity === 'Lower is Better' 
    ? Number((kpi.target * 1.15).toFixed(1)) 
    : Number((kpi.target * 0.88).toFixed(1));

  const [enabled, setEnabled] = useState(existingRule ? existingRule.enabled : true);
  const [condition, setCondition] = useState<AlertCondition>(existingRule ? existingRule.condition : defaultCondition);
  const [warningThreshold, setWarningThreshold] = useState<number>(existingRule ? existingRule.warningThreshold : defaultWarning);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(existingRule ? existingRule.criticalThreshold : defaultCritical);
  const [varianceThreshold, setVarianceThreshold] = useState<number>(existingRule?.varianceThreshold ?? 5);
  const [dataQualityThreshold, setDataQualityThreshold] = useState<number>(existingRule?.dataQualityThreshold ?? 90);
  const [severity, setSeverity] = useState<AlertSeverity>(existingRule ? existingRule.severity : 'critical');
  const [channels, setChannels] = useState<AlertChannel[]>(existingRule ? existingRule.channels : ['in_app', 'aocc']);
  const [notes, setNotes] = useState<string>(existingRule?.notes ?? `Remediation SOP for ${kpi.code} threshold breach`);
  const [testTriggered, setTestTriggered] = useState<boolean | null>(null);

  // Re-sync if kpi changes
  useEffect(() => {
    const rules = getAlertsForKpi(kpi.code);
    if (rules.length > 0) {
      const r = rules[0];
      setEnabled(r.enabled);
      setCondition(r.condition);
      setWarningThreshold(r.warningThreshold);
      setCriticalThreshold(r.criticalThreshold);
      setVarianceThreshold(r.varianceThreshold ?? 5);
      setDataQualityThreshold(r.dataQualityThreshold ?? 90);
      setSeverity(r.severity);
      setChannels(r.channels);
      setNotes(r.notes ?? '');
    } else {
      setEnabled(true);
      setCondition(defaultCondition);
      setWarningThreshold(defaultWarning);
      setCriticalThreshold(defaultCritical);
      setVarianceThreshold(5);
      setDataQualityThreshold(90);
      setSeverity('critical');
      setChannels(['in_app', 'aocc']);
      setNotes(`Remediation SOP for ${kpi.code} threshold breach`);
    }
    setTestTriggered(null);
  }, [kpi.code]);

  // Current draft rule for live simulation
  const draftRule: KpiAlertRule = {
    id: existingRule ? existingRule.id : `alert-${kpi.code.toLowerCase()}`,
    kpiCode: kpi.code,
    kpiName: kpi.name,
    enabled,
    condition,
    warningThreshold,
    criticalThreshold,
    varianceThreshold,
    dataQualityThreshold,
    severity,
    channels,
    notes,
    createdAt: existingRule ? existingRule.createdAt : new Date().toISOString()
  };

  const evaluation = evaluateKpiAlert(kpi, draftRule);

  const handleToggleChannel = (chan: AlertChannel) => {
    setChannels(prev => 
      prev.includes(chan) ? prev.filter(c => c !== chan) : [...prev, chan]
    );
  };

  const handleSave = () => {
    saveAlertRule(draftRule);
    if (onSaved) onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (existingRule) {
      deleteAlertRule(existingRule.id);
    }
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                <span>{kpi.code}</span>
                <span aria-hidden="true">·</span>
                <span>{kpi.domain}</span>
                <span aria-hidden="true">·</span>
                <span>Polarity: {kpi.polarity}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Configure KPI Alert: {kpi.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Snapshot Ribbon */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Current Value</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{kpi.currentValue} {kpi.unit}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Governed Target</div>
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{kpi.target} {kpi.unit}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Period Variance</div>
            <div className={`text-sm font-bold ${kpi.changePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {kpi.changePct > 0 ? '+' : ''}{kpi.changePct}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Data Quality</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{kpi.dataQuality}% SLA</div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Active Toggle & Rule Severity */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Alert Monitoring Active</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {enabled ? 'Alert is actively evaluated on each simulated shift tick' : 'Alert rule is paused'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Severity:</span>
              {(['critical', 'warning', 'info'] as AlertSeverity[]).map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] transition-all ${
                    severity === sev 
                      ? sev === 'critical' 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : sev === 'warning' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Condition Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-600" />
              <span>Trigger Condition</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AlertCondition)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="below_threshold">Value Drops Below Threshold (&lt; Minimum Allowed)</option>
              <option value="above_threshold">Value Exceeds Threshold (&gt; Maximum Allowed)</option>
              <option value="variance_target">Period Variance Exceeds ±X%</option>
              <option value="status_red">Governed Status Turns RED (Breaching Target)</option>
              <option value="status_red_or_amber">Governed Status Turns RED or AMBER (Near Tolerance)</option>
              <option value="data_quality_below">Data Quality Falls Below Minimum SLA (%)</option>
            </select>
          </div>

          {/* Conditional Inputs based on selected Condition */}
          {(condition === 'below_threshold' || condition === 'above_threshold') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Warning Threshold ({kpi.unit})</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">Early Warning</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Triggers an operational amber notification</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Critical Threshold ({kpi.unit})</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-bold">Hard Breach</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Triggers critical AOCC escalation and dispatch</span>
              </div>
            </div>
          )}

          {condition === 'variance_target' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Maximum Allowed Period Variance (%)</span>
                <span className="text-[10px] font-mono text-cyan-600 font-bold">Current: {kpi.changePct}%</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={varianceThreshold}
                onChange={(e) => setVarianceThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">Alert triggers if period-over-period change absolute value exceeds this threshold</span>
            </div>
          )}

          {condition === 'data_quality_below' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Minimum Required Data Quality Score (%)</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Current: {kpi.dataQuality}%</span>
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="100"
                value={dataQualityThreshold}
                onChange={(e) => setDataQualityThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">Flags telemetry dropouts, missing airline feeds, or late DCS baggage logs</span>
            </div>
          )}

          {/* Notification Channels */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              <span>Dispatch Notification Channels</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'in_app' as AlertChannel, label: 'In-App Banner', desc: 'Card alert indicator' },
                { id: 'aocc' as AlertChannel, label: 'AOCC Stream', desc: 'Live tactical board' },
                { id: 'email' as AlertChannel, label: 'Email Dispatch', desc: 'Duty manager digest' },
                { id: 'webhook' as AlertChannel, label: 'Ops Webhook', desc: 'Teams / Slack alert' }
              ].map(ch => {
                const checked = channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleToggleChannel(ch.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      checked 
                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200 shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-[11px] flex items-center justify-between">
                      <span>{ch.label}</span>
                      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ch.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remediation SOP / Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-900 dark:text-slate-100">
              Remediation SOP / Action Plan Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Notify Apron Control, reroute baggage tugs to conveyor belt 4..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Real-Time Condition Evaluation Result Box */}
          <div className={`p-4 rounded-xl border transition-all ${
            evaluation.isTriggered 
              ? evaluation.severity === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              {evaluation.isTriggered ? (
                evaluation.severity === 'critical' ? (
                  <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>Real-Time Evaluation:</span>
                  <span className="uppercase font-mono text-[11px] px-2 py-0.5 rounded font-bold bg-white/80 dark:bg-black/40">
                    {evaluation.isTriggered ? `ALERT BREACHED (${evaluation.severity.toUpperCase()})` : 'NOMINAL (NO BREACH)'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {evaluation.isTriggered ? evaluation.message : `Current value (${kpi.currentValue} ${kpi.unit}) is comfortably within the configured ${condition.replace('_', ' ')} rule.`}
                </p>
              </div>
            </div>
          </div>

          {testTriggered !== null && (
            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Simulated alert test notification successfully sent to configured channels ({channels.join(', ')}).</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            {existingRule && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Alert Rule</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTestTriggered(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-cyan-600" />
              <span>Test Alert Trigger</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Alert Configuration</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
