"use client";

import * as React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronRight,
  X,
  FileText,
  Building2,
  Shield,
  Timer,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Progress } from "@/src/components/ui/progress";
import { Avatar } from "@/src/components/ui/avatar";
import {
  cn,
  formatCurrency,
  formatDateTime,
  riskLevelText,
  riskLevelBgColor,
  userRoleText,
} from "@/src/lib/utils";
import {
  store,
  initializeStore,
} from "@/src/data/store";
import { useAuth } from "@/src/context/AuthContext";
import type {
  ApprovalWorkflow,
  FinanceApplication,
  Enterprise,
  RiskLevel,
} from "@/src/types";

interface WorkbenchItem {
  workflow: ApprovalWorkflow;
  application: FinanceApplication;
  supplier: Enterprise | undefined;
  coreEnterprise: Enterprise | undefined;
  urgency: RiskLevel;
  remainingHours: number;
  isTimeout: boolean;
}

const urgencyOrder: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const urgencyStyles: Record<RiskLevel, string> = {
  critical: "border-l-4 border-l-status-danger",
  high: "border-l-4 border-l-orange-500",
  medium: "border-l-4 border-l-status-warning",
  low: "border-l-4 border-l-status-success",
};

const urgencyDotStyles: Record<RiskLevel, string> = {
  critical: "bg-status-danger",
  high: "bg-orange-500",
  medium: "bg-status-warning",
  low: "bg-status-success",
};

