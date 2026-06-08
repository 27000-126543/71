"use client";

import * as React from "react";
import {
  Building2,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatDate,
  riskLevelText,
  riskLevelBgColor,
} from "@/src/lib/utils";
import { store, initializeStore } from "@/src/data/store";
import type {
  MonitoringMetrics,
  Enterprise,
  FinanceApplication,
  AlertEvent,
  CreditScore,
} from "@/src/types";

interface SupplierMonitorRow {
  supplier: Enterprise;
  latest: MonitoringMetrics;
  outstanding: number;
  activeCount: number;
  status: "normal" | "warning" | "frozen";
  score: CreditScore | undefined;
  expanded: boolean;
}

interface TrendPoint {
  date: string;
  value: number;
}

export default function MonitoringDashboardPage() {
  const [rows, setRows] = React.useState<SupplierMonitorRow[]>([]);
  const [trendData, setTrendData] = React.useState<{
    orders: TrendPoint[];
    returns: TrendPoint[];
    cycles: TrendPoint[];
  }>({ orders: [], returns: [], cycles: [] });
  const [loading, setLoading] = React.useState(true);
  const [selectedSupplier, setSelectedSupplier] = React.useState<string | null>(null);
  const [supplierTrend, setSupplierTrend] = React.useState<{
    orders: TrendPoint[];
    returns: TrendPoint[];
    cycles: TrendPoint[];
  } | null>(null);
  const [supplierFinancings, setSupplierFinancings] = React.useState<FinanceApplication[]>([]);
  const [supplierAlerts, setSupplierAlerts] = React.useState<AlertEvent[]>([]);

  const kpis = React.useMemo(() => {
    let totalOutstanding = 0;
    let activeCount = 0;
    let avgCycle = 0;
    let warningCount = 0;
    let cycleSum = 0;
    rows.forEach((r) => {
      totalOutstanding += r.outstanding;
      activeCount += r.activeCount;
      cycleSum += r.latest.paymentCycleDays;
      if (r.status !== "normal") warningCount++;
    });
    avgCycle = rows.length > 0 ? Math.round(cycleSum / rows.length) : 0;
    return {
      supplierCount: rows.length,
      totalOutstanding,
      avgCycle,
      warningCount,
      activeFinancingCount: activeCount,
    };
  }, [rows]);

  React.useEffect(() => {
    initializeStore();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metrics, suppliers, apps, alerts, scores] = await Promise.all([
        store.monitoringMetrics.all(),
        store.enterprises.filter((e) => e.role === "supplier"),
        store.financeApplications.filter((a) => a.status === "disbursed" || a.status === "overdue"),
        store.alertEvents.all(),
        store.creditScores.all(),
      ]);

      const today = new Date("2026-06-08");
      const dateStr = (d: Date) => d.toISOString().slice(0, 10);
      const daysBack = 30;

      const aggOrders: Record<string, number> = {};
      const aggReturns: Record<string, number> = {};
      const aggCycles: Record<string, number[]> = {};
      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dateStr(d);
        aggOrders[key] = 0;
        aggReturns[key] = 0;
        aggCycles[key] = [];
      }

      const supplierLatest: Record<string, MonitoringMetrics> = {};
      const supplierMetricsList: Record<string, MonitoringMetrics[]> = {};
      metrics.forEach((m) => {
        const key = m.date.slice(0, 10);
        if (aggOrders[key] !== undefined) {
          aggOrders[key] += m.orderVolume;
          aggReturns[key] += Math.round(m.returnRate * 10000) / 100;
          aggCycles[key].push(m.paymentCycleDays);
        }
        if (!supplierLatest[m.supplierId] || m.date > supplierLatest[m.supplierId].date) {
          supplierLatest[m.supplierId] = m;
        }
        if (!supplierMetricsList[m.supplierId]) supplierMetricsList[m.supplierId] = [];
        supplierMetricsList[m.supplierId].push(m);
      });

      const ordersTrend = Object.entries(aggOrders).map(([date, value]) => ({
        date: date.slice(5),
        value,
      }));
      const returnsTrend = Object.entries(aggReturns).map(([date, value]) => ({
        date: date.slice(5),
        value,
      }));
      const cyclesTrend = Object.entries(aggCycles).map(([date, arr]) => ({
        date: date.slice(5),
        value: arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0,
      }));

      setTrendData({ orders: ordersTrend, returns: returnsTrend, cycles: cyclesTrend });

      const supplierRows: SupplierMonitorRow[] = suppliers.map((sup) => {
        const latest = supplierLatest[sup.id];
        const supplierApps = apps.filter((a) => a.supplierId === sup.id);
        const outstanding = supplierApps.reduce(
          (sum, a) => sum + (a.amount || 0),
          0
        );
        const hasWarning = alerts.some(
          (a) => a.supplierId === sup.id && (a.status === "new" || a.status === "processing")
        );
        const cs = scores.find((c) => c.supplierId === sup.id);
        let status: "normal" | "warning" | "frozen" = "normal";
        if (cs && (cs.riskLevel === "critical" || cs.riskLevel === "high")) status = "frozen";
        else if (hasWarning || latest?.orderVolumeMom < -0.15) status = "warning";
        return {
          supplier: sup,
          latest: latest || {
            id: "",
            supplierId: sup.id,
            date: "",
            orderVolume: 0,
            orderVolumeMom: 0,
            returnRate: 0,
            returnRateMom: 0,
            paymentCycleDays: 0,
            paymentCycleMom: 0,
            activeFinancingCount: 0,
            totalOutstanding: 0,
          },
          outstanding,
          activeCount: supplierApps.length,
          status,
          score: cs,
          expanded: false,
        };
      });

      setRows(supplierRows);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (supplierId: string) => {
    const isExpanding = selectedSupplier !== supplierId;
    setSelectedSupplier(isExpanding ? supplierId : null);

    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        expanded: isExpanding && r.supplier.id === supplierId,
      }))
    );

    if (!isExpanding) {
      setSupplierTrend(null);
      setSupplierFinancings([]);
      setSupplierAlerts([]);
      return;
    }

    const today = new Date("2026-06-08");
    const dateStr = (d: Date) => d.toISOString().slice(0, 10);
    const daysBack = 30;
    const targetDates: string[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      targetDates.push(dateStr(d));
    }

    const [metrics, apps, alerts] = await Promise.all([
      store.monitoringMetrics.filter((m) => m.supplierId === supplierId),
      store.financeApplications.filter((a) => a.supplierId === supplierId),
      store.alertEvents.filter((a) => a.supplierId === supplierId),
    ]);

    const map: Record<string, MonitoringMetrics> = {};
    metrics.forEach((m) => {
      map[m.date.slice(0, 10)] = m;
    });

    const orders: TrendPoint[] = [];
    const returns: TrendPoint[] = [];
    const cycles: TrendPoint[] = [];
    targetDates.forEach((d) => {
      const m = map[d];
      orders.push({ date: d.slice(5), value: m?.orderVolume || 0 });
      returns.push({ date: d.slice(5), value: m ? Math.round(m.returnRate * 10000) / 100 : 0 });
      cycles.push({ date: d.slice(5), value: m?.paymentCycleDays || 0 });
    });

    setSupplierTrend({ orders, returns, cycles });
    setSupplierFinancings(apps);
    setSupplierAlerts(alerts);
  };

  const renderTrendBadge = (mom: number, inverse: boolean = false) => {
    const positive = inverse ? mom < 0 : mom > 0;
    const isStable = Math.abs(mom) < 0.02;
    if (isStable) {
      return (
        <span className="inline-flex items-center text-navy-500 text-sm">
          <Minus className="w-3.5 h-3.5 mr-0.5" />
          {formatPercent(Math.abs(mom))}
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center text-sm",
          positive ? "text-status-success" : "text-status-danger"
        )}
      >
        {positive ? (
          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
        )}
        {formatPercent(Math.abs(mom))}
      </span>
    );
  };

  const statusBadge = (status: "normal" | "warning" | "frozen") => {
    if (status === "frozen") {
      return <Badge variant="danger">已冻结</Badge>;
    }
    if (status === "warning") {
      return <Badge variant="warning">预警</Badge>;
    }
    return <Badge variant="success">正常</Badge>;
  };

  const chartGradient = (
    <defs>
      <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B2545" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#0B2545" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1B9AAA" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#1B9AAA" stopOpacity={0.02} />
      </linearGradient>
    </defs>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">贷后监控看板</h1>
          <p className="text-navy-500 text-sm mt-1">
            实时监控供应商经营指标与贷后风险变化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-navy-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">在贷供应商数</p>
                  <p className="text-3xl font-bold text-navy-700 mt-2">
                    {kpis.supplierCount}
                  </p>
                  <p className="text-xs text-navy-400 mt-1">
                    活跃融资 {kpis.activeFinancingCount} 笔
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-navy-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gold-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">在贷余额</p>
                  <p className="text-3xl font-bold text-gold-500 mt-2">
                    {formatCurrency(kpis.totalOutstanding)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gold-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gold-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-400">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">平均回款周期</p>
                  <p className="text-3xl font-bold text-navy-700 mt-2">
                    {kpis.avgCycle}
                    <span className="text-base font-normal text-navy-400 ml-1">天</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-teal-400/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-status-danger">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-500 text-sm">异常预警数</p>
                  <p className="text-3xl font-bold text-status-danger mt-2">
                    {kpis.warningCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-status-danger" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-navy-500" />
                近30天订单量趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.orders} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    {chartGradient}
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #C3D0E5",
                        boxShadow: "0 4px 12px rgba(11,37,69,0.1)",
                      }}
                    />
                    <defs>
                      <filter id="navyGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0B2545"
                      strokeWidth={2.5}
                      fill="url(#navyGrad)"
                      filter="url(#navyGlow)"
                      name="订单量"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-gold-500" />
                近30天退货率趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.returns} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    {chartGradient}
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #C3D0E5",
                        boxShadow: "0 4px 12px rgba(11,37,69,0.1)",
                      }}
                      formatter={(v: number) => [`${v}%`, "退货率"]}
                    />
                    <defs>
                      <filter id="goldGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#D4AF37"
                      strokeWidth={2.5}
                      fill="url(#goldGrad)"
                      filter="url(#goldGlow)"
                      name="退货率"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                近30天回款周期趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.cycles} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    {chartGradient}
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8FA6C9" }} axisLine={false} tickLine={false} unit="天" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #C3D0E5",
                        boxShadow: "0 4px 12px rgba(11,37,69,0.1)",
                      }}
                      formatter={(v: number) => [`${v}天`, "回款周期"]}
                    />
                    <defs>
                      <filter id="tealGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#1B9AAA"
                      strokeWidth={2.5}
                      fill="url(#tealGrad)"
                      filter="url(#tealGlow)"
                      name="回款周期"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gold-500" />
              供应商监控列表
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>供应商名称</TableHead>
                  <TableHead>行业</TableHead>
                  <TableHead>在贷余额</TableHead>
                  <TableHead>订单量</TableHead>
                  <TableHead>退货率</TableHead>
                  <TableHead>回款周期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment key={row.supplier.id}>
                    <TableRow className="cursor-pointer" onClick={() => toggleExpand(row.supplier.id)}>
                      <TableCell>
                        {row.expanded ? (
                          <ChevronUp className="w-4 h-4 text-navy-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-navy-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-navy-700">
                        {row.supplier.name}
                      </TableCell>
                      <TableCell className="text-navy-500">{row.supplier.industry}</TableCell>
                      <TableCell className="font-semibold text-navy-700">
                        {formatCurrency(row.outstanding)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-navy-700">{row.latest.orderVolume}</span>
                          <div className="mt-0.5">
                            {renderTrendBadge(row.latest.orderVolumeMom)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-navy-700">
                            {formatPercent(row.latest.returnRate)}
                          </span>
                          <div className="mt-0.5">
                            {renderTrendBadge(row.latest.returnRateMom, true)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-navy-700">
                            {row.latest.paymentCycleDays}天
                          </span>
                          <div className="mt-0.5">
                            {renderTrendBadge(row.latest.paymentCycleMom / 100, true)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                    {row.expanded && supplierTrend && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <div className="py-4 px-6 bg-gradient-to-r from-navy-50/50 to-gold-50/30 rounded-lg -mx-2 space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm text-navy-500">
                                    订单量走势
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={supplierTrend.orders}>
                                        {chartGradient}
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <Area
                                          type="monotone"
                                          dataKey="value"
                                          stroke="#0B2545"
                                          strokeWidth={2}
                                          fill="url(#navyGrad)"
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm text-navy-500">
                                    退货率走势
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={supplierTrend.returns}>
                                        {chartGradient}
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <Area
                                          type="monotone"
                                          dataKey="value"
                                          stroke="#D4AF37"
                                          strokeWidth={2}
                                          fill="url(#goldGrad)"
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm text-navy-500">
                                    回款周期走势
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={supplierTrend.cycles}>
                                        {chartGradient}
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#8FA6C9" }} axisLine={false} tickLine={false} />
                                        <Area
                                          type="monotone"
                                          dataKey="value"
                                          stroke="#1B9AAA"
                                          strokeWidth={2}
                                          fill="url(#tealGrad)"
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gold-500" />
                                    关联融资 ({supplierFinancings.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  {supplierFinancings.length === 0 ? (
                                    <p className="text-sm text-navy-400 py-2">暂无关联融资</p>
                                  ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {supplierFinancings.map((app) => (
                                        <div
                                          key={app.id}
                                          className="flex items-center justify-between p-2 rounded-md bg-white border border-navy-100"
                                        >
                                          <div>
                                            <p className="text-sm font-medium text-navy-700 font-mono">
                                              {app.applicationNo}
                                            </p>
                                            <p className="text-xs text-navy-400 mt-0.5">
                                              提交于 {formatDate(app.createdAt)}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-navy-700">
                                              {formatCurrency(app.amount)}
                                            </p>
                                            {row.score && (
                                              <Badge
                                                className={cn(
                                                  "text-xs mt-0.5 border",
                                                  riskLevelBgColor(row.score.riskLevel)
                                                )}
                                              >
                                                {riskLevelText(row.score.riskLevel)}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-status-warning" />
                                    预警记录 ({supplierAlerts.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  {supplierAlerts.length === 0 ? (
                                    <p className="text-sm text-navy-400 py-2">暂无预警记录</p>
                                  ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {supplierAlerts.map((alert) => (
                                        <div
                                          key={alert.id}
                                          className="p-2 rounded-md bg-white border border-navy-100"
                                        >
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-navy-700">
                                              {alert.title}
                                            </p>
                                            <Badge
                                              variant={
                                                alert.status === "resolved"
                                                  ? "success"
                                                  : alert.status === "false_alarm"
                                                  ? "default"
                                                  : alert.status === "processing"
                                                  ? "warning"
                                                  : "danger"
                                              }
                                              className="text-xs"
                                            >
                                              {alert.status === "resolved"
                                                ? "已解决"
                                                : alert.status === "false_alarm"
                                                ? "误报"
                                                : alert.status === "processing"
                                                ? "处理中"
                                                : "待处理"}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-navy-400 mt-1">
                                            {formatDate(alert.triggeredAt)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
