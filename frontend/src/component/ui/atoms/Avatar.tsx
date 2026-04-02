import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";

const avatarVariants = cva("w-8 h-8 rounded-full object-cover", {
  variants: {
    size: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  url: string;
  alt: string;
  className?: string;
}

export default function Avatar({ url, alt, size, className }: AvatarProps) {
  return (
    <img
      src={url}
      alt={alt}
      className={cn(avatarVariants({ size }), className)}
    />
  );
}
