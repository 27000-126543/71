import type { MonthlyReport } from "@/src/types";
import { store } from "@/src/data/store";
import { RiskForecastEngine } from "@/src/engine/RiskForecastEngine";

function formatMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function generateMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const monthKey = formatMonth(start);

  const [allApps, allWorkflows, enterprises] = await Promise.all([
    store.financeApplications.all(),
    store.approvalWorkflows.all(),
    store.enterprises.all(),
  ]);

  const inMonthApps = allApps.filter((a) => {
    const t = new Date(a.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  const totalFinancingCount = inMonthApps.filter(
    (a) => a.status !== "draft" && a.status !== "rejected"
  ).length;
  const totalFinancingAmount = inMonthApps
    .filter((a) => a.status !== "draft" && a.status !== "rejected")
    .reduce((s, a) => s + a.amount, 0);

  const totalInterestIncome = inMonthApps
    .filter((a) => a.status !== "draft" && a.status !== "rejected")
    .reduce((s, a) => {
      const plan = a.financingPlans.find((p) => p.id === a.selectedPlanId) || a.financingPlans[0];
      return s + (plan?.totalInterest || 0);
    }, 0);

  const approvedWorkflows = allWorkflows.filter((w) => {
    if (!w.createdAt || !w.completedAt) return false;
    const t = new Date(w.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime() && w.status === "approved";
  });
  const avgApprovalHours = approvedWorkflows.length
    ? approvedWorkflows.reduce((s, w) => {
        const created = new Date(w.createdAt!).getTime();
        const completed = new Date(w.completedAt!).getTime();
        return s + (completed - created) / (1000 * 60 * 60);
      }, 0) / approvedWorkflows.length
    : 0;

  const monthRepays = (await store.repayments.all()).filter((r) => {
    const t = new Date(r.dueDate).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const overdueCount = monthRepays.filter(
    (r) => r.status === "overdue" || r.status === "partial"
  ).length;
  const overdueRate = monthRepays.length ? overdueCount / monthRepays.length : 0;

  const monthDisbursed = inMonthApps.filter(
    (a) => a.status === "disbursed" || a.status === "overdue" || a.status === "repaid" || a.status === "write_off"
  );
  const writeOffCount = monthDisbursed.filter((a) => a.status === "write_off").length;
  const nonPerformingRate = monthDisbursed.length ? writeOffCount / monthDisbursed.length : 0;

  const entMap = new Map<
    string,
    { enterpriseName: string; financingAmount: number; interestIncome: number; writeOff: number; total: number }
  >();
  monthDisbursed.forEach((a) => {
    const ent = enterprises.find((e) => e.id === a.supplierId);
    const name = ent?.name || a.supplierId;
    const cur = entMap.get(a.supplierId) || {
      enterpriseName: name,
      financingAmount: 0,
      interestIncome: 0,
      writeOff: 0,
      total: 0,
    };
    cur.financingAmount += a.amount;
    const plan = a.financingPlans.find((p) => p.id === a.selectedPlanId) || a.financingPlans[0];
    cur.interestIncome += plan?.totalInterest || 0;
    cur.total += 1;
    if (a.status === "write_off") cur.writeOff += 1;
    entMap.set(a.supplierId, cur);
  });
  const enterpriseBreakdown = Array.from(entMap.values()).map((v) => ({
    enterpriseName: v.enterpriseName,
    financingAmount: v.financingAmount,
    interestIncome: v.interestIncome,
    nonPerformingRate: v.total ? v.writeOff / v.total : 0,
  }));

  const indMap = new Map<string, { financingAmount: number; overdue: number; total: number }>();
  monthDisbursed.forEach((a) => {
    const ent = enterprises.find((e) => e.id === a.supplierId);
    const ind = ent ? RiskForecastEngine.resolveIndustry(ent.industry || ent.name) : "其他";
    const cur = indMap.get(ind) || { financingAmount: 0, overdue: 0, total: 0 };
    cur.financingAmount += a.amount;
    cur.total += 1;
    if (a.status === "overdue" || a.status === "write_off") cur.overdue += 1;
    indMap.set(ind, cur);
  });
  const industryBreakdown = Array.from(indMap.entries()).map(([industry, v]) => ({
    industry,
    financingAmount: v.financingAmount,
    overdueRate: v.total ? v.overdue / v.total : 0,
  }));

  return {
    month: monthKey,
    totalFinancingAmount,
    totalFinancingCount,
    totalInterestIncome,
    averageApprovalHours: Math.round(avgApprovalHours * 100) / 100,
    overdueRate: Math.round(overdueRate * 10000) / 10000,
    nonPerformingRate: Math.round(nonPerformingRate * 10000) / 10000,
    enterpriseBreakdown,
    industryBreakdown,
  };
}

export async function exportReportToCSV(report: MonthlyReport): Promise<string> {
  const lines: string[] = [];
  lines.push(`月度融资报表,${report.month}`);
  lines.push("");
  lines.push("指标,数值");
  lines.push(`融资总额,${report.totalFinancingAmount}`);
  lines.push(`融资笔数,${report.totalFinancingCount}`);
  lines.push(`利息收入,${report.totalInterestIncome}`);
  lines.push(`平均审批时长(小时),${report.averageApprovalHours}`);
  lines.push(`逾期率,${(report.overdueRate * 100).toFixed(2)}%`);
  lines.push(`不良率,${(report.nonPerformingRate * 100).toFixed(2)}%`);
  lines.push("");
  lines.push("企业维度明细");
  lines.push("企业名称,融资金额,利息收入,不良率");
  report.enterpriseBreakdown.forEach((e) => {
    lines.push(`${e.enterpriseName},${e.financingAmount},${e.interestIncome},${(e.nonPerformingRate * 100).toFixed(2)}%`);
  });
  lines.push("");
  lines.push("行业维度明细");
  lines.push("行业,融资金额,逾期率");
  report.industryBreakdown.forEach((i) => {
    lines.push(`${i.industry},${i.financingAmount},${(i.overdueRate * 100).toFixed(2)}%`);
  });
  return lines.join("\n");
}

export async function exportReportToJSON(report: MonthlyReport): Promise<string> {
  return JSON.stringify(report, null, 2);
}

export const ReportService = {
  generate: generateMonthlyReport,
  toCSV: exportReportToCSV,
  toJSON: exportReportToJSON,
};

export default ReportService;
