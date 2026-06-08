"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: "default" | "gold" | "success" | "warning" | "danger";
}

/**
 * 进度条组件
 * @param value 当前值
 * @param max 最大值，默认100
 * @param color 颜色变体
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, color = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colorClass = {
      default: "bg-navy-500",
      gold: "bg-gold-400",
      success: "bg-status-success",
      warning: "bg-status-warning",
      danger: "bg-status-danger",
    }[color];

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-navy-100",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-300 ease-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
