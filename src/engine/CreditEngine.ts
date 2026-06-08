import type { CreditScore, RiskLevel, TransactionOrder, MonitoringMetrics, Invoice } from "@/src/types";

export interface CreditInput {
  supplierId: string;
  annualTransactionVolume: number;
  orders: TransactionOrder[];
  invoices: Invoice[];
  metrics: MonitoringMetrics[];
  industryBaseScore: number;
  cooperationMonths: number;
  overdueCount: number;
  complianceIssues: number;
}

const WEIGHTS = {
  transactionHistory: 0.3,
  financialHealth: 0.25,
  operationStability: 0.2,
  industryEnvironment: 0.15,
  compliance: 0.1,
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "critical";
}

function evaluateTransaction(
  annualVolume: number,
  orders: TransactionOrder[],
  cooperationMonths: number
): number {
  let score = 60;
  const volumeTier =
    annualVolume >= 100000000 ? 25 : annualVolume >= 50000000 ? 20 : annualVolume >= 20000000 ? 15 : 10;
  score += volumeTier;

  const completedRate =
    orders.length > 0 ? orders.filter((o) => o.status === "completed").length / orders.length : 0;
  score += completedRate * 15;

  if (cooperationMonths >= 24) score += 5;
  else if (cooperationMonths >= 12) score += 3;

  return clampScore(score);
}

function evaluateFinancial(
  orders: TransactionOrder[],
  invoices: Invoice[],
  metrics: MonitoringMetrics[]
): number {
  let score = 60;

  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
  const avgOrder = orders.length > 0 ? totalAmount / orders.length : 0;
  if (avgOrder >= 1000000) score += 15;
  else if (avgOrder >= 500000) score += 10;
  else if (avgOrder >= 100000) score += 5;

  const verifiedRate =
    invoices.length > 0 ? invoices.filter((i) => i.verified).length / invoices.length : 1;
  score += verifiedRate * 15;

  if (metrics.length > 0) {
    const avgOutstanding = metrics.reduce((s, m) => s + m.totalOutstanding, 0) / metrics.length;
    const utilization = annualVolumeLimit(avgOutstanding, totalAmount);
    if (utilization < 0.3) score += 10;
    else if (utilization < 0.5) score += 5;
    else if (utilization > 0.8) score -= 10;
  }

  return clampScore(score);
}

function annualVolumeLimit(outstanding: number, annual: number): number {
  if (annual === 0) return 0;
  return Math.min(2, outstanding / (annual / 12));
}

function evaluateOperation(metrics: MonitoringMetrics[]): number {
  let score = 70;
  if (metrics.length === 0) return score;

  const recent = metrics.slice(0, Math.min(30, metrics.length));
  const avgReturnRate = recent.reduce((s, m) => s + m.returnRate, 0) / recent.length;
  const avgOrderMom = recent.reduce((s, m) => s + m.orderVolumeMom, 0) / recent.length;
  const avgCycle = recent.reduce((s, m) => s + m.paymentCycleDays, 0) / recent.length;

  if (avgReturnRate < 0.02) score += 15;
  else if (avgReturnRate < 0.05) score += 8;
  else if (avgReturnRate > 0.1) score -= 15;

  if (avgOrderMom > 0.1) score += 10;
  else if (avgOrderMom > 0) score += 5;
  else if (avgOrderMom < -0.2) score -= 10;

  if (avgCycle < 30) score += 5;
  else if (avgCycle > 60) score -= 10;

  return clampScore(score);
}

function evaluateIndustry(industryBase: number): number {
  return clampScore(industryBase);
}

function evaluateCompliance(overdueCount: number, issues: number): number {
  let score = 85;
  score -= overdueCount * 8;
  score -= issues * 12;
  return clampScore(score);
}

export function calculateCreditScore(input: CreditInput): CreditScore {
  const {
    supplierId,
    annualTransactionVolume,
    orders,
    invoices,
    metrics,
    industryBaseScore,
    cooperationMonths,
    overdueCount,
    complianceIssues,
  } = input;

  const factors = {
    transactionHistory: evaluateTransaction(annualTransactionVolume, orders, cooperationMonths),
    financialHealth: evaluateFinancial(orders, invoices, metrics),
    operationStability: evaluateOperation(metrics),
    industryEnvironment: evaluateIndustry(industryBaseScore),
    compliance: evaluateCompliance(overdueCount, complianceIssues),
  };

  const overallScore = clampScore(
    factors.transactionHistory * WEIGHTS.transactionHistory +
      factors.financialHealth * WEIGHTS.financialHealth +
      factors.operationStability * WEIGHTS.operationStability +
      factors.industryEnvironment * WEIGHTS.industryEnvironment +
      factors.compliance * WEIGHTS.compliance
  );

  const creditLimit = Math.round(
    (overallScore / 100) * Math.min(annualTransactionVolume * 0.3, 50000000)
  );

  const history: CreditScore["history"] = [];
  for (let m = 11; m >= 0; m--) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    date.setDate(1);
    const variance = Math.floor(Math.random() * 10) - 5;
    history.push({
      date: date.toISOString(),
      score: clampScore(overallScore + variance),
    });
  }
  const lastScore = history[history.length - 2]?.score ?? overallScore;

  return {
    id: `cs_${supplierId}_${Date.now()}`,
    supplierId,
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    creditLimit,
    availableLimit: creditLimit,
    factors,
    evaluationDate: new Date().toISOString(),
    trend: overallScore > lastScore ? "up" : overallScore < lastScore ? "down" : "stable",
    history,
  };
}

export const CreditEngine = {
  calculate: calculateCreditScore,
  WEIGHTS,
};

export default CreditEngine;
