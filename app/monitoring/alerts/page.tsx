"use client";

import * as React from "react";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Eye,
  Clock3,
  Clock4,
  X,
  Building2,
  DollarSign,
  Filter,
  Search,
  MessageSquare,
  Shield,
  User as UserIcon,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Avatar } from "@/src/components/ui/avatar";
import { Tooltip } from "@/src/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatPercent,
  riskLevelText,
  alertTypeText,
  formatDate,
} from "@/src/lib/utils";
import { store, initializeStore } from "@/src/data/store";
import type {
  AlertEvent,
  Enterprise,
  AlertType,
  RiskLevel,
  User,
} from "@/src/types";

const typeIconMap: Record<AlertType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  order_drop: { icon: TrendingDown, color: "text-navy-500" },
  return_spike: { icon: TrendingUp, color: "text-status-danger" },
  payment_delay: { icon: Clock, color: "text-status-warning" },
  abnormal_behavior: { icon: Activity, color: "text-status-danger" },
};

const levelBadgeVariant = (level: RiskLevel): "default" | "success" | "warning" | "danger" | "gold" => {
  if (level === "critical") return "danger";
  if (level === "high") return "warning";
  if (level === "medium") return "warning";
  return "success";
};

const statusBadgeVariant = (status: AlertEvent["status"]) => {
  if (status === "new") return "danger";
  if (status === "processing") return "warning";
  if (status === "resolved") return "success";
  return "default";
};

const statusText = (status: AlertEvent["status"]) => {
  const map: Record<AlertEvent["status"], string> = {
    new: "待处理",
    processing: "处理中",
    resolved: "已解决",
    false_alarm: "误报",
  };
  return map[status];
};

type FollowUpRecord = { time: string; operator: string; content: string; status: AlertEvent["status"] };

