import type { DashboardStats, RiskLevel, IndustryRiskForecast, FinanceApplication, RepaymentRecord } from "@/src/types";
import { store } from "@/src/data/store";
import { RiskForecastEngine } from "@/src/engine/RiskForecastEngine";

export type DashboardTimeRange = "month" | "quarter" | "year" | "all";

function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!isFinite(numerator) || !isFinite(denominator)) return fallback;
  if (denominator === 0) return fallback;
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

function safeNumber(n: number, fallback = 0): number {
  return isFinite(n) ? n : fallback;
}

function getRangeBoundaries(range: DashboardTimeRange): { start: Date; end: Date } {
  const now = new Date("2026-06-08");
  const end = new Date(now);

  let start = new Date(now);
  switch (range) {
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "all":
    default:
      start = new Date(2000, 0, 1);
      break;
  }
  return { start, end };
}

function isInRange(dateStr: string | undefined, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function getEffectiveDate(app: FinanceApplication): string | undefined {
  if (app.disbursedAt) return app.disbursedAt;
  if (app.createdAt) return app.createdAt;
  return undefined;
}

export async function getDashboardStats(range: DashboardTimeRange = "all"): Promise<DashboardStats> {
  const { start, end } = getRangeBoundaries(range);

  const [allApps, allScores, allRepay, allAlerts, enterprises] = await Promise.all([
    store.financeApplications.all(),
    store.creditScores.all(),
    store.repayments.all(),
    store.alertEvents.all(),
    store.enterprises.all(),
  ]);

  const disbursedAll = allApps.filter(
    (a) =>
      a.status === "disbursed" ||
      a.status === "overdue" ||
      a.status === "repaid" ||
      a.status === "write_off"
  );

  const disbursed = disbursedAll.filter((a) =>
    range === "all" ? true : isInRange(getEffectiveDate(a), start, end)
  );

  const totalCreditLimit = safeNumber(
    allScores.reduce((s, c) => s + safeNumber(c.creditLimit, 0), 0),
    0
  );

  const usedCreditLimit = safeNumber(
    disbursed
      .filter((a) => a.status === "disbursed")
      .reduce((s, a) => s + safeNumber(a.amount, 0), 0),
    0
  );

  const availableCreditLimit = Math.max(0, totalCreditLimit - usedCreditLimit);
  const creditUtilizationRate = safeDivide(usedCreditLimit, totalCreditLimit);

  let totalOutstanding = 0;
  let totalFinancingCount = 0;
  let overdueRate = 0;
  let nonPerformingRate = 0;
  let totalInterestIncome = 0;
  let industryDistribution: DashboardStats["industryDistribution"] = [];
  let monthlyTrend: DashboardStats["monthlyTrend"] = [];
  let riskDistribution: DashboardStats["riskDistribution"] = [
    { level: "low", count: 0, amount: 0 },
    { level: "medium", count: 0, amount: 0 },
    { level: "high", count: 0, amount: 0 },
    { level: "critical", count: 0, amount: 0 },
  ];

  if (disbursed.length > 0) {
    const outstandingApps = allApps.filter(
      (a) => a.status === "disbursed" || a.status === "overdue"
    );
    totalOutstanding = safeNumber(
      (range === "all"
        ? outstandingApps
        : outstandingApps.filter((a) => isInRange(getEffectiveDate(a), start, end))
      ).reduce((s, a) => s + safeNumber(a.amount, 0), 0),
      0
    );

    totalFinancingCount = disbursed.length;

    const filteredRepays =
      range === "all"
        ? allRepay
        : allRepay.filter((r) => isInRange(r.dueDate, start, end));
    const overdueRepays = filteredRepays.filter(
      (r) => r.status === "overdue" || r.status === "partial"
    );
    overdueRate = safeDivide(overdueRepays.length, filteredRepays.length);

    const writeOffCount = disbursed.filter((a) => a.status === "write_off").length;
    nonPerformingRate = safeDivide(writeOffCount, disbursed.length);

    totalInterestIncome = safeNumber(
      disbursed.reduce((s, a) => {
        const plan =
          a.financingPlans.find((p) => p.id === a.selectedPlanId) || a.financingPlans[0];
        return s + safeNumber(plan?.totalInterest || 0, 0);
      }, 0),
      0
    );

    const industryMap = new Map<string, { amount: number; count: number; overdue: number }>();
    disbursed.forEach((a) => {
      const ent = enterprises.find((e) => e.id === a.supplierId);
      const ind = ent
        ? RiskForecastEngine.resolveIndustry(ent.industry || ent.name)
        : "其他";
      const cur = industryMap.get(ind) || { amount: 0, count: 0, overdue: 0 };
      cur.amount += safeNumber(a.amount, 0);
      cur.count += 1;
      if (a.status === "overdue" || a.status === "write_off") cur.overdue += 1;
      industryMap.set(ind, cur);
    });
    industryDistribution = Array.from(industryMap.entries()).map(([industry, v]) => ({
      industry,
      amount: safeNumber(v.amount, 0),
      overdueRate: safeDivide(v.overdue, v.count),
    }));

    const monthlyMap = new Map<
      string,
      { disbursed: number; repaid: number; overdue: number }
    >();
    disbursed.forEach((a) => {
      if (a.disbursedAt) {
        const d = new Date(a.disbursedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const cur = monthlyMap.get(key) || { disbursed: 0, repaid: 0, overdue: 0 };
        cur.disbursed += safeNumber(a.amount, 0);
        if (a.status === "repaid") cur.repaid += safeNumber(a.amount, 0);
        if (a.status === "overdue" || a.status === "write_off")
          cur.overdue += safeNumber(a.amount, 0);
        monthlyMap.set(key, cur);
      }
    });
    monthlyTrend = Array.from(monthlyMap.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-12)
      .map(([month, v]) => ({
        month,
        disbursed: safeNumber(v.disbursed, 0),
        repaid: safeNumber(v.repaid, 0),
        overdue: safeNumber(v.overdue, 0),
      }));

    const riskCount: Record<RiskLevel, { count: number; amount: number }> = {
      low: { count: 0, amount: 0 },
      medium: { count: 0, amount: 0 },
      high: { count: 0, amount: 0 },
      critical: { count: 0, amount: 0 },
    };
    disbursed.forEach((a) => {
      riskCount[a.riskLevel].count += 1;
      riskCount[a.riskLevel].amount += safeNumber(a.amount, 0);
    });
    riskDistribution = (Object.keys(riskCount) as RiskLevel[]).map((level) => ({
      level,
      count: riskCount[level].count,
      amount: safeNumber(riskCount[level].amount, 0),
    }));
  }

  const activeAlerts = allAlerts
    .filter((a) => a.status === "new" || a.status === "processing")
    .filter((a) => (range === "all" ? true : isInRange(a.triggeredAt, start, end)))
    .sort((a, b) => (a.triggeredAt < b.triggeredAt ? 1 : -1))
    .slice(0, 10);

  return {
    totalOutstanding: safeNumber(totalOutstanding, 0),
    totalFinancingCount,
    creditUtilizationRate: Math.round(safeNumber(creditUtilizationRate, 0) * 10000) / 10000,
    totalCreditLimit: safeNumber(totalCreditLimit, 0),
    usedCreditLimit: safeNumber(usedCreditLimit, 0),
    availableCreditLimit: safeNumber(availableCreditLimit, 0),
    overdueRate: Math.round(safeNumber(overdueRate, 0) * 10000) / 10000,
    nonPerformingRate: Math.round(safeNumber(nonPerformingRate, 0) * 10000) / 10000,
    totalInterestIncome: safeNumber(totalInterestIncome, 0),
    industryDistribution,
    monthlyTrend,
    riskDistribution,
    alerts: activeAlerts,
  };
}

export async function getRiskForecast(): Promise<IndustryRiskForecast[]> {
  const industries = Object.keys(RiskForecastEngine.baseScores);
  const results: IndustryRiskForecast[] = [];
  for (const ind of industries) {
    results.push(RiskForecastEngine.quickForecast(ind));
  }
  return results;
}

export const DashboardService = {
  stats: (range?: DashboardTimeRange) => getDashboardStats(range),
  getStats: (range?: DashboardTimeRange) => getDashboardStats(range),
  riskForecast: getRiskForecast,
  getRiskForecast,
};

export default DashboardService;
