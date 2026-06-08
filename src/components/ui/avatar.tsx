import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * 头像组件，显示首字母或图片
 * @param name 用户名称，用于提取首字母
 * @param src 头像图片地址（可选）
 * @param size 尺寸：sm/default/lg
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, src, size = "default", ...props }, ref) => {
    const sizeClass = {
      sm: "h-8 w-8 text-xs",
      default: "h-10 w-10 text-sm",
      lg: "h-14 w-14 text-lg",
    }[size];

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-navy-400 to-navy-600 font-medium text-white",
          sizeClass,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
