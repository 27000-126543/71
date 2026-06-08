"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pause,
  UserX,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  FileText,
  CalendarDays,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  Filter,
} from "lucide-react";
import AppLayout from "@/src/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Separator } from "@/src/components/ui/separator";
import { Progress } from "@/src/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import { Avatar } from "@/src/components/ui/avatar";
import { Tooltip } from "@/src/components/ui/tooltip";
import {
  formatCurrency,
  formatDate,
  cn,
  riskLevelColor,
  riskLevelText,
  riskLevelBgColor,
} from "@/src/lib/utils";
import type { RiskLevel } from "@/src/types";

interface Supplier {
  id: string;
  name: string;
  industry: string;
  cooperationSince: string;
  annualTransactionVolume: number;
  status: "active" | "suspended" | "terminated";
  unifiedCreditCode: string;
  legalPerson: string;
  registeredCapital: number;
  contactPhone: string;
  contactEmail: string;
  address: string;
  foundedDate: string;
  creditScore: number;
  riskLevel: RiskLevel;
  creditLimit: number;
  availableLimit: number;
}

const mockSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "上海精密制造有限公司",
    industry: "制造业",
    cooperationSince: "2021-03-15",
    annualTransactionVolume: 128000000,
    status: "active",
    unifiedCreditCode: "91310000MA1FL3XX1K",
    legalPerson: "王建国",
    registeredCapital: 5000,
    contactPhone: "13812345678",
    contactEmail: "wangjg@sh-precision.com",
    address: "上海市浦东新区张江高科技园区科苑路88号",
    foundedDate: "2010-06-20",
    creditScore: 86,
    riskLevel: "low",
    creditLimit: 5000000,
    availableLimit: 2800000,
  },
  {
    id: "s2",
    name: "苏州电子科技有限公司",
    industry: "信息技术",
    cooperationSince: "2022-01-10",
    annualTransactionVolume: 56000000,
    status: "active",
    unifiedCreditCode: "91320500MA1N2YY3M",
    legalPerson: "李明",
    registeredCapital: 2000,
    contactPhone: "13987654321",
    contactEmail: "liming@suzhou-elec.com",
    address: "苏州工业园区星湖街328号创意产业园",
    foundedDate: "2015-09-08",
    creditScore: 78,
    riskLevel: "low",
    creditLimit: 3000000,
    availableLimit: 1200000,
  },
  {
    id: "s3",
    name: "杭州物流运输集团",
    industry: "物流运输",
    cooperationSince: "2020-08-22",
    annualTransactionVolume: 32000000,
    status: "active",
    unifiedCreditCode: "91330100MA27ZZ8Q5",
    legalPerson: "张伟",
    registeredCapital: 8000,
    contactPhone: "13655556666",
    contactEmail: "zhangwei@hangzhou-logistics.com",
    address: "杭州市余杭区良渚街道通运街168号",
    foundedDate: "2008-04-12",
    creditScore: 72,
    riskLevel: "medium",
    creditLimit: 2000000,
    availableLimit: 800000,
  },
  {
    id: "s4",
    name: "宁波新材料科技有限公司",
    industry: "制造业",
    cooperationSince: "2023-02-28",
    annualTransactionVolume: 215000000,
    status: "suspended",
    unifiedCreditCode: "91330200MA28K3LX9",
    legalPerson: "陈志强",
    registeredCapital: 10000,
    contactPhone: "13777778888",
    contactEmail: "chenzq@nb-materials.com",
    address: "宁波市镇海区宁波石化经济技术开发区",
    foundedDate: "2018-11-05",
    creditScore: 65,
    riskLevel: "medium",
    creditLimit: 8000000,
    availableLimit: 0,
  },
  {
    id: "s5",
    name: "无锡自动化设备有限公司",
    industry: "制造业",
    cooperationSince: "2019-11-15",
    annualTransactionVolume: 380000000,
    status: "active",
    unifiedCreditCode: "91320200MA1T6XX2L",
    legalPerson: "刘芳",
    registeredCapital: 6000,
    contactPhone: "13899990000",
    contactEmail: "liufang@wx-auto.com",
    address: "无锡市新吴区长江南路176号",
    foundedDate: "2012-03-25",
    creditScore: 91,
    riskLevel: "low",
    creditLimit: 6000000,
    availableLimit: 4500000,
  },
  {
    id: "s6",
    name: "南京商贸有限公司",
    industry: "批发零售",
    cooperationSince: "2022-06-30",
    annualTransactionVolume: 18000000,
    status: "terminated",
    unifiedCreditCode: "91320100MA1N8YY4N",
    legalPerson: "赵刚",
    registeredCapital: 500,
    contactPhone: "13711112222",
    contactEmail: "zhaogang@nj-trade.com",
    address: "南京市鼓楼区中山北路100号",
    foundedDate: "2016-08-18",
    creditScore: 48,
    riskLevel: "high",
    creditLimit: 500000,
    availableLimit: 0,
  },
  {
    id: "s7",
    name: "合肥零部件制造公司",
    industry: "制造业",
    cooperationSince: "2021-09-05",
    annualTransactionVolume: 45000000,
    status: "active",
    unifiedCreditCode: "91340100MA2U9XX5P",
    legalPerson: "孙丽华",
    registeredCapital: 3000,
    contactPhone: "13833334444",
    contactEmail: "sunlh@hf-parts.com",
    address: "合肥市高新区望江西路5089号",
    foundedDate: "2013-07-22",
    creditScore: 82,
    riskLevel: "low",
    creditLimit: 2500000,
    availableLimit: 1800000,
  },
];

