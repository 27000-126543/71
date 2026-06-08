"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { cn, formatPercent } from "@/src/lib/utils";
import type { IndustryRiskForecast } from "@/src/types";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Info, ShieldAlert, TrendingUp as TrendingUpIcon, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MOCK_RISK_FORECAST: IndustryRiskForecast[] = [
  {
    industry: "电子制造业",
    currentRiskScore: 72,
    forecastedRiskScore: 70,
    trend: "stable",
    suggestion: "行业景气度保持稳定，建议维持当前授信政策，重点关注核心企业上下游优质供应商",
    macroFactors: [
      { factor: "宏观经济", impact: "neutral" },
      { factor: "政策导向", impact: "positive" },
      { factor: "供需关系", impact: "neutral" },
      { factor: "原材料价格", impact: "negative" },
      { factor: "技术迭代", impact: "positive" },
    ],
  },
  {
    industry: "汽车零部件",
    currentRiskScore: 65,
    forecastedRiskScore: 60,
    trend: "down",
    suggestion: "新能源车渗透率持续提升，传统零部件企业面临转型压力，建议调整客户结构，聚焦新能源产业链企业",
    macroFactors: [
      { factor: "宏观经济", impact: "neutral" },
      { factor: "政策导向", impact: "positive" },
      { factor: "供需关系", impact: "negative" },
      { factor: "原材料价格", impact: "neutral" },
      { factor: "技术迭代", impact: "positive" },
    ],
  },
  {
    industry: "纺织服装",
    currentRiskScore: 42,
    forecastedRiskScore: 38,
    trend: "down",
    suggestion: "海外订单向东南亚转移趋势明显，国内消费疲软，建议收紧该行业整体授信额度15%，提高保证金比例至30%",
    macroFactors: [
      { factor: "宏观经济", impact: "negative" },
      { factor: "政策导向", impact: "neutral" },
      { factor: "供需关系", impact: "negative" },
      { factor: "原材料价格", impact: "neutral" },
      { factor: "国际贸易", impact: "negative" },
    ],
  },
  {
    industry: "食品饮料",
    currentRiskScore: 81,
    forecastedRiskScore: 84,
    trend: "up",
    suggestion: "消费复苏明显，必选消费品需求稳定，建议增加优质客户授信额度，重点支持品牌食品企业和区域龙头",
    macroFactors: [
      { factor: "宏观经济", impact: "positive" },
      { factor: "政策导向", impact: "positive" },
      { factor: "供需关系", impact: "positive" },
      { factor: "原材料价格", impact: "neutral" },
      { factor: "消费升级", impact: "positive" },
    ],
  },
  {
    industry: "医药健康",
    currentRiskScore: 78,
    forecastedRiskScore: 80,
    trend: "up",
    suggestion: "人口老龄化+政策支持创新药发展，建议关注创新药产业链及CXO企业，适度增加授信额度",
    macroFactors: [
      { factor: "宏观经济", impact: "positive" },
      { factor: "政策导向", impact: "positive" },
      { factor: "供需关系", impact: "positive" },
      { factor: "集采政策", impact: "negative" },
      { factor: "技术创新", impact: "positive" },
    ],
  },
  {
    industry: "机械设备",
    currentRiskScore: 58,
    forecastedRiskScore: 55,
    trend: "down",
    suggestion: "出口增速放缓，内需疲软，建议提高首付比例至30%，缩短融资期限，重点支持出口替代型企业",
    macroFactors: [
      { factor: "宏观经济", impact: "negative" },
      { factor: "政策导向", impact: "neutral" },
      { factor: "供需关系", impact: "negative" },
      { factor: "出口环境", impact: "negative" },
      { factor: "技术迭代", impact: "neutral" },
    ],
  },
];

function generateHistoryData(currentScore: number, trend: "up" | "stable" | "down") {
  const data = [];
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  let score = currentScore - (trend === "up" ? 10 : trend === "down" ? -5 : 5);
  const step = (currentScore - score) / 11;
  for (let i = 0; i < 12; i++) {
    data.push({
      month: months[i],
      score: Math.round(score + step * i + (Math.random() - 0.5) * 4),
    });
  }
  return data;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-status-success";
  if (score >= 65) return "text-teal-500";
  if (score >= 50) return "text-status-warning";
  if (score >= 35) return "text-orange-600";
  return "text-status-danger";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200 text-status-success";
  if (score >= 65) return "bg-teal-50 border-teal-200 text-teal-600";
  if (score >= 50) return "bg-yellow-50 border-yellow-200 text-status-warning";
  if (score >= 35) return "bg-orange-50 border-orange-200 text-orange-600";
  return "bg-red-50 border-red-200 text-status-danger";
}

function getTrendColor(trend: "up" | "stable" | "down"): string {
  if (trend === "up") return "text-status-success";
  if (trend === "down") return "text-status-danger";
  return "text-gray-500";
}

