"use client";

import * as React from "react";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  Eye,
  MessageSquare,
  Gavel,
  ArrowUpRight,
  CheckCircle2,
  Phone,
  FileText,
  History,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Avatar } from "@/src/components/ui/avatar";
import { X } from "lucide-react";
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
  userRoleText,
} from "@/src/lib/utils";
import { store, initializeStore } from "@/src/data/store";
import { RepaymentService } from "@/src/services/repaymentService";
import type {
  CollectionCase,
  Enterprise,
  User,
  FinanceApplication,
  RepaymentRecord,
} from "@/src/types";

const tabConfig: Array<{ value: CollectionCase["status"] | "all"; label: string }> = [
  { value: "new", label: "新工单" },
  { value: "contacted", label: "跟进中" },
  { value: "promise_to_pay", label: "承诺还款" },
  { value: "escalated", label: "已升级" },
  { value: "legal_proceeding", label: "法律程序" },
  { value: "closed", label: "已结案" },
];

const statusTextMap: Record<CollectionCase["status"], string> = {
  new: "待分配",
  contacted: "跟进中",
  promise_to_pay: "承诺还款",
  escalated: "已升级",
  legal_proceeding: "法律程序",
  closed: "已结案",
  written_off: "已核销",
};

const statusBadgeMap: Record<CollectionCase["status"], "default" | "success" | "warning" | "danger" | "gold"> = {
  new: "danger",
  contacted: "warning",
  promise_to_pay: "gold",
  escalated: "warning",
  legal_proceeding: "danger",
  closed: "success",
  written_off: "default",
};

const overdueColor = (days: number) => {
  if (days <= 30) return "text-status-warning";
  if (days <= 60) return "text-orange-600";
  if (days <= 90) return "text-status-danger";
  return "text-red-800 font-bold";
};

const overdueBg = (days: number) => {
  if (days <= 30) return "bg-yellow-50";
  if (days <= 60) return "bg-orange-50";
  if (days <= 90) return "bg-red-50";
  return "bg-red-100";
};

type FollowUpRecord = {
  time: string;
  operator: string;
  content: string;
  status: CollectionCase["status"];
};

