import { KpiAlertRule, KpiAlertEvaluationResult } from '../types/alert';
import { KpiValueResult } from '../types';

const STORAGE_KEY = 'aionos_kpi_alerts_v1';

const INITIAL_ALERTS: KpiAlertRule[] = [
  {
    id: 'alert-pun-01',
    kpiCode: 'PUN-01',
    kpiName: 'On-Time Departure Rate (OTP-15)',
    enabled: true,
    condition: 'below_threshold',
    warningThreshold: 85,
    criticalThreshold: 78,
    varianceThreshold: 5,
    dataQualityThreshold: 90,
    severity: 'critical',
    channels: ['in_app', 'aocc'],
    notes: 'Escalate to AOCC Duty Manager and Apron Control when OTP falls below 85%',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-bag-01',
    kpiCode: 'BAG-01',
    kpiName: 'First Bag Delivery Time (On-Chocks to Reclaim)',
    enabled: true,
    condition: 'above_threshold',
    warningThreshold: 12,
    criticalThreshold: 15,
    varianceThreshold: 10,
    dataQualityThreshold: 92,
    severity: 'warning',
    channels: ['in_app', 'aocc'],
    notes: 'Baggage make-up belt delay alert to ground handler duty supervisors',
    createdAt: new Date().toISOString()
  },
  {
    id: 'alert-pax-01',
    kpiCode: 'PAX-01',
    kpiName: 'Security Checkpoint Queue Wait Time (P90)',
    enabled: true,
    condition: 'above_threshold',
    warningThreshold: 10,
    criticalThreshold: 15,
    varianceThreshold: 15,
    dataQualityThreshold: 90,
    severity: 'warning',
    channels: ['in_app'],
    notes: 'Queue overflow alert: request additional CISF / screening lanes opening',
    createdAt: new Date().toISOString()
  }
];

export function getStoredAlertRules(): KpiAlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ALERTS;
  } catch {
    return INITIAL_ALERTS;
  }
}

export function saveAlertRule(rule: KpiAlertRule): KpiAlertRule[] {
  const current = getStoredAlertRules();
  const existingIdx = current.findIndex(r => r.id === rule.id || r.kpiCode === rule.kpiCode);
  
  let updated: KpiAlertRule[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...rule };
  } else {
    updated = [rule, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('aionos_alerts_updated'));
  } catch (err) {
    console.error('Failed to save alert rule:', err);
  }

  return updated;
}

export function deleteAlertRule(ruleId: string): KpiAlertRule[] {
  const current = getStoredAlertRules();
  const updated = current.filter(r => r.id !== ruleId && r.kpiCode !== ruleId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('aionos_alerts_updated'));
  } catch (err) {
    console.error('Failed to delete alert rule:', err);
  }
  return updated;
}

export function getAlertsForKpi(kpiCode: string): KpiAlertRule[] {
  const rules = getStoredAlertRules();
  return rules.filter(r => r.kpiCode === kpiCode);
}

export function evaluateKpiAlert(kpi: KpiValueResult, rule: KpiAlertRule): KpiAlertEvaluationResult {
  if (!rule.enabled) {
    return {
      rule,
      isTriggered: false,
      severity: rule.severity,
      message: 'Alert rule disabled'
    };
  }

  const val = kpi.currentValue;
  let isTriggered = false;
  let triggeredSeverity = rule.severity;
  let message = '';

  switch (rule.condition) {
    case 'below_threshold':
      if (val <= rule.criticalThreshold) {
        isTriggered = true;
        triggeredSeverity = 'critical';
        message = `Current value ${val} ${kpi.unit} is at or below critical limit (${rule.criticalThreshold} ${kpi.unit})`;
      } else if (val <= rule.warningThreshold) {
        isTriggered = true;
        triggeredSeverity = 'warning';
        message = `Current value ${val} ${kpi.unit} is below warning limit (${rule.warningThreshold} ${kpi.unit})`;
      }
      break;

    case 'above_threshold':
      if (val >= rule.criticalThreshold) {
        isTriggered = true;
        triggeredSeverity = 'critical';
        message = `Current value ${val} ${kpi.unit} exceeds critical limit (${rule.criticalThreshold} ${kpi.unit})`;
      } else if (val >= rule.warningThreshold) {
        isTriggered = true;
        triggeredSeverity = 'warning';
        message = `Current value ${val} ${kpi.unit} exceeds warning limit (${rule.warningThreshold} ${kpi.unit})`;
      }
      break;

    case 'variance_target': {
      const varPct = Math.abs(kpi.changePct);
      const threshold = rule.varianceThreshold ?? 5;
      if (varPct >= threshold) {
        isTriggered = true;
        triggeredSeverity = varPct >= threshold * 2 ? 'critical' : 'warning';
        message = `Period variance ${kpi.changePct}% exceeds allowed variance limit (±${threshold}%)`;
      }
      break;
    }

    case 'status_red':
      if (kpi.status === 'red') {
        isTriggered = true;
        triggeredSeverity = 'critical';
        message = `Governed status is RED (Breaching operational tolerance)`;
      }
      break;

    case 'status_red_or_amber':
      if (kpi.status === 'red' || kpi.status === 'amber') {
        isTriggered = true;
        triggeredSeverity = kpi.status === 'red' ? 'critical' : 'warning';
        message = `Governed status is ${kpi.status.toUpperCase()} (${kpi.status === 'red' ? 'Breaching' : 'Near Tolerance'})`;
      }
      break;

    case 'data_quality_below': {
      const dqLimit = rule.dataQualityThreshold ?? 90;
      if (kpi.dataQuality < dqLimit) {
        isTriggered = true;
        triggeredSeverity = kpi.dataQuality < dqLimit - 10 ? 'critical' : 'warning';
        message = `Data Quality Score ${kpi.dataQuality}% is below SLA minimum of ${dqLimit}%`;
      }
      break;
    }
  }

  return {
    rule,
    isTriggered,
    severity: triggeredSeverity,
    message
  };
}

export function evaluateAllAlertsForKpi(kpi: KpiValueResult, rules?: KpiAlertRule[]) {
  const kpiRules = rules ?? getAlertsForKpi(kpi.code);
  const evaluations = kpiRules.map(r => evaluateKpiAlert(kpi, r));
  const activeTriggered = evaluations.filter(e => e.isTriggered);

  const hasCritical = activeTriggered.some(e => e.severity === 'critical');
  const hasWarning = activeTriggered.some(e => e.severity === 'warning');

  return {
    hasRules: kpiRules.length > 0,
    rules: kpiRules,
    evaluations,
    activeTriggered,
    isTriggered: activeTriggered.length > 0,
    highestSeverity: hasCritical ? 'critical' : hasWarning ? 'warning' : activeTriggered.length > 0 ? 'info' : null,
    primaryMessage: activeTriggered.length > 0 ? activeTriggered[0].message : null
  };
}
