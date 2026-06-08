import type {
  User,
  Enterprise,
  SupplierBinding,
  TransactionOrder,
  LogisticsRecord,
  Invoice,
  CreditScore,
  FinanceApplication,
  ApprovalWorkflow,
  ApprovalNode,
  FinancingPlan,
  MonitoringMetrics,
  AlertEvent,
  RepaymentRecord,
  CollectionCase,
  RiskLevel,
  FinanceStatus,
  AlertType,
  RepaymentMethod,
} from "@/src/types";

const now = new Date("2026-06-08T10:00:00Z");
const daysAgo = (d: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  return date.toISOString();
};
const daysLater = (d: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + d);
  return date.toISOString();
};

export const seedUsers: User[] = [
  {
    id: "u_admin_1",
    username: "admin",
    password: "123456",
    role: "admin",
    name: "系统管理员",
    createdAt: daysAgo(365),
  },
  {
    id: "u_rm_1",
    username: "zhangwei",
    password: "123456",
    role: "relationship_manager",
    name: "张伟",
    createdAt: daysAgo(300),
  },
  {
    id: "u_rm_2",
    username: "limei",
    password: "123456",
    role: "relationship_manager",
    name: "李梅",
    createdAt: daysAgo(280),
  },
  {
    id: "u_risk_1",
    username: "wanggang",
    password: "123456",
    role: "risk_director",
    name: "王刚",
    createdAt: daysAgo(320),
  },
  {
    id: "u_cc_1",
    username: "chenhao",
    password: "123456",
    role: "credit_committee",
    name: "陈浩",
    createdAt: daysAgo(290),
  },
  {
    id: "u_cc_2",
    username: "liuying",
    password: "123456",
    role: "credit_committee",
    name: "刘颖",
    createdAt: daysAgo(285),
  },
  {
    id: "u_cc_3",
    username: "zhaoming",
    password: "123456",
    role: "credit_committee",
    name: "赵明",
    createdAt: daysAgo(275),
  },
];

