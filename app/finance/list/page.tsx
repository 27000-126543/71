"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Search,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { store } from "@/src/data/store";
import type { FinanceApplication, FinanceStatus, Enterprise, RiskLevel } from "@/src/types";
import {
  formatCurrency,
  formatDate,
  financeStatusText,
  financeStatusVariant,
  riskLevelText,
  riskLevelBgColor,
} from "@/src/lib/utils";

const STATUS_OPTIONS: { value: FinanceStatus | "all"; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "submitted", label: "已提交" },
  { value: "verifying", label: "审批中" },
  { value: "approved", label: "已通过" },
  { value: "disbursed", label: "已放款" },
  { value: "repaid", label: "已还款" },
  { value: "overdue", label: "逾期" },
  { value: "rejected", label: "已拒绝" },
];

const APPROVAL_NODES = [
  "客户经理初审",
  "风控审核",
  "授信委员会审批",
  "放款审核",
  "已完成",
];

function riskBadgeVariant(level: RiskLevel): "default" | "gold" | "success" | "warning" | "danger" {
  const map: Record<RiskLevel, "default" | "gold" | "success" | "warning" | "danger"> = {
    low: "success",
    medium: "gold",
    high: "warning",
    critical: "danger",
  };
  return map[level] || "default";
}

export default function FinanceListPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<FinanceApplication[]>([]);
  const [enterprises, setEnterprises] = useState<Record<string, Enterprise>>({});
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<FinanceStatus | "all">("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      let apps = await store.financeApplications.all();
      if (user?.role === "supplier" && user.enterpriseId) {
        apps = apps.filter((a) => a.supplierId === user.enterpriseId);
      }
      apps = apps.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setApplications(apps);

      const allEnts = await store.enterprises.all();
      const entMap: Record<string, Enterprise> = {};
      allEnts.forEach((e) => (entMap[e.id] = e));
      setEnterprises(entMap);
      setLoading(false);
    })();
  }, [user]);

  const filteredData = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (minAmount && app.amount < Number(minAmount)) return false;
      if (maxAmount && app.amount > Number(maxAmount)) return false;
      if (startDate && app.createdAt < startDate) return false;
      if (endDate && app.createdAt > endDate + "T23:59:59") return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const supplier = enterprises[app.supplierId]?.name.toLowerCase() || "";
        const core = enterprises[app.coreEnterpriseId]?.name.toLowerCase() || "";
        if (
          !app.applicationNo.toLowerCase().includes(term) &&
          !supplier.includes(term) &&
          !core.includes(term)
        )
          return false;
      }
      return true;
    });
  }, [applications, statusFilter, minAmount, maxAmount, startDate, endDate, searchTerm, enterprises]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, minAmount, maxAmount, startDate, endDate, searchTerm]);

  const getApprovalNodeText = (app: FinanceApplication) => {
    if (app.status === "draft") return "未提交";
    if (app.status === "submitted") return APPROVAL_NODES[0];
    if (app.status === "verifying") return APPROVAL_NODES[1];
    if (app.status === "approved") return APPROVAL_NODES[2];
    if (app.status === "disbursed") return APPROVAL_NODES[3];
    if (app.status === "repaid") return APPROVAL_NODES[4];
    if (app.status === "rejected") return "已拒绝";
    if (app.status === "overdue") return "逾期处理中";
    return "-";
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const inProgress = applications.filter((a) =>
      ["submitted", "verifying", "approved"].includes(a.status)
    ).length;
    const disbursed = applications.filter((a) => a.status === "disbursed").length;
    const totalAmount = applications
      .filter((a) => ["approved", "disbursed", "repaid"].includes(a.status))
      .reduce((s, a) => s + a.amount, 0);
    return { total, inProgress, disbursed, totalAmount };
  }, [applications]);

  return (
    <AppLayout
      requiredRoles={["supplier", "relationship_manager", "risk_director", "credit_committee"]}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">融资申请列表</h1>
            <p className="text-navy-400 mt-1 text-sm">查看和管理所有融资申请记录</p>
          </div>
          {user?.role === "supplier" && (
            <Button variant="gold" onClick={() => (window.location.href = "/finance/apply")}>
              <Plus className="w-4 h-4 mr-1" />
              新建申请
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-navy-400 text-sm">申请总数</p>
                  <p className="text-2xl font-bold text-navy-600 mt-2">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-navy-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-navy-400 text-sm">审批中</p>
                  <p className="text-2xl font-bold text-gold-600 mt-2">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-navy-400 text-sm">已放款</p>
                  <p className="text-2xl font-bold text-status-success mt-2">{stats.disbursed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-status-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-navy-400 text-sm">累计放款金额</p>
                  <p className="text-2xl font-bold text-navy-600 mt-2">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-navy-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-navy-500" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">申请状态</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FinanceStatus | "all")}
                  className="flex h-10 w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">最低金额（元）</Label>
                <Input
                  type="number"
                  placeholder="如 100000"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>

              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">最高金额（元）</Label>
                <Input
                  type="number"
                  placeholder="如 5000000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>

              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">开始日期</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">结束日期</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <Label className="mb-1.5 block">搜索</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <Input
                    placeholder="申请编号/企业名称"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {(statusFilter !== "all" ||
              minAmount ||
              maxAmount ||
              startDate ||
              endDate ||
              searchTerm) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setMinAmount("");
                    setMaxAmount("");
                    setStartDate("");
                    setEndDate("");
                    setSearchTerm("");
                  }}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申请编号</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>核心企业</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>期限</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>申请日期</TableHead>
                    <TableHead>当前节点</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-navy-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-400" />
                          加载中...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && pagedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-navy-400">
                        暂无符合条件的融资申请记录
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    pagedData.map((app) => (
                      <TableRow key={app.id} className="group">
                        <TableCell className="font-mono text-sm text-navy-700">
                          {app.applicationNo}
                        </TableCell>
                        <TableCell className="text-navy-700">
                          {enterprises[app.supplierId]?.name || "-"}
                        </TableCell>
                        <TableCell className="text-navy-600">
                          {enterprises[app.coreEnterpriseId]?.name || "-"}
                        </TableCell>
                        <TableCell className="font-semibold text-navy-700">
                          {formatCurrency(app.amount)}
                        </TableCell>
                        <TableCell className="text-navy-600">{app.termDays} 天</TableCell>
                        <TableCell>
                          <Badge variant={riskBadgeVariant(app.riskLevel)}>
                            {riskLevelText(app.riskLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={financeStatusVariant(app.status)}>
                            {financeStatusText(app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-navy-500">
                          {formatDate(app.createdAt)}
                        </TableCell>
                        <TableCell className="text-navy-600 text-sm">
                          {getApprovalNodeText(app)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-navy-100">
                <div className="text-sm text-navy-500">
                  共 <span className="font-semibold text-navy-700">{filteredData.length}</span> 条记录，
                  第 <span className="font-semibold text-navy-700">{page}</span> /{" "}
                  <span className="font-semibold text-navy-700">{totalPages}</span> 页
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-navy-400">...</span>
                        )}
                        <Button
                          variant={p === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={`min-w-8 ${p === page ? "bg-navy-500 text-white" : ""}`}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