const statusConfig: Record<
  Supplier["status"],
  { text: string; variant: "success" | "warning" | "danger" }
> = {
  active: { text: "合作中", variant: "success" },
  suspended: { text: "已暂停", variant: "warning" },
  terminated: { text: "已终止", variant: "danger" },
};

const industries = ["全部", "制造业", "信息技术", "物流运输", "批发零售", "其他"];
const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "合作中" },
  { value: "suspended", label: "已暂停" },
  { value: "terminated", label: "已终止" },
];

const creditFactors = [
  { name: "交易历史", score: 88 },
  { name: "财务健康", score: 82 },
  { name: "经营稳定", score: 85 },
  { name: "行业环境", score: 78 },
  { name: "合规记录", score: 92 },
];

const recentTransactions = [
  {
    id: "t1",
    orderNo: "TRX20240608001",
    productName: "高精度数控机床配件",
    amount: 1280000,
    date: "2024-06-08",
    status: "completed",
  },
  {
    id: "t2",
    orderNo: "TRX20240528015",
    productName: "精密模具组件",
    amount: 560000,
    date: "2024-05-28",
    status: "completed",
  },
  {
    id: "t3",
    orderNo: "TRX20240515028",
    productName: "工业级传感器套件",
    amount: 320000,
    date: "2024-05-15",
    status: "completed",
  },
  {
    id: "t4",
    orderNo: "TRX20240430042",
    productName: "自动化控制系统",
    amount: 2150000,
    date: "2024-04-30",
    status: "completed",
  },
];

const searchResults = [
  {
    id: "new1",
    name: "常州精密机械有限公司",
    unifiedCreditCode: "91320400MA1X8YY7Q",
    industry: "制造业",
    legalPerson: "周明",
    foundedDate: "2014-02-18",
  },
  {
    id: "new2",
    name: "嘉兴纺织科技有限公司",
    unifiedCreditCode: "91330400MA29BXX8R",
    industry: "制造业",
    legalPerson: "吴秀英",
    foundedDate: "2011-11-30",
  },
];