export default function ApprovalWorkbenchPage() {
  const { user } = useAuth();
  const [pending, setPending] = React.useState<WorkbenchItem[]>([]);
  const [approved, setApproved] = React.useState<WorkbenchItem[]>([]);
  const [cc, setCc] = React.useState<WorkbenchItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<WorkbenchItem | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [decisionComment, setDecisionComment] = React.useState("");

  const stats = React.useMemo(() => {
    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      timeoutCount: pending.filter((i) => i.isTimeout).length,
      todayCount: pending.filter((i) => {
        if (!i.workflow.createdAt) return false;
        const d = new Date(i.workflow.createdAt);
        const t = new Date();
        return (
          d.getFullYear() === t.getFullYear() &&
          d.getMonth() === t.getMonth() &&
          d.getDate() === t.getDate()
        );
      }).length,
    };
  }, [pending, approved]);

  React.useEffect(() => {
    initializeStore();
    if (user) {
      loadData();
    }
  }, [user]);

  const buildItems = async (
    wfList: ApprovalWorkflow[]
  ): Promise<WorkbenchItem[]> => {
    const [apps, enterprises] = await Promise.all([
      store.financeApplications.all(),
      store.enterprises.all(),
    ]);
    return wfList
      .map((wf) => {
        const application = apps.find(
          (a) => a.id === wf.financeApplicationId
        );
        if (!application) return null;
        const supplier = enterprises.find(
          (e) => e.id === application.supplierId
        );
        const coreEnterprise = enterprises.find(
          (e) => e.id === application.coreEnterpriseId
        );
        const currentNode = wf.nodes[wf.currentNodeIndex];
        let remainingHours = -1;
        let isTimeout = false;
        if (currentNode?.deadline) {
          const deadline = new Date(currentNode.deadline);
          const now = new Date();
          const diffMs = deadline.getTime() - now.getTime();
          remainingHours = diffMs / (1000 * 60 * 60);
          isTimeout = remainingHours < 0;
        }
        const urgency: RiskLevel = isTimeout
          ? "critical"
          : remainingHours < 4
          ? "high"
          : remainingHours < 12
          ? "medium"
          : "low";
        return {
          workflow: wf,
          application,
          supplier,
          coreEnterprise,
          urgency,
          remainingHours,
          isTimeout,
        } as WorkbenchItem;
      })
      .filter((i): i is WorkbenchItem => i !== null)
      .sort(
        (a, b) =>
          urgencyOrder[a.urgency] - urgencyOrder[b.urgency] ||
          a.remainingHours - b.remainingHours
      );
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [workbenchRes, allWorkflowsRes] = await Promise.all([
        fetch("/api/approval/workbench").then((r) => r.json()),
        store.approvalWorkflows.all(),
      ]);

      let pendingWf: ApprovalWorkflow[] = [];
      if (workbenchRes?.success && workbenchRes.data?.items) {
        pendingWf = workbenchRes.data.items;
      }

      const approvedWf = allWorkflowsRes.filter(
        (w) => w.status === "approved" || w.status === "rejected"
      );
      const ccWf = allWorkflowsRes.filter((w) => w.escalated);

      const [pendingItems, approvedItems, ccItems] = await Promise.all([
        buildItems(pendingWf),
        buildItems(approvedWf),
        buildItems(ccWf),
      ]);

      setPending(pendingItems);
      setApproved(approvedItems);
      setCc(ccItems);
    } catch (e) {
      console.error("loadData error", e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: WorkbenchItem) => {
    setSelected(item);
    setDetailOpen(true);
    setDecisionComment("");
  };

  const handleDecision = async (
    decision: "approve" | "reject" | "escalate",
    item?: WorkbenchItem | null
  ) => {
    const target = item || selected;
    if (!target) return;
    try {
      const res = await fetch(`/api/approval/${target.workflow.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment: decisionComment }),
      });
      if (!res.ok) throw new Error("操作失败");
      setDetailOpen(false);
      setSelected(null);
      setDecisionComment("");
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "操作失败");
    }
  };

  const formatRemaining = (hours: number) => {
    if (hours < 0) {
      const absH = Math.abs(hours);
      const h = Math.floor(absH);
      const m = Math.floor((absH - h) * 60);
      return `超时 ${h}小时${m}分`;
    }
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    if (h > 24) {
      const d = Math.floor(h / 24);
      return `剩余 ${d}天${h % 24}小时`;
    }
    return `剩余 ${h}小时${m}分`;
  };

  const renderItemCard = (item: WorkbenchItem, showActions: boolean) => {
    const currentNode = item.workflow.nodes[item.workflow.currentNodeIndex];
    return (
      <Card
        key={item.workflow.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-card-hover",
          urgencyStyles[item.urgency]
        )}
        onClick={() => openDetail(item)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    "inline-block w-2.5 h-2.5 rounded-full",
                    urgencyDotStyles[item.urgency]
                  )}
                />
                <span className="font-mono text-sm text-navy-500">
                  {item.application.applicationNo}
                </span>
                <Badge
                  className={cn(
                    "border",
                    riskLevelBgColor(item.application.riskLevel)
                  )}
                >
                  {riskLevelText(item.application.riskLevel)}
                </Badge>
                {currentNode && (
                  <Badge variant="default" className="border border-navy-200 bg-white">
                    {currentNode.name}
                  </Badge>
                )}
                {item.isTimeout && (
                  <Badge variant="danger">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    超时
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-navy-400" />
                <span className="font-medium text-navy-700">
                  {item.supplier?.name || "-"}
                </span>
                <span className="text-gray-400 text-sm">
                  / {item.coreEnterprise?.name}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-navy-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  融资金额:
                  <span className="font-semibold text-navy-700">
                    {formatCurrency(item.application.amount)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {formatDateTime(item.workflow.createdAt, "MM-dd HH:mm")}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    item.isTimeout ? "text-status-danger" : "text-navy-600"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {formatRemaining(item.remainingHours)}
                </span>
              </div>
            </div>

            {showActions && (
              <div
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="default"
                  className="w-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDecisionComment("");
                    handleDecision("approve", item);
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  通过
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDecisionComment("");
                    handleDecision("reject", item);
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  拒绝
                </Button>
              </div>
            )}

            {!showActions && (
              <ChevronRight className="w-5 h-5 text-navy-300 flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderList = (list: WorkbenchItem[], showActions: boolean) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-navy-100 rounded w-1/3" />
                <div className="h-5 bg-navy-100 rounded w-2/3" />
                <div className="h-4 bg-navy-100 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="py-16 text-center text-navy-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>暂无数据</p>
        </div>
      );
    }
    return <div className="space-y-3">{list.map((i) => renderItemCard(i, showActions))}</div>;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-700">审批工作台</h1>
            <p className="text-navy-500 text-sm mt-1">
              处理待审批融资申请，管理审批流程
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-status-warning">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">待我审批</p>
                  <p className="text-3xl font-bold text-navy-700 mt-2">
                    {stats.pendingCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-status-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-status-success">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">我已审批</p>
                  <p className="text-3xl font-bold text-navy-700 mt-2">
                    {stats.approvedCount}
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
                  <p className="text-navy-500 text-sm">超时未处理</p>
                  <p className="text-3xl font-bold text-status-danger mt-2">
                    {stats.timeoutCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-status-danger" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-navy-400">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">今日审批量</p>
                  <p className="text-3xl font-bold text-navy-700 mt-2">
                    {stats.todayCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-navy-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="pending">
              <div className="px-6 pt-4">
                <TabsList>
                  <TabsTrigger value="pending">
                    待办审批
                    <Badge
                      variant="warning"
                      className="ml-2"
                    >
                      {stats.pendingCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved">已审批</TabsTrigger>
                  <TabsTrigger value="cc">抄送我的</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 pt-4">
                <TabsContent value="pending">
                  {renderList(pending, true)}
                </TabsContent>
                <TabsContent value="approved">
                  {renderList(approved, false)}
                </TabsContent>
                <TabsContent value="cc">
                  {renderList(cc, false)}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-500" />
                审批详情 - {selected?.application.applicationNo}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-5 max-h-[70vh] overflow-y-auto px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">供应商</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {selected.supplier?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">核心企业</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {selected.coreEnterprise?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">融资金额</Label>
                    <p className="font-medium text-navy-700 mt-1 text-lg">
                      {formatCurrency(selected.application.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">融资期限</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {selected.application.termDays} 天
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">风险等级</Label>
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          "border",
                          riskLevelBgColor(selected.application.riskLevel)
                        )}
                      >
                        {riskLevelText(selected.application.riskLevel)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-navy-500">融资用途</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {selected.application.purpose}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-navy-500">审批进度</Label>
                  <div className="mt-3">
                    <div className="flex items-center gap-1">
                      {selected.workflow.nodes.map((node, idx) => (
                        <React.Fragment key={node.index}>
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium",
                                node.status === "approved"
                                  ? "bg-status-success text-white"
                                  : node.status === "in_progress"
                                  ? "bg-gold-400 text-navy-900 animate-pulse-glow"
                                  : node.status === "rejected"
                                  ? "bg-status-danger text-white"
                                  : node.status === "skipped"
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-navy-100 text-navy-500"
                              )}
                            >
                              {node.status === "approved" ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : node.status === "rejected" ? (
                                <X className="w-5 h-5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <p className="text-xs text-navy-600 mt-2 text-center w-20">
                              {node.name}
                            </p>
                          </div>
                          {idx < selected.workflow.nodes.length - 1 && (
                            <div className="flex-1">
                              <Progress
                                value={
                                  idx < selected.workflow.currentNodeIndex
                                    ? 100
                                    : 0
                                }
                                color={
                                  idx < selected.workflow.currentNodeIndex
                                    ? "success"
                                    : "default"
                                }
                              />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-4 space-y-3">
                      {selected.workflow.nodes.map((node) =>
                        node.status === "approved" ||
                        node.status === "rejected" ||
                        node.status === "in_progress" ? (
                          <div
                            key={node.index}
                            className="flex gap-3 items-start"
                          >
                            <Avatar
                              name={userRoleText(node.requiredRole)}
                              size="sm"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-navy-700">
                                  {node.name}
                                </span>
                                <Badge
                                  variant={
                                    node.status === "approved"
                                      ? "success"
                                      : node.status === "rejected"
                                      ? "danger"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {node.status === "approved"
                                    ? "已通过"
                                    : node.status === "rejected"
                                    ? "已拒绝"
                                    : "审批中"}
                                </Badge>
                              </div>
                              {node.comment && (
                                <p className="text-sm text-navy-500 mt-1">
                                  意见: {node.comment}
                                </p>
                              )}
                              {node.decidedAt && (
                                <p className="text-xs text-navy-400 mt-1">
                                  {formatDateTime(node.decidedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="comment">审批意见</Label>
                  <Textarea
                    id="comment"
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    placeholder="请输入审批意见..."
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDecision("reject")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                  <Button
                    variant="gold"
                    onClick={() => handleDecision("approve")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    通过
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
