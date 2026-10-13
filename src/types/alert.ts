export type AlertCondition = 
  | 'below_threshold' 
  | 'above_threshold' 
  | 'variance_target' 
  | 'status_red' 
  | 'status_red_or_amber' 
  | 'data_quality_below';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertChannel = 'in_app' | 'aocc' | 'email' | 'webhook';

export interface KpiAlertRule {
  id: string;
  kpiCode: string;
  kpiName: string;
  enabled: boolean;
  condition: AlertCondition;
  warningThreshold: number;
  criticalThreshold: number;
  varianceThreshold?: number; // e.g. 5%
  dataQualityThreshold?: number; // e.g. 90%
  severity: AlertSeverity;
  channels: AlertChannel[];
  notes?: string;
  createdAt: string;
  lastEvaluated?: string;
  isTriggered?: boolean;
  triggeredMessage?: string;
}

export interface KpiAlertEvaluationResult {
  rule: KpiAlertRule;
  isTriggered: boolean;
  severity: AlertSeverity;
  message: string;
}
