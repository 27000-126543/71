export type UserRole =
  | "core_enterprise"
  | "supplier"
  | "relationship_manager"
  | "risk_director"
  | "credit_committee"
  | "admin";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "timeout";
export type FinanceStatus =
  | "draft"
  | "submitted"
  | "verifying"
  | "approved"
  | "rejected"
  | "disbursed"
  | "repaid"
  | "overdue"
  | "write_off";
export type AlertType = "order_drop" | "return_spike" | "payment_delay" | "abnormal_behavior";
export type RepaymentMethod = "bullet" | "equal_installment" | "interest_only";

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  enterpriseId?: string;
  createdAt: string;
}

export interface Enterprise {
  id: string;
  name: string;
  unifiedCreditCode: string;
  legalPerson: string;
  registeredCapital: number;
  industry: string;
  contactInfo: { phone: string; email: string; address?: string };
  certificationStatus: "pending" | "verified" | "rejected";
  role: UserRole;
  createdAt: string;
  description?: string;
}

export interface SupplierBinding {
  id: string;
  coreEnterpriseId: string;
  supplierId: string;
  cooperationSince: string;
  annualTransactionVolume: number;
  status: "active" | "suspended" | "terminated";
}

export interface TransactionOrder {
  id: string;
  orderNo: string;
  coreEnterpriseId: string;
  supplierId: string;
  amount: number;
  productName: string;
  quantity: number;
  orderDate: string;
  deliveryDate: string;
  status: "created" | "shipped" | "delivered" | "completed" | "returned";
  logisticsTrackingId?: string;
}

export interface LogisticsRecord {
  id: string;
  orderId: string;
  trackingNo: string;
  carrier: string;
  status: "picked" | "in_transit" | "delivered";
  estimatedArrival: string;
  actualArrival?: string;
  checkpoints: Array<{ time: string; location: string; description: string }>;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  invoiceDate: string;
  buyer: string;
  seller: string;
  verified: boolean;
  verificationScore: number;
}

export interface CreditScore {
  id: string;
  supplierId: string;
  overallScore: number;
  riskLevel: RiskLevel;
  creditLimit: number;
  availableLimit: number;
  factors: {
    transactionHistory: number;
    financialHealth: number;
    operationStability: number;
    industryEnvironment: number;
    compliance: number;
  };
  evaluationDate: string;
  trend: "up" | "stable" | "down";
  history: Array<{ date: string; score: number }>;
}

export interface FinancingPlan {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  termDays: number;
  totalInterest: number;
  monthlyPayment: number;
  repaymentMethod: RepaymentMethod;
}

export interface ApprovalNode {
  index: number;
  name: string;
  requiredRole: UserRole;
  timeoutHours: number;
  assigneeId?: string;
  status: "pending" | "in_progress" | "approved" | "rejected" | "skipped";
  decision?: "approve" | "reject" | "escalate";
  comment?: string;
  decidedAt?: string;
  deadline?: string;
}

export interface ApprovalWorkflow {
  id: string;
  financeApplicationId: string;
  amount: number;
  riskLevel: RiskLevel;
  nodes: ApprovalNode[];
  currentNodeIndex: number;
  status: ApprovalStatus;
  escalated: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface FinanceApplication {
  id: string;
  applicationNo: string;
  supplierId: string;
  coreEnterpriseId: string;
  amount: number;
  termDays: number;
  purpose: string;
  attachedInvoiceIds: string[];
  attachedOrderIds: string[];
  riskLevel: RiskLevel;
  status: FinanceStatus;
  selectedPlanId?: string;
  verificationResult?: {
    authenticity: boolean;
    confidence: number;
    notes: string;
  };
  financingPlans: FinancingPlan[];
  approvalWorkflowId?: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  disbursedAt?: string;
  managerId?: string;
}

export interface MonitoringMetrics {
  id: string;
  supplierId: string;
  date: string;
  orderVolume: number;
  orderVolumeMom: number;
  returnRate: number;
  returnRateMom: number;
  paymentCycleDays: number;
  paymentCycleMom: number;
  activeFinancingCount: number;
  totalOutstanding: number;
}

export interface AlertEvent {
  id: string;
  supplierId: string;
  type: AlertType;
  level: RiskLevel;
  title: string;
  description: string;
  metricValue: number;
  threshold: number;
  triggeredAt: string;
  status: "new" | "processing" | "resolved" | "false_alarm";
  frozenCreditLimit?: number;
  handledBy?: string;
  handledAt?: string;
  handlingNotes?: string;
}

export interface RepaymentRecord {
  id: string;
  financeApplicationId: string;
  periodNo: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  status: "pending" | "auto_deducting" | "paid" | "overdue" | "partial";
  actualPaidAt?: string;
  actualPaidAmount?: number;
  collectionCaseId?: string;
}

export interface CollectionCase {
  id: string;
  caseNo: string;
  financeApplicationId: string;
  supplierId: string;
  overdueDays: number;
  overdueAmount: number;
  status:
    | "new"
    | "contacted"
    | "promise_to_pay"
    | "escalated"
    | "legal_proceeding"
    | "closed"
    | "written_off";
  assignedTo?: string;
  followUpRecords: Array<{ time: string; operator: string; content: string }>;
  createdAt: string;
}

export interface DashboardStats {
  totalOutstanding: number;
  totalFinancingCount: number;
  creditUtilizationRate: number;
  totalCreditLimit: number;
  usedCreditLimit: number;
  availableCreditLimit: number;
  overdueRate: number;
  nonPerformingRate: number;
  totalInterestIncome: number;
  industryDistribution: Array<{ industry: string; amount: number; overdueRate: number }>;
  monthlyTrend: Array<{ month: string; disbursed: number; repaid: number; overdue: number }>;
  riskDistribution: Array<{ level: RiskLevel; count: number; amount: number }>;
  alerts: AlertEvent[];
}

export interface MonthlyReport {
  month: string;
  totalFinancingAmount: number;
  totalFinancingCount: number;
  totalInterestIncome: number;
  averageApprovalHours: number;
  overdueRate: number;
  nonPerformingRate: number;
  enterpriseBreakdown: Array<{
    enterpriseName: string;
    financingAmount: number;
    interestIncome: number;
    nonPerformingRate: number;
  }>;
  industryBreakdown: Array<{
    industry: string;
    financingAmount: number;
    overdueRate: number;
  }>;
}

export interface IndustryRiskForecast {
  industry: string;
  currentRiskScore: number;
  forecastedRiskScore: number;
  trend: "up" | "stable" | "down";
  suggestion: string;
  macroFactors: Array<{ factor: string; impact: "positive" | "negative" | "neutral" }>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
