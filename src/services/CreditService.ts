import type { CreditScore, IndustryRiskForecast } from "@/src/types";
import { store } from "@/src/data/store";
import { CreditEngine, type CreditInput } from "@/src/engine/CreditEngine";
import { RiskForecastEngine, type IndustryInput } from "@/src/engine/RiskForecastEngine";

export async function getCreditScoreBySupplier(supplierId: string): Promise<CreditScore | undefined> {
  return store.creditScores.getBySupplier(supplierId);
}

export async function getAllCreditScores(): Promise<CreditScore[]> {
  return store.creditScores.all();
}

export async function refreshCreditScore(supplierId: string): Promise<CreditScore | undefined> {
  const enterprise = await store.enterprises.get(supplierId);
  const sellerName = enterprise?.name || "";

  const [bindings, orders, allInvoices, allMetrics, collections] = await Promise.all([
    store.supplierBindings.filter((b) => b.supplierId === supplierId && b.status === "active"),
    store.orders.filter((o) => o.supplierId === supplierId),
    store.invoices.all(),
    store.monitoringMetrics.filter((m) => m.supplierId === supplierId),
    store.collections.filter((c) => c.supplierId === supplierId),
  ]);

  const invoices = allInvoices.filter((i) => i.seller === sellerName);
  if (!enterprise) return undefined;

  const annualVolume = bindings.reduce((s, b) => s + b.annualTransactionVolume, 0);
  const cooperationMonths = bindings.length
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(bindings[0].cooperationSince).getTime()) / (30 * 24 * 3600 * 1000)
        )
      )
    : 6;
  const overdueCount = collections.filter((c) => c.status !== "closed" && c.status !== "written_off").length;
  const industryName = RiskForecastEngine.resolveIndustry(enterprise.industry || enterprise.name);
  const industryBase = RiskForecastEngine.baseScores[industryName] ?? 70;

  const input: CreditInput = {
    supplierId,
    annualTransactionVolume: annualVolume,
    orders,
    invoices,
    metrics: allMetrics.sort((a, b) => (a.date < b.date ? 1 : -1)),
    industryBaseScore: industryBase,
    cooperationMonths,
    overdueCount,
    complianceIssues: 0,
  };

  const newScore = CreditEngine.calculate(input);
  const existing = await store.creditScores.getBySupplier(supplierId);
  if (existing) {
    const updated = await store.creditScores.update(existing.id, newScore);
    return updated;
  }
  return store.creditScores.create(newScore);
}

export async function forecastIndustryRisk(industry: string): Promise<IndustryRiskForecast> {
  const enterprises = await store.enterprises.filter(
    (e) => RiskForecastEngine.resolveIndustry(e.industry || e.name) === industry
  );
  const supplierIds = enterprises.filter((e) => e.role === "supplier").map((e) => e.id);

  const [allOrders, allMetrics, allApps, allRepayRaw] = await Promise.all([
    store.orders.filter((o) => supplierIds.includes(o.supplierId)),
    store.monitoringMetrics.filter((m) => supplierIds.includes(m.supplierId)),
    store.financeApplications.filter((a) => supplierIds.includes(a.supplierId)),
    store.repayments.all(),
  ]);
  const appIdToSupplier = new Map(allApps.map((a) => [a.id, a.supplierId]));
  const allRepay = allRepayRaw.filter((r) => {
    const sid = appIdToSupplier.get(r.financeApplicationId);
    return sid ? supplierIds.includes(sid) : false;
  });

  const totalOutstanding = allApps
    .filter((a) => a.status === "disbursed" || a.status === "overdue")
    .reduce((s, a) => s + a.amount, 0);
  const avgReturnRate = allMetrics.length
    ? allMetrics.reduce((s, m) => s + m.returnRate, 0) / allMetrics.length
    : 0.03;
  const overdueCount = allRepay.filter((r) => r.status === "overdue" || r.status === "partial").length;
  const avgOverdueRate = allRepay.length ? overdueCount / allRepay.length : 0.02;
  const nonPerforming = allApps.filter((a) => a.status === "write_off").length;
  const nonPerformingRate = allApps.length ? nonPerforming / allApps.length : 0.01;

  const recentOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate).getTime();
    return Date.now() - d < 90 * 24 * 3600 * 1000;
  }).length;
  const priorOrders = allOrders.filter((o) => {
    const d = new Date(o.orderDate).getTime();
    const diff = Date.now() - d;
    return diff >= 90 * 24 * 3600 * 1000 && diff < 180 * 24 * 3600 * 1000;
  }).length;
  const avgOrderGrowth = priorOrders ? (recentOrders - priorOrders) / priorOrders : 0.05;

  const input: IndustryInput = {
    industry,
    currentMetrics: {
      avgOrderGrowth,
      avgReturnRate,
      avgOverdueRate,
      financingCount: allApps.length,
      totalOutstanding,
      nonPerformingRate,
    },
    macroFactors: [],
  };

  return RiskForecastEngine.forecast(input);
}

export async function getIndustryForecasts(): Promise<IndustryRiskForecast[]> {
  const industries = Array.from(
    new Set(Object.values(RiskForecastEngine.baseScores).map(() => "").map((_, i, arr) => Object.keys(RiskForecastEngine.baseScores)[i]))
  );
  const results = await Promise.all(industries.map((ind) => forecastIndustryRisk(ind)));
  return results;
}

export async function adjustCreditLimit(supplierId: string, delta: number): Promise<CreditScore | undefined> {
  const existing = await store.creditScores.getBySupplier(supplierId);
  if (!existing) return undefined;
  const newLimit = Math.max(0, existing.creditLimit + delta);
  const newAvailable = Math.min(existing.availableLimit + delta, newLimit);
  return store.creditScores.update(existing.id, {
    creditLimit: newLimit,
    availableLimit: Math.max(0, newAvailable),
  });
}

export const CreditService = {
  getBySupplier: getCreditScoreBySupplier,
  all: getAllCreditScores,
  refresh: refreshCreditScore,
  forecastIndustry: forecastIndustryRisk,
  industryForecasts: getIndustryForecasts,
  adjustLimit: adjustCreditLimit,
};

export default CreditService;
