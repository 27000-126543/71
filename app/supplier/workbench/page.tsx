"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  CreditCard,
  FileText,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Wallet,
  History,
  PiggyBank,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { store } from "@/src/data/store";
import type { CreditScore, FinanceApplication } from "@/src/types";
import { formatCurrency, formatDate, financeStatusText, financeStatusVariant } from "@/src/lib/utils";

const riskLevelConfig = {
  low: { label: "低风险", variant: "success" as const },
  medium: { label: "中等风险", variant: "warning" as const },
  high: { label: "高风险", variant: "danger" as const },
  critical: { label: "极高风险", variant: "danger" as const },
};

export default function SupplierWorkbench() {
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [applications, setApplications] = useState<FinanceApplication[]>([]);

  useEffect(() => {
    if (!user?.enterpriseId) return;
    (async () => {
      const cs = await store.creditScores.getBySupplier(user.enterpriseId!);
      setCreditScore(cs || null);
      const apps = await store.financeApplications.filter(
        (f) => f.supplierId === user.enterpriseId
      );
      setApplications(apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    })();
  }, [user]);

  const trendData = [
    { month: "1月", used: 120, available: 380 },
    { month: "2月", used: 180, available: 320 },
    { month: "3月", used: 150, available: 350 },
    { month: "4月", used: 220, available: 280 },
    { month: "5月", used: 200, available: 300 },
    { month: "6月", used: 260, available: 240 },
  ];

  const totalCreditLimit = creditScore?.creditLimit || 5000000;
  const availableLimit = creditScore?.availableLimit || 2400000;
  const usedLimit = totalCreditLimit - availableLimit;
  const overallScore = creditScore?.overallScore || 78;
  const riskLevel = creditScore?.riskLevel || "medium";

  const activeCount = applications.filter(
    (a) => ["submitted", "verifying", "approved", "disbursed"].includes(a.status)
  ).length;
  const pendingRepayment = applications
    .filter((a) => a.status === "disbursed")
    .reduce((sum, a) => sum + a.amount, 0);
  const historicalCount = applications.filter(
    (a) => ["repaid", "rejected"].includes(a.status)
  ).length;
  const avgRate = 6.8;

  const progressColor = overallScore >= 80
    ? "#2E8B57"
    : overallScore >= 60
    ? "#E6A817"
    : "#C1292E";

  return (
    <AppLayout requiredRoles={["supplier"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-600">供应商工作台</h1>
            <p className="text-navy-400 mt-1 text-sm">欢迎回来，{user?.name}</p>
          </div>
          <Button variant="gold" onClick={() => (window.location.href = "/finance/apply")}>
            <DollarSign className="w-4 h-4 mr-2" />
            立即融资
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-navy-500 via-navy-600 to-navy-700 text-white border-navy-400 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <CardContent className="p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="gold" className="bg-gold-400/20 text-gold-300 border-gold-400/30">
                    已认证
                  </Badge>
                  <Badge variant={riskLevelConfig[riskLevel].variant} className="bg-opacity-20">
                    {riskLevelConfig[riskLevel].label}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-1">上海鑫源供应链有限公司</h2>
                <p className="text-navy-200 text-sm">统一信用代码：91310000MA1FL2XX8A</p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-navy-300 text-xs mb-1">总授信额度</p>
                    <p className="text-xl font-bold text-gold-300">{formatCurrency(totalCreditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-navy-300 text-xs mb-1">可用额度</p>
                    <p className="text-xl font-bold text-green-300">{formatCurrency(availableLimit)}</p>
                  </div>
                  <div>
                    <p className="text-navy-300 text-xs mb-1">已用额度</p>
                    <p className="text-xl font-bold">{formatCurrency(usedLimit)}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(212, 175, 55, 0.15)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={progressColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(overallScore / 100) * 263.89} 263.89`}
                      style={{ transition: "stroke-dasharray 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold" style={{ color: progressColor }}>
                      {overallScore}
                    </p>
                    <p className="text-navy-300 text-sm">综合信用评分</p>
                    <p className="text-gold-300 text-xs mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      较上月 +3
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <p className="text-navy-300 text-sm mb-3">额度使用情况</p>
                <div className="w-full h-4 rounded-full bg-navy-800/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-500"
                    style={{ width: `${(usedLimit / totalCreditLimit) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-navy-300">
                  <span>已用 {((usedLimit / totalCreditLimit) * 100).toFixed(1)}%</span>
                  <span>剩余 {((availableLimit / totalCreditLimit) * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gold-400" />
                      <span className="text-sm">下次评级更新</span>
                    </div>
                    <span className="text-gold-300 text-sm font-medium">2024-07-15</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "在贷笔数",
              value: activeCount.toString(),
              unit: "笔",
              icon: CreditCard,
              trend: "+2",
              trendUp: true,
            },
            {
              title: "待还款总额",
              value: formatCurrency(pendingRepayment),
              unit: "",
              icon: Wallet,
              trend: "-5.2%",
              trendUp: false,
            },
            {
              title: "历史融资笔数",
              value: historicalCount.toString(),
              unit: "笔",
              icon: History,
              trend: "+12%",
              trendUp: true,
            },
            {
              title: "平均融资成本",
              value: avgRate.toString(),
              unit: "%/年",
              icon: PiggyBank,
              trend: "-0.3%",
              trendUp: false,
            },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-navy-400 text-sm">{item.title}</p>
                    <p className="text-2xl font-bold text-navy-600 mt-2">
                      {item.value}
                      <span className="text-sm font-normal text-navy-400 ml-1">{item.unit}</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-navy-500" />
                  </div>
                </div>
                <div className={`mt-3 flex items-center text-sm ${item.trendUp ? "text-status-success" : "text-status-danger"}`}>
                  <ArrowUpRight className={`w-4 h-4 mr-1 ${!item.trendUp ? "rotate-180" : ""}`} />
                  {item.trend}
                  <span className="text-navy-400 ml-1">较上月</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "立即融资", icon: DollarSign, color: "from-gold-400 to-gold-500", href: "/finance/apply" },
            { label: "查看额度", icon: CreditCard, color: "from-navy-500 to-navy-600", href: "/supplier/credit" },
            { label: "还款管理", icon: Wallet, color: "from-teal-500 to-teal-600", href: "#" },
            { label: "交易记录", icon: FileText, color: "from-navy-400 to-navy-500", href: "/finance/list" },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => (window.location.href = action.href)}
              className="group relative overflow-hidden rounded-xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-95 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-semibold">{action.label}</p>
                <ChevronRight className="w-5 h-5 text-white/70 mt-2 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>最近融资申请</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/finance/list")}>
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申请编号</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>期限</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>申请日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.slice(0, 5).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.applicationNo}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(app.amount)}</TableCell>
                      <TableCell>{app.termDays}天</TableCell>
                      <TableCell>
                        <Badge variant={financeStatusVariant(app.status)}>
                          {financeStatusText(app.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-1 text-navy-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(app.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">详情</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-navy-400 py-8">
                        暂无融资申请记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>近6个月额度使用趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="availableGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B9AAA" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1B9AAA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                    <XAxis dataKey="month" tick={{ fill: "#5A7CAC", fontSize: 12 }} axisLine={{ stroke: "#C3D0E5" }} />
                    <YAxis tick={{ fill: "#5A7CAC", fontSize: 12 }} axisLine={{ stroke: "#C3D0E5" }} unit="万" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #C3D0E5",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(11,37,69,0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="used"
                      name="已用额度"
                      stroke="#D4AF37"
                      strokeWidth={2.5}
                      dot={{ fill: "#D4AF37", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="available"
                      name="可用额度"
                      stroke="#1B9AAA"
                      strokeWidth={2.5}
                      dot={{ fill: "#1B9AAA", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
