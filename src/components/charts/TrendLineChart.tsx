"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { formatCurrency } from "@/src/lib/utils";

interface TrendLineChartProps {
  data: Array<{ month: string; disbursed?: number; repaid?: number; overdue?: number; [key: string]: any }>;
  lines: Array<{
    dataKey: string;
    color: string;
    name: string;
    type?: "line" | "area" | "bar";
  }>;
  darkMode?: boolean;
  height?: number;
  showLegend?: boolean;
  yAxisFormatter?: (value: number) => string;
}

export default function TrendLineChart({
  data,
  lines,
  darkMode = false,
  height = 280,
  showLegend = true,
  yAxisFormatter = (v) => formatCurrency(v, 0),
}: TrendLineChartProps) {
  const textColor = darkMode ? "#C3D0E5" : "#5A7CAC";
  const gridColor = darkMode ? "rgba(90, 124, 172, 0.2)" : "#E6ECF5";
  const tooltipBg = darkMode ? "#091E38" : "#ffffff";
  const tooltipBorder = darkMode ? "#2E5290" : "#E6ECF5";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line, idx) => (
            <linearGradient key={idx} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "8px",
            color: darkMode ? "#ffffff" : "#0B2545",
          }}
          formatter={(value: number) => yAxisFormatter(value)}
          labelStyle={{ color: textColor, fontWeight: 600 }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: textColor, fontSize: 12 }}
            formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
          />
        )}
        {lines.map((line, idx) =>
          line.type === "area" || line.type === undefined ? (
            <Area
              key={idx}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              fill={`url(#gradient-${line.dataKey})`}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
            />
          ) : (
            <Line
              key={idx}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
            />
          )
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
