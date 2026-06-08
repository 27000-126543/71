"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  Wallet,
  FileBarChart,
  Settings,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import type { UserRole } from "@/src/types";
import { clsx } from "clsx";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const menuConfig: Record<UserRole, MenuItem[]> = {
  core_enterprise: [
    { label: "工作台", href: "/dashboard/core-enterprise", icon: LayoutDashboard },
    { label: "供应商管理", href: "/enterprise/suppliers", icon: Users },
    { label: "交易订单", href: "/enterprise/orders", icon: ShoppingCart },
    { label: "融资申请", href: "/finance/list", icon: FileText },
    { label: "信用评估", href: "/supplier/credit", icon: CreditCard },
    { label: "数据报表", href: "/reports/monthly", icon: FileBarChart },
  ],
  supplier: [
    { label: "工作台", href: "/dashboard/supplier", icon: LayoutDashboard },
    { label: "企业信息", href: "/enterprise/profile", icon: Building2 },
    { label: "我的订单", href: "/supplier/orders", icon: ShoppingCart },
    { label: "融资申请", href: "/finance/apply", icon: FileText },
    { label: "融资记录", href: "/finance/list", icon: CreditCard },
    { label: "还款管理", href: "/repayment/list", icon: Wallet },
  ],
  relationship_manager: [
    { label: "工作台", href: "/dashboard/manager", icon: LayoutDashboard },
    { label: "客户企业", href: "/enterprise/list", icon: Building2 },
    { label: "融资申请", href: "/finance/list", icon: FileText },
    { label: "审批中心", href: "/approval/workbench", icon: CheckSquare },
    { label: "预警监控", href: "/monitoring/alerts", icon: AlertTriangle },
    { label: "数据报表", href: "/reports/monthly", icon: FileBarChart },
  ],
  risk_director: [
    { label: "工作台", href: "/dashboard/risk", icon: LayoutDashboard },
    { label: "审批中心", href: "/approval/workbench", icon: CheckSquare },
    { label: "风险监控", href: "/monitoring/metrics", icon: BarChart3 },
    { label: "预警管理", href: "/monitoring/alerts", icon: AlertTriangle },
    { label: "信用评估", href: "/supplier/credit", icon: CreditCard },
    { label: "数据报表", href: "/reports/monthly", icon: FileBarChart },
  ],
  credit_committee: [
    { label: "工作台", href: "/dashboard/committee", icon: LayoutDashboard },
    { label: "审批中心", href: "/approval/workbench", icon: CheckSquare },
    { label: "融资项目", href: "/finance/list", icon: FileText },
    { label: "风险分析", href: "/dashboard/risk-forecast", icon: BarChart3 },
    { label: "数据报表", href: "/reports/monthly", icon: FileBarChart },
  ],
  admin: [
    { label: "工作台", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "企业管理", href: "/enterprise/list", icon: Building2 },
    { label: "用户管理", href: "/admin/users", icon: Users },
    { label: "融资项目", href: "/finance/list", icon: FileText },
    { label: "审批管理", href: "/approval/workbench", icon: CheckSquare },
    { label: "监控预警", href: "/monitoring/alerts", icon: AlertTriangle },
    { label: "数据报表", href: "/reports/monthly", icon: FileBarChart },
    { label: "系统设置", href: "/admin/settings", icon: Settings },
  ],
};

interface SidebarProps {
  role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  core_enterprise: "核心企业",
  supplier: "供应商",
  relationship_manager: "客户经理",
  risk_director: "风控总监",
  credit_committee: "授信委员会",
  admin: "系统管理员",
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = menuConfig[role] || [];

  return (
    <aside className="w-64 bg-navy-600 min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-navy-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-glow">
            <Building2 className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-gold-300 glow-text">供应链金融</h1>
            <p className="text-xs text-navy-200 mt-0.5">{roleLabels[role]}端</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-gold-400/20 to-transparent text-gold-300 border-l-4 border-gold-400 shadow-inner"
                    : "text-navy-100 hover:bg-navy-500/60 hover:text-white"
                )}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-gold-400" : "text-navy-200 group-hover:text-white"
                  )}
                />
                <span
                  className={clsx(
                    "text-sm font-medium",
                    isActive ? "text-gold-300" : ""
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-navy-500">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-navy-700/50">
          <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
          <span className="text-xs text-navy-200">系统运行正常</span>
        </div>
      </div>
    </aside>
  );
}
