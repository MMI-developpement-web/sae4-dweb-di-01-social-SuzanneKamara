import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode } from "react";

const inputVariants = cva("border border-gray-300 ", {
  variants: {
   variant:{
    default: "border border-gray-300 focus:ring-2 focus:ring-blue-500",
         active: "border border-gray-300 focus:ring-2 focus:ring-blue-500",
        error: "border border-red-500 focus:ring-2 focus:ring-red-500",
    },
   
  },
  defaultVariants: {
    variant: "default",
  },
});

interface InputDataProps {
 placeholder?: string;
 type?:string;
}
interface InputViewProps extends VariantProps<typeof inputVariants> {
//   className?: string;
}
interface InputProps extends InputDataProps, InputViewProps {}

// function handlerInputChange(event: React.ChangeEvent<HTMLInputElement>) {
//   const value = event.target.value;
//   if ()
//   console.log("Input value:", value);
// }
function isValidEmail(email: string) {
  return email.includes("@");
} 


export default function Input({ type, placeholder, variant }: InputProps) {
    const Inpt =  <input type={type} placeholder={placeholder} className={cn(inputVariants({ variant }))} />
 
    if (type === "email") {
      Inpt.props.onChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
    let res = isValidEmail(event.target.value || "");
    if (!res) {
      event.target.className = cn(inputVariants({ variant: "error" }));
      let errorMessage = document.createElement("p");
      errorMessage.textContent = "Please enter a valid email address.";
      errorMessage.className = "text-red-500 text-sm mt-1";
      event.target.parentNode?.appendChild(errorMessage);
    }
  }}
  return (
    <>
      {Inpt}
    </>
    );
}