import type { ApprovalNode, ApprovalWorkflow, RiskLevel, UserRole } from "@/src/types";

export interface ApprovalRouteInput {
  amount: number;
  riskLevel: RiskLevel;
  supplierId: string;
  financeApplicationId: string;
}

export interface RouteDecision {
  nodes: ApprovalNode[];
  escalateToVpAfterHours: number;
}

const AMOUNT_TIERS = [
  { max: 500000, role: "relationship_manager" as UserRole, label: "客户经理审批", timeout: 24 },
  { max: 2000000, role: "risk_director" as UserRole, label: "风控总监审批", timeout: 48 },
  { max: Infinity, role: "credit_committee" as UserRole, label: "贷审会审批", timeout: 72 },
];

const VP_ESCALATE_HOURS = 72;

function getBaseTierIndex(amount: number): number {
  for (let i = 0; i < AMOUNT_TIERS.length; i++) {
    if (amount <= AMOUNT_TIERS[i].max) return i;
  }
  return AMOUNT_TIERS.length - 1;
}

function riskAddsNodes(risk: RiskLevel): ApprovalNode[] {
  if (risk === "critical") {
    return [
      {
        index: 0,
        name: "风控专项审核",
        requiredRole: "risk_director",
        timeoutHours: 12,
        status: "pending",
      },
    ];
  }
  if (risk === "high") {
    return [
      {
        index: 0,
        name: "风险总监复核",
        requiredRole: "risk_director",
        timeoutHours: 24,
        status: "pending",
      },
    ];
  }
  return [];
}

export function buildApprovalNodes(input: ApprovalRouteInput): RouteDecision {
  const { amount, riskLevel } = input;
  const tierIdx = getBaseTierIndex(amount);
  const nodes: ApprovalNode[] = [];
  let idx = 0;

  if (tierIdx > 0) {
    nodes.push({
      index: idx++,
      name: "客户经理初审",
      requiredRole: "relationship_manager",
      timeoutHours: tierIdx >= 2 ? 8 : 12,
      status: "pending",
    });
  }
  if (tierIdx >= 1) {
    const hasRisk = riskLevel === "high" || riskLevel === "critical";
    nodes.push({
      index: idx++,
      name: hasRisk ? "风控总监风险复核" : "风控总监审批",
      requiredRole: "risk_director",
      timeoutHours: tierIdx >= 2 ? 24 : 48,
      status: "pending",
    });
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    const riskNodes = riskAddsNodes(riskLevel);
    riskNodes.forEach((n) => {
      n.index = idx++;
      nodes.push(n);
    });
  }

  const tier = AMOUNT_TIERS[tierIdx];
  if (!nodes.some((n) => n.requiredRole === tier.role && tierIdx < AMOUNT_TIERS.length - 1)) {
    nodes.push({
      index: idx++,
      name: tier.label,
      requiredRole: tier.role,
      timeoutHours: tier.timeout,
      status: "pending",
    });
  } else if (tierIdx === AMOUNT_TIERS.length - 1) {
    nodes.push({
      index: idx++,
      name: "贷审会集体审批",
      requiredRole: "credit_committee",
      timeoutHours: 72,
      status: "pending",
    });
  }

  nodes.push({
    index: idx++,
    name: "超时升级-副总裁终审",
    requiredRole: "admin",
    timeoutHours: 24,
    status: "skipped",
  });

  const now = new Date();
  nodes.forEach((n) => {
    if (n.status !== "skipped") {
      const deadline = new Date(now);
      deadline.setHours(deadline.getHours() + n.timeoutHours);
      n.deadline = deadline.toISOString();
    }
  });

  return {
    nodes,
    escalateToVpAfterHours: VP_ESCALATE_HOURS,
  };
}

export function createApprovalWorkflow(
  input: ApprovalRouteInput
): ApprovalWorkflow {
  const { nodes } = buildApprovalNodes(input);
  return {
    id: `wf_${Date.now()}`,
    financeApplicationId: input.financeApplicationId,
    amount: input.amount,
    riskLevel: input.riskLevel,
    nodes,
    currentNodeIndex: 0,
    status: "pending",
    escalated: false,
    createdAt: new Date().toISOString(),
  };
}

export function isNodeTimedOut(node: ApprovalNode, now: Date = new Date()): boolean {
  if (!node.deadline) return false;
  if (node.status !== "pending" && node.status !== "in_progress") return false;
  return new Date(node.deadline).getTime() < now.getTime();
}

export function checkAndEscalate(
  workflow: ApprovalWorkflow,
  now: Date = new Date()
): ApprovalWorkflow {
  const cloned: ApprovalWorkflow = JSON.parse(JSON.stringify(workflow));
  if (cloned.status !== "pending") return cloned;

  const current = cloned.nodes[cloned.currentNodeIndex];
  if (!current) return cloned;

  if (isNodeTimedOut(current, now)) {
    const vpIdx = cloned.nodes.findIndex((n) => n.requiredRole === "admin");
    if (vpIdx !== -1 && cloned.nodes[vpIdx].status === "skipped") {
      cloned.nodes[vpIdx].status = "in_progress";
      cloned.nodes[vpIdx].deadline = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      cloned.currentNodeIndex = vpIdx;
      cloned.escalated = true;
    }
  }
  return cloned;
}

export function decideNode(
  workflow: ApprovalWorkflow,
  nodeIndex: number,
  decision: "approve" | "reject" | "escalate",
  comment: string,
  userId: string
): ApprovalWorkflow {
  const cloned: ApprovalWorkflow = JSON.parse(JSON.stringify(workflow));
  const node = cloned.nodes[nodeIndex];
  if (!node || node.status === "skipped" || node.status === "approved" || node.status === "rejected") {
    return cloned;
  }

  node.status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "in_progress";
  node.decision = decision;
  node.comment = comment;
  node.assigneeId = userId;
  node.decidedAt = new Date().toISOString();

  if (decision === "reject") {
    cloned.status = "rejected";
    cloned.completedAt = node.decidedAt;
    return cloned;
  }

  if (decision === "escalate") {
    const vpIdx = cloned.nodes.findIndex((n) => n.requiredRole === "admin");
    if (vpIdx !== -1) {
      cloned.nodes[vpIdx].status = "in_progress";
      cloned.nodes[vpIdx].deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      cloned.currentNodeIndex = vpIdx;
      cloned.escalated = true;
    }
    return cloned;
  }

  const nextIdx = cloned.nodes.findIndex(
    (n, i) => i > nodeIndex && n.status !== "skipped" && n.status !== "approved" && n.status !== "rejected"
  );

  if (nextIdx === -1) {
    cloned.status = "approved";
    cloned.completedAt = node.decidedAt;
  } else {
    cloned.currentNodeIndex = nextIdx;
    cloned.nodes[nextIdx].status = "in_progress";
  }

  return cloned;
}

export const ApprovalEngine = {
  build: buildApprovalNodes,
  createWorkflow: createApprovalWorkflow,
  isTimedOut: isNodeTimedOut,
  escalate: checkAndEscalate,
  decide: decideNode,
};

export default ApprovalEngine;
