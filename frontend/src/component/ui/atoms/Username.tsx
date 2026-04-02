import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";

const usernameVariants = cva("font-medium", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    color: {
      default: "text-gray-900",
      muted: "text-gray-600",
      primary: "text-blue-600",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
    truncate: true,
  },
});

interface UsernameProps extends VariantProps<typeof usernameVariants> {
  username: string;
  className?: string;
}

export default function Username({
  username,
  size,
  color,
  truncate,
  className,
}: UsernameProps) {
  return (
    <span className={cn(usernameVariants({ size, color, truncate }), className)}>
      @{username}
    </span>
  );
}
