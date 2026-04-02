import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";
import type { ReactNode } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      type: {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800",
        info: "bg-blue-100 text-blue-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      type: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export default function Badge({
  type,
  size,
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ type, size }), className)}>
      {children}
    </span>
  );
}
