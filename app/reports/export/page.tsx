"use client";

import React, { useState, useMemo } from "react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { cn, formatCurrency, formatDateTime, formatPercent, riskLevelText, financeStatusText, alertTypeText } from "@/src/lib/utils";
import { FileSpreadsheet, FileText, FileJson, Download, Clock, History, Filter, Eye, ChevronDown, Check, X } from "lucide-react";
import * as XLSX from "xlsx";

type ReportType = "monthly" | "finance" | "approval" | "collection" | "alert";
type ExportFormat = "xlsx" | "csv" | "json";

const REPORT_TYPES: { key: ReportType; label: string; description: string }[] = [
  { key: "monthly", label: "月度运营报表", description: "月度融资、收入、风险等汇总数据" },
  { key: "finance", label: "融资明细报表", description: "所有融资申请的详细记录" },
  { key: "approval", label: "审批记录报表", description: "审批流程及决策记录" },
  { key: "collection", label: "催收记录报表", description: "逾期及催收案件明细" },
  { key: "alert", label: "预警记录报表", description: "风险预警触发及处理记录" },
];

const INDUSTRIES = ["电子制造业", "汽车零部件", "纺织服装", "食品饮料", "医药健康", "机械设备"];
const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
const FINANCE_STATUS = ["draft", "submitted", "verifying", "approved", "rejected", "disbursed", "repaid", "overdue", "write_off"] as const;

interface ExportRecord {
  id: string;
  reportType: ReportType;
  format: ExportFormat;
  createdAt: string;
  fileName: string;
  size: string;
  status: "completed" | "processing";
}

function generateMockFinanceData() {
  const data = [];
  const enterprises = ["深圳市恒辉电子有限公司", "苏州精密机械有限公司", "杭州纺织科技有限公司", "广州食品有限公司", "上海医药集团", "北京机械设备有限公司", "成都汽车零部件有限公司", "武汉医药科技有限公司"];
  for (let i = 0; i < 20; i++) {
    data.push({
      applicationNo: `SCF${String(2026060000 + i).padStart(10, "0")}`,
      enterpriseName: enterprises[i % enterprises.length],
      industry: INDUSTRIES[i % INDUSTRIES.length],
      amount: Math.round((500000 + Math.random() * 9500000) / 10000) * 10000,
      termDays: 30 + Math.floor(Math.random() * 150),
      annualRate: 0.06 + Math.random() * 0.08,
      riskLevel: RISK_LEVELS[Math.floor(Math.random() * 4)],
      status: FINANCE_STATUS[Math.floor(Math.random() * 9)],
      createdAt: `2026-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
    });
  }
  return data;
}

function generateMockApprovalData() {
  const data = [];
  const approvers = ["张经理", "李总监", "王委员", "赵主管", "陈专员"];
  for (let i = 0; i < 20; i++) {
    data.push({
      applicationNo: `SCF${String(2026060000 + i).padStart(10, "0")}`,
      enterpriseName: ["恒辉电子", "精密机械", "纺织科技", "广州食品", "上海医药"][i % 5],
      amount: Math.round((500000 + Math.random() * 9500000) / 10000) * 10000,
      riskLevel: RISK_LEVELS[Math.floor(Math.random() * 4)],
      approver: approvers[i % approvers.length],
      approvalHours: Math.round((2 + Math.random() * 60) * 10) / 10,
      decision: ["approved", "rejected", "escalated"][i % 3] as "approved" | "rejected" | "escalated",
      comment: i % 3 === 0 ? "材料齐全，同意放款" : i % 3 === 1 ? "风险较高，建议补充材料" : "金额较大，升级审批",
      decidedAt: `2026-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
    });
  }
  return data;
}

