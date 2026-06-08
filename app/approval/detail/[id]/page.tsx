"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Target,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Gavel,
  UserCheck,
  X,
  ArrowUpRight,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Progress } from "@/src/components/ui/progress";
import { Avatar } from "@/src/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatPercent,
  riskLevelText,
  riskLevelBgColor,
  riskLevelColor,
  userRoleText,
  formatDate,
} from "@/src/lib/utils";
import {
  store,
  initializeStore,
} from "@/src/data/store";
import type {
  ApprovalWorkflow,
  FinanceApplication,
  Enterprise,
  CreditScore,
  TransactionOrder,
  Invoice,
  RiskLevel,
} from "@/src/types";

const alertVariantForRisk = (
  level: RiskLevel
): "default" | "success" | "warning" | "danger" => {
  if (level === "critical" || level === "high") return "danger";
  if (level === "medium") return "warning";
  return "success";
};

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = React.useState<FinanceApplication | null>(null);
  const [workflow, setWorkflow] = React.useState<ApprovalWorkflow | null>(null);
  const [supplier, setSupplier] = React.useState<Enterprise | null>(null);
  const [coreEnterprise, setCoreEnterprise] = React.useState<Enterprise | null>(null);
  const [creditScore, setCreditScore] = React.useState<CreditScore | null>(null);
  const [orders, setOrders] = React.useState<TransactionOrder[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [comment, setComment] = React.useState("");
  const [countdown, setCountdown] = React.useState("");
  const [isTimeout, setIsTimeout] = React.useState(false);

  React.useEffect(() => {
    initializeStore();
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const app = await store.financeApplications.get(id);
      if (!app) {
        setLoading(false);
        return;
      }
      setApplication(app);

      const [wf, enterprises, scores, allOrders, allInvoices] = await Promise.all([
        app.approvalWorkflowId
          ? store.approvalWorkflows.get(app.approvalWorkflowId)
          : Promise.resolve(null),
        store.enterprises.all(),
        store.creditScores.all(),
        store.orders.all(),
        store.invoices.all(),
      ]);

      setWorkflow(wf || null);
      setSupplier(enterprises.find((e) => e.id === app.supplierId) || null);
      setCoreEnterprise(enterprises.find((e) => e.id === app.coreEnterpriseId) || null);
      setCreditScore(scores.find((c) => c.supplierId === app.supplierId) || null);
      setOrders(allOrders.filter((o) => app.attachedOrderIds.includes(o.id)));
      setInvoices(allInvoices.filter((i) => app.attachedInvoiceIds.includes(i.id)));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!workflow) return;
    const currentNode = workflow.nodes[workflow.currentNodeIndex];
    if (!currentNode?.deadline) return;

    const tick = () => {
      const deadline = new Date(currentNode.deadline!);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      setIsTimeout(diff < 0);
      const abs = Math.abs(diff);
      const d = Math.floor(abs / (1000 * 60 * 60 * 24));
      const h = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((abs % (1000 * 60)) / 1000);
      const prefix = diff < 0 ? "已超时 " : "";
      setCountdown(`${prefix}${d}天 ${h}时 ${m}分 ${s}秒`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [workflow]);

  const handleDecision = (decision: "approve" | "conditional" | "reject" | "escalate") => {
    router.back();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mx-auto mb-4" />
            <p className="text-navy-500">加载中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-status-warning" />
          <p className="text-navy-600">未找到该审批记录</p>
          <Button className="mt-4" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>
      </AppLayout>
    );
  }

  const selectedPlan = application.financingPlans.find(
    (p) => p.id === application.selectedPlanId
  ) || application.financingPlans[0];

  const currentNode = workflow?.nodes[workflow.currentNodeIndex];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gold-500" />
                审批详情
              </h1>
              <p className="text-navy-500 text-sm mt-1">
                {application.applicationNo} · 提交于 {formatDateTime(application.submittedAt)}
              </p>
            </div>
          </div>
          <Badge
            className={cn("text-sm py-1.5 px-3 border", riskLevelBgColor(application.riskLevel))}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {riskLevelText(application.riskLevel)}
          </Badge>
        </div>

        <Alert variant={alertVariantForRisk(application.riskLevel)}>
          {application.riskLevel === "critical" || application.riskLevel === "high" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : application.riskLevel === "medium" ? (
            <Info className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <AlertTitle>
            {application.riskLevel === "critical" || application.riskLevel === "high"
              ? "高风险提示"
              : application.riskLevel === "medium"
              ? "中等风险提示"
              : "风险评估良好"}
          </AlertTitle>
          <AlertDescription>
            {application.riskLevel === "critical"
              ? "该申请风险等级为极高风险，请审慎审批，建议升级至高级管理层决策"
              : application.riskLevel === "high"
              ? "该申请风险等级较高，请重点关注贸易背景真实性及还款能力"
              : application.riskLevel === "medium"
              ? "该申请存在一定风险，请按常规流程审批并关注关键指标"
              : "该申请风险可控，可按正常流程审批"}
          </AlertDescription>
        </Alert>

        {workflow && (
          <Card className="border-l-4 border-l-gold-400">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gavel className="w-4 h-4 text-gold-500" />
                审批进度时间轴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-1 overflow-x-auto pb-4">
                {workflow.nodes.map((node, idx) => {
                  const isCurrent = idx === workflow.currentNodeIndex && node.status !== "skipped";
                  const isDone = node.status === "approved" || node.status === "rejected";
                  const isPending = node.status === "pending" || node.status === "in_progress";
                  return (
                    <React.Fragment key={node.index}>
                      <div className="flex flex-col items-center min-w-[120px]">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                            node.status === "approved"
                              ? "bg-status-success text-white shadow-glow"
                              : node.status === "rejected"
                              ? "bg-status-danger text-white"
                              : isCurrent
                              ? "bg-gold-400 text-navy-900 animate-pulse-glow"
                              : node.status === "skipped"
                              ? "bg-gray-100 text-gray-400"
                              : "bg-navy-100 text-navy-500"
                          )}
                        >
                          {node.status === "approved" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : node.status === "rejected" ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm font-medium mt-2 text-center",
                            isCurrent ? "text-gold-500" : isDone ? "text-navy-700" : "text-navy-400"
                          )}
                        >
                          {node.name}
                        </p>
                        <p className="text-xs text-navy-400 mt-1">
                          {userRoleText(node.requiredRole)}
                        </p>
                        {node.decidedAt && (
                          <p className="text-xs text-navy-400 mt-1">
                            {formatDate(node.decidedAt, "MM-dd HH:mm")}
                          </p>
                        )}
                        {node.deadline && (isCurrent || isPending) && (
                          <p className="text-xs text-status-warning mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-0.5" />
                            {formatDate(node.deadline, "MM-dd HH:mm")}
                          </p>
                        )}
                        {node.comment && (
                          <p className="text-xs text-navy-500 mt-1 px-2 py-1 bg-navy-50 rounded max-w-[140px] text-center">
                            {node.comment}
                          </p>
                        )}
                      </div>
                      {idx < workflow.nodes.length - 1 && (
                        <div className="flex-1 min-w-[24px] pt-5">
                          <Progress
                            value={idx < workflow.currentNodeIndex ? 100 : 0}
                            color={idx < workflow.currentNodeIndex ? "success" : "default"}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {workflow.escalated && (
                <div className="mt-3 flex items-center gap-2 text-sm text-status-danger bg-red-50 rounded-lg p-3">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>
                    <strong>超时已自动升级至副总裁审批</strong>，请按高级审批流程处理
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4 text-gold-500" />
                  供应商信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">企业名称</Label>
                    <p className="font-medium text-navy-700 mt-1">{supplier?.name}</p>
                  </div>
                  <div>
                    <Label className="text-navy-500">所属行业</Label>
                    <p className="font-medium text-navy-700 mt-1">{supplier?.industry}</p>
                  </div>
                  <div>
                    <Label className="text-navy-500">统一信用代码</Label>
                    <p className="font-medium text-navy-700 mt-1 font-mono text-sm">
                      {supplier?.unifiedCreditCode}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">信用评分</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-lg text-gold-500">
                        {creditScore?.overallScore ?? "-"}
                      </span>
                      <span className="text-navy-400 text-sm">/ 100</span>
                      {creditScore?.trend === "up" && (
                        <TrendingUp className="w-4 h-4 text-status-success" />
                      )}
                      {creditScore?.trend === "down" && (
                        <TrendingDown className="w-4 h-4 text-status-danger" />
                      )}
                      {creditScore?.trend === "stable" && (
                        <Minus className="w-4 h-4 text-navy-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-navy-500">风险等级</Label>
                    <div className="mt-1">
                      <Badge
                        className={cn("border", riskLevelBgColor(creditScore?.riskLevel || "low"))}
                      >
                        {riskLevelText(creditScore?.riskLevel || "low")}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-navy-500">可用授信额度</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {formatCurrency(creditScore?.availableLimit || 0)}
                      <span className="text-navy-400 text-sm ml-2">
                        / 总额度 {formatCurrency(creditScore?.creditLimit || 0)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4 text-gold-500" />
                  融资基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">融资金额</Label>
                    <p className="font-bold text-xl text-navy-700 mt-1 text-gold-500">
                      {formatCurrency(application.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">融资期限</Label>
                    <p className="font-medium text-navy-700 mt-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-navy-400" />
                      {application.termDays} 天
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">融资用途</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {application.purpose}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">核心企业</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {coreEnterprise?.name}
                    </p>
                  </div>
                </div>

                {selectedPlan && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-navy-500">方案详情</Label>
                      <div className="mt-2 p-4 bg-gradient-to-r from-gold-50 to-navy-50 rounded-lg border border-gold-100">
                        <p className="font-semibold text-navy-700 mb-3">
                          {selectedPlan.name}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-navy-500">年化利率: </span>
                            <span className="font-semibold text-navy-700">
                              {formatPercent(selectedPlan.annualRate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">总利息: </span>
                            <span className="font-semibold text-navy-700">
                              {formatCurrency(selectedPlan.totalInterest)}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">月供: </span>
                            <span className="font-semibold text-navy-700">
                              {formatCurrency(selectedPlan.monthlyPayment)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-4 h-4 text-gold-500" />
                  贸易背景
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {application.verificationResult && (
                  <div
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg",
                      application.verificationResult.authenticity
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    )}
                  >
                    {application.verificationResult.authenticity ? (
                      <CheckCircle className="w-5 h-5 text-status-success mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-status-danger mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-semibold",
                          application.verificationResult.authenticity
                            ? "text-status-success"
                            : "text-status-danger"
                        )}
                      >
                        发票验真结果:{" "}
                        {application.verificationResult.authenticity ? "通过" : "存在疑点"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-navy-600">
                          置信度:{" "}
                          <span className="font-semibold">
                            {formatPercent(application.verificationResult.confidence / 100)}
                          </span>
                        </span>
                        <Badge
                          variant={
                            application.verificationResult.authenticity ? "success" : "danger"
                          }
                        >
                          {application.verificationResult.authenticity ? "验证通过" : "验证未通过"}
                        </Badge>
                      </div>
                      <p className="text-sm text-navy-500 mt-2">
                        {application.verificationResult.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-navy-500">关联订单</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>订单编号</TableHead>
                          <TableHead>产品名称</TableHead>
                          <TableHead>数量</TableHead>
                          <TableHead className="text-right">金额</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-navy-400 py-6">
                              暂无关联订单
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((o) => (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono text-sm">
                                {o.orderNo}
                              </TableCell>
                              <TableCell>{o.productName}</TableCell>
                              <TableCell>{o.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(o.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    o.status === "completed"
                                      ? "success"
                                      : o.status === "returned"
                                      ? "danger"
                                      : "default"
                                  }
                                >
                                  {{
                                    created: "已创建",
                                    shipped: "运输中",
                                    delivered: "已送达",
                                    completed: "已完成",
                                    returned: "已退回",
                                  }[o.status]}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {invoices.length > 0 && (
                  <div>
                    <Label className="text-navy-500">关联发票</Label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-navy-100 bg-white"
                        >
                          <div>
                            <p className="font-mono text-sm text-navy-600">
                              {inv.invoiceNo}
                            </p>
                            <p className="text-xs text-navy-400 mt-0.5">
                              开票日期: {formatDate(inv.invoiceDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-navy-700">
                              {formatCurrency(inv.amount)}
                            </p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              {inv.verified ? (
                                <CheckCircle className="w-3.5 h-3.5 text-status-success" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                              )}
                              <span
                                className={cn(
                                  "text-xs",
                                  inv.verified ? "text-status-success" : "text-status-warning"
                                )}
                              >
                                {inv.verified ? "已验真" : "待验真"} ·{" "}
                                {inv.verificationScore}分
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-t-4 border-t-gold-400 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="w-4 h-4 text-gold-500" />
                  审批操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {currentNode && (
                  <div
                    className={cn(
                      "p-4 rounded-lg border",
                      isTimeout
                        ? "bg-red-50 border-red-200"
                        : "bg-gold-50 border-gold-200"
                    )}
                  >
                    <p className="text-sm text-navy-500">当前节点</p>
                    <p className="font-semibold text-navy-700 mt-1">
                      {currentNode.name}
                    </p>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-navy-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        截止时间
                      </span>
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold",
                          isTimeout ? "text-status-danger" : "text-navy-700"
                        )}
                      >
                        {formatDateTime(currentNode.deadline, "MM-dd HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-navy-500">倒计时</span>
                      <span
                        className={cn(
                          "font-mono text-sm font-bold",
                          isTimeout ? "text-status-danger" : "text-gold-500"
                        )}
                      >
                        {countdown}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="approval-comment">审批意见</Label>
                  <Textarea
                    id="approval-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入审批意见..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="col-span-2 bg-status-success hover:bg-green-600"
                    onClick={() => handleDecision("approve")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    通过
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleDecision("conditional")}
                  >
                    有条件通过
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDecision("escalate")}
                  >
                    升级上报
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="col-span-2"
                    onClick={() => handleDecision("reject")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                </div>

                {isTimeout && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
                    <AlertTriangle className="w-4 h-4 text-status-danger flex-shrink-0" />
                    <span className="text-status-danger">
                      <strong>超时预警:</strong> 本节点已超时，系统将自动升级至副总裁审批
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
