"use client";

import React from "react";
import { cn, formatPercent } from "@/src/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  darkMode?: boolean;
  color?: string;
}

export default function GaugeChart({
  value,
  max = 1,
  label,
  size = "md",
  darkMode = false,
  color,
}: GaugeChartProps) {
  const percentage = Math.min(value / max, 1);
  const startAngle = 225;
  const endAngle = -45;
  const displayColor = color ?? "#D4AF37";

  const data = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 1 - percentage },
  ];

  const sizeClass = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  const trackColor = darkMode ? "#1a3557" : "#E6ECF5";

  return (
    <div className={cn("relative flex items-center justify-center", sizeClass)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius="75%"
            outerRadius="95%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill={displayColor} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            "font-bold font-serif",
            textSize,
            darkMode ? "text-gold-300" : "text-navy-700"
          )}
        >
          {formatPercent(percentage)}
        </div>
        {label && (
          <div className={cn("text-xs mt-1", darkMode ? "text-gray-400" : "text-navy-500")}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
