"use client";

import React, { useState, useMemo } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { cn, formatCurrency, formatPercent } from "@/src/lib/utils";
import KpiCard from "@/src/components/charts/KpiCard";
import { Download, ChevronUp, ChevronDown, FileSpreadsheet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import * as XLSX from "xlsx";
import type { MonthlyReport } from "@/src/types";

const MOCK_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    month: "2026-06",
    totalFinancingAmount: 98765400,
    totalFinancingCount: 186,
    totalInterestIncome: 2156789,
    averageApprovalHours: 14.2,
    overdueRate: 0.0245,
    nonPerformingRate: 0.0087,
    enterpriseBreakdown: [
      { enterpriseName: "深圳市恒辉电子有限公司", financingAmount: 8560000, interestIncome: 185600, nonPerformingRate: 0 },
      { enterpriseName: "苏州精密机械有限公司", financingAmount: 6780000, interestIncome: 148900, nonPerformingRate: 0 },
      { enterpriseName: "杭州纺织科技有限公司", financingAmount: 5430000, interestIncome: 132400, nonPerformingRate: 0.032 },
      { enterpriseName: "广州食品有限公司", financingAmount: 4890000, interestIncome: 106700, nonPerformingRate: 0 },
      { enterpriseName: "上海医药集团", financingAmount: 4320000, interestIncome: 94200, nonPerformingRate: 0 },
      { enterpriseName: "北京机械设备有限公司", financingAmount: 3980000, interestIncome: 86900, nonPerformingRate: 0.015 },
      { enterpriseName: "成都汽车零部件有限公司", financingAmount: 3560000, interestIncome: 77800, nonPerformingRate: 0 },
      { enterpriseName: "武汉医药科技有限公司", financingAmount: 3120000, interestIncome: 68200, nonPerformingRate: 0 },
    ],
    industryBreakdown: [
      { industry: "电子制造业", financingAmount: 28760000, overdueRate: 0.018 },
      { industry: "汽车零部件", financingAmount: 22340000, overdueRate: 0.023 },
      { industry: "纺织服装", financingAmount: 15670000, overdueRate: 0.038 },
      { industry: "食品饮料", financingAmount: 12890000, overdueRate: 0.012 },
      { industry: "医药健康", financingAmount: 11230000, overdueRate: 0.008 },
      { industry: "机械设备", financingAmount: 7875400, overdueRate: 0.029 },
    ],
  },
];

const MONTHLY_TREND_DATA = [
  { month: "2026-01", financingAmount: 89012300, financingCount: 168, interestIncome: 1876543, approvalHours: 16.8, overdueRate: 0.0267, nonPerformingRate: 0.0092 },
  { month: "2026-02", financingAmount: 76543200, financingCount: 142, interestIncome: 1654321, approvalHours: 15.2, overdueRate: 0.0258, nonPerformingRate: 0.0089 },
  { month: "2026-03", financingAmount: 123456700, financingCount: 215, interestIncome: 2654321, approvalHours: 14.8, overdueRate: 0.0278, nonPerformingRate: 0.0095 },
  { month: "2026-04", financingAmount: 108765400, financingCount: 198, interestIncome: 2345678, approvalHours: 14.5, overdueRate: 0.0262, nonPerformingRate: 0.0091 },
  { month: "2026-05", financingAmount: 115432100, financingCount: 207, interestIncome: 2487654, approvalHours: 14.3, overdueRate: 0.0255, nonPerformingRate: 0.0088 },
  { month: "2026-06", financingAmount: 98765400, financingCount: 186, interestIncome: 2156789, approvalHours: 14.2, overdueRate: 0.0245, nonPerformingRate: 0.0087 },
];

