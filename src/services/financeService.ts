import type { FinanceApplication, FinancingPlan, Invoice, TransactionOrder, PaginatedResult } from "@/src/types";
import { store } from "@/src/data/store";
import { PlanEngine, type PlanInput } from "@/src/engine/PlanEngine";
import { CreditService } from "@/src/services/CreditService";
import { ApprovalService } from "@/src/services/approvalService";
import { RepaymentService } from "@/src/services/repaymentService";

export interface CreateApplicationInput {
  supplierId: string;
  coreEnterpriseId: string;
  amount: number;
  termDays: number;
  purpose: string;
  attachedInvoiceIds: string[];
  attachedOrderIds: string[];
  managerId?: string;
}

export async function getApplicationById(id: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.get(id);
}

export async function getAllApplications(): Promise<FinanceApplication[]> {
  return store.financeApplications.all();
}

export async function list(params?: {
  supplierId?: string;
  coreEnterpriseId?: string;
  status?: string;
  managerId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<FinanceApplication>> {
  let all = await store.financeApplications.all();
  if (params?.supplierId) {
    all = all.filter((a) => a.supplierId === params.supplierId);
  }
  if (params?.coreEnterpriseId) {
    all = all.filter((a) => a.coreEnterpriseId === params.coreEnterpriseId);
  }
  if (params?.status) {
    all = all.filter((a) => a.status === params.status);
  }
  if (params?.managerId) {
    all = all.filter((a) => a.managerId === params.managerId);
  }
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return store.paginate(all, params?.page, params?.pageSize);
}

export async function apply(body: CreateApplicationInput & { riskLevel?: FinanceApplication["riskLevel"] }): Promise<FinanceApplication> {
  const score = await CreditService.getBySupplier(body.supplierId);
  const riskLevel: FinanceApplication["riskLevel"] =
    body.riskLevel ||
    (score
      ? score.overallScore >= 75
        ? "low"
        : score.overallScore >= 60
          ? "medium"
          : score.overallScore >= 45
            ? "high"
            : "critical"
      : "medium");
  const app = await createApplication(body, score?.overallScore || 60, riskLevel);
  return app;
}

export async function getApplicationsBySupplier(supplierId: string): Promise<FinanceApplication[]> {
  return store.financeApplications.filter((a) => a.supplierId === supplierId);
}

export async function getApplicationsByStatus(
  status: FinanceApplication["status"]
): Promise<FinanceApplication[]> {
  return store.financeApplications.filter((a) => a.status === status);
}

export async function getApplicationsByManager(managerId: string): Promise<FinanceApplication[]> {
  return store.financeApplications.filter((a) => a.managerId === managerId);
}

export async function getPlans(applicationId: string): Promise<FinancingPlan[] | undefined> {
  const app = await store.financeApplications.get(applicationId);
  return app?.financingPlans;
}

export async function generatePlans(input: PlanInput): Promise<FinancingPlan[]> {
  return PlanEngine.generate(input);
}

export async function createApplication(
  input: CreateApplicationInput,
  creditScore: number,
  riskLevel: FinanceApplication["riskLevel"]
): Promise<FinanceApplication> {
  const plans = PlanEngine.generate({
    principal: input.amount,
    termDays: input.termDays,
    riskLevel,
    supplierCreditScore: creditScore,
  });

  const appNo = `FA${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
  const app: FinanceApplication = {
    id: `fa_${Date.now()}`,
    applicationNo: appNo,
    supplierId: input.supplierId,
    coreEnterpriseId: input.coreEnterpriseId,
    amount: input.amount,
    termDays: input.termDays,
    purpose: input.purpose,
    attachedInvoiceIds: input.attachedInvoiceIds,
    attachedOrderIds: input.attachedOrderIds,
    riskLevel,
    status: "draft",
    financingPlans: plans,
    createdAt: new Date().toISOString(),
    managerId: input.managerId,
  };
  return store.financeApplications.create(app);
}

export async function submitApplication(id: string): Promise<FinanceApplication | undefined> {
  const app = await store.financeApplications.get(id);
  if (!app || app.status !== "draft") return undefined;
  const updated = await store.financeApplications.update(id, {
    status: "submitted",
    submittedAt: new Date().toISOString(),
  });
  if (updated) {
    await ApprovalService.ensure({
      financeApplicationId: id,
      amount: updated.amount,
      riskLevel: updated.riskLevel,
      supplierId: updated.supplierId,
    });
  }
  return updated;
}

export async function selectPlan(applicationId: string, planId: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(applicationId, { selectedPlanId: planId });
}

export async function updateApplication(
  id: string,
  patch: Partial<FinanceApplication>
): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(id, patch);
}

export async function verifyInvoicesAndOrders(
  applicationId: string
): Promise<{
  authenticity: boolean;
  confidence: number;
  notes: string;
} | undefined> {
  const app = await store.financeApplications.get(applicationId);
  if (!app) return undefined;
  const invoices = await Promise.all(app.attachedInvoiceIds.map((id) => store.invoices.get(id)));
  const orders = await Promise.all(app.attachedOrderIds.map((id) => store.orders.get(id)));
  const validInvoices = invoices.filter((i): i is Invoice => !!i && i.verified);
  const validOrders = orders.filter(
    (o): o is TransactionOrder => !!o && (o.status === "completed" || o.status === "delivered")
  );
  const invoiceConfidence = invoices.length
    ? validInvoices.reduce((s, i) => s + i.verificationScore, 0) / invoices.length
    : 85;
  const orderConfidence = orders.length ? validOrders.length / orders.length : 0.8;
  const confidence = Math.round(invoiceConfidence * 0.6 + orderConfidence * 40);
  const authenticity = confidence >= 70;
  return {
    authenticity,
    confidence,
    notes: authenticity
      ? `票据核验通过，贸易背景真实有效`
      : `部分单据存疑，建议补充材料后重新核验`,
  };
}

export async function setVerificationResult(
  applicationId: string,
  result: {
    authenticity: boolean;
    confidence: number;
    notes: string;
  }
): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(applicationId, {
    status: "verifying",
    verificationResult: result,
  });
}

export async function approveApplication(id: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(id, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  });
}

export async function disburseApplication(id: string): Promise<FinanceApplication | undefined> {
  const updated = await store.financeApplications.update(id, {
    status: "disbursed",
    disbursedAt: new Date().toISOString(),
  });
  if (updated) {
    const existing = await RepaymentService.byApplication(id);
    if (!existing || existing.length === 0) {
      await RepaymentService.generateSchedule(id);
    }
  }
  return updated;
}

export async function rejectApplication(id: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(id, { status: "rejected" });
}

export async function markRepaid(id: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(id, { status: "repaid" });
}

export async function markOverdue(id: string): Promise<FinanceApplication | undefined> {
  return store.financeApplications.update(id, { status: "overdue" });
}

export async function submitFullWorkflow(applicationId: string): Promise<{
  success: boolean;
  message?: string;
  application?: FinanceApplication;
}> {
  const verify = await verifyInvoicesAndOrders(applicationId);
  if (!verify) {
    return { success: false, message: "融资申请不存在" };
  }

  if (!verify.authenticity || verify.confidence < 60) {
    return { success: false, message: `验真失败：${verify.notes}` };
  }

  await setVerificationResult(applicationId, verify);

  let app = await store.financeApplications.get(applicationId);
  if (!app) {
    return { success: false, message: "融资申请不存在" };
  }

  if (!app.financingPlans || app.financingPlans.length === 0) {
    const plans = PlanEngine.generate({
      principal: app.amount,
      termDays: app.termDays,
      riskLevel: app.riskLevel,
      supplierCreditScore: (await CreditService.getBySupplier(app.supplierId))?.overallScore || 60,
    });
    app = await store.financeApplications.update(applicationId, { financingPlans: plans }) || app;
  }

  const submitted = await submitApplication(applicationId);
  if (!submitted) {
    return { success: false, message: "提交失败" };
  }

  const workflow = await ApprovalService.ensure({
    financeApplicationId: applicationId,
    amount: submitted.amount,
    riskLevel: submitted.riskLevel,
    supplierId: submitted.supplierId,
  });

  const finalApp = await store.financeApplications.update(applicationId, {
    approvalWorkflowId: workflow.id,
  });

  return {
    success: true,
    message: "融资申请提交成功",
    application: finalApp || submitted,
  };
}

export const FinanceService = {
  getById: getApplicationById,
  all: getAllApplications,
  list,
  apply,
  bySupplier: getApplicationsBySupplier,
  byStatus: getApplicationsByStatus,
  byManager: getApplicationsByManager,
  generatePlans,
  getPlans,
  create: createApplication,
  submit: submitApplication,
  submitFullWorkflow,
  selectPlan,
  update: updateApplication,
  verify: verifyInvoicesAndOrders,
  setVerification: setVerificationResult,
  approve: approveApplication,
  disburse: disburseApplication,
  reject: rejectApplication,
  markRepaid,
  markOverdue,
};

export default FinanceService;
