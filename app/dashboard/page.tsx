"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatCurrency, formatPercent, formatDateTime, riskLevelText, riskLevelColor, alertTypeText } from "@/src/lib/utils";
import type { DashboardStats, AlertEvent, RiskLevel } from "@/src/types";
import KpiCard from "@/src/components/charts/KpiCard";
import GaugeChart from "@/src/components/charts/GaugeChart";
import TrendLineChart from "@/src/components/charts/TrendLineChart";
import IndustryPieChart from "@/src/components/charts/IndustryPieChart";
import RiskBarChart from "@/src/components/charts/RiskBarChart";
import HeatmapGrid, { HeatmapItem } from "@/src/components/charts/HeatmapGrid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const MOCK_DASHBOARD_DATA: DashboardStats = {
  totalOutstanding: 1285678450.25,
  totalFinancingCount: 3847,
  creditUtilizationRate: 0.7234,
  totalCreditLimit: 1777287374.88,
  usedCreditLimit: 1285678450.25,
  availableCreditLimit: 491608924.63,
  overdueRate: 0.0245,
  nonPerformingRate: 0.0087,
  totalInterestIncome: 28567890.5,
  industryDistribution: [
    { industry: "电子制造业", amount: 385678900, overdueRate: 0.018 },
    { industry: "汽车零部件", amount: 298456700, overdueRate: 0.023 },
    { industry: "纺织服装", amount: 187654300, overdueRate: 0.038 },
    { industry: "食品饮料", amount: 156789200, overdueRate: 0.012 },
    { industry: "医药健康", amount: 134567800, overdueRate: 0.008 },
    { industry: "机械设备", amount: 122531550, overdueRate: 0.029 },
  ],
  monthlyTrend: [
    { month: "2025-07", disbursed: 85678900, repaid: 72345600, overdue: 1234500 },
    { month: "2025-08", disbursed: 92345600, repaid: 78901200, overdue: 1456700 },
    { month: "2025-09", disbursed: 78901200, repaid: 85678900, overdue: 1123400 },
    { month: "2025-10", disbursed: 101234500, repaid: 89012300, overdue: 1678900 },
    { month: "2025-11", disbursed: 94567800, repaid: 92345600, overdue: 1345600 },
    { month: "2025-12", disbursed: 115678900, repaid: 98765400, overdue: 1890100 },
    { month: "2026-01", disbursed: 89012300, repaid: 101234500, overdue: 1456700 },
    { month: "2026-02", disbursed: 76543200, repaid: 85678900, overdue: 1123400 },
    { month: "2026-03", disbursed: 123456700, repaid: 98765400, overdue: 2012300 },
    { month: "2026-04", disbursed: 108765400, repaid: 105432100, overdue: 1789000 },
    { month: "2026-05", disbursed: 115432100, repaid: 108765400, overdue: 1923400 },
    { month: "2026-06", disbursed: 98765400, repaid: 94567800, overdue: 1567800 },
  ],
  riskDistribution: [
    { level: "low", count: 1847, amount: 623456700 },
    { level: "medium", count: 1156, amount: 398765400 },
    { level: "high", count: 589, amount: 187654300 },
    { level: "critical", count: 255, amount: 75802050 },
  ],
  alerts: [
    {
      id: "1",
      supplierId: "s1",
      type: "payment_delay",
      level: "critical",
      title: "付款严重延迟预警",
      description: "深圳市恒辉电子有限公司付款延迟超过15天，涉及金额¥5,680,000",
      metricValue: 15,
      threshold: 7,
      triggeredAt: "2026-06-08T14:23:00",
      status: "new",
      frozenCreditLimit: 5000000,
    },
    {
      id: "2",
      supplierId: "s2",
      type: "order_drop",
      level: "high",
      title: "订单量大幅下降",
      description: "苏州精密机械有限公司近30天订单量环比下降42%",
      metricValue: -42,
      threshold: -20,
      triggeredAt: "2026-06-08T11:45:00",
      status: "new",
      frozenCreditLimit: 3000000,
    },
    {
      id: "3",
      supplierId: "s3",
      type: "return_spike",
      level: "high",
      title: "退货率异常激增",
      description: "杭州纺织科技有限公司退货率达18.5%，远超行业平均",
      metricValue: 18.5,
      threshold: 8,
      triggeredAt: "2026-06-08T09:12:00",
      status: "processing",
    },
    {
      id: "4",
      supplierId: "s4",
      type: "abnormal_behavior",
      level: "medium",
      title: "异常融资行为检测",
      description: "广州食品有限公司短时间内频繁提交小额融资申请",
      metricValue: 12,
      threshold: 5,
      triggeredAt: "2026-06-07T16:30:00",
      status: "processing",
    },
    {
      id: "5",
      supplierId: "s5",
      type: "payment_delay",
      level: "medium",
      title: "付款延迟预警",
      description: "上海医药集团付款延迟5天，涉及金额¥2,340,000",
      metricValue: 5,
      threshold: 3,
      triggeredAt: "2026-06-07T14:20:00",
      status: "processing",
    },
    {
      id: "6",
      supplierId: "s6",
      type: "order_drop",
      level: "low",
      title: "订单量轻微下降",
      description: "北京机械设备有限公司近30天订单量环比下降12%",
      metricValue: -12,
      threshold: -10,
      triggeredAt: "2026-06-06T10:00:00",
      status: "resolved",
    },
  ],
};

