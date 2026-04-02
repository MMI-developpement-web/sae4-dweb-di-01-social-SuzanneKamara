import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";

const iconVariants = cva("inline-block", {
  variants: {
    size: {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-10 h-10",
    },
    display: {
      shown: "block",
      hidden: "hidden",
    },
  },
  defaultVariants: {
    size: "md",
    display: "shown",
  },
});

interface IconProps extends VariantProps<typeof iconVariants> {
  icon?: string | React.ReactNode;
  className?: string;
  ariaHidden?: boolean;
}

export default function Icon({ 
  icon, 
  size, 
  display, 
  className,
  ariaHidden = true 
}: IconProps) {
  if (!icon) return null;

  return (
    <span 
      className={cn(iconVariants({ size, display }), className)}
      aria-hidden={ariaHidden}
    >
      {icon}
    </span>
  );
}
