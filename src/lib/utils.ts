import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import type {
  RiskLevel,
  FinanceStatus,
  AlertType,
  UserRole,
} from "@/src/types";

/**
 * 合并 TailwindCSS 类名，解决类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化金额为人民币格式
 * @param amount 金额数字
 * @param decimals 小数位数，默认2位
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  if (!isFinite(amount)) return "¥0.00";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * 格式化百分比
 * @param value 数值（如 0.85 表示 85%）
 * @param decimals 小数位数，默认1位
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (!isFinite(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param pattern 格式模式，默认 yyyy-MM-dd
 */
export function formatDate(
  date: string | Date | undefined | null,
  pattern: string = "yyyy-MM-dd"
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, pattern, { locale: zhCN });
}

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param pattern 格式模式，默认 yyyy-MM-dd HH:mm:ss
 */
export function formatDateTime(
  date: string | Date | undefined | null,
  pattern: string = "yyyy-MM-dd HH:mm:ss"
): string {
  return formatDate(date, pattern);
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 风险等级中文文本
 */
export function riskLevelText(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "极高风险",
  };
  return map[level] || "未知";
}

/**
 * 风险等级文字颜色
 */
export function riskLevelColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "text-status-success",
    medium: "text-status-warning",
    high: "text-orange-600",
    critical: "text-status-danger",
  };
  return map[level] || "text-gray-600";
}

/**
 * 风险等级背景色
 */
export function riskLevelBgColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "bg-green-50 text-status-success border-green-200",
    medium: "bg-yellow-50 text-status-warning border-yellow-200",
    high: "bg-orange-50 text-orange-600 border-orange-200",
    critical: "bg-red-50 text-status-danger border-red-200",
  };
  return map[level] || "bg-gray-50 text-gray-600 border-gray-200";
}

/**
 * 融资状态中文文本
 */
export function financeStatusText(status: FinanceStatus): string {
  const map: Record<FinanceStatus, string> = {
    draft: "草稿",
    submitted: "已提交",
    verifying: "审核中",
    approved: "已批准",
    rejected: "已拒绝",
    disbursed: "已放款",
    repaid: "已结清",
    overdue: "已逾期",
    write_off: "已核销",
  };
  return map[status] || "未知";
}

/**
 * 融资状态颜色
 */
export function financeStatusColor(status: FinanceStatus): string {
  const map: Record<FinanceStatus, string> = {
    draft: "bg-gray-100 text-gray-600",
    submitted: "bg-blue-50 text-blue-600",
    verifying: "bg-yellow-50 text-status-warning",
    approved: "bg-green-50 text-status-success",
    rejected: "bg-red-50 text-status-danger",
    disbursed: "bg-teal-50 text-teal-600",
    repaid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-status-danger",
    write_off: "bg-gray-200 text-gray-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

/**
 * 融资状态 Badge 样式变体
 */
export function financeStatusVariant(status: FinanceStatus): "default" | "gold" | "success" | "warning" | "danger" {
  const map: Record<FinanceStatus, "default" | "gold" | "success" | "warning" | "danger"> = {
    draft: "default",
    submitted: "default",
    verifying: "warning",
    approved: "gold",
    rejected: "danger",
    disbursed: "success",
    repaid: "success",
    overdue: "danger",
    write_off: "danger",
  };
  return map[status] || "default";
}

/**
 * 预警类型中文文本
 */
export function alertTypeText(type: AlertType): string {
  const map: Record<AlertType, string> = {
    order_drop: "订单量下降",
    return_spike: "退货率激增",
    payment_delay: "付款延迟",
    abnormal_behavior: "异常行为",
  };
  return map[type] || "未知";
}

/**
 * 用户角色中文文本
 */
export function userRoleText(role: UserRole): string {
  const map: Record<UserRole, string> = {
    core_enterprise: "核心企业",
    supplier: "供应商",
    relationship_manager: "客户经理",
    risk_director: "风控总监",
    credit_committee: "授信委员会",
    admin: "系统管理员",
  };
  return map[role] || "未知";
}