const APPROVAL_EFFICIENCY_DATA = [
  { range: "100万以下", hours: 4.2 },
  { range: "100-500万", hours: 8.6 },
  { range: "500-1000万", hours: 16.3 },
  { range: "1000-3000万", hours: 28.5 },
  { range: "3000万以上", hours: 52.8 },
];

const INDUSTRY_RISK_DATA: HeatmapItem[] = [
  { name: "电子制造业", score: 72, trend: "stable", suggestion: "行业景气度稳定，建议维持当前授信政策" },
  { name: "汽车零部件", score: 65, trend: "down", suggestion: "新能源车渗透率提升，建议关注传统零部件企业转型" },
  { name: "纺织服装", score: 42, trend: "down", suggestion: "海外订单转移压力大，建议收紧授信额度15%" },
  { name: "食品饮料", score: 81, trend: "up", suggestion: "消费复苏明显，建议增加优质客户授信额度" },
  { name: "医药健康", score: 78, trend: "stable", suggestion: "政策支持创新药发展，建议关注创新药产业链" },
  { name: "机械设备", score: 58, trend: "down", suggestion: "出口增速放缓，建议提高首付比例至30%" },
];

const TIME_RANGES = [
  { key: "month", label: "本月" },
  { key: "quarter", label: "本季" },
  { key: "year", label: "本年" },
  { key: "custom", label: "自定义" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats>(MOCK_DASHBOARD_DATA);
  const [timeRange, setTimeRange] = useState<string>("month");
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = useCallback(async (range: string) => {
    setLoading(true);
    try {
      const apiRange = range === "custom" ? "all" : range;
      const res = await fetch(`/api/dashboard/stats?range=${apiRange}`);
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error("获取仪表盘数据失败", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange, fetchStats]);

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const formatMonth = (m: string) => {
    const [, month] = m.split("-");
    return `${parseInt(month)}月`;
  };

  const trendData = useMemo(() => {
    return data.monthlyTrend.map((d) => ({ ...d, month: formatMonth(d.month) }));
  }, [data]);

  return (
    <div className="min-h-screen bg-navy-500 noise-bg text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <header className="mb-6">
          <div className="gold-line mb-4"></div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-serif font-bold glow-text tracking-wider">
                盛融供应链金融 · 管理驾驶舱
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-gold-400" />
                <span className="font-mono">{formatDateTime(now, "yyyy年MM月dd日")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-gold-400" />
                <span className="font-mono text-lg font-semibold text-gold-300">
                  {formatDateTime(now, "HH:mm:ss")}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-navy-700/60 rounded-lg p-1 border border-gold-500/20">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => handleRangeChange(r.key)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                      timeRange === r.key
                        ? "bg-gold-400 text-navy-900 font-semibold"
                        : "text-gray-300 hover:text-gold-300"
                    } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {loading && timeRange === r.key ? "加载中..." : r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="gold-line mt-4"></div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <KpiCard
            title="在贷余额"
            value={data.totalOutstanding}
            format="currency"
            changePercent={0.085}
            trend="up"
            showGlow
            darkMode
          />
          <div className="relative rounded-xl p-5 border bg-navy-700/60 border-gold-500/30 backdrop-blur-sm animate-pulse-glow">
            <div className="flex items-start justify-between">
              <div className="text-sm font-medium text-gray-300 mb-2">授信使用率</div>
              <div className="text-xs text-gold-300 font-semibold">{formatPercent(data.creditUtilizationRate)}</div>
            </div>
            {data.totalCreditLimit > 0 ? (
              <div className="flex items-center justify-between">
                <GaugeChart value={data.creditUtilizationRate} darkMode size="md" />
                <div className="space-y-2 text-sm">
                  <div className="text-gray-400">
                    总额度: <span className="text-white font-semibold">{formatCurrency(data.totalCreditLimit, 0)}</span>
                  </div>
                  <div className="text-gray-400">
                    已用: <span className="text-gold-300 font-semibold">{formatCurrency(data.usedCreditLimit, 0)}</span>
                  </div>
                  <div className="text-gray-400">
                    剩余: <span className="text-emerald-400 font-semibold">{formatCurrency(data.availableCreditLimit, 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[140px] text-gray-400 text-sm">
                本时间段暂无授信使用数据
              </div>
            )}
          </div>
          <KpiCard
            title="逾期率"
            value={data.overdueRate}
            format="percent"
            changePercent={-0.023}
            trend="down"
            showGlow
            darkMode
            valueColor="text-rose-400"
          />
          <KpiCard
            title="不良率"
            value={data.nonPerformingRate}
            format="percent"
            changePercent={0.005}
            trend="up"
            showGlow
            darkMode
            valueColor="text-orange-400"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2 rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-gold-200">月度投放与回收趋势</h2>
              <span className="text-xs text-gray-400">近12个月</span>
            </div>
            <TrendLineChart
              data={trendData}
              darkMode
              lines={[
                { dataKey: "disbursed", name: "投放金额", color: "#D4AF37", type: "area" },
                { dataKey: "repaid", name: "回收金额", color: "#1B9AAA", type: "line" },
                { dataKey: "overdue", name: "逾期金额", color: "#C1292E", type: "line" },
              ]}
              height={300}
            />
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
            <h2 className="text-lg font-serif font-semibold text-gold-200 mb-4">各行业融资分布</h2>
            <IndustryPieChart data={data.industryDistribution} darkMode height={300} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
            <h2 className="text-lg font-serif font-semibold text-gold-200 mb-4">风险等级分布</h2>
            <RiskBarChart data={data.riskDistribution} darkMode height={200} />
            <div className="mt-4 border-t border-gold-500/10 pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left py-2 font-normal">风险等级</th>
                    <th className="text-right py-2 font-normal">笔数</th>
                    <th className="text-right py-2 font-normal">金额</th>
                    <th className="text-right py-2 font-normal">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {data.riskDistribution.map((item) => {
                    const totalAmount = data.riskDistribution.reduce((s, r) => s + (isFinite(r.amount) ? r.amount : 0), 0);
                    const ratio = totalAmount > 0 && isFinite(item.amount) ? item.amount / totalAmount : 0;
                    return (
                      <tr key={item.level} className="border-t border-gold-500/10">
                        <td className="py-2">
                          <span className={riskLevelColor(item.level).replace("text-status", "text")}>
                            {riskLevelText(item.level)}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono">{item.count.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-gold-300">{formatCurrency(item.amount, 0)}</td>
                        <td className="py-2 text-right font-mono text-gray-400">
                          {formatPercent(ratio)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
            <h2 className="text-lg font-serif font-semibold text-gold-200 mb-4">审批时效分析</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={APPROVAL_EFFICIENCY_DATA} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,124,172,0.2)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#C3D0E5", fontSize: 11 }} axisLine={{ stroke: "rgba(90,124,172,0.2)" }} tickLine={false} unit="h" />
                <YAxis type="category" dataKey="range" tick={{ fill: "#C3D0E5", fontSize: 11 }} axisLine={{ stroke: "rgba(90,124,172,0.2)" }} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#091E38", border: "1px solid #2E5290", borderRadius: "8px" }}
                  formatter={(v: number) => [`${v.toFixed(1)} 小时`, "平均审批时长"]}
                  labelStyle={{ color: "#D4AF37", fontWeight: 600 }}
                />
                <Bar dataKey="hours" name="hours" radius={[0, 4, 4, 0]} barSize={20}>
                  {APPROVAL_EFFICIENCY_DATA.map((_, idx) => (
                    <Cell key={idx} fill={idx < 2 ? "#2E8B57" : idx < 4 ? "#D4AF37" : "#C1292E"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-gold-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gold-400" />
                实时预警
              </h2>
              <span className="text-xs text-gray-400">{data.alerts.length} 条</span>
            </div>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {data.alerts.map((alert: AlertEvent, idx: number) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 transition-all ${
                    alert.status === "new"
                      ? "border-rose-500/50 bg-rose-500/10 animate-pulse"
                      : "border-gold-500/20 bg-navy-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      alert.level === "critical" ? "bg-rose-600 text-white" :
                      alert.level === "high" ? "bg-orange-500 text-white" :
                      alert.level === "medium" ? "bg-yellow-500 text-navy-900" :
                      "bg-emerald-500 text-white"
                    }`}>
                      {riskLevelText(alert.level)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                      {formatDateTime(alert.triggeredAt, "MM-dd HH:mm")}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{alert.title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{alert.description}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-teal-400">{alertTypeText(alert.type)}</span>
                    <span className={`text-xs ${
                      alert.status === "new" ? "text-rose-400" :
                      alert.status === "processing" ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}>
                      {alert.status === "new" ? "新预警" : alert.status === "processing" ? "处理中" : "已处理"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gold-500/20 bg-navy-700/40 backdrop-blur-sm p-5">
          <h2 className="text-lg font-serif font-semibold text-gold-200 mb-4">行业风险分布热力图</h2>
          <HeatmapGrid data={INDUSTRY_RISK_DATA} darkMode />
        </section>
      </div>
    </div>
  );
}
