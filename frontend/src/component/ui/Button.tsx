import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode } from "react";

import Icons from "./Icon.tsx";

const buttonVariants = cva("font-medium rounded-md", {
  variants: {
  variant: {
     solid: "bg-blue-500 text-white",
        primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
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
  compoundVariants: [
    // Border plus fin pour outline + sm
    {
      variant: "outline",
      size: "lg",
      class: "shadow-sm",
    },
  
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
});

interface ButtonDataProps {
  children: ReactNode;
  icon?: string;
}

interface ButtonViewProps extends VariantProps<typeof buttonVariants> {
//   className?: string;
}

interface ButtonProps extends ButtonDataProps, ButtonViewProps {}

export default function Button({
  children,
  variant,
//   iconState,
  size,
    icon,
//   className,
  ...props
}: ButtonProps) {
//    const icon = !icon ? "hidden" : iconState;
 const displayIconState = icon ? "shown" : "hidden";


    return (
      <button className={cn(buttonVariants({ variant}))}>

        <Icons icon={icon} variant={displayIconState} />
      {children}
    </button>
  );
}