"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { riskLevelText, formatCurrency } from "@/src/lib/utils";
import type { RiskLevel } from "@/src/types";

interface RiskBarChartProps {
  data: Array<{ level: RiskLevel; count: number; amount: number }>;
  darkMode?: boolean;
  height?: number;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#2E8B57",
  medium: "#E6A817",
  high: "#F97316",
  critical: "#C1292E",
};

export default function RiskBarChart({
  data,
  darkMode = false,
  height = 240,
}: RiskBarChartProps) {
  const textColor = darkMode ? "#C3D0E5" : "#5A7CAC";
  const gridColor = darkMode ? "rgba(90, 124, 172, 0.2)" : "#E6ECF5";
  const tooltipBg = darkMode ? "#091E38" : "#ffffff";
  const tooltipBorder = darkMode ? "#2E5290" : "#E6ECF5";

  const chartData = data.map((item) => ({
    ...item,
    name: riskLevelText(item.level),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, 0)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "8px",
            color: darkMode ? "#ffffff" : "#0B2545",
          }}
          formatter={(value: number, name: string) => {
            if (name === "amount") return [formatCurrency(value, 0), "金额"];
            return [value, "数量"];
          }}
        />
        <Legend
          wrapperStyle={{ color: textColor, fontSize: 12 }}
          formatter={(value) => {
            const label = value === "count" ? "笔数" : "金额";
            return <span style={{ color: textColor }}>{label}</span>;
          }}
        />
        <Bar yAxisId="left" dataKey="count" name="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-count-${index}`} fill={RISK_COLORS[entry.level]} />
          ))}
        </Bar>
        <Bar
          yAxisId="right"
          dataKey="amount"
          name="amount"
          radius={[4, 4, 0, 0]}
          fill="#D4AF37"
          opacity={0.7}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