export default function MonitoringAlertsPage() {
  const [alerts, setAlerts] = React.useState<AlertEvent[]>([]);
  const [suppliers, setSuppliers] = React.useState<Enterprise[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterLevel, setFilterLevel] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [selectedAlert, setSelectedAlert] = React.useState<AlertEvent | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [handlingNote, setHandlingNote] = React.useState("");
  const [followUps, setFollowUps] = React.useState<FollowUpRecord[]>([]);

  React.useEffect(() => {
    initializeStore();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAlerts, allEnterprises, allUsers] = await Promise.all([
        store.alertEvents.all(),
        store.enterprises.all(),
        store.users.all(),
      ]);
      setAlerts(allAlerts);
      setSuppliers(allEnterprises);
      setUsers(allUsers);
    } finally {
        setLoading(false);
      }
  };

  const filtered = React.useMemo(() => {
    return alerts.filter((a) => {
      if (filterType !== "all" && a.type !== filterType) return false;
      if (filterLevel !== "all" && a.level !== filterLevel) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (search.trim()) {
        const supplier = suppliers.find((s) => s.id === a.supplierId);
        const hay = `${a.title} ${a.description} ${supplier?.name || ""}`;
        if (!hay.toLowerCase().includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [alerts, filterType, filterLevel, filterStatus, search, suppliers]);

  const openDetail = async (alert: AlertEvent) => {
    setSelectedAlert(alert);
    setHandlingNote("");
    setFollowUps([
      { time: alert.triggeredAt, operator: "系统", content: "自动检测到异常指标，触发预警", status: "new" },
      ...(alert.handlingNotes
        ? [{ time: alert.handledAt || alert.triggeredAt, operator: users.find((u) => u.id === alert.handledBy)?.name || "操作员", content: alert.handlingNotes, status: alert.status } as FollowUpRecord]
        : []),
    ]);
    setDetailOpen(true);
  };

  const handleStatusChange = (newStatus: AlertEvent["status"]) => {
    if (!selectedAlert) return;
    const time = new Date().toISOString();
    const newRecord: FollowUpRecord = {
      time,
      operator: "当前用户",
      content: handlingNote || `状态变更为${statusText(newStatus)}`,
      status: newStatus,
    };
    setFollowUps((prev) => [...prev, newRecord]);
    setHandlingNote("");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-gold-500" />
              预警处理列表
            </h1>
            <p className="text-navy-500 text-sm mt-1">
              处理供应商风险预警事件，及时处置潜在风险
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-navy-400" />
                <span className="text-sm text-navy-500">筛选:</span>
              </div>
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <Input
                  placeholder="搜索预警或供应商名称"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-44"
              >
                <option value="all">全部预警类型</option>
                <option value="order_drop">订单量下降</option>
                <option value="return_spike">退货率飙升</option>
                <option value="payment_delay">回款延期</option>
                <option value="abnormal_behavior">异常行为</option>
              </Select>
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-36"
              >
                <option value="all">全部等级</option>
                <option value="critical">极高风险</option>
                <option value="high">高风险</option>
                <option value="medium">中风险</option>
                <option value="low">低风险</option>
              </Select>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-36"
              >
                <option value="all">全部状态</option>
                <option value="new">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="false_alarm">误报</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-navy-100 rounded w-2/3" />
                  <div className="h-5 bg-navy-100 rounded w-full" />
                  <div className="h-4 bg-navy-100 rounded w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-navy-300" />
          <p className="text-navy-400">暂无预警数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((alert) => {
              const Icon = typeIconMap[alert.type].icon;
              const supplier = suppliers.find((s) => s.id === alert.supplierId);
              return (
                <Card
                  key={alert.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-0.5",
                    alert.level === "critical"
                      ? "border-l-4 border-l-status-danger"
                      : alert.level === "high"
                      ? "border-l-4 border-l-orange-500"
                      : alert.level === "medium"
                      ? "border-l-4 border-l-status-warning"
                      : "border-l-4 border-l-status-success"
                  )}
                  onClick={() => openDetail(alert)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            alert.level === "critical"
                              ? "bg-red-50"
                              : alert.level === "high"
                              ? "bg-orange-50"
                              : alert.level === "medium"
                              ? "bg-yellow-50"
                              : "bg-green-50"
                          )}
                        >
                          <Icon
                            className={cn("w-5 h-5", typeIconMap[alert.type].color)}
                          />
                        </div>
                        <div>
                          <Badge variant={levelBadgeVariant(alert.level)} className="text-xs">
                            {riskLevelText(alert.level)}
                          </Badge>
                          <Badge variant={statusBadgeVariant(alert.status)} className="text-xs ml-1">
                            {statusText(alert.status)}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-navy-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(alert.triggeredAt, "MM-dd HH:mm")}
                      </span>
                    </div>

                    <h3 className="font-semibold text-navy-700 mt-3">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-navy-500 mt-1">
                      {alert.description}
                    </p>

                    {supplier && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-navy-600">
                        <Building2 className="w-4 h-4 text-navy-400" />
                        {supplier.name}
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-navy-50/60 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-navy-500">触发指标</span>
                        <span className="font-semibold text-navy-700">
                          {alert.type === "order_drop" || alert.type === "return_spike"
                            ? formatPercent(alert.metricValue)
                            : alert.type === "payment_delay"
                            ? `${alert.metricValue}天`
                            : `${alert.metricValue}次`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-navy-500">阈值</span>
                        <span className="text-navy-600">
                          {alert.type === "order_drop" || alert.type === "return_spike"
                            ? formatPercent(alert.threshold)
                            : alert.type === "payment_delay"
                            ? `${alert.threshold}天`
                            : `${alert.threshold}次`}
                        </span>
                      </div>
                    </div>

                    {alert.frozenCreditLimit && alert.frozenCreditLimit > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-status-danger bg-red-50 rounded-lg p-2.5">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          已冻结额度:{" "}
                          <strong>{formatCurrency(alert.frozenCreditLimit)}</strong>
                        </span>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        {alertTypeText(alert.type)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Tooltip content="查看详情">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(alert);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gold-500" />
                预警详情
              </DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-500">预警标题</Label>
                    <p className="font-semibold text-navy-700 mt-1">
                      {selectedAlert.title}
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <Badge variant={levelBadgeVariant(selectedAlert.level)}>
                      {riskLevelText(selectedAlert.level)}
                    </Badge>
                    <Badge variant={statusBadgeVariant(selectedAlert.status)}>
                      {statusText(selectedAlert.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-navy-500">预警类型</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {alertTypeText(selectedAlert.type)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">触发时间</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {formatDateTime(selectedAlert.triggeredAt)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-navy-500">供应商</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {suppliers.find((s) => s.id === selectedAlert.supplierId)?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">触发指标值</Label>
                    <p className="font-bold text-lg text-status-danger mt-1">
                      {selectedAlert.type === "order_drop" ||
                      selectedAlert.type === "return_spike"
                        ? formatPercent(selectedAlert.metricValue)
                        : selectedAlert.type === "payment_delay"
                        ? `${selectedAlert.metricValue} 天`
                        : `${selectedAlert.metricValue} 次`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy-500">预警阈值</Label>
                    <p className="font-medium text-navy-700 mt-1">
                      {selectedAlert.type === "order_drop" ||
                      selectedAlert.type === "return_spike"
                        ? formatPercent(selectedAlert.threshold)
                        : selectedAlert.type === "payment_delay"
                        ? `${selectedAlert.threshold} 天`
                        : `${selectedAlert.threshold} 次`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-navy-500">预警描述</Label>
                  <p className="text-navy-700 mt-1 p-3 bg-navy-50 rounded-lg">
                    {selectedAlert.description}
                  </p>
                </div>

                {selectedAlert.frozenCreditLimit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-status-danger">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold">
                        已冻结授信额度: {formatCurrency(selectedAlert.frozenCreditLimit)}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="text-navy-500 mb-2 block">处理记录时间轴</Label>
                  <div className="space-y-4 mt-3">
                    {followUps.map((record, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <Avatar
                            name={record.operator}
                            size="sm"
                            className="ring-2 ring-white"
                          />
                          {idx < followUps.length - 1 && (
                            <div className="w-px flex-1 bg-navy-100 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy-700 text-sm">
                              {record.operator}
                            </span>
                            <Badge
                              variant={statusBadgeVariant(record.status)}
                              className="text-xs"
                            >
                              {statusText(record.status)}
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
                  <Label htmlFor="handling-note">处理意见</Label>
                  <Textarea
                    id="handling-note"
                    value={handlingNote}
                    onChange={(e) => setHandlingNote(e.target.value)}
                    placeholder="请输入处理意见..."
                    className="mt-2"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange("processing")}
                  >
                    <Clock4 className="w-4 h-4 mr-1" />
                    标记处理中
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange("resolved")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    标记已解决
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleStatusChange("false_alarm")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    标记误报
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