export default function SuppliersPage() {
  const [searchName, setSearchName] = React.useState("");
  const [filterIndustry, setFilterIndustry] = React.useState("全部");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [suppliers, setSuppliers] = React.useState(mockSuppliers);
  const [bindDialogOpen, setBindDialogOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searched, setSearched] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: "suspend" | "terminate" | null;
    supplier: Supplier | null;
  }>({ open: false, type: null, supplier: null });

  const filteredSuppliers = suppliers.filter((s) => {
    const nameMatch = s.name.toLowerCase().includes(searchName.toLowerCase());
    const industryMatch = filterIndustry === "全部" || s.industry === filterIndustry;
    const statusMatch = filterStatus === "all" || s.status === filterStatus;
    return nameMatch && industryMatch && statusMatch;
  });

  const getCooperationYears = (date: string) => {
    const start = new Date(date);
    const now = new Date();
    return Math.max(0, (now.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000)).toFixed(1);
  };

  const handleViewDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailDrawerOpen(true);
  };

  const handleAction = (supplier: Supplier, type: "suspend" | "terminate") => {
    setConfirmDialog({ open: true, type, supplier });
  };

  const confirmAction = () => {
    if (!confirmDialog.supplier || !confirmDialog.type) return;
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === confirmDialog.supplier!.id
          ? { ...s, status: confirmDialog.type === "suspend" ? "suspended" : "terminated" }
          : s
      )
    );
    setConfirmDialog({ open: false, type: null, supplier: null });
  };

  return (
    <AppLayout requiredRoles={["core_enterprise"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-700">供应商绑定管理</h1>
            <p className="text-navy-500 text-sm mt-1">管理已绑定的供应商企业及合作关系</p>
          </div>
          <Button variant="gold" onClick={() => setBindDialogOpen(true)} className="shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            绑定新供应商
          </Button>
        </div>

        <Card className="border-gold-400/20">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 flex-1 min-w-[240px]">
                <Label className="text-xs">搜索供应商名称</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <Input
                    placeholder="请输入供应商名称关键词"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2 w-48">
                <Label className="text-xs">所属行业</Label>
                <Select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 w-48">
                <Label className="text-xs">合作状态</Label>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchName("");
                  setFilterIndustry("全部");
                  setFilterStatus("all");
                }}
                className="text-navy-500"
              >
                <Filter className="w-4 h-4 mr-1" />
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold-400/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold-500" />
              已绑定供应商列表
              <Badge variant="gold" className="ml-2">
                共 {filteredSuppliers.length} 家
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>供应商名称</TableHead>
                  <TableHead>所属行业</TableHead>
                  <TableHead>合作年限</TableHead>
                  <TableHead className="text-right">年交易额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-navy-400">
                      <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      暂无匹配的供应商
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const status = statusConfig[supplier.status];
                    return (
                      <TableRow key={supplier.id} className="hover:bg-navy-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={supplier.name} size="sm" />
                            <div>
                              <p
                                className="font-medium text-navy-700 cursor-pointer hover:text-gold-500 transition-colors"
                                onClick={() => handleViewDetail(supplier)}
                              >
                                {supplier.name}
                              </p>
                              <p className="text-xs text-navy-400 font-mono">
                                {supplier.unifiedCreditCode}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{supplier.industry}</Badge>
                        </TableCell>
                        <TableCell className="text-navy-600">
                          {getCooperationYears(supplier.cooperationSince)} 年
                        </TableCell>
                        <TableCell className="text-right font-semibold text-navy-700">
                          {formatCurrency(supplier.annualTransactionVolume)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip content="查看详情">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(supplier)}
                                className="h-8 px-2 text-navy-500 hover:text-navy-700"
                              >
                                详情
                              </Button>
                            </Tooltip>
                            {supplier.status === "active" && (
                              <Tooltip content="暂停合作">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(supplier, "suspend")}
                                  className="h-8 px-2 text-status-warning hover:text-status-warning"
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            )}
                            {supplier.status !== "terminated" && (
                              <Tooltip content="解除绑定">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(supplier, "terminate")}
                                  className="h-8 px-2 text-status-danger hover:text-status-danger"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-gold-500" />
              绑定新供应商
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0 space-y-5">
            <div className="space-y-2">
              <Label>搜索供应商</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="输入企业名称或统一社会信用代码"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="gold"
                  onClick={() => {
                    if (searchQuery.trim()) setSearched(true);
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
              </div>
              <p className="text-xs text-navy-400">
                支持通过企业全称、关键词或统一社会信用代码搜索平台已入驻企业
              </p>
            </div>

            {searched && (
              <div className="space-y-3 animate-fade-in">
                <Separator />
                <p className="text-sm text-navy-600 font-medium">
                  搜索结果 ({searchResults.length} 家)
                </p>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <Card
                      key={result.id}
                      className="border-navy-100 hover:border-gold-400/50 transition-all cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar name={result.name} size="sm" />
                            <div>
                              <p className="font-semibold text-navy-700">{result.name}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-navy-400">
                                <span className="font-mono">{result.unifiedCreditCode}</span>
                                <Badge variant="default">{result.industry}</Badge>
                                <span>法人：{result.legalPerson}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBindDialogOpen(false);
                              alert(`已向「${result.name}」发送绑定邀请`);
                            }}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            发送邀请
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!searched && (
              <Alert className="bg-navy-50 border-navy-200">
                <Info className="w-4 h-4 text-navy-500" />
                <AlertTitle className="text-navy-600">温馨提示</AlertTitle>
                <AlertDescription className="text-navy-500 text-sm">
                  若搜索不到目标企业，该企业可能尚未在本平台注册。您可以先
                  <span className="text-gold-500 font-medium cursor-pointer hover:underline mx-1">
                    邀请企业入驻
                  </span>
                  后再进行绑定。
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBindDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-status-warning" />
              确认操作
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <p className="text-navy-600 mb-3">
              您确定要{confirmDialog.type === "suspend" ? "暂停" : "解除"}与供应商
              <span className="font-semibold text-navy-800 mx-1">
                {confirmDialog.supplier?.name}
              </span>
              的合作关系吗？
            </p>
            <Alert
              variant={confirmDialog.type === "suspend" ? "warning" : "danger"}
              className={cn(
                confirmDialog.type === "suspend"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              )}
            >
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>
                {confirmDialog.type === "suspend" ? "暂停合作说明" : "解除绑定说明"}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {confirmDialog.type === "suspend"
                  ? "暂停后，该供应商将无法发起新的融资申请，历史订单不受影响，您可随时恢复合作。"
                  : "解除绑定为不可逆操作，解除后双方合作关系将终止，请谨慎操作。"}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDialog({ open: false, type: null, supplier: null })}
            >
              取消
            </Button>
            <Button
              variant={confirmDialog.type === "suspend" ? "default" : "destructive"}
              onClick={confirmAction}
            >
              确认{confirmDialog.type === "suspend" ? "暂停" : "解除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSupplier && (
        <div
          className={cn(
            "fixed inset-0 z-50 transition-opacity duration-300",
            detailDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            onClick={() => setDetailDrawerOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto",
              detailDrawerOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-navy-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-700 font-serif">供应商详情</h2>
              <button
                onClick={() => setDetailDrawerOpen(false)}
                className="p-2 rounded-md text-navy-400 hover:text-navy-600 hover:bg-navy-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-navy-600 to-navy-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute inset-0 noise-bg opacity-50" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <Avatar name={selectedSupplier.name} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-serif font-bold glow-text">
                          {selectedSupplier.name}
                        </h3>
                        <Badge
                          variant={statusConfig[selectedSupplier.status].variant as any}
                          className={cn(
                            selectedSupplier.status === "active" &&
                              "bg-green-500/20 text-green-200 border-green-500/30"
                          )}
                        >
                          {statusConfig[selectedSupplier.status].text}
                        </Badge>
                      </div>
                      <p className="text-navy-200 text-sm font-mono mb-3">
                        {selectedSupplier.unifiedCreditCode}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-navy-200">
                          <Building2 className="w-4 h-4 text-gold-400" />
                          <span>{selectedSupplier.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-navy-200">
                          <CalendarDays className="w-4 h-4 text-gold-400" />
                          <span>合作自 {formatDate(selectedSupplier.cooperationSince)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-gold-400/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold-500" />
                    信用评分概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8 mb-5">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#E6ECF5"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#D4AF37"
                          strokeWidth="8"
                          strokeDasharray={`${(selectedSupplier.creditScore / 100) * 264} 264`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-navy-700 font-serif">
                          {selectedSupplier.creditScore}
                        </span>
                        <span className="text-xs text-navy-400">综合评分</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-navy-500">风险等级</span>
                        <Badge
                          variant="default"
                          className={riskLevelBgColor(selectedSupplier.riskLevel)}
                        >
                          {riskLevelText(selectedSupplier.riskLevel)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-navy-500">授信额度</span>
                        <span className="font-semibold text-navy-700">
                          {formatCurrency(selectedSupplier.creditLimit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-navy-500">可用额度</span>
                        <span className="font-semibold text-gold-600">
                          {formatCurrency(selectedSupplier.availableLimit)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-navy-400">
                          <span>额度使用率</span>
                          <span>
                            {(
                              ((selectedSupplier.creditLimit - selectedSupplier.availableLimit) /
                                selectedSupplier.creditLimit) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            ((selectedSupplier.creditLimit - selectedSupplier.availableLimit) /
                              selectedSupplier.creditLimit) *
                            100
                          }
                          color="gold"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-navy-600">评分维度明细</p>
                    {creditFactors.map((factor) => (
                      <div key={factor.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-navy-500">{factor.name}</span>
                          <span className="font-medium text-navy-700">{factor.score}</span>
                        </div>
                        <Progress
                          value={factor.score}
                          color={factor.score >= 85 ? "success" : factor.score >= 70 ? "gold" : "warning"}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-base font-semibold text-navy-700 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gold-500" />
                  企业基本信息
                </h3>
                <Card>
                  <CardContent className="p-0 divide-y divide-navy-100">
                    {[
                      { icon: UserX, label: "法定代表人", value: selectedSupplier.legalPerson },
                      {
                        icon: Building2,
                        label: "注册资本",
                        value: `${selectedSupplier.registeredCapital.toLocaleString()} 万元`,
                      },
                      { icon: CalendarDays, label: "成立日期", value: formatDate(selectedSupplier.foundedDate) },
                      { icon: Phone, label: "联系电话", value: selectedSupplier.contactPhone },
                      { icon: Mail, label: "电子邮箱", value: selectedSupplier.contactEmail },
                      { icon: MapPin, label: "企业地址", value: selectedSupplier.address },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center gap-3 p-4">
                          <Icon className="w-4 h-4 text-navy-400 flex-shrink-0" />
                          <span className="text-sm text-navy-500 w-24 flex-shrink-0">{item.label}</span>
                          <span className="text-sm text-navy-700 font-medium">{item.value}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-base font-semibold text-navy-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-500" />
                    历史交易记录
                  </span>
                  <Button variant="ghost" size="sm" className="text-navy-500 text-xs gap-1">
                    查看全部 <ChevronRight className="w-4 h-4" />
                  </Button>
                </h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs py-3">订单号</TableHead>
                          <TableHead className="text-xs py-3">产品</TableHead>
                          <TableHead className="text-xs py-3 text-right">金额</TableHead>
                          <TableHead className="text-xs py-3">日期</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs font-mono py-3">{tx.orderNo}</TableCell>
                            <TableCell className="text-xs py-3">{tx.productName}</TableCell>
                            <TableCell className="text-xs text-right font-semibold py-3 text-navy-700">
                              {formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell className="text-xs py-3 text-navy-500">{tx.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
