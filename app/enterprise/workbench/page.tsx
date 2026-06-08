"use client";

import * as React from "react";
import {
  Building2,
  Users,
  TrendingUp,
  Wallet,
  ShieldCheck,
  BadgeCheck,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  FileText,
  ChevronRight,
  Search,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/src/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Separator } from "@/src/components/ui/separator";
import { useAuth } from "@/src/context/AuthContext";
import { formatCurrency, formatDate, financeStatusText, financeStatusColor, cn } from "@/src/lib/utils";
import Link from "next/link";

const monthlyTrendData = [
  { month: "7月", 交易额: 3200, 融资额: 1800 },
  { month: "8月", 交易额: 3800, 融资额: 2100 },
  { month: "9月", 交易额: 4200, 融资额: 2400 },
  { month: "10月", 交易额: 3900, 融资额: 2200 },
  { month: "11月", 交易额: 4600, 融资额: 2800 },
  { month: "12月", 交易额: 5200, 融资额: 3200 },
  { month: "1月", 交易额: 4800, 融资额: 2900 },
  { month: "2月", 交易额: 3600, 融资额: 2000 },
  { month: "3月", 交易额: 5100, 融资额: 3100 },
  { month: "4月", 交易额: 5600, 融资额: 3500 },
  { month: "5月", 交易额: 6200, 融资额: 3900 },
  { month: "6月", 交易额: 6800, 融资额: 4300 },
];

const supplierDistributionData = [
  { name: "制造业", value: 45 },
  { name: "批发零售", value: 28 },
  { name: "物流运输", value: 15 },
  { name: "信息技术", value: 8 },
  { name: "其他", value: 4 },
];

const PIE_COLORS = ["#0B2545", "#D4AF37", "#1B9AAA", "#2E5290", "#5A7CAC"];

const transactionOrders = [
  {
    id: "1",
    orderNo: "TRX20240608001",
    supplierName: "上海精密制造有限公司",
    productName: "高精度数控机床配件",
    amount: 1280000,
    orderDate: "2024-06-08",
    status: "completed",
  },
  {
    id: "2",
    orderNo: "TRX20240607002",
    supplierName: "苏州电子科技有限公司",
    productName: "工业级PCB电路板",
    amount: 560000,
    orderDate: "2024-06-07",
    status: "delivered",
  },
  {
    id: "3",
    orderNo: "TRX20240606003",
    supplierName: "杭州物流运输集团",
    productName: "冷链物流服务",
    amount: 320000,
    orderDate: "2024-06-06",
    status: "shipped",
  },
  {
    id: "4",
    orderNo: "TRX20240605004",
    supplierName: "宁波新材料科技",
    productName: "特种合金材料",
    amount: 2150000,
    orderDate: "2024-06-05",
    status: "created",
  },
  {
    id: "5",
    orderNo: "TRX20240604005",
    supplierName: "无锡自动化设备",
    productName: "智能仓储系统",
    amount: 3800000,
    orderDate: "2024-06-04",
    status: "completed",
  },
];

const guaranteedFinancing = [
  {
    id: "1",
    applicationNo: "FIN20240608001",
    supplierName: "上海精密制造有限公司",
    amount: 5000000,
    termDays: 90,
    annualRate: 4.8,
    status: "disbursed",
    createdAt: "2024-06-01",
    disbursedAt: "2024-06-05",
  },
  {
    id: "2",
    applicationNo: "FIN20240607002",
    supplierName: "苏州电子科技有限公司",
    amount: 2000000,
    termDays: 60,
    annualRate: 5.2,
    status: "approved",
    createdAt: "2024-06-03",
  },
  {
    id: "3",
    applicationNo: "FIN20240606003",
    supplierName: "杭州物流运输集团",
    amount: 800000,
    termDays: 30,
    annualRate: 5.5,
    status: "verifying",
    createdAt: "2024-06-06",
  },
  {
    id: "4",
    applicationNo: "FIN20240605004",
    supplierName: "宁波新材料科技",
    amount: 3500000,
    termDays: 180,
    annualRate: 4.5,
    status: "repaid",
    createdAt: "2024-01-05",
    disbursedAt: "2024-01-10",
  },
];

const statusLabels: Record<string, { text: string; variant: "success" | "warning" | "default" | "gold" }> = {
  created: { text: "已创建", variant: "default" },
  shipped: { text: "已发货", variant: "warning" },
  delivered: { text: "已送达", variant: "gold" },
  completed: { text: "已完成", variant: "success" },
  returned: { text: "已退货", variant: "danger" as any },
};

function KpiCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendUp,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  iconBg: string;
}) {
  return (
    <Card className="relative overflow-hidden border-gold-400/20 hover:border-gold-400/40 transition-all">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-400 to-gold-600" />
      <CardContent className="p-6 pl-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-navy-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-navy-700 mt-2 font-serif">{value}</p>
            <p className="text-xs text-navy-400 mt-1">{subtitle}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trendUp ? "text-status-success" : "text-status-danger"
              )}>
                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnterpriseWorkbenchPage() {
  const { user } = useAuth();

  return (
    <AppLayout requiredRoles={["core_enterprise"]}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-navy-600 via-navy-500 to-navy-700 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 noise-bg opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <CardContent className="relative p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-glow">
                  <Building2 className="w-12 h-12 text-navy-800" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-serif font-bold glow-text">
                      盛华实业集团有限公司
                    </h1>
                    <Badge variant="success" className="bg-green-500/20 text-green-300 border-green-500/30">
                      <BadgeCheck className="w-3 h-3 mr-1 inline" />
                      已认证
                    </Badge>
                  </div>
                  <p className="text-navy-200 text-sm">
                    统一社会信用代码：91310000MA1FL3XX1K
                  </p>
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-navy-200">
                      <ShieldCheck className="w-4 h-4 text-gold-400" />
                      <span>核心企业会员等级：铂金VIP</span>
                    </div>
                    <div className="flex items-center gap-2 text-navy-200">
                      <CalendarCheck className="w-4 h-4 text-gold-400" />
                      <span>资质有效期至：2026-12-31</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-navy-200 text-sm">欢迎回来</p>
                <p className="text-xl font-semibold text-gold-300 mt-1">
                  {user?.name || "赵总"}
                </p>
                <p className="text-navy-400 text-xs mt-1">{formatDate(new Date(), "yyyy年MM月dd日 EEEE")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            icon={Users}
            title="绑定供应商数"
            value="128"
            subtitle="较上月新增 6 家"
            trend="+4.9% 同比"
            trendUp
            iconBg="bg-navy-100 text-navy-600"
          />
          <KpiCard
            icon={TrendingUp}
            title="年交易额"
            value="¥5.36亿"
            subtitle="本年度累计交易金额"
            trend="+18.6% 同比"
            trendUp
            iconBg="bg-gold-100 text-gold-600"
          />
          <KpiCard
            icon={Wallet}
            title="在贷余额"
            value="¥1.82亿"
            subtitle="当前未结清融资总额"
            trend="-5.2% 环比"
            trendUp={false}
            iconBg="bg-teal-50 text-teal-600"
          />
          <KpiCard
            icon={ShieldCheck}
            title="融资担保笔数"
            value="47"
            subtitle="本年度累计担保笔数"
            trend="+12.3% 同比"
            trendUp
            iconBg="bg-green-50 text-status-success"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-navy-50 p-1.5 rounded-xl">
            <TabsTrigger value="overview" className="px-5 py-2 rounded-lg text-sm">
              概览
            </TabsTrigger>
            <TabsTrigger value="transactions" className="px-5 py-2 rounded-lg text-sm">
              交易管理
            </TabsTrigger>
            <TabsTrigger value="guarantee" className="px-5 py-2 rounded-lg text-sm">
              融资担保
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-gold-400/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">近12个月交易趋势</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-navy-100 text-navy-600">交易额（万元）</Badge>
                    <Badge variant="gold">融资额（万元）</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                        <XAxis dataKey="month" stroke="#5A7CAC" fontSize={12} />
                        <YAxis stroke="#5A7CAC" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B2545",
                            border: "1px solid #D4AF37",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value: number) => [`${value} 万元`, ""]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="交易额"
                          stroke="#0B2545"
                          strokeWidth={3}
                          dot={{ fill: "#0B2545", r: 4 }}
                          activeDot={{ r: 6, fill: "#D4AF37" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="融资额"
                          stroke="#D4AF37"
                          strokeWidth={3}
                          dot={{ fill: "#D4AF37", r: 4 }}
                          activeDot={{ r: 6, fill: "#0B2545" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gold-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">供应商行业分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={supplierDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {supplierDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value} 家`, "供应商数量"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {supplierDistributionData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: PIE_COLORS[index] }}
                          />
                          <span className="text-navy-600">{item.name}</span>
                        </div>
                        <span className="text-navy-500 font-medium">{item.value} 家</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card className="border-gold-400/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-500" />
                  最近交易订单
                </CardTitle>
                <Link href="/enterprise/orders">
                  <Button variant="ghost" size="sm" className="text-navy-500 gap-1">
                    查看全部 <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>产品名称</TableHead>
                      <TableHead className="text-right">金额</TableHead>
                      <TableHead>下单日期</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionOrders.map((order) => {
                      const statusInfo = statusLabels[order.status];
                      return (
                        <TableRow key={order.id} className="hover:bg-navy-50/50">
                          <TableCell className="font-mono text-navy-600">{order.orderNo}</TableCell>
                          <TableCell className="text-navy-700 font-medium">{order.supplierName}</TableCell>
                          <TableCell className="text-navy-600">{order.productName}</TableCell>
                          <TableCell className="text-right font-semibold text-navy-700">
                            {formatCurrency(order.amount)}
                          </TableCell>
                          <TableCell className="text-navy-500">{order.orderDate}</TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant as any}>{statusInfo.text}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guarantee" className="mt-6">
            <Card className="border-gold-400/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  已担保融资申请
                </CardTitle>
                <Link href="/finance/list">
                  <Button variant="ghost" size="sm" className="text-navy-500 gap-1">
                    查看全部 <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请编号</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead className="text-right">融资金额</TableHead>
                      <TableHead>期限</TableHead>
                      <TableHead>年利率</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guaranteedFinancing.map((item) => (
                      <TableRow key={item.id} className="hover:bg-navy-50/50">
                        <TableCell className="font-mono text-navy-600">{item.applicationNo}</TableCell>
                        <TableCell className="text-navy-700 font-medium">{item.supplierName}</TableCell>
                        <TableCell className="text-right font-semibold text-navy-700">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-navy-500">{item.termDays} 天</TableCell>
                        <TableCell className="text-navy-600">{item.annualRate}%</TableCell>
                        <TableCell className="text-navy-500">{item.createdAt}</TableCell>
                        <TableCell>
                          <Badge variant="default" className={financeStatusColor(item.status as any)}>
                            {financeStatusText(item.status as any)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
