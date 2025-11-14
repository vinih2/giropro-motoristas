'use client';

import * as React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const formatCurrency = (val: string | number) => {
    if (!val) return "";
    const num = Number(val);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value));

  React.useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); 
    const numberValue = Number(rawValue) / 100; 
    
    setDisplayValue(formatCurrency(numberValue));
    onChange(numberValue.toString());
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  );
}
