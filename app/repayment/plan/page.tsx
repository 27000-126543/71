"use client";

import * as React from "react";
import {
  Wallet,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Eye,
  FileText,
  History,
  Building2,
  Banknote,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Avatar } from "@/src/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
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
  formatDate,
  formatDateTime,
} from "@/src/lib/utils";
import { store, initializeStore } from "@/src/data/store";
import type {
  RepaymentRecord,
  FinanceApplication,
  Enterprise,
} from "@/src/types";

const statusText: Record<RepaymentRecord["status"], string> = {
  pending: "待扣",
  auto_deducting: "代扣中",
  paid: "已还",
  overdue: "逾期",
  partial: "部分还款",
};

const statusBadgeVariant: Record<RepaymentRecord["status"], "default" | "success" | "warning" | "danger" | "gold"> = {
  pending: "default",
  auto_deducting: "gold",
  paid: "success",
  overdue: "danger",
  partial: "warning",
};

const mockAccounts = [
  { id: "1", bankName: "中国工商银行", accountNo: "6222 0212 3456 7890", holder: "恒达精密零部件有限公司" },
  { id: "2", bankName: "中国建设银行", accountNo: "6217 0098 7654 3210", holder: "盛华新材料科技" },
];

export default function RepaymentPlanPage() {
  const [plans, setPlans] = React.useState<(RepaymentRecord & { app?: FinanceApplication; supplier?: Enterprise; autoDeduct: boolean })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<RepaymentRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [relatedApp, setRelatedApp] = React.useState<FinanceApplication | null>(null);
  const [relatedSupplier, setRelatedSupplier] = React.useState<Enterprise | null>(null);
  const [relatedPlans, setRelatedPlans] = React.useState<RepaymentRecord[]>([]);

  React.useEffect(() => {
    initializeStore();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRepayments, allApps, allSuppliers] = await Promise.all([
        store.repayments.all(),
        store.financeApplications.all(),
        store.enterprises.all(),
      ]);
      const enriched = allRepayments.map((r, idx) => ({
        ...r,
        app: allApps.find((a) => a.id === r.financeApplicationId),
        supplier: allSuppliers.find(
          (s) => s.id === allApps.find((a) => a.id === r.financeApplicationId)?.supplierId
        ),
        autoDeduct: idx % 3 !== 2,
      }));
      setPlans(enriched);
    } finally {
      setLoading(false);
    }
  };

  const summary = React.useMemo(() => {
    let total = 0;
    let pending = 0;
    let paid = 0;
    let overdue = 0;
    let monthly = 0;
    const now = new Date("2026-06-08");
    plans.forEach((p) => {
      total += p.totalAmount;
      if (p.status === "paid") paid += p.totalAmount;
      if (p.status === "overdue" || p.status === "partial") overdue += p.totalAmount - (p.actualPaidAmount || 0);
      if (p.status === "pending" || p.status === "auto_deducting") pending += p.totalAmount;
      const due = new Date(p.dueDate);
      if (due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth()) {
        monthly += p.totalAmount;
      }
    });
    return { total, pending, paid, overdue, monthly };
  }, [plans]);

  const openDetail = async (r: RepaymentRecord) => {
    setSelected(r);
    const [apps, suppliers, related] = await Promise.all([
      store.financeApplications.get(r.financeApplicationId),
      store.enterprises.all(),
      store.repayments.filter((rp) => rp.financeApplicationId === r.financeApplicationId),
    ]);
    setRelatedApp(apps || null);
    setRelatedSupplier(suppliers.find((s) => s.id === apps?.supplierId) || null);
    setRelatedPlans(related);
    setDetailOpen(true);
  };

  const toggleAutoDeduct = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, autoDeduct: !p.autoDeduct } : p))
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-gold-500" />
            还款计划管理
          </h1>
          <p className="text-navy-500 text-sm mt-1">
            管理融资还款计划，设置自动划扣，跟踪还款状态
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-navy-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">待还款总额</p>
                  <p className="text-2xl font-bold text-navy-700 mt-2">
                    {formatCurrency(summary.pending)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-navy-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gold-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">本月应还</p>
                  <p className="text-2xl font-bold text-gold-500 mt-2">
                    {formatCurrency(summary.monthly)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gold-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gold-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-status-success">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">已结清金额</p>
                  <p className="text-2xl font-bold text-status-success mt-2">
                    {formatCurrency(summary.paid)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-status-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-status-danger">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">逾期金额</p>
                  <p className="text-2xl font-bold text-status-danger mt-2">
                    {formatCurrency(summary.overdue)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-status-danger" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-500" />
              还款计划列表
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="py-12 text-center text-navy-400">加载中...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>期号</TableHead>
                    <TableHead>融资编号</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead className="text-right">本金</TableHead>
                    <TableHead className="text-right">利息</TableHead>
                    <TableHead className="text-right">应还总额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>自动划扣</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium text-navy-700">
                        第 {plan.periodNo} 期
                      </TableCell>
                      <TableCell className="font-mono text-sm text-navy-600">
                        {plan.app?.applicationNo || "-"}
                      </TableCell>
                      <TableCell className="text-navy-600">
                        {plan.supplier?.name || "-"}
                      </TableCell>
                      <TableCell className="text-navy-600">
                        {formatDate(plan.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-navy-700">
                        {formatCurrency(plan.principal)}
                      </TableCell>
                      <TableCell className="text-right text-navy-600">
                        {formatCurrency(plan.interest)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-navy-700">
                        {formatCurrency(plan.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant[plan.status]}>
                          {statusText[plan.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleAutoDeduct(plan.id)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            plan.autoDeduct ? "bg-navy-500" : "bg-gray-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                              plan.autoDeduct ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(plan)}>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-500" />
                还款详情
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">融资编号</Label>
                    <p className="font-mono font-medium text-navy-700 mt-1">
                      {relatedApp?.applicationNo || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">期号</Label>
                    <p className="font-semibold text-navy-700 mt-1">
                      第 {selected.periodNo} 期
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-navy-500">供应商</Label>
                    <p className="font-medium text-navy-700 mt-1 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-navy-400" />
                      {relatedSupplier?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">应还日期</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {formatDate(selected.dueDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">状态</Label>
                    <div className="mt-1">
                      <Badge variant={statusBadgeVariant[selected.status]}>
                        {statusText[selected.status]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-gradient-to-r from-gold-50 to-navy-50 rounded-lg border border-gold-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-navy-500 text-xs">本金</Label>
                      <p className="font-bold text-lg text-navy-700 mt-1">
                        {formatCurrency(selected.principal)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-navy-500 text-xs">利息</Label>
                      <p className="font-bold text-lg text-navy-700 mt-1">
                        {formatCurrency(selected.interest)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-navy-500 text-xs">应还总额</Label>
                      <p className="font-bold text-lg text-gold-500 mt-1">
                        {formatCurrency(selected.totalAmount)}
                      </p>
                    </div>
                  </div>
                  {selected.actualPaidAmount && (
                    <>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-navy-500 text-xs">实还金额</Label>
                          <p className="font-semibold text-status-success mt-1">
                            {formatCurrency(selected.actualPaidAmount)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-navy-500 text-xs">实还日期</Label>
                          <p className="font-semibold text-navy-700 mt-1">
                            {selected.actualPaidAt ? formatDate(selected.actualPaidAt) : "-"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <Label className="text-navy-500 mb-2 block flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    扣款账户信息
                  </Label>
                  <div className="p-4 rounded-lg border border-navy-100 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-navy-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-700">
                          {mockAccounts[0].bankName}
                        </p>
                        <p className="text-sm font-mono text-navy-500 mt-0.5">
                          {mockAccounts[0].accountNo}
                        </p>
                        <p className="text-xs text-navy-400 mt-0.5">
                          开户名: {mockAccounts[0].holder}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-navy-500 mb-2 block flex items-center gap-1">
                    <History className="w-4 h-4" />
                    历史还款记录
                  </Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">期号</TableHead>
                          <TableHead className="text-xs">应还日期</TableHead>
                          <TableHead className="text-right text-xs">应还金额</TableHead>
                          <TableHead className="text-right text-xs">实还金额</TableHead>
                          <TableHead className="text-xs">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedPlans.map((rp) => (
                          <TableRow key={rp.id} className={rp.id === selected.id ? "bg-gold-50" : ""}>
                            <TableCell className="text-sm">第 {rp.periodNo} 期</TableCell>
                            <TableCell className="text-sm text-navy-500">
                              {formatDate(rp.dueDate)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-navy-700">
                              {formatCurrency(rp.totalAmount)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {rp.actualPaidAmount ? formatCurrency(rp.actualPaidAmount) : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={statusBadgeVariant[rp.status]}
                                className="text-xs"
                              >
                                {statusText[rp.status]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
