import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * 徽章组件样式变体定义
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy-100 text-navy-600",
        gold: "bg-gold-100 text-gold-600",
        success: "bg-green-100 text-status-success",
        warning: "bg-yellow-100 text-status-warning",
        danger: "bg-red-100 text-status-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * 徽章组件
 * @param variant 样式变体：default/gold/success/warning/danger
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
