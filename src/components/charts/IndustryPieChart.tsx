"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/src/lib/utils";

interface IndustryPieChartProps {
  data: Array<{ industry: string; amount: number; overdueRate?: number }>;
  darkMode?: boolean;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#D4AF37",
  "#DDB84A",
  "#1B9AAA",
  "#2E5290",
  "#5A7CAC",
  "#8FA6C9",
  "#E8D086",
  "#157A87",
];

export default function IndustryPieChart({
  data,
  darkMode = false,
  height = 280,
  colors = DEFAULT_COLORS,
}: IndustryPieChartProps) {
  const textColor = darkMode ? "#C3D0E5" : "#5A7CAC";
  const tooltipBg = darkMode ? "#091E38" : "#ffffff";
  const tooltipBorder = darkMode ? "#2E5290" : "#E6ECF5";

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    payload,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={90}
          innerRadius={40}
          dataKey="amount"
          nameKey="industry"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "8px",
            color: darkMode ? "#ffffff" : "#0B2545",
          }}
          formatter={(value: number, _name: string, props: any) => {
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return [
              `${formatCurrency(value, 0)} (${percent}%)`,
              props.payload.industry,
            ];
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => <span style={{ color: textColor, fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
