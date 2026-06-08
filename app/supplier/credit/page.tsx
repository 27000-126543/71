"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { Separator } from "@/src/components/ui/separator";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Info,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { store } from "@/src/data/store";
import type { CreditScore } from "@/src/types";
import { formatCurrency, formatDate, riskLevelText } from "@/src/lib/utils";

interface FactorInfo {
  key: keyof CreditScore["factors"];
  name: string;
  weight: number;
  description: string;
  delta: number;
}

export default function CreditDetailPage() {
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);

  useEffect(() => {
    if (!user?.enterpriseId) return;
    (async () => {
      const cs = await store.creditScores.getBySupplier(user.enterpriseId!);
      setCreditScore(cs || null);
    })();
  }, [user]);

  const overallScore = creditScore?.overallScore || 78;
  const riskLevel = creditScore?.riskLevel || "medium";
  const totalLimit = creditScore?.creditLimit || 5000000;
  const availableLimit = creditScore?.availableLimit || 2400000;
  const usedLimit = totalLimit - availableLimit;

  const scoreColor = overallScore >= 85
    ? "#2E8B57"
    : overallScore >= 70
    ? "#D4AF37"
    : overallScore >= 60
    ? "#E6A817"
    : "#C1292E";

  const factors: FactorInfo[] = [
    {
      key: "transactionHistory",
      name: "交易历史",
      weight: 25,
      description: "与核心企业合作时长、订单量、付款及时性等",
      delta: 3,
    },
    {
      key: "financialHealth",
      name: "财务健康",
      weight: 25,
      description: "营收增长、利润率、资产负债率、现金流等指标",
      delta: -1,
    },
    {
      key: "operationStability",
      name: "运营稳定",
      weight: 20,
      description: "员工稳定性、产能利用率、供应链连续性等",
      delta: 2,
    },
    {
      key: "industryEnvironment",
      name: "行业环境",
      weight: 15,
      description: "行业景气度、政策影响、市场竞争格局等",
      delta: 0,
    },
    {
      key: "compliance",
      name: "合规记录",
      weight: 15,
      description: "工商、税务、司法、行政处罚等合规信息",
      delta: 5,
    },
  ];

  const radarData = factors.map((f) => ({
    subject: f.name,
    score: creditScore?.factors[f.key] || 75,
    fullMark: 100,
  }));

  const historyData = creditScore?.history || [
    { date: "2024-01", score: 70 },
    { date: "2024-02", score: 71 },
    { date: "2024-03", score: 73 },
    { date: "2024-04", score: 72 },
    { date: "2024-05", score: 75 },
    { date: "2024-06", score: 76 },
    { date: "2024-07", score: 78 },
  ];

  const timelineEvents = [
    {
      date: "2024-07-01",
      type: "upgrade" as const,
      title: "信用评级上调",
      description: "综合评分从76分提升至78分，信用等级维持中等风险",
      icon: TrendingUp,
      color: "text-status-success",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      date: "2024-06-15",
      type: "info" as const,
      title: "合规信息更新",
      description: "工商年检完成，无不良记录，合规维度评分+5",
      icon: CheckCircle2,
      color: "text-status-info",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      date: "2024-05-20",
      type: "warning" as const,
      title: "财务指标波动",
      description: "Q1财报显示利润率微降0.8%，财务健康维度-1",
      icon: AlertTriangle,
      color: "text-status-warning",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      date: "2024-04-01",
      type: "upgrade" as const,
      title: "信用评级上调",
      description: "综合评分从73分提升至75分，授信额度维持500万",
      icon: TrendingUp,
      color: "text-status-success",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <AppLayout requiredRoles={["supplier", "relationship_manager", "risk_director"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy-600">信用评估详情</h1>
            <p className="text-navy-400 mt-1 text-sm">
              评估日期：{creditScore?.evaluationDate ? formatDate(creditScore.evaluationDate) : "2024-07-01"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-gradient-to-br from-navy-500 to-navy-700 text-white border-navy-400 overflow-hidden relative">
            <div className="absolute inset-0 bg-noise opacity-30" />
            <CardContent className="p-8 relative flex flex-col items-center">
              <div className="relative w-52 h-52">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.15)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallScore / 100) * 263.89} 263.89`}
                    style={{ transition: "stroke-dasharray 1.5s ease-out", filter: `drop-shadow(0 0 8px ${scoreColor}80)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-6xl font-bold glow-text" style={{ color: scoreColor }}>
                    {overallScore}
                  </p>
                  <p className="text-navy-200 text-sm mt-1">综合信用评分</p>
                  <Badge variant="gold" className="mt-3 bg-gold-400/20 text-gold-300 border-gold-400/30">
                    {riskLevelText(riskLevel)}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 w-full space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-200">评级趋势</span>
                  <span className="text-gold-300 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> 上升趋势
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-200">评级等级</span>
                  <span className="text-white">B+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-200">下次更新</span>
                  <span className="text-gold-300 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 2024-08-01
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>五维度评分分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#0B2545" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke="#C3D0E5" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#0B2545", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#8FA6C9", fontSize: 10 }} />
                      <Radar
                        name="评分"
                        dataKey="score"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        fill="url(#radarGradient)"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 overflow-y-auto pr-2">
                  {factors.map((f) => {
                    const score = creditScore?.factors[f.key] || 75;
                    const DeltaIcon = f.delta > 0 ? TrendingUp : f.delta < 0 ? TrendingDown : Minus;
                    const deltaColor = f.delta > 0 ? "text-status-success" : f.delta < 0 ? "text-status-danger" : "text-navy-400";
                    return (
                      <div key={f.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-navy-700">{f.name}</span>
                            <Badge variant="default" className="text-xs">权重 {f.weight}%</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-navy-600">{score}</span>
                            <span className={`text-sm flex items-center gap-0.5 ${deltaColor}`}>
                              <DeltaIcon className="w-3 h-3" />
                              {f.delta > 0 ? `+${f.delta}` : f.delta}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={score}
                          color={score >= 80 ? "success" : score >= 60 ? "gold" : "warning"}
                        />
                        <p className="text-xs text-navy-400">{f.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>信用评分历史趋势（近12个月）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
                    <XAxis dataKey="date" tick={{ fill: "#5A7CAC", fontSize: 11 }} axisLine={{ stroke: "#C3D0E5" }} />
                    <YAxis domain={[60, 100]} tick={{ fill: "#5A7CAC", fontSize: 12 }} axisLine={{ stroke: "#C3D0E5" }} />
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
                      dataKey="score"
                      name="综合评分"
                      stroke="#D4AF37"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                      dot={{ fill: "#D4AF37", stroke: "#fff", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: "#D4AF37", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>信用额度信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-navy-500 flex items-center gap-1">
                    <CreditCard className="w-4 h-4" /> 总授信额度
                  </span>
                  <span className="text-xl font-bold text-navy-600">{formatCurrency(totalLimit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-500">可用额度</span>
                  <span className="text-xl font-bold text-status-success">{formatCurrency(availableLimit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-500">已用额度</span>
                  <span className="text-lg font-semibold text-navy-600">{formatCurrency(usedLimit)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-navy-600">使用率</p>
                <Progress value={(usedLimit / totalLimit) * 100} color="gold" />
                <p className="text-xs text-navy-400">
                  已使用 {((usedLimit / totalLimit) * 100).toFixed(1)}%
                </p>
              </div>
              <Separator />
              <div className="p-4 rounded-lg bg-navy-50 border border-navy-100">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-navy-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-navy-700">额度调整建议</p>
                    <p className="text-xs text-navy-500 mt-1">
                      基于当前信用状况和还款记录良好，系统建议将授信额度上调至 <span className="font-semibold text-gold-600">{formatCurrency(totalLimit + 1000000)}</span>，请联系客户经理申请提额。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>历史评分变动记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-gold-400 via-navy-200 to-transparent" />
              <div className="space-y-6">
                {timelineEvents.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 w-6 h-6 rounded-full ${event.bgColor} border-2 ${event.borderColor} flex items-center justify-center`}>
                        <Icon className={`w-3 h-3 ${event.color}`} />
                      </div>
                      <div className={`p-4 rounded-lg border ${event.borderColor} ${event.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-navy-700">{event.title}</h4>
                          <span className="text-xs text-navy-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {event.date}
                          </span>
                        </div>
                        <p className="text-sm text-navy-500">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
