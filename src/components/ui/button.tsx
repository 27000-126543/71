import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * 按钮组件样式变体定义
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-navy-500 text-white hover:bg-navy-600 focus-visible:ring-navy-500",
        gold: "bg-gold-400 text-navy-900 hover:bg-gold-300 focus-visible:ring-gold-400 font-semibold",
        ghost:
          "hover:bg-navy-50 hover:text-navy-600 text-navy-500 focus-visible:ring-navy-500",
        destructive:
          "bg-status-danger text-white hover:bg-red-600 focus-visible:ring-status-danger",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * 按钮组件
 * @param variant 样式变体：default/gold/ghost/destructive
 * @param size 尺寸：sm/default/lg
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
