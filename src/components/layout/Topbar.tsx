"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { clsx } from "clsx";

const roleLabels: Record<string, string> = {
  core_enterprise: "核心企业",
  supplier: "供应商",
  relationship_manager: "客户经理",
  risk_director: "风控总监",
  credit_committee: "授信委员会",
  admin: "系统管理员",
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const notifications = [
    {
      id: 1,
      title: "新的融资申请待审批",
      time: "5分钟前",
      type: "info",
    },
    {
      id: 2,
      title: "供应商恒达电子触发高风险预警",
      time: "1小时前",
      type: "warning",
    },
    {
      id: 3,
      title: "月度报告已生成",
      time: "3小时前",
      type: "success",
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-navy-100 shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-navy-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg hover:bg-navy-50 transition-colors text-navy-500 hover:text-navy-700"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full ring-2 ring-white"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card border border-navy-100 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100">
                <h3 className="font-semibold text-navy-700">消息通知</h3>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 hover:bg-navy-50 rounded"
                >
                  <X className="w-4 h-4 text-navy-400" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-navy-50 hover:bg-navy-50 cursor-pointer transition-colors"
                  >
                    <p className="text-sm text-navy-700">{n.title}</p>
                    <p className="text-xs text-navy-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-navy-50/50 text-center">
                <button className="text-sm text-gold-500 hover:text-gold-600 font-medium">
                  查看全部消息
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-navy-200"></div>

        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-navy-700">{user?.name}</p>
              <p className="text-xs text-navy-400">
                {roleLabels[user?.role || ""] || user?.role}
              </p>
            </div>
            <ChevronDown
              className={clsx(
                "w-4 h-4 text-navy-400 transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card border border-navy-100 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-navy-100 bg-gradient-to-r from-navy-50 to-transparent">
                <p className="text-sm font-semibold text-navy-700">{user?.name}</p>
                <p className="text-xs text-navy-400 mt-0.5">{user?.username}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition-colors">
                  <User className="w-4 h-4" />
                  个人中心
                </button>
              </div>
              <div className="border-t border-navy-50 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-status-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