type SortField = "financingAmount" | "interestIncome" | "nonPerformingRate";
type SortOrder = "asc" | "desc";

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-06");
  const [sortField, setSortField] = useState<SortField>("financingAmount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const currentReport = MOCK_MONTHLY_REPORTS.find((r) => r.month === selectedMonth) ?? MOCK_MONTHLY_REPORTS[0];

  const sortedEnterpriseData = useMemo(() => {
    const data = [...currentReport.enterpriseBreakdown];
    data.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortOrder === "asc" ? diff : -diff;
    });
    return data;
  }, [currentReport, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getMom = (current: number, month: string, field: keyof typeof MONTHLY_TREND_DATA[0]) => {
    const idx = MONTHLY_TREND_DATA.findIndex((m) => m.month === month);
    if (idx <= 0) return null;
    const prev = MONTHLY_TREND_DATA[idx - 1][field] as number;
    return (current - prev) / prev;
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet([
      {
        指标: "当月融资总额",
        数值: currentReport.totalFinancingAmount,
      },
      {
        指标: "融资笔数",
        数值: currentReport.totalFinancingCount,
      },
      {
        指标: "利息收入",
        数值: currentReport.totalInterestIncome,
      },
      {
        指标: "平均审批时效(小时)",
        数值: currentReport.averageApprovalHours,
      },
      {
        指标: "逾期率",
        数值: currentReport.overdueRate,
      },
      {
        指标: "不良率",
        数值: currentReport.nonPerformingRate,
      },
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, "概览");

    const ws2 = XLSX.utils.json_to_sheet(
      sortedEnterpriseData.map((e) => ({
        企业名称: e.enterpriseName,
        融资额: e.financingAmount,
        利息收入: e.interestIncome,
        不良率: e.nonPerformingRate,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws2, "企业明细");

    const ws3 = XLSX.utils.json_to_sheet(
      currentReport.industryBreakdown.map((i) => ({
        行业: i.industry,
        融资额: i.financingAmount,
        逾期率: i.overdueRate,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws3, "行业统计");

    XLSX.writeFile(wb, `月度运营报表_${selectedMonth}.xlsx`);
  };

  const monthLabel = selectedMonth.replace("-", "年") + "月";
  const totalFinancing = currentReport.industryBreakdown.reduce((s, i) => s + i.financingAmount, 0);

  return (
    <AppLayout requiredRoles={["admin", "risk_director", "credit_committee", "relationship_manager"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-700 mb-1">月度运营报表</h1>
            <p className="text-navy-500 text-sm">统计周期：{monthLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-44"
            />
            <Button variant="gold" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              导出Excel
            </Button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="融资总额"
            value={currentReport.totalFinancingAmount}
            format="currency"
            changePercent={getMom(currentReport.totalFinancingAmount, selectedMonth, "financingAmount") ?? undefined}
            valueColor="text-gold-500"
          />
          <KpiCard
            title="融资笔数"
            value={currentReport.totalFinancingCount}
            format="number"
            changePercent={getMom(currentReport.totalFinancingCount, selectedMonth, "financingCount") ?? undefined}
            suffix="笔"
          />
          <KpiCard
            title="利息收入"
            value={currentReport.totalInterestIncome}
            format="currency"
            changePercent={getMom(currentReport.totalInterestIncome, selectedMonth, "interestIncome") ?? undefined}
            valueColor="text-gold-500"
          />
          <KpiCard
            title="平均审批时效"
            value={currentReport.averageApprovalHours}
            format="number"
            changePercent={getMom(currentReport.averageApprovalHours, selectedMonth, "approvalHours") ?? undefined}
            trend={getMom(currentReport.averageApprovalHours, selectedMonth, "approvalHours") && getMom(currentReport.averageApprovalHours, selectedMonth, "approvalHours")! < 0 ? "up" : "down"}
            suffix="小时"
          />
          <KpiCard
            title="逾期率"
            value={currentReport.overdueRate}
            format="percent"
            changePercent={getMom(currentReport.overdueRate, selectedMonth, "overdueRate") ?? undefined}
            trend={getMom(currentReport.overdueRate, selectedMonth, "overdueRate") && getMom(currentReport.overdueRate, selectedMonth, "overdueRate")! < 0 ? "up" : "down"}
            valueColor="text-status-danger"
          />
          <KpiCard
            title="不良率"
            value={currentReport.nonPerformingRate}
            format="percent"
            changePercent={getMom(currentReport.nonPerformingRate, selectedMonth, "nonPerformingRate") ?? undefined}
            trend={getMom(currentReport.nonPerformingRate, selectedMonth, "nonPerformingRate") && getMom(currentReport.nonPerformingRate, selectedMonth, "nonPerformingRate")! < 0 ? "up" : "down"}
            valueColor="text-orange-600"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>按企业明细表</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业名称</TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("financingAmount")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        融资额
                        {sortField === "financingAmount" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("interestIncome")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        利息收入
                        {sortField === "interestIncome" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("nonPerformingRate")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        不良率
                        {sortField === "nonPerformingRate" && (
                          sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEnterpriseData.map((e) => (
                    <TableRow key={e.enterpriseName}>
                      <TableCell className="font-medium">{e.enterpriseName}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-gold-500 tabular-nums">
                        {formatCurrency(e.financingAmount, 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(e.interestIncome, 0)}</TableCell>
                      <TableCell className={cn("text-right font-mono tabular-nums", e.nonPerformingRate > 0 ? "text-status-danger" : "text-status-success")}>
                        {e.nonPerformingRate > 0 ? formatPercent(e.nonPerformingRate) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>按行业统计表</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>行业名称</TableHead>
                    <TableHead className="text-right">融资额</TableHead>
                    <TableHead className="text-right">占比</TableHead>
                    <TableHead className="text-right">逾期率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReport.industryBreakdown
                    .sort((a, b) => b.financingAmount - a.financingAmount)
                    .map((i) => {
                      const percent = i.financingAmount / totalFinancing;
                      return (
                        <TableRow key={i.industry}>
                          <TableCell className="font-medium">{i.industry}</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-gold-500 tabular-nums">
                            {formatCurrency(i.financingAmount, 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden min-w-[60px]">
                                <div
                                  className="h-full bg-gradient-to-r from-gold-300 to-gold-500 rounded-full"
                                  style={{ width: `${percent * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-sm text-navy-600 tabular-nums w-12 text-right">
                                {formatPercent(percent)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={cn("text-right font-mono tabular-nums", i.overdueRate > 0.03 ? "text-status-danger" : i.overdueRate > 0.02 ? "text-status-warning" : "text-status-success")}>
                            {formatPercent(i.overdueRate)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>月度趋势对比（近6个月）</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月份</TableHead>
                  <TableHead className="text-right">融资总额</TableHead>
                  <TableHead className="text-right">环比</TableHead>
                  <TableHead className="text-right">融资笔数</TableHead>
                  <TableHead className="text-right">环比</TableHead>
                  <TableHead className="text-right">利息收入</TableHead>
                  <TableHead className="text-right">环比</TableHead>
                  <TableHead className="text-right">逾期率</TableHead>
                  <TableHead className="text-right">环比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MONTHLY_TREND_DATA.map((m, idx) => {
                  const getMomValue = (curr: number, field: keyof typeof m) => {
                    if (idx === 0) return null;
                    const prev = MONTHLY_TREND_DATA[idx - 1][field] as number;
                    return (curr - prev) / prev;
                  };
                  const MomCell = ({ mom }: { mom: number | null }) => {
                    if (mom === null) return <TableCell className="text-right text-navy-300">-</TableCell>;
                    const isPositive = mom >= 0;
                    const isRate = false;
                    return (
                      <TableCell className="text-right">
                        <span className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-medium font-mono tabular-nums",
                          isPositive ? "text-status-success" : "text-status-danger"
                        )}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatPercent(Math.abs(mom))}
                        </span>
                      </TableCell>
                    );
                  };
                  return (
                    <TableRow key={m.month}>
                      <TableCell className="font-medium">{m.month.replace("-", "年")}月</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-gold-500 tabular-nums">{formatCurrency(m.financingAmount, 0)}</TableCell>
                      <MomCell mom={getMomValue(m.financingAmount, "financingAmount")} />
                      <TableCell className="text-right font-mono tabular-nums">{m.financingCount}</TableCell>
                      <MomCell mom={getMomValue(m.financingCount, "financingCount")} />
                      <TableCell className="text-right font-mono tabular-nums">{formatCurrency(m.interestIncome, 0)}</TableCell>
                      <MomCell mom={getMomValue(m.interestIncome, "interestIncome")} />
                      <TableCell className={cn("text-right font-mono tabular-nums", m.overdueRate > 0.03 ? "text-status-danger" : "text-navy-700")}>
                        {formatPercent(m.overdueRate)}
                      </TableCell>
                      <MomCell mom={getMomValue(m.overdueRate, "overdueRate")} />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
