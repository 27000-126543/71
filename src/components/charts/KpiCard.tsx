"use client";

import React from "react";
import { cn, formatCurrency, formatPercent } from "@/src/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  format?: "currency" | "percent" | "number";
  changePercent?: number;
  showGlow?: boolean;
  darkMode?: boolean;
  trend?: "up" | "down" | "stable";
  valueColor?: string;
  suffix?: string;
}

export default function KpiCard({
  title,
  value,
  format = "number",
  changePercent,
  showGlow = false,
  darkMode = false,
  trend,
  valueColor,
  suffix,
}: KpiCardProps) {
  const formattedValue = React.useMemo(() => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percent":
        return formatPercent(value);
      default:
        return value.toLocaleString("zh-CN");
    }
  }, [value, format]);

  const trendIcon = () => {
    const t = trend ?? (changePercent !== undefined ? (changePercent >= 0 ? "up" : "down") : "stable");
    if (t === "up") return <TrendingUp className="w-4 h-4" />;
    if (t === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const trendColor = () => {
    const t = trend ?? (changePercent !== undefined ? (changePercent >= 0 ? "up" : "down") : "stable");
    if (t === "up") return darkMode ? "text-emerald-400" : "text-status-success";
    if (t === "down") return darkMode ? "text-rose-400" : "text-status-danger";
    return darkMode ? "text-gray-400" : "text-gray-500";
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-5 border transition-all",
        showGlow && "animate-pulse-glow",
        darkMode
          ? "bg-navy-700/60 border-gold-500/30 backdrop-blur-sm"
          : "bg-white border-navy-100 shadow-card"
      )}
    >
      <div className={cn("text-sm font-medium mb-2", darkMode ? "text-gray-300" : "text-navy-500")}>
        {title}
      </div>
      <div className="flex items-end justify-between">
        <div
          className={cn(
            "text-2xl md:text-3xl font-bold font-serif",
            valueColor || (darkMode ? "text-gold-300" : "text-navy-700")
          )}
        >
          {formattedValue}
          {suffix && <span className="text-base font-normal ml-1 opacity-80">{suffix}</span>}
        </div>
        {changePercent !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor())}>
            {trendIcon()}
            <span>{Math.abs(changePercent * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