function getTrendBg(trend: "up" | "stable" | "down"): string {
  if (trend === "up") return "bg-green-500";
  if (trend === "down") return "bg-status-danger";
  return "bg-gray-400";
}

function ImpactBadge({ impact }: { impact: "positive" | "negative" | "neutral" }) {
  const config = {
    positive: { bg: "bg-green-100", text: "text-status-success", label: "正面", icon: TrendingUp },
    negative: { bg: "bg-red-100", text: "text-status-danger", label: "负面", icon: TrendingDown },
    neutral: { bg: "bg-gray-100", text: "text-gray-600", label: "中性", icon: Minus },
  }[impact];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function RiskForecastPage() {
  const [data, setData] = useState<IndustryRiskForecast[]>(MOCK_RISK_FORECAST);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(
        MOCK_RISK_FORECAST.map((item) => ({
          ...item,
          currentRiskScore: Math.max(30, Math.min(95, item.currentRiskScore + (Math.random() - 0.5) * 4)),
        }))
      );
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <AppLayout requiredRoles={["admin", "risk_director", "credit_committee"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-700 mb-2">行业风险预判</h1>
            <p className="text-navy-500 flex items-center gap-2">
              <Info className="w-4 h-4" />
              基于宏观数据与企业画像的行业风险趋势预判与授信策略建议
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy-400">
              最后更新: {lastUpdate.toLocaleString("zh-CN")}
            </span>
            <Button variant="default" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "计算中..." : "重新计算"}
            </Button>
          </div>
        </div>

        <Alert variant="default" className="bg-navy-50 border-navy-200">
          <ShieldAlert className="w-4 h-4 text-navy-600" />
          <AlertTitle className="text-navy-700">预判模型说明</AlertTitle>
          <AlertDescription className="text-navy-600">
            本系统基于宏观经济指标、行业政策导向、上下游供需关系、企业财务画像等多维度数据，
            通过机器学习模型预测未来3个月行业风险走势，辅助授信决策。模型准确率约85%，仅供参考。
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.map((item) => {
            const historyData = generateHistoryData(item.currentRiskScore, item.trend);
            const scoreDiff = item.forecastedRiskScore - item.currentRiskScore;
            return (
              <Card key={item.industry} className="overflow-hidden hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-3 border-b border-navy-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-navy-700 flex items-center gap-2">
                      {item.industry}
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${getTrendBg(item.trend)}`}
                      ></span>
                    </CardTitle>
                    <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(item.trend)}`}>
                      {item.trend === "up" ? <TrendingUp className="w-4 h-4" /> :
                       item.trend === "down" ? <TrendingDown className="w-4 h-4" /> :
                       <Minus className="w-4 h-4" />}
                      <span>
                        {item.trend === "up" ? "风险下降" : item.trend === "down" ? "风险上升" : "趋于稳定"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-navy-400 mb-1">当前风险分数</div>
                      <div className={`text-3xl font-serif font-bold ${getScoreColor(item.currentRiskScore)}`}>
                        {Math.round(item.currentRiskScore)}
                      </div>
                      <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs border ${getScoreBgColor(item.currentRiskScore)}`}>
                        {item.currentRiskScore >= 80 ? "低风险" :
                         item.currentRiskScore >= 65 ? "中低风险" :
                         item.currentRiskScore >= 50 ? "中风险" :
                         item.currentRiskScore >= 35 ? "中高风险" : "高风险"}
                      </div>
                    </div>
                    <div className="text-center relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <ArrowRight className="w-5 h-5 text-gold-400" />
                      </div>
                      <div className="text-xs text-navy-400 mb-1">3个月后预测</div>
                      <div className={`text-3xl font-serif font-bold ${getScoreColor(item.forecastedRiskScore)}`}>
                        {Math.round(item.forecastedRiskScore)}
                      </div>
                      <div className={`mt-1 text-xs font-medium ${scoreDiff > 0 ? "text-status-success" : scoreDiff < 0 ? "text-status-danger" : "text-gray-500"}`}>
                        {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(0)}分
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-navy-400 mb-2">历史风险走势</div>
                    <div className="h-20 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData}>
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke={item.trend === "up" ? "#2E8B57" : item.trend === "down" ? "#C1292E" : "#8FA6C9"}
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 6 }}
                            formatter={(v: number) => [v + "分", "风险分数"]}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-navy-400 mb-2">风险因素分析</div>
                    <div className="flex flex-wrap gap-2">
                      {item.macroFactors.map((f) => (
                        <div key={f.factor} className="flex items-center gap-1.5">
                          <span className="text-sm text-navy-600">{f.factor}</span>
                          <ImpactBadge impact={f.impact} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert variant="default" className="bg-blue-50 border-blue-200 !py-3">
                    <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                    <AlertTitle className="text-blue-700 text-sm">授信策略建议</AlertTitle>
                    <AlertDescription className="text-blue-600 text-sm">
                      {item.suggestion}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