export const seedEnterprises: Enterprise[] = [
  {
    id: "e_core_1",
    name: "华盛汽车制造集团",
    unifiedCreditCode: "91310000MA1FL00001",
    legalPerson: "孙建国",
    registeredCapital: 500000000,
    industry: "汽车制造",
    contactInfo: {
      phone: "021-88880001",
      email: "contact@huasheng-auto.com",
      address: "上海市浦东新区张江高科技园区",
    },
    certificationStatus: "verified",
    role: "core_enterprise",
    createdAt: daysAgo(400),
    description: "国内领先的新能源汽车制造商，年销售额超500亿",
  },
  {
    id: "e_core_2",
    name: "明远电子科技股份",
    unifiedCreditCode: "91440300MA5E000002",
    legalPerson: "周志强",
    registeredCapital: 300000000,
    industry: "电子元器件",
    contactInfo: {
      phone: "0755-66660002",
      email: "info@mingyuan-electronics.com",
      address: "深圳市南山区科技园南区",
    },
    certificationStatus: "verified",
    role: "core_enterprise",
    createdAt: daysAgo(380),
    description: "专注于消费电子芯片和模组的研发生产",
  },
  {
    id: "e_supplier_1",
    name: "恒达精密零部件有限公司",
    unifiedCreditCode: "91320500MA1MJ00003",
    legalPerson: "吴建华",
    registeredCapital: 50000000,
    industry: "汽车零部件",
    contactInfo: {
      phone: "0512-55550003",
      email: "hd@hengda-parts.com",
      address: "苏州市工业园区星湖街",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(350),
    description: "专业汽车发动机精密零部件供应商",
  },
  {
    id: "e_supplier_2",
    name: "盛华新材料科技",
    unifiedCreditCode: "91330200MA29300004",
    legalPerson: "郑海涛",
    registeredCapital: 30000000,
    industry: "新材料",
    contactInfo: {
      phone: "0574-33330004",
      email: "sh@sh-huacai.com",
      address: "宁波市北仑区保税区",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(340),
    description: "高性能车用复合材料供应商",
  },
  {
    id: "e_supplier_3",
    name: "天宇电子元件厂",
    unifiedCreditCode: "91441900MA4UT00005",
    legalPerson: "黄伟民",
    registeredCapital: 20000000,
    industry: "电子元器件",
    contactInfo: {
      phone: "0769-22220005",
      email: "tianyu@ty-elec.com",
      address: "东莞市长安镇振安东路",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(330),
    description: "电容电阻等被动元件专业制造商",
  },
  {
    id: "e_supplier_4",
    name: "精诚机械制造",
    unifiedCreditCode: "91320400MA1NY00006",
    legalPerson: "何志明",
    registeredCapital: 40000000,
    industry: "汽车零部件",
    contactInfo: {
      phone: "0519-88880006",
      email: "jingcheng@jc-mach.com",
      address: "常州市武进区高新区",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(320),
    description: "汽车底盘结构件供应商",
  },
  {
    id: "e_supplier_5",
    name: "瑞丰塑胶制品",
    unifiedCreditCode: "91442000MA4UW00007",
    legalPerson: "林美玲",
    registeredCapital: 15000000,
    industry: "塑料制品",
    contactInfo: {
      phone: "0760-88880007",
      email: "ruifeng@rf-plastic.com",
      address: "中山市火炬开发区",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(310),
    description: "工程塑料注塑成型供应商",
  },
  {
    id: "e_supplier_6",
    name: "博远半导体",
    unifiedCreditCode: "91310100MA1G800008",
    legalPerson: "徐文斌",
    registeredCapital: 80000000,
    industry: "半导体",
    contactInfo: {
      phone: "021-66660008",
      email: "boyuan@by-semi.com",
      address: "上海市嘉定区工业区",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(300),
    description: "功率半导体芯片设计与封装",
  },
  {
    id: "e_supplier_7",
    name: "鑫隆线缆",
    unifiedCreditCode: "91320583MA1MD00009",
    legalPerson: "马国栋",
    registeredCapital: 25000000,
    industry: "电线电缆",
    contactInfo: {
      phone: "0512-33330009",
      email: "xinlong@xl-cable.com",
      address: "昆山市花桥镇",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(290),
    description: "汽车线束及特种电缆供应商",
  },
  {
    id: "e_supplier_8",
    name: "通达电子配件",
    unifiedCreditCode: "91440600MA4UQ00010",
    legalPerson: "黎俊杰",
    registeredCapital: 18000000,
    industry: "电子元器件",
    contactInfo: {
      phone: "0757-55550010",
      email: "tongda@td-access.com",
      address: "佛山市顺德区容桂街道",
    },
    certificationStatus: "verified",
    role: "supplier",
    createdAt: daysAgo(280),
    description: "电子连接器及接插件专业厂商",
  },
];

export const seedSupplierBindings: SupplierBinding[] = [
  { id: "b_1", coreEnterpriseId: "e_core_1", supplierId: "e_supplier_1", cooperationSince: daysAgo(350), annualTransactionVolume: 120000000, status: "active" },
  { id: "b_2", coreEnterpriseId: "e_core_1", supplierId: "e_supplier_2", cooperationSince: daysAgo(340), annualTransactionVolume: 80000000, status: "active" },
  { id: "b_3", coreEnterpriseId: "e_core_1", supplierId: "e_supplier_4", cooperationSince: daysAgo(320), annualTransactionVolume: 95000000, status: "active" },
  { id: "b_4", coreEnterpriseId: "e_core_1", supplierId: "e_supplier_5", cooperationSince: daysAgo(310), annualTransactionVolume: 45000000, status: "active" },
  { id: "b_5", coreEnterpriseId: "e_core_1", supplierId: "e_supplier_7", cooperationSince: daysAgo(290), annualTransactionVolume: 55000000, status: "active" },
  { id: "b_6", coreEnterpriseId: "e_core_2", supplierId: "e_supplier_3", cooperationSince: daysAgo(330), annualTransactionVolume: 65000000, status: "active" },
  { id: "b_7", coreEnterpriseId: "e_core_2", supplierId: "e_supplier_6", cooperationSince: daysAgo(300), annualTransactionVolume: 150000000, status: "active" },
  { id: "b_8", coreEnterpriseId: "e_core_2", supplierId: "e_supplier_8", cooperationSince: daysAgo(280), annualTransactionVolume: 35000000, status: "active" },
];

const productNames = [
  "精密齿轮组件", "高强度螺栓", "车用PCB板", "锂电池模组", "铝合金压铸件",
  "橡胶密封圈", "电机控制器", "传感器模块", "连接器线束", "散热片组件",
  "电容芯片组", "功率MOSFET", "注塑外壳", "碳纤维板材", "弹簧组件",
];

const orderStatuses: TransactionOrder["status"][] = ["completed", "completed", "completed", "completed", "delivered", "delivered", "shipped", "created", "returned"];
const carriers = ["顺丰速运", "京东物流", "德邦快递", "中通快运", "安能物流"];

function generateOrders(): TransactionOrder[] {
  const orders: TransactionOrder[] = [];
  let orderCounter = 1;

  const supplierCoreMap: Record<string, string[]> = {
    e_supplier_1: ["e_core_1"],
    e_supplier_2: ["e_core_1"],
    e_supplier_3: ["e_core_2"],
    e_supplier_4: ["e_core_1"],
    e_supplier_5: ["e_core_1"],
    e_supplier_6: ["e_core_2"],
    e_supplier_7: ["e_core_1"],
    e_supplier_8: ["e_core_2"],
  };

  for (let i = 0; i < 60; i++) {
    const supplierIdx = (i % 8) + 1;
    const supplierId = `e_supplier_${supplierIdx}`;
    const coreIds = supplierCoreMap[supplierId];
    const coreId = coreIds[i % coreIds.length];
    const status = orderStatuses[i % orderStatuses.length];
    const orderDateOffset = Math.floor(i * 1.5);
    const product = productNames[i % productNames.length];
    const quantity = 100 + Math.floor(Math.random() * 4900);
    const unitPrice = 50 + Math.floor(Math.random() * 1950);
    const amount = quantity * unitPrice;
    const orderNo = `PO${2026}${String(orderCounter).padStart(6, "0")}`;

    orders.push({
      id: `ord_${i + 1}`,
      orderNo,
      coreEnterpriseId: coreId,
      supplierId,
      amount,
      productName: product,
      quantity,
      orderDate: daysAgo(orderDateOffset),
      deliveryDate: daysAgo(Math.max(0, orderDateOffset - 7 - Math.floor(Math.random() * 5))),
      status,
      logisticsTrackingId: status !== "created" ? `log_${i + 1}` : undefined,
    });
    orderCounter++;
  }
  return orders;
}

export const seedOrders: TransactionOrder[] = generateOrders();

export function generateLogistics(orders: TransactionOrder[]): LogisticsRecord[] {
  const logistics: LogisticsRecord[] = [];
  orders.forEach((order, idx) => {
    if (!order.logisticsTrackingId) return;
    const carrier = carriers[idx % carriers.length];
    const checkpoints = [
      { time: order.orderDate, location: "供应商仓库", description: "货物已揽收" },
    ];
    if (order.status === "shipped" || order.status === "delivered" || order.status === "completed") {
      checkpoints.push({
        time: daysAgo(Math.max(1, idx)),
        location: ["无锡转运中心", "上海分拨中心", "深圳集散中心"][idx % 3],
        description: "货物运输中",
      });
    }
    if (order.status === "delivered" || order.status === "completed" || order.status === "returned") {
      checkpoints.push({
        time: order.deliveryDate,
        location: "核心企业仓库",
        description: order.status === "returned" ? "货物已退回" : "货物已签收",
      });
    }

    logistics.push({
      id: order.logisticsTrackingId,
      orderId: order.id,
      trackingNo: `SF${100000000000 + idx}`,
      carrier,
      status: order.status === "returned" ? "delivered" : order.status === "shipped" ? "in_transit" : order.status === "delivered" || order.status === "completed" ? "delivered" : "picked",
      estimatedArrival: order.deliveryDate,
      actualArrival: order.status === "delivered" || order.status === "completed" || order.status === "returned" ? order.deliveryDate : undefined,
      checkpoints,
    });
  });
  return logistics;
}

export const seedLogistics: LogisticsRecord[] = generateLogistics(seedOrders);

export function generateInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const completedOrders = seedOrders.filter((o) => o.status === "completed" || o.status === "delivered").slice(0, 30);
  completedOrders.forEach((order, idx) => {
    invoices.push({
      id: `inv_${idx + 1}`,
      invoiceNo: `INV${2026}${String(idx + 1).padStart(8, "0")}`,
      amount: order.amount,
      invoiceDate: order.deliveryDate,
      buyer: seedEnterprises.find((e) => e.id === order.coreEnterpriseId)?.name || "",
      seller: seedEnterprises.find((e) => e.id === order.supplierId)?.name || "",
      verified: Math.random() > 0.1,
      verificationScore: 80 + Math.floor(Math.random() * 20),
    });
  });
  return invoices;
}

export const seedInvoices: Invoice[] = generateInvoices();

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "critical";
}

export function generateCreditScores(): CreditScore[] {
  const suppliers = seedEnterprises.filter((e) => e.role === "supplier");
  const baseScores = [88, 76, 82, 65, 72, 90, 58, 70];
  const limits = [30000000, 20000000, 25000000, 15000000, 18000000, 50000000, 10000000, 16000000];

  return suppliers.map((sup, idx) => {
    const base = baseScores[idx];
    const history: Array<{ date: string; score: number }> = [];
    for (let m = 11; m >= 0; m--) {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - m);
      monthDate.setDate(1);
      const variance = Math.floor(Math.random() * 10) - 5;
      history.push({
        date: monthDate.toISOString(),
        score: Math.max(30, Math.min(95, base + variance + Math.floor((11 - m) / 3))),
      });
    }
    const overallScore = history[history.length - 1].score;
    const lastScore = history[history.length - 2]?.score || overallScore;
    const trend: CreditScore["trend"] = overallScore > lastScore ? "up" : overallScore < lastScore ? "down" : "stable";
    const usedLimit = Math.floor(limits[idx] * (0.2 + Math.random() * 0.5));

    return {
      id: `cs_${sup.id}`,
      supplierId: sup.id,
      overallScore,
      riskLevel: getRiskLevel(overallScore),
      creditLimit: limits[idx],
      availableLimit: limits[idx] - usedLimit,
      factors: {
        transactionHistory: Math.min(100, base + Math.floor(Math.random() * 10) - 5),
        financialHealth: Math.min(100, base - 3 + Math.floor(Math.random() * 10) - 5),
        operationStability: Math.min(100, base + 2 + Math.floor(Math.random() * 10) - 5),
        industryEnvironment: Math.min(100, base - 5 + Math.floor(Math.random() * 10) - 5),
        compliance: Math.min(100, base + 5 + Math.floor(Math.random() * 5) - 2),
      },
      evaluationDate: daysAgo(0),
      trend,
      history,
    };
  });
}

export const seedCreditScores: CreditScore[] = generateCreditScores();

function genPlans(amount: number, termDays: number, riskLevel: RiskLevel): FinancingPlan[] {
  const plans: FinancingPlan[] = [];
  const baseRate = riskLevel === "low" ? 0.055 : riskLevel === "medium" ? 0.072 : riskLevel === "high" ? 0.095 : 0.12;
  const methods: RepaymentMethod[] = ["bullet", "equal_installment", "interest_only"];
  const nameMap: Record<RepaymentMethod, string> = {
    bullet: "到期一次性还本付息",
    equal_installment: "等额本息分期",
    interest_only: "按月付息到期还本",
  };

  methods.forEach((m, i) => {
    const rateAdjust = (i - 1) * 0.003;
    const annualRate = baseRate + rateAdjust;
    const termYears = termDays / 365;
    const totalInterest = amount * annualRate * termYears;
    const months = Math.max(1, Math.round(termDays / 30));
    let monthlyPayment: number;
    if (m === "bullet") {
      monthlyPayment = 0;
    } else if (m === "equal_installment") {
      const monthlyRate = annualRate / 12;
      monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    } else {
      monthlyPayment = (amount * annualRate) / 12;
    }
    plans.push({
      id: `plan_${i}`,
      name: nameMap[m],
      principal: amount,
      annualRate: Math.round(annualRate * 10000) / 10000,
      termDays,
      totalInterest: Math.round(totalInterest),
      monthlyPayment: Math.round(monthlyPayment),
      repaymentMethod: m,
    });
  });
  return plans;
}

function genApprovalNodes(amount: number, riskLevel: RiskLevel): ApprovalNode[] {
  const nodes: ApprovalNode[] = [];
  const nowTime = new Date(now);

  if (amount <= 500000) {
    const deadline = new Date(nowTime);
    deadline.setHours(deadline.getHours() + 24);
    nodes.push({
      index: 0,
      name: "客户经理审批",
      requiredRole: "relationship_manager",
      timeoutHours: 24,
      status: "pending",
      deadline: deadline.toISOString(),
    });
  } else if (amount <= 2000000) {
    nodes.push({
      index: 0,
      name: "客户经理初审",
      requiredRole: "relationship_manager",
      timeoutHours: 12,
      status: "pending",
    });
    const deadline = new Date(nowTime);
    deadline.setHours(deadline.getHours() + 48);
    nodes.push({
      index: 1,
      name: "风控总监审批",
      requiredRole: "risk_director",
      timeoutHours: 48,
      status: "pending",
      deadline: deadline.toISOString(),
    });
  } else {
    nodes.push({
      index: 0,
      name: "客户经理初审",
      requiredRole: "relationship_manager",
      timeoutHours: 8,
      status: "pending",
    });
    nodes.push({
      index: 1,
      name: "风控总监复核",
      requiredRole: "risk_director",
      timeoutHours: 24,
      status: "pending",
    });
    const deadline = new Date(nowTime);
    deadline.setHours(deadline.getHours() + 72);
    nodes.push({
      index: 2,
      name: "贷审会审批",
      requiredRole: "credit_committee",
      timeoutHours: 72,
      status: "pending",
      deadline: deadline.toISOString(),
    });
    nodes.push({
      index: 3,
      name: "副总裁最终审批(超时升级)",
      requiredRole: "admin",
      timeoutHours: 24,
      status: "skipped",
    });
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    const exists = nodes.some((n) => n.requiredRole === "risk_director");
    if (!exists) {
      nodes.splice(nodes.length - 1, 0, {
        index: nodes.length - 1,
        name: "风控总监风险审核",
        requiredRole: "risk_director",
        timeoutHours: 24,
        status: "pending",
      });
    }
  }
  return nodes;
}

function advanceApproval(nodes: ApprovalNode[], stages: number): ApprovalNode[] {
  const result = nodes.map((n) => ({ ...n }));
  const approvers = ["u_rm_1", "u_risk_1", "u_cc_1", "u_admin_1"];
  for (let i = 0; i < Math.min(stages, result.length); i++) {
    const n = result[i];
    if (n.status === "skipped") continue;
    n.status = "approved";
    n.decision = "approve";
    n.assigneeId = approvers[i % approvers.length];
    n.decidedAt = daysAgo(Math.max(0, stages - i));
    n.comment = ["资料齐全，同意", "风险可控，审批通过", "符合政策，同意放款"][i % 3];
  }
  if (stages < result.length && result[stages].status !== "skipped") {
    result[stages].status = "in_progress";
    result[stages].assigneeId = approvers[stages % approvers.length];
  }
  return result;
}

const statusProgress: Record<FinanceStatus, number> = {
  draft: 0,
  submitted: 0,
  verifying: 0,
  approved: 1,
  rejected: 1,
  disbursed: 99,
  repaid: 99,
  overdue: 99,
  write_off: 99,
};

export function generateFinanceData(): {
  applications: FinanceApplication[];
  workflows: ApprovalWorkflow[];
} {
  const applications: FinanceApplication[] = [];
  const workflows: ApprovalWorkflow[] = [];

  const suppliers = seedEnterprises.filter((e) => e.role === "supplier");
  const statuses: FinanceStatus[] = [
    "draft",
    "submitted",
    "verifying",
    "approved",
    "approved",
    "disbursed",
    "disbursed",
    "disbursed",
    "repaid",
    "repaid",
    "repaid",
    "overdue",
    "overdue",
    "rejected",
    "write_off",
  ];
  const purposes = [
    "订单原材料采购",
    "扩大生产流动资金",
    "支付上游供应商货款",
    "设备采购资金",
    "工资及运营周转",
  ];
  const terms = [30, 60, 90, 120, 180, 365];

  for (let i = 0; i < 15; i++) {
    const supplier = suppliers[i % suppliers.length];
    const binding = seedSupplierBindings.find((b) => b.supplierId === supplier.id)!;
    const cs = seedCreditScores.find((c) => c.supplierId === supplier.id)!;
    const amount = [200000, 450000, 800000, 1200000, 1800000, 2500000, 3500000, 5000000][i % 8];
    const termDays = terms[i % terms.length];
    const status = statuses[i];
    const supplierOrders = seedOrders.filter((o) => o.supplierId === supplier.id);
    const orderIds = supplierOrders.slice(0, 3 + (i % 2)).map((o) => o.id);
    const supplierInvoices = seedInvoices.filter((inv) => inv.seller === supplier.name);
    const invoiceIds = supplierInvoices.slice(0, 2).map((inv) => inv.id);
    const plans = genPlans(amount, termDays, cs.riskLevel);
    const selectedPlanId = status !== "draft" && status !== "submitted" ? plans[i % 3].id : undefined;
    const nodes = genApprovalNodes(amount, cs.riskLevel);
    const progressStages = statusProgress[status];
    const advancedNodes = advanceApproval(nodes, progressStages);
    const appNo = `FA${2026}${String(i + 1).padStart(6, "0")}`;

    const createdAt = daysAgo(90 - i * 5);
    const submittedAt = status !== "draft" ? daysAgo(88 - i * 5) : undefined;
    const approvedAt = status === "approved" || status === "disbursed" || status === "repaid" || status === "overdue" || status === "write_off" ? daysAgo(85 - i * 5) : undefined;
    const disbursedAt = status === "disbursed" || status === "repaid" || status === "overdue" || status === "write_off" ? daysAgo(83 - i * 5) : undefined;

    const workflowId = `wf_${i + 1}`;
    workflows.push({
      id: workflowId,
      financeApplicationId: `fa_${i + 1}`,
      amount,
      riskLevel: cs.riskLevel,
      nodes: advancedNodes,
      currentNodeIndex: Math.min(progressStages, advancedNodes.length - 1),
      status:
        status === "rejected"
          ? "rejected"
          : status === "approved" || status === "disbursed" || status === "repaid"
          ? "approved"
          : status === "overdue" || status === "write_off"
          ? "approved"
          : "pending",
      escalated: false,
      createdAt,
      completedAt: approvedAt,
    });

    applications.push({
      id: `fa_${i + 1}`,
      applicationNo: appNo,
      supplierId: supplier.id,
      coreEnterpriseId: binding.coreEnterpriseId,
      amount,
      termDays,
      purpose: purposes[i % purposes.length],
      attachedInvoiceIds: invoiceIds,
      attachedOrderIds: orderIds,
      riskLevel: cs.riskLevel,
      status,
      selectedPlanId,
      verificationResult:
        status !== "draft" && status !== "submitted"
          ? {
              authenticity: status !== "rejected",
              confidence: status === "rejected" ? 55 : 92,
              notes: status === "rejected" ? "发票存在疑点，贸易背景存疑" : "贸易背景真实，单据核验通过",
            }
          : undefined,
      financingPlans: plans,
      approvalWorkflowId: status !== "draft" ? workflowId : undefined,
      createdAt,
      submittedAt,
      approvedAt,
      disbursedAt,
      managerId: i % 2 === 0 ? "u_rm_1" : "u_rm_2",
    });
  }
  return { applications, workflows };
}

export const { applications: seedFinanceApplications, workflows: seedApprovalWorkflows } = generateFinanceData();

export function generateMonitoringMetrics(): MonitoringMetrics[] {
  const metrics: MonitoringMetrics[] = [];
  const suppliers = seedEnterprises.filter((e) => e.role === "supplier");

  suppliers.forEach((sup) => {
    for (let d = 89; d >= 0; d--) {
      const baseOrders = 10 + Math.floor(Math.random() * 15);
      const mom = Math.random() * 0.4 - 0.2;
      const returnBase = 0.02 + Math.random() * 0.03;
      const pcycle = 30 + Math.floor(Math.random() * 20);
      metrics.push({
        id: `mm_${sup.id}_${d}`,
        supplierId: sup.id,
        date: daysAgo(d),
        orderVolume: baseOrders,
        orderVolumeMom: Math.round(mom * 10000) / 10000,
        returnRate: Math.round(returnBase * 10000) / 10000,
        returnRateMom: Math.round((Math.random() * 0.02 - 0.01) * 10000) / 10000,
        paymentCycleDays: pcycle,
        paymentCycleMom: Math.round((Math.random() * 4 - 2) * 100) / 100,
        activeFinancingCount: 1 + Math.floor(Math.random() * 3),
        totalOutstanding: 1000000 + Math.floor(Math.random() * 4000000),
      });
    }
  });
  return metrics;
}

export const seedMonitoringMetrics: MonitoringMetrics[] = generateMonitoringMetrics();

export function generateAlertEvents(): AlertEvent[] {
  const suppliers = seedEnterprises.filter((e) => e.role === "supplier");
  const types: AlertType[] = ["order_drop", "return_spike", "payment_delay", "abnormal_behavior"];
  const levels: RiskLevel[] = ["low", "medium", "high", "medium", "low", "high", "critical"];
  const titles: Record<AlertType, string[]> = {
    order_drop: ["近7日订单量环比下降35%", "月订单量连续3个月下滑", "核心客户订单骤减"],
    return_spike: ["退货率飙升至8.5%", "单周退货异常增多", "质量问题导致批量退货"],
    payment_delay: ["应收账款逾期超30天", "回款周期延长至65天", "银行账户流水异常"],
    abnormal_behavior: ["频繁变更开票信息", "关联交易异常增多", "法定代表人突然变更"],
  };
  const alerts: AlertEvent[] = [];

  for (let i = 0; i < 15; i++) {
    const type = types[i % types.length];
    const level = levels[i % levels.length];
    const sup = suppliers[i % suppliers.length];
    const titleList = titles[type];
    alerts.push({
      id: `alert_${i + 1}`,
      supplierId: sup.id,
      type,
      level,
      title: titleList[i % titleList.length],
      description:
        type === "order_drop"
          ? "该供应商近30天订单量较上一周期下降明显，需关注其经营稳定性"
          : type === "return_spike"
          ? "近期退货数量异常增加，可能存在产品质量下滑或交付问题"
          : type === "payment_delay"
          ? "应收账款回收周期拉长，可能影响该供应商现金流及还款能力"
          : "经营行为存在异常变动，建议人工复核其经营状况",
      metricValue: [0.35, 0.085, 65, 5][i % 4],
      threshold: [0.2, 0.05, 45, 3][i % 4],
      triggeredAt: daysAgo(i + 1),
      status: (["new", "new", "processing", "resolved", "resolved", "false_alarm"] as AlertEvent["status"][])[i % 6],
      frozenCreditLimit: level === "high" || level === "critical" ? 500000 + Math.floor(Math.random() * 1500000) : undefined,
      handledBy: i > 7 ? (i % 2 === 0 ? "u_risk_1" : "u_rm_1") : undefined,
      handledAt: i > 7 ? daysAgo(Math.max(1, i - 5)) : undefined,
      handlingNotes: i > 7 ? (i % 3 === 0 ? "已与供应商核实，订单波动属季节性正常现象" : i % 3 === 1 ? "已冻结部分授信额度，持续跟踪观察" : "排除误报，解除预警") : undefined,
    });
  }
  return alerts;
}

export const seedAlertEvents: AlertEvent[] = generateAlertEvents();

export function generateRepaymentAndCollection(): {
  repayments: RepaymentRecord[];
  collections: CollectionCase[];
} {
  const repayments: RepaymentRecord[] = [];
  const collections: CollectionCase[] = [];
  let rpCount = 0;
  let colCount = 0;

  seedFinanceApplications
    .filter((a) => a.status === "disbursed" || a.status === "repaid" || a.status === "overdue" || a.status === "write_off")
    .forEach((app) => {
      const plan = app.financingPlans.find((p) => p.id === app.selectedPlanId) || app.financingPlans[0];
      if (!plan || !app.disbursedAt) return;
      const periods = Math.max(1, Math.round(plan.termDays / 30));
      const disbursedDate = new Date(app.disbursedAt);

      for (let p = 1; p <= periods; p++) {
        const dueDate = new Date(disbursedDate);
        dueDate.setMonth(dueDate.getMonth() + p);

        let principal: number;
        let interest: number;
        if (plan.repaymentMethod === "bullet") {
          principal = p === periods ? plan.principal : 0;
          interest = p === periods ? plan.totalInterest : 0;
        } else if (plan.repaymentMethod === "equal_installment") {
          const monthlyRate = plan.annualRate / 12;
          const mp = plan.monthlyPayment;
          const remaining = plan.principal - (p - 1) * (plan.principal / periods);
          interest = Math.round(remaining * monthlyRate);
          principal = mp - interest;
        } else {
          principal = p === periods ? plan.principal : 0;
          interest = Math.round((plan.principal * plan.annualRate) / 12);
        }

        rpCount++;
        const isOverdue = app.status === "overdue" && p <= periods - 1;
        const isPaid = app.status === "repaid" || (app.status !== "overdue" && p < periods) || (app.status === "disbursed" && p < periods);
        const actualPaid = isPaid ? principal + interest : isOverdue ? Math.round((principal + interest) * 0.3) : 0;

        const repayment: RepaymentRecord = {
          id: `rp_${rpCount}`,
          financeApplicationId: app.id,
          periodNo: p,
          dueDate: dueDate.toISOString(),
          principal,
          interest,
          totalAmount: principal + interest,
          status: isPaid ? "paid" : isOverdue ? (actualPaid > 0 ? "partial" : "overdue") : "pending",
          actualPaidAt: isPaid ? dueDate.toISOString() : actualPaid > 0 ? dueDate.toISOString() : undefined,
          actualPaidAmount: actualPaid > 0 ? actualPaid : undefined,
        };

        if (repayment.status === "overdue" || repayment.status === "partial") {
          colCount++;
          const overdueDays = Math.max(1, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          const caseId = `col_${colCount}`;
          repayment.collectionCaseId = caseId;
          collections.push({
            id: caseId,
            caseNo: `COL${2026}${String(colCount).padStart(6, "0")}`,
            financeApplicationId: app.id,
            supplierId: app.supplierId,
            overdueDays,
            overdueAmount: repayment.totalAmount - (repayment.actualPaidAmount || 0),
            status: app.status === "write_off" ? "written_off" : (["new", "contacted", "promise_to_pay", "escalated"] as CollectionCase["status"][])[colCount % 4],
            assignedTo: colCount % 2 === 0 ? "u_rm_1" : "u_rm_2",
            followUpRecords: [
              { time: daysAgo(Math.max(1, overdueDays - 3)), operator: "系统", content: "自动检测到逾期，生成催收工单" },
              ...(colCount > 1
                ? [{ time: daysAgo(Math.max(1, overdueDays - 1)), operator: colCount % 2 === 0 ? "张伟" : "李梅", content: "已电话联系客户，客户承诺3日内还款" }]
                : []),
            ],
            createdAt: daysAgo(overdueDays),
          });
        }
        repayments.push(repayment);
      }
    });

  return { repayments, collections };
}

export const { repayments: seedRepayments, collections: seedCollections } = generateRepaymentAndCollection();
