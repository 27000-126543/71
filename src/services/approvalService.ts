import type { ApprovalWorkflow, UserRole, PaginatedResult } from "@/src/types";
import { store } from "@/src/data/store";
import { ApprovalEngine, type ApprovalRouteInput } from "@/src/engine/ApprovalEngine";
import { FinanceService } from "@/src/services/financeService";

export async function getWorkflowById(id: string): Promise<ApprovalWorkflow | undefined> {
  return store.approvalWorkflows.get(id);
}

export async function getWorkflowByFinance(
  financeId: string
): Promise<ApprovalWorkflow | undefined> {
  return store.approvalWorkflows.getByFinanceId(financeId);
}

export async function getAllWorkflows(): Promise<ApprovalWorkflow[]> {
  return store.approvalWorkflows.all();
}

export async function createWorkflow(input: ApprovalRouteInput): Promise<ApprovalWorkflow> {
  const wf = ApprovalEngine.createWorkflow(input);
  return store.approvalWorkflows.create(wf);
}

export async function ensureWorkflow(input: ApprovalRouteInput): Promise<ApprovalWorkflow> {
  const existing = await store.approvalWorkflows.getByFinanceId(input.financeApplicationId);
  if (existing) return existing;
  return createWorkflow(input);
}

export async function processTimeout(workflowId: string): Promise<ApprovalWorkflow | undefined> {
  const wf = await store.approvalWorkflows.get(workflowId);
  if (!wf) return undefined;
  const updated = ApprovalEngine.escalate(wf);
  return store.approvalWorkflows.update(workflowId, updated);
}

async function syncFinanceStatus(workflow: ApprovalWorkflow) {
  if (workflow.status === "approved") {
    await FinanceService.approve(workflow.financeApplicationId);
  } else if (workflow.status === "rejected") {
    await FinanceService.reject(workflow.financeApplicationId);
  }
}

export async function decideNode(
  workflowId: string,
  nodeIndex: number,
  decision: "approve" | "reject" | "escalate",
  comment: string,
  userId: string
): Promise<ApprovalWorkflow | undefined> {
  const wf = await store.approvalWorkflows.get(workflowId);
  if (!wf) return undefined;
  const updated = ApprovalEngine.decide(wf, nodeIndex, decision, comment, userId);
  const saved = await store.approvalWorkflows.update(workflowId, updated);
  if (saved) {
    await syncFinanceStatus(saved);
  }
  return saved;
}

export async function decide(
  workflowId: string,
  userId: string,
  decision: "approve" | "reject" | "escalate",
  comment: string
): Promise<ApprovalWorkflow | undefined> {
  const wf = await store.approvalWorkflows.get(workflowId);
  if (!wf) return undefined;
  const nodeIndex = wf.currentNodeIndex;
  return decideNode(workflowId, nodeIndex, decision, comment, userId);
}

export async function getWorkflowsPendingRole(role: UserRole): Promise<ApprovalWorkflow[]> {
  const all = await store.approvalWorkflows.all();
  return all.filter((wf) => {
    if (wf.status !== "pending") return false;
    const node = wf.nodes[wf.currentNodeIndex];
    return (
      node?.requiredRole === role && (node.status === "in_progress" || node.status === "pending")
    );
  });
}

export async function getWorkflowsAssigned(
  userId: string,
  role: UserRole
): Promise<ApprovalWorkflow[]> {
  const all = await store.approvalWorkflows.all();
  return all.filter((wf) => {
    if (wf.status !== "pending") return false;
    const node = wf.nodes[wf.currentNodeIndex];
    return (
      node?.assigneeId === userId ||
      (node?.requiredRole === role && node.assigneeId === undefined)
    );
  });
}

export async function getWorkbench(
  role: UserRole,
  options?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PaginatedResult<ApprovalWorkflow>> {
  const userId = store.getCurrentUserId();
  let items: ApprovalWorkflow[];
  if (userId) {
    items = await getWorkflowsAssigned(userId, role);
  } else {
    items = await getWorkflowsPendingRole(role);
  }
  if (options?.status) {
    items = items.filter((w) => w.status === options.status);
  }
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return store.paginate(items, options?.page, options?.pageSize);
}

export async function assignApprover(
  workflowId: string,
  nodeIndex: number,
  userId: string
): Promise<ApprovalWorkflow | undefined> {
  const wf = await store.approvalWorkflows.get(workflowId);
  if (!wf) return undefined;
  const nodes = [...wf.nodes];
  if (nodes[nodeIndex]) {
    nodes[nodeIndex] = {
      ...nodes[nodeIndex],
      assigneeId: userId,
      status: nodes[nodeIndex].status === "pending" ? "in_progress" : nodes[nodeIndex].status,
    };
  }
  return store.approvalWorkflows.update(workflowId, { nodes });
}

export const ApprovalService = {
  getById: getWorkflowById,
  getByFinance: getWorkflowByFinance,
  all: getAllWorkflows,
  create: createWorkflow,
  ensure: ensureWorkflow,
  processTimeout,
  decide,
  decideNode,
  pendingRole: getWorkflowsPendingRole,
  assigned: getWorkflowsAssigned,
  getWorkbench,
  assignApprover,
};

export default ApprovalService;
