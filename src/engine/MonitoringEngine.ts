import type { AlertEvent, AlertType, MonitoringMetrics, RiskLevel } from "@/src/types";

export interface MonitorThresholds {
  orderDropThreshold: number;
  returnSpikeThreshold: number;
  paymentCycleThreshold: number;
  abnormalBehaviorThreshold: number;
}

export const DEFAULT_THRESHOLDS: MonitorThresholds = {
  orderDropThreshold: -0.2,
  returnSpikeThreshold: 0.05,
  paymentCycleThreshold: 45,
  abnormalBehaviorThreshold: 3,
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function detectOrderDrop(metrics: MonitoringMetrics[]): { triggered: boolean; value: number } {
  if (metrics.length < 14) return { triggered: false, value: 0 };
  const recent = metrics.slice(0, 7);
  const prior = metrics.slice(7, 14);
  const recentAvg = avg(recent.map((m) => m.orderVolume));
  const priorAvg = avg(prior.map((m) => m.orderVolume));
  if (priorAvg === 0) return { triggered: false, value: 0 };
  const change = (recentAvg - priorAvg) / priorAvg;
  return { triggered: change <= DEFAULT_THRESHOLDS.orderDropThreshold, value: change };
}

function detectReturnSpike(metrics: MonitoringMetrics[]): { triggered: boolean; value: number } {
  if (metrics.length < 7) return { triggered: false, value: 0 };
  const recent = metrics.slice(0, 7);
  const rate = avg(recent.map((m) => m.returnRate));
  return { triggered: rate >= DEFAULT_THRESHOLDS.returnSpikeThreshold, value: rate };
}

function detectPaymentDelay(metrics: MonitoringMetrics[]): { triggered: boolean; value: number } {
  if (metrics.length < 7) return { triggered: false, value: 0 };
  const recent = metrics.slice(0, 7);
  const cycle = avg(recent.map((m) => m.paymentCycleDays));
  return { triggered: cycle >= DEFAULT_THRESHOLDS.paymentCycleThreshold, value: cycle };
}

function detectAbnormalBehavior(
  metrics: MonitoringMetrics[],
  recentAlerts: AlertEvent[]
): { triggered: boolean; value: number } {
  const count = recentAlerts.length;
  return { triggered: count >= DEFAULT_THRESHOLDS.abnormalBehaviorThreshold, value: count };
}

function determineRiskLevel(
  type: AlertType,
  value: number,
  threshold: number
): RiskLevel {
  const ratio =
    type === "order_drop"
      ? Math.abs(value) / Math.max(0.0001, Math.abs(threshold))
      : type === "payment_delay"
      ? value / threshold
      : type === "return_spike"
      ? value / Math.max(0.0001, threshold)
      : value / threshold;

  if (ratio >= 2) return "critical";
  if (ratio >= 1.3) return "high";
  if (ratio >= 1) return "medium";
  return "low";
}

const ALERT_TEMPLATES: Record<AlertType, (value: number, threshold: number) => { title: string; description: string }> = {
  order_drop: (value, threshold) => ({
    title: `近7日订单量环比下降${Math.round(Math.abs(value) * 100)}%`,
    description: `订单量下降超过预警阈值${Math.round(Math.abs(threshold) * 100)}%，需关注供应商经营稳定性及核心客户变动情况。`,
  }),
  return_spike: (value, threshold) => ({
    title: `近7日平均退货率达${Math.round(value * 10000) / 100}%`,
    description: `退货率已超过阈值${Math.round(threshold * 10000) / 100}%，可能存在产品质量下滑或交付异常。`,
  }),
  payment_delay: (value, threshold) => ({
    title: `平均回款周期延长至${Math.round(value)}天`,
    description: `回款周期已超过阈值${threshold}天，供应商现金流承压，需关注其还款能力。`,
  }),
  abnormal_behavior: (value, threshold) => ({
    title: `近30日异常事件累计${value}次`,
    description: `异常事件数超过阈值${threshold}次，经营行为存在不稳定性，建议人工复核。`,
  }),
};

export function runMonitoringScan(
  supplierId: string,
  metrics: MonitoringMetrics[],
  existingAlerts: AlertEvent[]
): AlertEvent[] {
  const newAlerts: AlertEvent[] = [];
  const now = new Date().toISOString();
  const recentAlerts = existingAlerts.filter(
    (a) =>
      a.supplierId === supplierId &&
      a.status !== "resolved" &&
      a.status !== "false_alarm"
  );
  const activeTypes = new Set(recentAlerts.map((a) => a.type));

  const orderDrop = detectOrderDrop(metrics);
  if (orderDrop.triggered && !activeTypes.has("order_drop")) {
    const tpl = ALERT_TEMPLATES.order_drop(orderDrop.value, DEFAULT_THRESHOLDS.orderDropThreshold);
    newAlerts.push({
      id: `alert_${Date.now()}_od_${supplierId}`,
      supplierId,
      type: "order_drop",
      level: determineRiskLevel("order_drop", orderDrop.value, DEFAULT_THRESHOLDS.orderDropThreshold),
      title: tpl.title,
      description: tpl.description,
      metricValue: Math.round(orderDrop.value * 10000) / 10000,
      threshold: Math.abs(DEFAULT_THRESHOLDS.orderDropThreshold),
      triggeredAt: now,
      status: "new",
    });
  }

  const returnSpike = detectReturnSpike(metrics);
  if (returnSpike.triggered && !activeTypes.has("return_spike")) {
    const tpl = ALERT_TEMPLATES.return_spike(returnSpike.value, DEFAULT_THRESHOLDS.returnSpikeThreshold);
    newAlerts.push({
      id: `alert_${Date.now()}_rs_${supplierId}`,
      supplierId,
      type: "return_spike",
      level: determineRiskLevel("return_spike", returnSpike.value, DEFAULT_THRESHOLDS.returnSpikeThreshold),
      title: tpl.title,
      description: tpl.description,
      metricValue: Math.round(returnSpike.value * 10000) / 10000,
      threshold: DEFAULT_THRESHOLDS.returnSpikeThreshold,
      triggeredAt: now,
      status: "new",
    });
  }

  const paymentDelay = detectPaymentDelay(metrics);
  if (paymentDelay.triggered && !activeTypes.has("payment_delay")) {
    const tpl = ALERT_TEMPLATES.payment_delay(paymentDelay.value, DEFAULT_THRESHOLDS.paymentCycleThreshold);
    newAlerts.push({
      id: `alert_${Date.now()}_pd_${supplierId}`,
      supplierId,
      type: "payment_delay",
      level: determineRiskLevel("payment_delay", paymentDelay.value, DEFAULT_THRESHOLDS.paymentCycleThreshold),
      title: tpl.title,
      description: tpl.description,
      metricValue: Math.round(paymentDelay.value),
      threshold: DEFAULT_THRESHOLDS.paymentCycleThreshold,
      triggeredAt: now,
      status: "new",
    });
  }

  const abnormal = detectAbnormalBehavior(metrics, recentAlerts);
  if (abnormal.triggered && !activeTypes.has("abnormal_behavior")) {
    const tpl = ALERT_TEMPLATES.abnormal_behavior(abnormal.value, DEFAULT_THRESHOLDS.abnormalBehaviorThreshold);
    newAlerts.push({
      id: `alert_${Date.now()}_ab_${supplierId}`,
      supplierId,
      type: "abnormal_behavior",
      level: determineRiskLevel("abnormal_behavior", abnormal.value, DEFAULT_THRESHOLDS.abnormalBehaviorThreshold),
      title: tpl.title,
      description: tpl.description,
      metricValue: abnormal.value,
      threshold: DEFAULT_THRESHOLDS.abnormalBehaviorThreshold,
      triggeredAt: now,
      status: "new",
    });
  }

  return newAlerts;
}

export function computeAlertImpactCreditAdjustment(alert: AlertEvent): number {
  const baseAdjust = { low: -3, medium: -6, high: -10, critical: -15 } as const;
  return baseAdjust[alert.level] ?? 0;
}

export const MonitoringEngine = {
  scan: runMonitoringScan,
  thresholds: DEFAULT_THRESHOLDS,
  computeCreditAdjustment: computeAlertImpactCreditAdjustment,
};

export default MonitoringEngine;
