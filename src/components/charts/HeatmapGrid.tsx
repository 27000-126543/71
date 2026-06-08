"use client";

import React from "react";
import { cn, formatPercent } from "@/src/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface HeatmapItem {
  name: string;
  score: number;
  trend?: "up" | "down" | "stable";
  suggestion?: string;
}

interface HeatmapGridProps {
  data: HeatmapItem[];
  darkMode?: boolean;
}

function getScoreColor(score: number, darkMode: boolean): string {
  if (score >= 80) return darkMode ? "bg-emerald-600/80 text-white" : "bg-emerald-500 text-white";
  if (score >= 65) return darkMode ? "bg-emerald-500/70 text-white" : "bg-emerald-400 text-white";
  if (score >= 50) return darkMode ? "bg-yellow-500/80 text-navy-900" : "bg-yellow-400 text-navy-900";
  if (score >= 35) return darkMode ? "bg-orange-500/80 text-white" : "bg-orange-400 text-white";
  return darkMode ? "bg-red-600/80 text-white" : "bg-red-500 text-white";
}

function getTrendIcon(trend?: "up" | "down" | "stable") {
  if (trend === "up") return <TrendingUp className="w-4 h-4" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
}

function getTrendColor(trend?: "up" | "down" | "stable", darkMode = false): string {
  if (trend === "up") return darkMode ? "text-emerald-400" : "text-status-success";
  if (trend === "down") return darkMode ? "text-rose-400" : "text-status-danger";
  return darkMode ? "text-gray-400" : "text-gray-500";
}

export default function HeatmapGrid({ data, darkMode = false }: HeatmapGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-lg p-4 border transition-all hover:scale-[1.02]",
            darkMode
              ? "bg-navy-700/40 border-gold-500/20 hover:border-gold-500/40"
              : "bg-white border-navy-100 shadow-sm hover:shadow-md"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={cn("font-semibold", darkMode ? "text-gold-200" : "text-navy-700")}>
              {item.name}
            </div>
            <div className={cn("flex items-center gap-1", getTrendColor(item.trend, darkMode))}>
              {getTrendIcon(item.trend)}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "px-3 py-1.5 rounded-md font-bold text-sm",
                getScoreColor(item.score, darkMode)
              )}
            >
              {item.score.toFixed(0)}分
            </div>
            <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-navy-500")}>
              风险评级: {item.score >= 65 ? "安全" : item.score >= 50 ? "关注" : item.score >= 35 ? "预警" : "高风险"}
            </div>
          </div>
          {item.suggestion && (
            <div
              className={cn(
                "text-xs mt-2 p-2 rounded border-l-2",
                darkMode
                  ? "bg-navy-800/50 border-gold-500/50 text-gray-300"
                  : "bg-navy-50 border-navy-300 text-navy-600"
              )}
            >
              {item.suggestion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
