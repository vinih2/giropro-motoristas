// src/components/ui/currency-input.tsx
'use client';

import * as React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  // Formata o valor para exibição (R$ 0,00)
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

  // Atualiza o display se o valor externo mudar
  React.useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Apenas números
    const numberValue = Number(rawValue) / 100; // Divide por 100 para centavos
    
    setDisplayValue(formatCurrency(numberValue));
    onChange(numberValue.toString()); // Devolve o número puro para o estado
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
