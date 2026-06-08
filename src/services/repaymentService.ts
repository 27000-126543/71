import type { RepaymentRecord, CollectionCase, FinancingPlan, PaginatedResult } from "@/src/types";
import { store } from "@/src/data/store";
import { PlanEngine } from "@/src/engine/PlanEngine";

export async function getRepaymentsByApplication(
  appId: string
): Promise<RepaymentRecord[]> {
  return store.repayments.getByApplication(appId);
}

export async function getAllRepayments(): Promise<RepaymentRecord[]> {
  return store.repayments.all();
}

export async function list(params?: {
  financeApplicationId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<RepaymentRecord>> {
  let all = await store.repayments.all();
  if (params?.financeApplicationId) {
    all = all.filter((r) => r.financeApplicationId === params.financeApplicationId);
  }
  if (params?.status) {
    all = all.filter((r) => r.status === params.status);
  }
  all.sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
  return store.paginate(all, params?.page, params?.pageSize);
}

export async function getOverdueRepayments(): Promise<RepaymentRecord[]> {
  return store.repayments.filter(
    (r) => r.status === "overdue" || r.status === "partial"
  );
}

export async function getRepaymentById(id: string): Promise<RepaymentRecord | undefined> {
  return store.repayments.get(id);
}

export async function generateRepaymentSchedule(
  applicationId: string
): Promise<RepaymentRecord[] | undefined> {
  const app = await store.financeApplications.get(applicationId);
  if (!app || !app.disbursedAt) return undefined;
  const plan =
    app.financingPlans.find((p) => p.id === app.selectedPlanId) ||
    app.financingPlans[0];
  if (!plan) return undefined;

  const schedule = PlanEngine.schedule(plan, app.disbursedAt);
  const records: RepaymentRecord[] = schedule.map((item, idx) => ({
    id: `rp_${applicationId}_${idx + 1}_${Date.now()}`,
    financeApplicationId: applicationId,
    periodNo: item.periodNo,
    dueDate: item.dueDate,
    principal: item.principal,
    interest: item.interest,
    totalAmount: item.totalAmount,
    status: "pending",
  }));
  for (const r of records) {
    await store.repayments.create(r);
  }
  return records;
}

export async function autoDeduct(
  repaymentId: string
): Promise<RepaymentRecord | undefined> {
  const r = await store.repayments.get(repaymentId);
  if (!r || r.status !== "pending") return undefined;
  const updated = await store.repayments.update(repaymentId, {
    status: "auto_deducting",
  });
  if (!updated) return undefined;
  const success = Math.random() > 0.15;
  if (success) {
    return store.repayments.update(repaymentId, {
      status: "paid",
      actualPaidAt: new Date().toISOString(),
      actualPaidAmount: r.totalAmount,
    });
  }
  return store.repayments.update(repaymentId, {
    status: "overdue",
  });
}

export async function deduct(
  repaymentId: string
): Promise<RepaymentRecord | undefined> {
  return autoDeduct(repaymentId);
}

export async function manualRepay(
  repaymentId: string,
  amount: number
): Promise<RepaymentRecord | undefined> {
  const r = await store.repayments.get(repaymentId);
  if (!r) return undefined;
  const full = amount >= r.totalAmount;
  return store.repayments.update(repaymentId, {
    status: full ? "paid" : "partial",
    actualPaidAt: new Date().toISOString(),
    actualPaidAmount: amount,
  });
}

export async function getAllCollections(): Promise<CollectionCase[]> {
  return store.collections.all();
}

export async function getCollectionById(id: string): Promise<CollectionCase | undefined> {
  return store.collections.get(id);
}

export async function getCollectionByApplication(
  appId: string
): Promise<CollectionCase | undefined> {
  return store.collections.getByApplication(appId);
}

export async function getCollectionsByAssignee(userId: string): Promise<CollectionCase[]> {
  return store.collections.filter((c) => c.assignedTo === userId);
}

export async function getActiveCollections(): Promise<CollectionCase[]> {
  return store.collections.filter(
    (c) =>
      c.status === "new" ||
      c.status === "contacted" ||
      c.status === "promise_to_pay" ||
      c.status === "escalated" ||
      c.status === "legal_proceeding"
  );
}

export async function createCollectionCaseDirect(
  applicationId: string,
  supplierId: string,
  overdueDays: number,
  overdueAmount: number
): Promise<CollectionCase> {
  const caseNo = `COL${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
  const c: CollectionCase = {
    id: `col_${Date.now()}`,
    caseNo,
    financeApplicationId: applicationId,
    supplierId,
    overdueDays,
    overdueAmount,
    status: "new",
    followUpRecords: [
      {
        time: new Date().toISOString(),
        operator: "系统",
        content: "自动检测到逾期，生成催收工单",
      },
    ],
    createdAt: new Date().toISOString(),
  };
  return store.collections.create(c);
}

export async function createCollectionCase(
  input: Partial<CollectionCase> & {
    financeApplicationId: string;
    supplierId: string;
    overdueDays?: number;
    overdueAmount?: number;
    assignedTo?: string;
  }
): Promise<CollectionCase> {
  const caseNo = `COL${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
  const c: CollectionCase = {
    id: `col_${Date.now()}`,
    caseNo,
    financeApplicationId: input.financeApplicationId,
    supplierId: input.supplierId,
    overdueDays: input.overdueDays || 1,
    overdueAmount: input.overdueAmount || 0,
    assignedTo: input.assignedTo,
    status: input.status || "new",
    followUpRecords: input.followUpRecords || [
      {
        time: new Date().toISOString(),
        operator: "系统",
        content: "系统生成催收工单",
      },
    ],
    createdAt: input.createdAt || new Date().toISOString(),
  };
  return store.collections.create(c);
}

export async function addCollectionFollowUp(
  caseId: string,
  operator: string,
  content: string
): Promise<CollectionCase | undefined> {
  const c = await store.collections.get(caseId);
  if (!c) return undefined;
  return store.collections.update(caseId, {
    followUpRecords: [
      ...c.followUpRecords,
      { time: new Date().toISOString(), operator, content },
    ],
  });
}

export async function updateCollectionStatus(
  caseId: string,
  status: CollectionCase["status"],
  operator?: string,
  note?: string
): Promise<CollectionCase | undefined> {
  const c = await store.collections.get(caseId);
  if (!c) return undefined;
  const records = [...c.followUpRecords];
  if (operator && note) {
    records.push({ time: new Date().toISOString(), operator, content: note });
  }
  return store.collections.update(caseId, {
    status,
    followUpRecords: records,
  });
}

export async function assignCollection(
  caseId: string,
  userId: string
): Promise<CollectionCase | undefined> {
  return store.collections.update(caseId, { assignedTo: userId });
}

export const RepaymentService = {
  byApplication: getRepaymentsByApplication,
  allRepayments: getAllRepayments,
  overdueRepayments: getOverdueRepayments,
  repaymentById: getRepaymentById,
  generateSchedule: generateRepaymentSchedule,
  autoDeduct,
  deduct,
  manualRepay,
  allCollections: getAllCollections,
  collectionById: getCollectionById,
  collectionByApplication: getCollectionByApplication,
  byAssignee: getCollectionsByAssignee,
  activeCollections: getActiveCollections,
  createCase: createCollectionCaseDirect,
  createCollectionCase,
  addFollowUp: addCollectionFollowUp,
  updateStatus: updateCollectionStatus,
  assign: assignCollection,
  list,
};

export default RepaymentService;
