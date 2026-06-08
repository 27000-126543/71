import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

/**
 * 骨架屏加载组件
 * @param variant 形状变体：text（文字）/ circular（圆形）/ rectangular（矩形）
 */
function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  const variantClass = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }[variant];

  return (
    <div
      className={cn(
        "animate-pulse bg-navy-100",
        variantClass,
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