function generateMockAlertData() {
  const data = [];
  const types = ["order_drop", "return_spike", "payment_delay", "abnormal_behavior"] as const;
  for (let i = 0; i < 20; i++) {
    data.push({
      id: `ALT${String(10000 + i)}`,
      enterpriseName: ["恒辉电子", "精密机械", "纺织科技", "广州食品", "上海医药", "北京机械"][i % 6],
      type: types[i % 4],
      level: RISK_LEVELS[Math.floor(Math.random() * 4)],
      title: ["订单量下降预警", "退货率激增", "付款延迟", "异常行为检测"][i % 4],
      status: ["new", "processing", "resolved", "false_alarm"][i % 4],
      triggeredAt: `2026-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
    });
  }
  return data;
}

const MOCK_HISTORY: ExportRecord[] = [
  { id: "1", reportType: "monthly", format: "xlsx", createdAt: "2026-06-08 10:23:00", fileName: "月度运营报表_2026-05.xlsx", size: "245 KB", status: "completed" },
  { id: "2", reportType: "finance", format: "csv", createdAt: "2026-06-07 16:45:00", fileName: "融资明细_20260601-20260607.csv", size: "189 KB", status: "completed" },
  { id: "3", reportType: "approval", format: "xlsx", createdAt: "2026-06-05 14:12:00", fileName: "审批记录_2026Q2.xlsx", size: "312 KB", status: "completed" },
  { id: "4", reportType: "alert", format: "json", createdAt: "2026-06-03 09:30:00", fileName: "预警记录_2026-06.json", size: "98 KB", status: "completed" },
];

export default function ReportExportPage() {
  const [reportType, setReportType] = useState<ReportType>("finance");
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-08");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [enterpriseKeyword, setEnterpriseKeyword] = useState("");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showRiskDropdown, setShowRiskDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [history, setHistory] = useState<ExportRecord[]>(MOCK_HISTORY);
  const [isExporting, setIsExporting] = useState(false);

  const previewData = useMemo(() => {
    if (reportType === "finance") return generateMockFinanceData();
    if (reportType === "approval") return generateMockApprovalData();
    if (reportType === "alert") return generateMockAlertData();
    return [];
  }, [reportType]);

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((v) => v !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 600));

    let fileName = "";
    const data = previewData as any[];

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "数据");
      fileName = `${REPORT_TYPES.find((r) => r.key === reportType)?.label}_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } else if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      fileName = `${REPORT_TYPES.find((r) => r.key === reportType)?.label}_${startDate}_${endDate}.csv`;
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      fileName = `${REPORT_TYPES.find((r) => r.key === reportType)?.label}_${startDate}_${endDate}.json`;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }

    const newRecord: ExportRecord = {
      id: String(Date.now()),
      reportType,
      format,
      createdAt: formatDateTime(new Date()),
      fileName,
      size: `${Math.round(80 + Math.random() * 300)} KB`,
      status: "completed",
    };
    setHistory([newRecord, ...history]);
    setIsExporting(false);
  };

  const MultiSelect = ({
    label,
    options,
    selected,
    setSelected,
    show,
    setShow,
    renderLabel,
  }: {
    label: string;
    options: string[];
    selected: string[];
    setSelected: (v: string[]) => void;
    show: boolean;
    setShow: (v: boolean) => void;
    renderLabel?: (v: string) => string;
  }) => (
    <div className="space-y-2 relative">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between px-3 py-2 border border-navy-200 rounded-md bg-white hover:border-navy-300 transition-colors text-left"
      >
        <span className={cn("text-sm", selected.length === 0 ? "text-navy-400" : "text-navy-700")}>
          {selected.length === 0 ? `全部${label}` : `已选 ${selected.length} 项`}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-navy-400 transition-transform", show && "rotate-180")} />
      </button>
      {show && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-navy-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          <div className="p-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleArrayItem(selected, opt, setSelected)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-sm hover:bg-navy-50 text-sm"
              >
                <span className="text-navy-700">{renderLabel ? renderLabel(opt) : opt}</span>
                {selected.includes(opt) && <Check className="w-4 h-4 text-navy-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const formatFormatIcon = (f: ExportFormat) => {
    if (f === "xlsx") return <FileSpreadsheet className="w-5 h-5" />;
    if (f === "csv") return <FileText className="w-5 h-5" />;
    return <FileJson className="w-5 h-5" />;
  };

  const renderPreviewTable = () => {
    if (reportType === "monthly") {
      return (
        <div className="py-8 text-center text-navy-400">
          请前往"月度运营报表"页面查看详细数据
        </div>
      );
    }
    if (reportType === "collection") {
      return (
        <div className="py-8 text-center text-navy-400">
          催收报表数据预览
        </div>
      );
    }
    if (reportType === "finance") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>申请编号</TableHead>
              <TableHead>企业名称</TableHead>
              <TableHead>行业</TableHead>
              <TableHead className="text-right">融资金额</TableHead>
              <TableHead className="text-right">期限(天)</TableHead>
              <TableHead className="text-right">年利率</TableHead>
              <TableHead>风险等级</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>申请时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(previewData as any[]).slice(0, 20).map((row) => (
              <TableRow key={row.applicationNo}>
                <TableCell className="font-mono text-xs">{row.applicationNo}</TableCell>
                <TableCell>{row.enterpriseName}</TableCell>
                <TableCell>{row.industry}</TableCell>
                <TableCell className="text-right font-mono text-gold-600 tabular-nums">{formatCurrency(row.amount, 0)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.termDays}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatPercent(row.annualRate)}</TableCell>
                <TableCell>
                  <Badge variant={row.riskLevel === "low" ? "default" : row.riskLevel === "medium" ? "warning" : "danger"} className="text-xs">
                    {riskLevelText(row.riskLevel)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{financeStatusText(row.status)}</TableCell>
                <TableCell className="font-mono text-xs text-navy-500">{row.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (reportType === "approval") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>申请编号</TableHead>
              <TableHead>企业名称</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>风险等级</TableHead>
              <TableHead>审批人</TableHead>
              <TableHead className="text-right">耗时(小时)</TableHead>
              <TableHead>决策</TableHead>
              <TableHead>审批意见</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(previewData as any[]).slice(0, 20).map((row) => (
              <TableRow key={row.applicationNo}>
                <TableCell className="font-mono text-xs">{row.applicationNo}</TableCell>
                <TableCell>{row.enterpriseName}</TableCell>
                <TableCell className="text-right font-mono text-gold-600 tabular-nums">{formatCurrency(row.amount, 0)}</TableCell>
                <TableCell>
                  <Badge variant={row.riskLevel === "low" ? "default" : row.riskLevel === "medium" ? "warning" : "danger"} className="text-xs">
                    {riskLevelText(row.riskLevel)}
                  </Badge>
                </TableCell>
                <TableCell>{row.approver}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.approvalHours}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    row.decision === "approved" ? "bg-green-100 text-status-success" :
                    row.decision === "rejected" ? "bg-red-100 text-status-danger" :
                    "bg-yellow-100 text-status-warning"
                  )}>
                    {row.decision === "approved" ? "通过" : row.decision === "rejected" ? "拒绝" : "升级"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-navy-600">{row.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    if (reportType === "alert") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>预警编号</TableHead>
              <TableHead>企业名称</TableHead>
              <TableHead>预警类型</TableHead>
              <TableHead>风险等级</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>触发时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(previewData as any[]).slice(0, 20).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>{row.enterpriseName}</TableCell>
                <TableCell>{alertTypeText(row.type)}</TableCell>
                <TableCell>
                  <Badge variant={row.level === "low" ? "default" : row.level === "medium" ? "warning" : "danger"} className="text-xs">
                    {riskLevelText(row.level)}
                  </Badge>
                </TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell className="text-sm">
                  {row.status === "new" ? "新预警" : row.status === "processing" ? "处理中" : row.status === "resolved" ? "已解决" : "误报"}
                </TableCell>
                <TableCell className="font-mono text-xs text-navy-500">{row.triggeredAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return null;
  };

  return (
    <AppLayout requiredRoles={["admin", "risk_director", "credit_committee", "relationship_manager"]}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-700 mb-1">自定义报表导出</h1>
          <p className="text-navy-500 text-sm">根据筛选条件生成并导出各类业务报表</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  报表配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>报表类型</Label>
                  <div className="space-y-2">
                    {REPORT_TYPES.map((rt) => (
                      <button
                        key={rt.key}
                        type="button"
                        onClick={() => setReportType(rt.key)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          reportType === rt.key
                            ? "border-gold-400 bg-gold-50 shadow-sm"
                            : "border-navy-200 bg-white hover:border-navy-300"
                        )}
                      >
                        <div className={cn("font-medium", reportType === rt.key ? "text-gold-600" : "text-navy-700")}>
                          {rt.label}
                        </div>
                        <div className="text-xs text-navy-500 mt-0.5">{rt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>开始日期</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>结束日期</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <MultiSelect
                  label="行业筛选"
                  options={INDUSTRIES}
                  selected={selectedIndustries}
                  setSelected={setSelectedIndustries}
                  show={showIndustryDropdown}
                  setShow={setShowIndustryDropdown}
                />

                <MultiSelect
                  label="风险等级"
                  options={[...RISK_LEVELS]}
                  selected={selectedRiskLevels}
                  setSelected={setSelectedRiskLevels}
                  show={showRiskDropdown}
                  setShow={setShowRiskDropdown}
                  renderLabel={(v) => riskLevelText(v as any)}
                />

                {(reportType === "finance") && (
                  <MultiSelect
                    label="融资状态"
                    options={[...FINANCE_STATUS]}
                    selected={selectedStatuses}
                    setSelected={setSelectedStatuses}
                    show={showStatusDropdown}
                    setShow={setShowStatusDropdown}
                    renderLabel={(v) => financeStatusText(v as any)}
                  />
                )}

                <div className="space-y-2">
                  <Label>企业名称关键字</Label>
                  <Input placeholder="输入企业名称搜索..." value={enterpriseKeyword} onChange={(e) => setEnterpriseKeyword(e.target.value)} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>导出格式</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["xlsx", "csv", "json"] as ExportFormat[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                          format === f
                            ? "border-gold-400 bg-gold-50 text-gold-600"
                            : "border-navy-200 bg-white text-navy-500 hover:border-navy-300"
                        )}
                      >
                        {formatFormatIcon(f)}
                        <span className="text-xs font-medium uppercase">{f}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="gold" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      导出报表
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  数据预览
                  <span className="text-sm font-normal text-navy-400 ml-2">（前20条）</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-auto">
                {renderPreviewTable()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  历史导出记录
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>报表类型</TableHead>
                      <TableHead>文件名</TableHead>
                      <TableHead>格式</TableHead>
                      <TableHead className="text-right">大小</TableHead>
                      <TableHead>导出时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{REPORT_TYPES.find((r) => r.key === h.reportType)?.label}</TableCell>
                        <TableCell className="font-mono text-xs text-navy-600">{h.fileName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase">
                            {formatFormatIcon(h.format)}
                            {h.format}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-navy-600">{h.size}</TableCell>
                        <TableCell className="font-mono text-xs text-navy-500">{h.createdAt}</TableCell>
                        <TableCell>
                          <Badge variant={h.status === "completed" ? "default" : "warning"} className="text-xs">
                            {h.status === "completed" ? "已完成" : "处理中"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