export default function RepaymentCollectionPage() {
  const [cases, setCases] = React.useState<CollectionCase[]>([]);
  const [suppliers, setSuppliers] = React.useState<Enterprise[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [applications, setApplications] = React.useState<FinanceApplication[]>([]);
  const [repayments, setRepayments] = React.useState<RepaymentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<CollectionCase["status"] | "all">("new");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<CollectionCase | null>(null);
  const [selectedApp, setSelectedApp] = React.useState<FinanceApplication | null>(null);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Enterprise | null>(null);
  const [selectedRepayments, setSelectedRepayments] = React.useState<RepaymentRecord[]>([]);
  const [followUps, setFollowUps] = React.useState<FollowUpRecord[]>([]);
  const [newNote, setNewNote] = React.useState("");
  const [nextStatus, setNextStatus] = React.useState<CollectionCase["status"]>("contacted");

  React.useEffect(() => {
    initializeStore();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allCases, allSuppliers, allUsers, allApps, allRepayments] = await Promise.all([
        RepaymentService.allCollections(),
        store.enterprises.all(),
        store.users.all(),
        store.financeApplications.all(),
        store.repayments.all(),
      ]);
      setCases(allCases);
      setSuppliers(allSuppliers);
      setUsers(allUsers);
      setApplications(allApps);
      setRepayments(allRepayments);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = React.useMemo(() => {
    if (activeTab === "all") return cases;
    return cases.filter((c) => c.status === activeTab);
  }, [cases, activeTab]);

  const openDrawer = async (c: CollectionCase) => {
    setSelected(c);
    const app = applications.find((a) => a.id === c.financeApplicationId);
    setSelectedApp(app || null);
    setSelectedSupplier(suppliers.find((s) => s.id === c.supplierId) || null);
    setSelectedRepayments(repayments.filter((r) => r.financeApplicationId === c.financeApplicationId));
    const records: FollowUpRecord[] = c.followUpRecords.map((r) => ({
      time: r.time,
      operator: r.operator,
      content: r.content,
      status: c.status,
    }));
    setFollowUps(records);
    setNewNote("");
    setNextStatus("contacted");
    setDrawerOpen(true);
  };

  const addFollowUp = async () => {
    if (!newNote.trim() || !selected) return;
    try {
      const res = await fetch(`/api/repayment/collection/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        const record: FollowUpRecord = {
          time: new Date().toISOString(),
          operator: "当前操作员",
          content: newNote,
          status: nextStatus,
        };
        setFollowUps((prev) => [...prev, record]);
        setSelected({ ...selected, status: nextStatus });
        setCases((prev) =>
          prev.map((c) => (c.id === selected.id ? { ...c, status: nextStatus } : c))
        );
        setNewNote("");
      } else {
        alert(data.message || "操作失败");
      }
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleStartLegalProceeding = async () => {
    if (!selected) return;
    setNextStatus("legal_proceeding");
    setNewNote("已启动法律催收程序，移交法务部门处理");
    await addFollowUp();
  };

  const needsLegalAction = selected && selected.overdueDays > 90;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
            <Gavel className="w-6 h-6 text-gold-500" />
            逾期催收工单
          </h1>
          <p className="text-navy-500 text-sm mt-1">
            管理逾期融资催收工单，跟进还款进度
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as CollectionCase["status"] | "all")}
            >
              <div className="px-6 pt-4">
                <TabsList className="flex-wrap h-auto gap-1">
                  {tabConfig.map((t) => {
                    const count = t.value === "all"
                      ? cases.length
                      : cases.filter((c) => c.status === t.value).length;
                    return (
                      <TabsTrigger key={t.value} value={t.value}>
                        {t.label}
                        <Badge
                          variant={t.value === "new" ? "danger" : "default"}
                          className="ml-2"
                        >
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <div className="p-6 pt-4">
                <TabsContent value={activeTab}>
                  {loading ? (
                    <div className="py-12 text-center text-navy-400">加载中...</div>
                  ) : filteredCases.length === 0 ? (
                    <div className="text-center py-16">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-status-success opacity-50" />
                      <p className="text-navy-400">暂无此状态的工单</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>工单号</TableHead>
                            <TableHead>供应商</TableHead>
                            <TableHead>逾期天数</TableHead>
                            <TableHead className="text-right">逾期金额</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>分配人</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCases.map((c) => {
                            const supplier = suppliers.find((s) => s.id === c.supplierId);
                            const assignee = users.find((u) => u.id === c.assignedTo);
                            return (
                              <TableRow
                                key={c.id}
                                className={cn(
                                  c.overdueDays > 90 ? "bg-red-50/50" : ""
                                )}
                              >
                                <TableCell className="font-mono text-sm text-navy-600">
                                  {c.caseNo}
                                </TableCell>
                                <TableCell className="font-medium text-navy-700">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-navy-400" />
                                    {supplier?.name || "-"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "font-semibold px-2 py-1 rounded",
                                      overdueColor(c.overdueDays),
                                      overdueBg(c.overdueDays)
                                    )}
                                  >
                                    {c.overdueDays} 天
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-bold text-navy-700">
                                  {formatCurrency(c.overdueAmount)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusBadgeMap[c.status]}>
                                    {statusTextMap[c.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {assignee ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar name={assignee.name} size="sm" />
                                      <span className="text-sm text-navy-600">
                                        {assignee.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-navy-400 text-sm">未分配</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-navy-500 text-sm">
                                  {formatDateTime(c.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDrawer(c)}
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    详情
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {drawerOpen && selected && (
          <>
            <div
              className="fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-xl animate-fade-in flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
                <h2 className="text-lg font-semibold text-navy-700 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-gold-500" />
                  催收工单详情
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {needsLegalAction && (
                  <div className="p-4 rounded-lg bg-red-50 border-2 border-status-danger flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-status-danger flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-status-danger">
                        逾期超过90天，建议启动法律程序
                      </p>
                      <p className="text-sm text-status-danger/80 mt-1">
                        该工单已逾期 {selected.overdueDays} 天，已达到启动法律催收的标准
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">工单号</Label>
                    <p className="font-mono font-medium text-navy-700 mt-1">
                      {selected.caseNo}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">状态</Label>
                    <div className="mt-1">
                      <Badge variant={statusBadgeMap[selected.status]}>
                        {statusTextMap[selected.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-navy-500">供应商</Label>
                    <p className="font-semibold text-navy-700 mt-1 text-lg">
                      {selectedSupplier?.name || "-"}
                    </p>
                    {selectedSupplier && (
                      <p className="text-sm text-navy-400 mt-0.5">
                        {selectedSupplier.industry} · {selectedSupplier.contactInfo.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-navy-500">逾期天数</Label>
                    <p className={cn("font-bold text-xl mt-1", overdueColor(selected.overdueDays))}>
                      {selected.overdueDays} 天
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">逾期金额</Label>
                    <p className="font-bold text-xl text-gold-500 mt-1">
                      {formatCurrency(selected.overdueAmount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">创建时间</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {formatDateTime(selected.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">分配人</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selected.assignedTo ? (
                        <>
                          <Avatar
                            name={users.find((u) => u.id === selected.assignedTo)?.name || "用户"}
                            size="sm"
                          />
                          <span className="font-medium text-navy-700">
                            {users.find((u) => u.id === selected.assignedTo)?.name || "-"}
                          </span>
                        </>
                      ) : (
                        <span className="text-navy-400">未分配</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedApp && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-navy-500 mb-2 block flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        融资信息
                      </Label>
                      <div className="p-4 rounded-lg bg-navy-50/50 border border-navy-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-navy-500">融资编号: </span>
                            <span className="font-mono font-medium text-navy-700">
                              {selectedApp.applicationNo}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">融资金额: </span>
                            <span className="font-semibold text-navy-700">
                              {formatCurrency(selectedApp.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">期限: </span>
                            <span className="font-medium text-navy-700">
                              {selectedApp.termDays} 天
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">用途: </span>
                            <span className="font-medium text-navy-700">
                              {selectedApp.purpose}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <Label className="text-navy-500 mb-2 block flex items-center gap-1">
                    <History className="w-4 h-4" />
                    还款历史
                  </Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs py-2">期号</TableHead>
                          <TableHead className="text-xs py-2">应还日期</TableHead>
                          <TableHead className="text-right text-xs py-2">应还</TableHead>
                          <TableHead className="text-right text-xs py-2">实还</TableHead>
                          <TableHead className="text-xs py-2">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRepayments.map((rp) => (
                          <TableRow key={rp.id} className="h-10">
                            <TableCell className="py-1 text-sm">
                              第 {rp.periodNo} 期
                            </TableCell>
                            <TableCell className="py-1 text-sm text-navy-500">
                              {formatDate(rp.dueDate)}
                            </TableCell>
                            <TableCell className="py-1 text-right text-sm font-medium">
                              {formatCurrency(rp.totalAmount)}
                            </TableCell>
                            <TableCell className="py-1 text-right text-sm">
                              {rp.actualPaidAmount ? formatCurrency(rp.actualPaidAmount) : "-"}
                            </TableCell>
                            <TableCell className="py-1">
                              <Badge
                                variant={
                                  rp.status === "paid"
                                    ? "success"
                                    : rp.status === "overdue"
                                    ? "danger"
                                    : rp.status === "partial"
                                    ? "warning"
                                    : "default"
                                }
                                className="text-xs"
                              >
                                {{
                                  pending: "待扣",
                                  auto_deducting: "代扣中",
                                  paid: "已还",
                                  overdue: "逾期",
                                  partial: "部分",
                                }[rp.status]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-navy-500 mb-3 block flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    跟进记录
                  </Label>
                  <div className="space-y-4">
                    {followUps.map((record, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <Avatar name={record.operator} size="sm" />
                          {idx < followUps.length - 1 && (
                            <div className="w-px flex-1 bg-navy-100 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-navy-700 text-sm">
                              {record.operator}
                            </span>
                            <Badge variant={statusBadgeMap[record.status]} className="text-xs">
                              {statusTextMap[record.status]}
                            </Badge>
                            <span className="text-xs text-navy-400">
                              {formatDateTime(record.time)}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mt-1">{record.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-navy-500 mb-2 block">添加跟进记录</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Label className="text-navy-500 whitespace-nowrap">更新状态:</Label>
                      <Select
                        value={nextStatus}
                        onChange={(e) => setNextStatus(e.target.value as CollectionCase["status"])}
                        className="max-w-xs"
                      >
                        <option value="contacted">已联系</option>
                        <option value="promise_to_pay">承诺还款</option>
                        <option value="escalated">升级处理</option>
                        <option value="legal_proceeding">启动法律程序</option>
                        <option value="closed">结案</option>
                      </Select>
                    </div>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="请输入跟进内容，如：电话沟通情况、还款承诺等..."
                    />
                    <div className="flex justify-between items-center">
                      {(needsLegalAction || (selected && selected.status !== "legal_proceeding" && selected.status !== "closed" && selected.status !== "written_off")) && selected && selected.overdueDays > 0 && (
                        <Button
                          variant={selected.status === "legal_proceeding" ? "default" : "destructive"}
                          size="lg"
                          className={selected.status !== "legal_proceeding" && selected.overdueDays > 90 ? "animate-pulse-glow" : ""}
                          onClick={handleStartLegalProceeding}
                          disabled={selected.status === "legal_proceeding"}
                        >
                          <Gavel className="w-4 h-4 mr-1" />
                          {selected.status === "legal_proceeding" ? "已进入法律程序" : "启动法律程序"}
                        </Button>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                          取消
                        </Button>
                        <Button variant="default" onClick={addFollowUp}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          保存记录
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
