import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";

const ppVariants = cva(
  "rounded-full bg-gray-300 object-cover flex-shrink-0",
  {
    variants: {
      size: {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
        "2xl": "w-20 h-20",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface PPProps extends VariantProps<typeof ppVariants> {
  src?: string;
  alt: string;
  className?: string;
}

export default function PP({ src, alt, size, className }: PPProps) {
  if (!src) {
    return (
      <div className={cn(ppVariants({ size }), className, "flex items-center justify-center")}>
        <span className="text-gray-500 text-sm">👤</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(ppVariants({ size }), className)}
    />
  );
}
