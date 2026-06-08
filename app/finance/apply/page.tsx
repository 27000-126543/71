"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  X,
  Check,
  ShieldCheck,
  AlertCircle,
  Percent,
  CreditCard,
  Wallet,
  Sparkles,
  Clock,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { store } from "@/src/data/store";
import type {
  CreditScore,
  TransactionOrder,
  Invoice,
  FinancingPlan,
  RepaymentMethod,
  FinanceApplication,
} from "@/src/types";
import { formatCurrency, formatDate } from "@/src/lib/utils";

interface SelectedOrder extends TransactionOrder {
  selected: boolean;
}

interface UploadedInvoice extends Invoice {
  file?: File;
  progress?: number;
}

const TERM_OPTIONS = [30, 60, 90, 180, 360];

const repaymentMethodText: Record<RepaymentMethod, string> = {
  bullet: "到期一次性还本付息",
  equal_installment: "等额本息分期",
  interest_only: "先息后本",
};

export default function FinanceApplyPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationNo, setApplicationNo] = useState("");
  const [approvalWorkflowId, setApprovalWorkflowId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<FinanceApplication | null>(null);

  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [orders, setOrders] = useState<SelectedOrder[]>([]);

  const [amount, setAmount] = useState(500000);
  const [termDays, setTermDays] = useState(90);
  const [purpose, setPurpose] = useState("");
  const [invoices, setInvoices] = useState<UploadedInvoice[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [plans, setPlans] = useState<FinancingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!user?.enterpriseId) return;
    (async () => {
      const cs = await store.creditScores.getBySupplier(user.enterpriseId!);
      setCreditScore(cs || null);
      const allOrders = await store.orders.filter(
        (o) => o.supplierId === user.enterpriseId && o.status === "completed"
      );
      setOrders(allOrders.map((o) => ({ ...o, selected: false })));
    })();
  }, [user]);

  const availableLimit = creditScore?.availableLimit || 2400000;
  const selectedOrdersAmount = orders.filter((o) => o.selected).reduce((s, o) => s + o.amount, 0);
  const selectedInvoicesAmount = invoices.reduce((s, i) => s + i.amount, 0);

  const generatePlans = useCallback(() => {
    const calcInterest = (principal: number, annualRate: number, days: number) =>
      principal * (annualRate / 100) * (days / 360);

    const basePlans: FinancingPlan[] = [
      {
        id: "plan-1",
        name: "标准融资方案",
        principal: amount,
        annualRate: 6.8,
        termDays,
        totalInterest: calcInterest(amount, 6.8, termDays),
        monthlyPayment: (amount + calcInterest(amount, 6.8, termDays)) / Math.ceil(termDays / 30),
        repaymentMethod: "bullet",
      },
      {
        id: "plan-2",
        name: "优选低息方案",
        principal: amount,
        annualRate: 5.8,
        termDays,
        totalInterest: calcInterest(amount, 5.8, termDays),
        monthlyPayment: (amount + calcInterest(amount, 5.8, termDays)) / Math.ceil(termDays / 30),
        repaymentMethod: "equal_installment",
      },
      {
        id: "plan-3",
        name: "灵活还款方案",
        principal: amount,
        annualRate: 7.2,
        termDays,
        totalInterest: calcInterest(amount, 7.2, termDays),
        monthlyPayment: calcInterest(amount, 7.2, termDays) / Math.ceil(termDays / 30),
        repaymentMethod: "interest_only",
      },
    ];
    setPlans(basePlans);
    setSelectedPlanId(basePlans[0].id);
  }, [amount, termDays]);

  useEffect(() => {
    if (step === 3) generatePlans();
  }, [step, generatePlans]);

  const toggleOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, selected: !o.selected } : o)));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newInvoices: UploadedInvoice[] = Array.from(files).map((file, idx) => ({
      id: `inv-new-${Date.now()}-${idx}`,
      invoiceNo: `FP${Math.floor(Math.random() * 1000000).toString().padStart(8, "0")}`,
      amount: Math.floor(Math.random() * 300000) + 50000,
      invoiceDate: new Date().toISOString(),
      buyer: "上海华信科技集团有限公司",
      seller: user?.name || "上海鑫源供应链有限公司",
      verified: Math.random() > 0.2,
      verificationScore: Math.floor(Math.random() * 20) + 80,
      file,
      progress: Math.floor(Math.random() * 30) + 70,
    }));
    setInvoices((prev) => [...prev, ...newInvoices]);
    setTimeout(() => {
      setInvoices((prev) => prev.map((i) => (newInvoices.some((n) => n.id === i.id) ? { ...i, progress: 100 } : i)));
    }, 1500);
  };

  const removeInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return amount > 0 && amount <= availableLimit && TERM_OPTIONS.includes(termDays) && purpose.trim().length > 0;
      case 2:
        return orders.some((o) => o.selected) || invoices.length > 0;
      case 3:
        return !!selectedPlanId;
      case 4:
        return agreed;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const selectedOrderIds = orders.filter((o) => o.selected).map((o) => o.id);
    const invoiceIds: string[] = [];
    for (const inv of invoices) {
      const existing = await store.invoices.get(inv.id);
      if (existing) {
        invoiceIds.push(inv.id);
      } else {
        const created = await store.invoices.create(inv);
        invoiceIds.push(created.id);
      }
    }

    try {
      const res = await fetch("/api/finance/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: user?.enterpriseId,
          coreEnterpriseId: "ce_001",
          amount,
          termDays,
          purpose,
          attachedInvoiceIds: invoiceIds,
          attachedOrderIds: selectedOrderIds,
          selectedPlanId,
          managerId: user?.id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setSubmitError(data.message || "提交失败");
        if (data.application) {
          setApplicationData(data.application);
        }
        return;
      }

      if (data.data) {
        setApplicationData(data.data);
        setApplicationNo(data.data.applicationNo);
        setApprovalWorkflowId(data.data.approvalWorkflowId || "");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppLayout requiredRoles={["supplier"]}>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Card className="w-full max-w-lg text-center">
            <CardContent className="p-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-status-success" />
              </div>
              <h2 className="text-2xl font-bold text-navy-600 mb-2">融资申请已提交成功</h2>
              <p className="text-navy-400 mb-6">系统已完成验真、生成融资方案并创建审批流程</p>
              <div className="p-5 rounded-xl bg-navy-50 border border-navy-100 text-left space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-navy-500">申请编号</span>
                  <span className="font-mono font-semibold text-navy-700">{applicationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">融资金额</span>
                  <span className="font-semibold text-gold-600">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">融资期限</span>
                  <span className="font-semibold text-navy-700">{termDays} 天</span>
                </div>
                {approvalWorkflowId && (
                  <div className="flex justify-between items-center">
                    <span className="text-navy-500 flex items-center gap-1">
                      <FileText className="w-4 h-4" /> 审批流程编号
                    </span>
                    <span className="font-mono font-semibold text-navy-700">{approvalWorkflowId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-navy-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 当前审批节点
                  </span>
                  <Badge variant="warning">客户经理审核</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 预计审批时间
                  </span>
                  <span className="font-semibold text-navy-700">1-3 个工作日</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => (window.location.href = "/finance/list")}
                >
                  查看申请列表
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={() => (window.location.href = "/supplier/workbench")}
                >
                  返回工作台
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const steps = [
    { id: 1, title: "基础信息", icon: DollarSign },
    { id: 2, title: "贸易背景", icon: FileText },
    { id: 3, title: "方案选择", icon: Sparkles },
    { id: 4, title: "确认提交", icon: ShieldCheck },
  ];

  return (
    <AppLayout requiredRoles={["supplier"]}>
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy-600">融资申请</h1>
            <p className="text-navy-400 mt-1 text-sm">填写融资信息并提交审批</p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-navy-500 to-navy-600 text-white border-navy-400">
          <CardContent className="py-5 px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-navy-200 text-xs mb-1">可用额度</p>
                <p className="text-2xl font-bold text-gold-300">{formatCurrency(availableLimit)}</p>
              </div>
              <div>
                <p className="text-navy-200 text-xs mb-1">已选订单金额</p>
                <p className="text-xl font-semibold">{formatCurrency(selectedOrdersAmount)}</p>
              </div>
              <div>
                <p className="text-navy-200 text-xs mb-1">已上传发票金额</p>
                <p className="text-xl font-semibold">{formatCurrency(selectedInvoicesAmount)}</p>
              </div>
              <div>
                <p className="text-navy-200 text-xs mb-1">申请金额</p>
                <p className="text-xl font-semibold text-gold-300">{formatCurrency(amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-navy-100" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-status-success border-status-success text-white"
                      : isActive
                      ? "bg-gold-400 border-gold-400 text-navy-900 shadow-glow"
                      : "bg-white border-navy-200 text-navy-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    isActive ? "text-navy-700" : isCompleted ? "text-status-success" : "text-navy-400"
                  }`}
                >
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="amount">融资金额（元）</Label>
                    <span className="text-sm text-navy-400">
                      最高可借：<span className="text-gold-600 font-semibold">{formatCurrency(availableLimit)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Math.min(availableLimit, Math.max(0, Number(e.target.value) || 0)))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[10, 30, 50, 100].map((w) => (
                        <Button
                          key={w}
                          variant="ghost"
                          size="sm"
                          onClick={() => setAmount(Math.min(availableLimit, w * 10000))}
                          className="whitespace-nowrap"
                        >
                          {w}万
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <input
                      type="range"
                      min={0}
                      max={availableLimit}
                      step={10000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full h-2 bg-navy-100 rounded-full appearance-none cursor-pointer accent-gold-400"
                    />
                    <div className="flex justify-between text-xs text-navy-400 mt-1">
                      <span>¥0</span>
                      <span>¥{Math.round(availableLimit / 2).toLocaleString()}</span>
                      <span>{formatCurrency(availableLimit)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">融资期限</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {TERM_OPTIONS.map((t) => {
                      const isSelected = termDays === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setTermDays(t)}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            isSelected
                              ? "border-gold-400 bg-gold-50 shadow-glow"
                              : "border-navy-100 bg-white hover:border-navy-300"
                          }`}
                        >
                          <p className={`text-xl font-bold ${isSelected ? "text-gold-600" : "text-navy-600"}`}>
                            {t}
                          </p>
                          <p className={`text-xs mt-1 ${isSelected ? "text-gold-500" : "text-navy-400"}`}>
                            天
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="purpose" className="mb-2 block">资金用途说明</Label>
                  <Textarea
                    id="purpose"
                    placeholder="请简要描述本次融资的资金用途，如：采购原材料、支付货款、流动资金周转等..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between text-xs text-navy-400 mt-1">
                    <span>请详细填写，有助于提高审批通过率</span>
                    <span>{purpose.length}/500</span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="!mb-0">关联交易订单（可多选）</Label>
                    <Badge variant="default">
                      已选 {orders.filter((o) => o.selected).length} 笔 · {formatCurrency(selectedOrdersAmount)}
                    </Badge>
                  </div>
                  <div className="border border-navy-100 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-navy-50 text-sm font-semibold text-navy-600">
                      <div className="col-span-1"></div>
                      <div className="col-span-2">订单编号</div>
                      <div className="col-span-3">商品名称</div>
                      <div className="col-span-2">数量</div>
                      <div className="col-span-2">金额</div>
                      <div className="col-span-2">订单日期</div>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-navy-100">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => toggleOrder(order.id)}
                          className={`grid grid-cols-12 gap-2 p-3 items-center cursor-pointer transition-colors ${
                            order.selected ? "bg-gold-50" : "hover:bg-navy-50"
                          }`}
                        >
                          <div className="col-span-1">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                order.selected
                                  ? "bg-gold-400 border-gold-400"
                                  : "border-navy-300"
                              }`}
                            >
                              {order.selected && <Check className="w-3.5 h-3.5 text-navy-900" />}
                            </div>
                          </div>
                          <div className="col-span-2 font-mono text-sm text-navy-700">{order.orderNo}</div>
                          <div className="col-span-3 text-navy-700 truncate">{order.productName}</div>
                          <div className="col-span-2 text-navy-600">{order.quantity}</div>
                          <div className="col-span-2 font-semibold text-gold-600">{formatCurrency(order.amount)}</div>
                          <div className="col-span-2 text-sm text-navy-400">{formatDate(order.orderDate)}</div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="p-8 text-center text-navy-400">暂无已完成的交易订单</div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="!mb-0">发票上传</Label>
                    <Badge variant="default">
                      已上传 {invoices.length} 张 · {formatCurrency(selectedInvoicesAmount)}
                    </Badge>
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? "border-gold-400 bg-gold-50"
                        : "border-navy-200 bg-navy-50/30 hover:border-navy-400 hover:bg-navy-50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => document.getElementById("invoice-upload")?.click()}
                  >
                    <input
                      id="invoice-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Upload className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                    <p className="text-navy-600 font-medium">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="text-sm text-navy-400 mt-1">
                      支持 PDF、JPG、PNG 格式，单张不超过 10MB
                    </p>
                  </div>

                  {invoices.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center gap-4 p-3 rounded-xl border border-navy-100 bg-white"
                        >
                          <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-navy-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm text-navy-700 truncate">
                                {inv.file?.name || `发票-${inv.invoiceNo}`}
                              </p>
                              {inv.verified ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> 已验真
                                </Badge>
                              ) : (
                                <Badge variant="warning">验真中</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-navy-400 mt-0.5">
                              <span>票号: {inv.invoiceNo}</span>
                              <span>日期: {formatDate(inv.invoiceDate)}</span>
                              <span>验真分: {inv.verificationScore}</span>
                            </div>
                            {inv.progress && inv.progress < 100 && (
                              <div className="mt-1.5 h-1 w-full bg-navy-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold-400 transition-all"
                                  style={{ width: `${inv.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gold-600">{formatCurrency(inv.amount)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeInvoice(inv.id);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-navy-400 hover:text-status-danger flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gold-50 border border-gold-200">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  <p className="text-sm text-navy-700">
                    基于您的信用状况（评分 <span className="font-semibold text-gold-600">{creditScore?.overallScore || 78}</span> 分），系统为您智能匹配了以下融资方案
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                          isSelected
                            ? "border-gold-400 bg-gradient-to-b from-gold-50 to-white shadow-glow"
                            : "border-navy-100 bg-white hover:border-navy-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gold-400 flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-navy-900" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-bold text-lg ${isSelected ? "text-gold-600" : "text-navy-700"}`}>
                            {plan.name}
                          </h3>
                          {plan.id === "plan-2" && (
                            <Badge variant="gold">推荐</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-navy-500 text-sm flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" /> 年利率
                            </span>
                            <span className="text-xl font-bold text-navy-700">{plan.annualRate}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-navy-500 text-sm flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> 期限
                            </span>
                            <span className="font-semibold text-navy-700">{plan.termDays}天</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-navy-500 text-sm flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" /> 月供
                            </span>
                            <span className="font-semibold text-navy-700">{formatCurrency(plan.monthlyPayment)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-navy-500 text-sm flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> 总利息
                            </span>
                            <span className="font-semibold text-gold-600">{formatCurrency(plan.totalInterest)}</span>
                          </div>
                          <Separator />
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-navy-400 mt-0.5 shrink-0" />
                            <span className="text-xs text-navy-500">
                              {repaymentMethodText[plan.repaymentMethod]}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed border-navy-100">
                          <div className="flex items-center justify-between">
                            <span className="text-navy-500 text-sm">还款总额</span>
                            <span className="text-lg font-bold text-navy-700">
                              {formatCurrency(plan.principal + plan.totalInterest)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-center">请确认融资申请信息</CardTitle>
                </CardHeader>

                {submitError && (
                  <Alert variant="danger">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>提交失败</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold text-navy-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gold-500" /> 基础信息
                  </h4>
                  <div className="p-4 rounded-xl bg-navy-50/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-navy-500">融资金额</span>
                      <span className="font-semibold text-gold-600">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">融资期限</span>
                      <span className="font-semibold text-navy-700">{termDays} 天</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">资金用途</span>
                      <span className="text-navy-700 text-right max-w-[60%]">{purpose}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-navy-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold-500" /> 贸易背景
                  </h4>
                  <div className="p-4 rounded-xl bg-navy-50/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-navy-500">关联订单</span>
                      <span className="font-semibold text-navy-700">
                        {orders.filter((o) => o.selected).length} 笔 · {formatCurrency(selectedOrdersAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">上传发票</span>
                      <span className="font-semibold text-navy-700">
                        {invoices.length} 张 · {formatCurrency(selectedInvoicesAmount)}
                      </span>
                    </div>
                  </div>

                  {selectedPlanId && (() => {
                    const plan = plans.find((p) => p.id === selectedPlanId)!;
                    return (
                      <>
                        <h4 className="font-semibold text-navy-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold-500" /> 融资方案
                        </h4>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-gold-50 to-navy-50/50 border border-gold-200 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-navy-500">方案名称</span>
                            <span className="font-semibold text-gold-600">{plan.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-navy-500">年利率</span>
                            <span className="font-semibold text-navy-700">{plan.annualRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-navy-500">总利息</span>
                            <span className="font-semibold text-gold-600">{formatCurrency(plan.totalInterest)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-navy-500">还款方式</span>
                            <span className="text-navy-700">{repaymentMethodText[plan.repaymentMethod]}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-navy-700 font-medium">还款总额</span>
                            <span className="text-xl font-bold text-navy-700">
                              {formatCurrency(plan.principal + plan.totalInterest)}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    agreed
                      ? "border-gold-400 bg-gold-50"
                      : "border-navy-200 bg-white hover:border-navy-300"
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        agreed ? "bg-gold-400 border-gold-400" : "border-navy-300"
                      }`}
                    >
                      {agreed && <Check className="w-3.5 h-3.5 text-navy-900" />}
                    </div>
                    <div className="text-sm text-navy-600">
                      本人已阅读并同意
                      <a href="#" className="text-gold-600 hover:underline mx-1">《供应链融资服务协议》</a>
                      及
                      <a href="#" className="text-gold-600 hover:underline mx-1">《征信授权书》</a>
                      ，承诺所提供信息真实有效，同意授权平台进行相关信用核查。
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between p-6 pt-0">
            <Button
              variant="ghost"
              onClick={() => (step > 1 ? setStep(step - 1) : window.history.back())}
              disabled={step === 1 && false}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {step === 1 ? "取消" : "上一步"}
            </Button>
            {step < 4 ? (
              <Button variant="gold" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                下一步
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="gold" onClick={handleSubmit} disabled={!canProceed() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    确认提交申请
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
