import { cn } from "../../lib/utils.ts";
import type { ReactNode } from "react";

interface BadgeDataProps {
  children: ReactNode;
}

interface BadgeViewProps {
  type?: "success" | "warning" | "error" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Avant - à refactorer
export default function Badge({ type, size, children }: BadgeDataProps & BadgeViewProps) {
 
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        {
          "bg-green-100 text-green-800": type === "success",
          "bg-yellow-100 text-yellow-800": type === "warning",
          "bg-red-100 text-red-800": type === "error",
          "bg-gray-100 text-gray-800": type === "default",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-0.5 text-xs": size === "md",
          "px-3 py-1 text-sm": size === "lg",
        },
      )}
    >
      {children}
    </span>
  );
}