import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";
import { useState } from "react";

const inputVariants = cva(
  "w-full px-4 py-2 border rounded-md transition-all focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
        error: "border-red-500 focus:ring-red-500 focus:border-red-500",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface InputProps
  extends VariantProps<typeof inputVariants>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "variant"> {
  label?: string;
  error?: string;
  help?: string;
  className?: string;
  onValidate?: (value: string) => boolean;
}

function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

export default function Input({
  type = "text",
  placeholder,
  variant: initialVariant = "default",
  className,
  label,
  error: externalError,
  help,
  onValidate,
  value: externalValue,
  onChange,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState<string>(
    typeof externalValue === "string" ? externalValue : ""
  );
  const [internalError, setInternalError] = useState<string>("");

  const currentValue = externalValue ?? internalValue;
  const currentError = externalError || internalError;
  const variant = currentError ? "error" : initialVariant;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);

    if (type === "email" && newValue && !isValidEmail(newValue)) {
      setInternalError("Veuillez entrer une adresse email valide.");
    } else if (onValidate && newValue && !onValidate(newValue)) {
      setInternalError("Valeur invalide.");
    } else {
      setInternalError("");
    }

    onChange?.(event);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
      {(currentError || help) && (
        <p className={`text-xs ${currentError ? "text-red-500" : "text-gray-500"}`}>
          {currentError || help}
        </p>
      )}
    </div>
  );
}
