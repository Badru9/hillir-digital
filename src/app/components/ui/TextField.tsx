"use client";

import { Input, Label, TextField as HeroTextField } from "@heroui/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface TextFieldProps {
  label: string;
  hint?: ReactNode;
  id: string;
  className?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
}

export function TextField({
  label,
  hint,
  id,
  className,
  type = "text",
  required,
  placeholder,
  value,
  onChange,
  autoComplete,
}: TextFieldProps) {
  return (
    <HeroTextField
      className={cn("gap-1.5", className)}
      id={id}
      isRequired={required}
      type={type}
      value={value}
      onChange={onChange}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint}
      </div>
      <Input
        autoComplete={autoComplete}
        id={id}
        placeholder={placeholder}
      />
    </HeroTextField>
  );
}