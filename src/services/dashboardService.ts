import type { DashboardStats, RiskLevel, IndustryRiskForecast } from "@/src/types";
import { store } from "@/src/data/store";
import { RiskForecastEngine } from "@/src/engine/RiskForecastEngine";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [allApps, allScores, allRepay, allAlerts, enterprises] = await Promise.all([
    store.financeApplications.all(),
    store.creditScores.all(),
    store.repayments.all(),
    store.alertEvents.all(),
    store.enterprises.all(),
  ]);

  const disbursed = allApps.filter(
    (a) =>
      a.status === "disbursed" ||
      a.status === "overdue" ||
      a.status === "repaid" ||
      a.status === "write_off"
  );
  const totalOutstanding = allApps
    .filter((a) => a.status === "disbursed" || a.status === "overdue")
    .reduce((s, a) => s + a.amount, 0);
  const totalFinancingCount = disbursed.length;

  const totalLimit = allScores.reduce((s, c) => s + c.creditLimit, 0);
  const usedLimit = allScores.reduce((s, c) => s + (c.creditLimit - c.availableLimit), 0);
  const creditUtilizationRate = totalLimit ? usedLimit / totalLimit : 0;

  const overdueRepays = allRepay.filter((r) => r.status === "overdue" || r.status === "partial");
  const overdueRate = allRepay.length ? overdueRepays.length / allRepay.length : 0;

  const writeOffCount = allApps.filter((a) => a.status === "write_off").length;
  const nonPerformingRate = disbursed.length ? writeOffCount / disbursed.length : 0;

  const totalInterestIncome = disbursed.reduce((s, a) => {
    const plan =
      a.financingPlans.find((p) => p.id === a.selectedPlanId) || a.financingPlans[0];
    return s + (plan?.totalInterest || 0);
  }, 0);

  const industryMap = new Map<string, { amount: number; count: number; overdue: number }>();
  disbursed.forEach((a) => {
    const ent = enterprises.find((e) => e.id === a.supplierId);
    const ind = ent
      ? RiskForecastEngine.resolveIndustry(ent.industry || ent.name)
      : "其他";
    const cur = industryMap.get(ind) || { amount: 0, count: 0, overdue: 0 };
    cur.amount += a.amount;
    cur.count += 1;
    if (a.status === "overdue" || a.status === "write_off") cur.overdue += 1;
    industryMap.set(ind, cur);
  });
  const industryDistribution = Array.from(industryMap.entries()).map(([industry, v]) => ({
    industry,
    amount: v.amount,
    overdueRate: v.count ? v.overdue / v.count : 0,
  }));

  const monthlyMap = new Map<string, { disbursed: number; repaid: number; overdue: number }>();
  disbursed.forEach((a) => {
    if (a.disbursedAt) {
      const d = new Date(a.disbursedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = monthlyMap.get(key) || { disbursed: 0, repaid: 0, overdue: 0 };
      cur.disbursed += a.amount;
      if (a.status === "repaid") cur.repaid += a.amount;
      if (a.status === "overdue" || a.status === "write_off") cur.overdue += a.amount;
      monthlyMap.set(key, cur);
    }
  });
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-6)
    .map(([month, v]) => ({
      month,
      disbursed: v.disbursed,
      repaid: v.repaid,
      overdue: v.overdue,
    }));

  const riskCount: Record<RiskLevel, { count: number; amount: number }> = {
    low: { count: 0, amount: 0 },
    medium: { count: 0, amount: 0 },
    high: { count: 0, amount: 0 },
    critical: { count: 0, amount: 0 },
  };
  disbursed.forEach((a) => {
    riskCount[a.riskLevel].count += 1;
    riskCount[a.riskLevel].amount += a.amount;
  });
  const riskDistribution: DashboardStats["riskDistribution"] = (
    Object.keys(riskCount) as RiskLevel[]
  ).map((level) => ({
    level,
    count: riskCount[level].count,
    amount: riskCount[level].amount,
  }));

  const activeAlerts = allAlerts
    .filter((a) => a.status === "new" || a.status === "processing")
    .sort((a, b) => (a.triggeredAt < b.triggeredAt ? 1 : -1))
    .slice(0, 10);

  return {
    totalOutstanding,
    totalFinancingCount,
    creditUtilizationRate: Math.round(creditUtilizationRate * 10000) / 10000,
    overdueRate: Math.round(overdueRate * 10000) / 10000,
    nonPerformingRate: Math.round(nonPerformingRate * 10000) / 10000,
    totalInterestIncome,
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
  stats: getDashboardStats,
  getStats: getDashboardStats,
  riskForecast: getRiskForecast,
  getRiskForecast,
};

export default DashboardService;
