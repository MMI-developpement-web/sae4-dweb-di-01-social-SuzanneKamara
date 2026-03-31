import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

const iconVariants = cva("w-", {
  variants: {
  variant: {
     shown: "block",
        hidden: "hidden",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        outline:
          "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
  },
  defaultVariants: {
    variant: "hidden",
    size: "md",
  },
});

interface IconProps{
   icon:string | undefined;
   variant: "shown" | "hidden";
}

interface IconViewProps extends VariantProps<typeof iconVariants> {
//   className?: string;
}


export default function Icons({icon,variant}:IconProps & IconViewProps) {
  
    return <span className={cn(iconVariants({ variant}))}>{icon}</span>;
}