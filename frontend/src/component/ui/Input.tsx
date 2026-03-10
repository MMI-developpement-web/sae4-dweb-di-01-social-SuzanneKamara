import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode } from "react";
import { useState } from "react";

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
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [currentVariant, setCurrentVariant] = useState<"default" | "active" | "error" | null | undefined>(variant);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {  
      const isValid = isValidEmail(event.target.value || "");
      if (!isValid && event.target.value !== "") {
        setCurrentVariant("error");
        setErrorMessage("Veuillez entrer une adresse email valide.");
      } else {
        setCurrentVariant(variant);
        setErrorMessage("");
      }
    };
 
    return (
      <div className="w-full">
        <input 
          type={type} 
          placeholder={placeholder} 
          className={cn(inputVariants({ variant: currentVariant }))} 
          onChange={type === "email" ? handleEmailChange : undefined}
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
}