import React, { useState } from "react";
import { Input } from "./input";
import { cn } from "../../lib/utils";

interface CardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

export function CardNumberInput({
  className,
  onValueChange,
  ...props
}: CardInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    let newValue = e.target.value.replace(/\D/g, "");
    
    // Limit to 16 digits
    newValue = newValue.substring(0, 16);
    
    // Format with spaces every 4 digits
    let formattedValue = "";
    for (let i = 0; i < newValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += " ";
      }
      formattedValue += newValue[i];
    }
    
    setValue(formattedValue);
    
    // Pass the raw value to the parent
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="cc-number"
      value={value}
      onChange={handleChange}
      className={cn("font-mono", className)}
      placeholder="1234 5678 9012 3456"
      {...props}
    />
  );
}

export function CardExpiryInput({
  className,
  onValueChange,
  ...props
}: CardInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateExpiry = (month: string, year: string): string | null => {
    // Only validate if we have full month and year
    if (month.length !== 2 || year.length !== 2) return null;

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Check if month is valid (1-12)
    if (monthNum < 1 || monthNum > 12) {
      return "Invalid month";
    }

    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

    // Check if the expiry date is in the past
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return "Card has expired";
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    let newValue = e.target.value.replace(/\D/g, "");
    
    // Limit to 4 digits
    newValue = newValue.substring(0, 4);
    
    // Format as MM/YY
    let formattedValue = "";
    if (newValue.length > 0) {
      // Format first two digits as month
      const month = newValue.substring(0, 2);
      formattedValue = month;
      
      // Add slash and year if we have more than 2 digits
      if (newValue.length > 2) {
        formattedValue += "/" + newValue.substring(2);
      }
    }
    
    setValue(formattedValue);
    
    // Validate expiry date if we have all 4 digits
    if (newValue.length === 4) {
      const month = newValue.substring(0, 2);
      const year = newValue.substring(2, 4);
      const validationError = validateExpiry(month, year);
      setError(validationError);
    } else {
      setError(null);
    }
    
    // Pass the raw value to the parent
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        value={value}
        onChange={handleChange}
        className={cn("font-mono", error ? "border-destructive" : "", className)}
        placeholder="MM/YY"
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export function CardCVCInput({
  className,
  onValueChange,
  ...props
}: CardInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    let newValue = e.target.value.replace(/\D/g, "");
    
    // Limit to 4 digits (for Amex, other cards use 3)
    newValue = newValue.substring(0, 4);
    
    setValue(newValue);
    
    // Pass the raw value to the parent
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="cc-csc"
      value={value}
      onChange={handleChange}
      className={cn("font-mono", className)}
      placeholder="123"
      {...props}
    />
  );
} 