"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * 简单提示框组件
 * @param content 提示内容
 * @param children 触发元素
 * @param side 提示位置：top/bottom/left/right
 */
function Tooltip({
  content,
  children,
  className,
  contentClassName,
  side = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-navy-800 px-2.5 py-1.5 text-xs text-white shadow-lg animate-fade-in pointer-events-none",
            sideClass,
            contentClassName
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export { Tooltip };
