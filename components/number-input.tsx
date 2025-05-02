"use client";

import * as React from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  allowNegative?: boolean;
  controls?: boolean;
  controlsPosition?: "both" | "right";
  controlsSize?: "xs" | "sm" | "md" | "lg";
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      formatOptions,
      allowNegative = true,
      controls = true,
      controlsPosition = "both",
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | undefined>(
      value !== undefined ? value : defaultValue
    );

    React.useEffect(() => {
      if (value !== undefined && value !== internalValue) {
        setInternalValue(value);
      }
    }, [value, internalValue]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      
      if (rawValue === "" || rawValue.replace(/[^\d.-]/g, "") === "") {
        setInternalValue(undefined);
        onChange?.(0);
        return;
      }
      
      const numericString = rawValue.replace(/[^\d.-]/g, "");
      const numericValue = parseFloat(numericString);
      
      if (isNaN(numericValue)) {
        return;
      }
      
      const constrainedValue = Math.min(Math.max(numericValue, min), max);
      
      const finalValue = !allowNegative && constrainedValue < 0 ? 0 : constrainedValue;
      
      setInternalValue(finalValue);
      onChange?.(finalValue);
    };

    const increment = () => {
      const currentValue = internalValue ?? 0;
      const newValue = Math.min(currentValue + step, max);
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const decrement = () => {
      const currentValue = internalValue ?? 0;
      const newValue = Math.max(currentValue - step, min);
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        increment();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        decrement();
      }
    };

    const displayValue = React.useMemo(() => {
      if (internalValue === undefined) {
        return "";
      }
      
      return formatOptions
        ? new Intl.NumberFormat(undefined, formatOptions).format(internalValue)
        : internalValue.toString();
    }, [internalValue, formatOptions]);

    return (
      <div className={cn("flex items-center", className)}>
        {controls && controlsPosition === "both" && (
          <Button
            type="button"
            variant="outline"
            onClick={decrement}
            disabled={disabled || internalValue === min}
            className="rounded-r-none"
            aria-label="減少數值"
          >
            <IconMinus className="h-3 w-3" />
          </Button>
        )}
        
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "",
            controls && controlsPosition === "both" && "rounded-none border-x-0",
            controls && controlsPosition === "right" && "rounded-r-none",
            !controls && "w-full"
          )}
          disabled={disabled}
          {...props}
        />
        
        {controls && (
          <div className={controlsPosition === "right" ? "flex flex-col" : ""}>
            {controlsPosition === "right" && (
              <Button
                type="button"
                variant="outline"
                onClick={increment}
                disabled={disabled || internalValue === max}
                className="rounded-bl-none border-b-0 px-2 py-0"
                aria-label="增加數值"
              >
                <IconPlus className="h-3 w-3" />
              </Button>
            )}
            
            {(controlsPosition === "both" || controlsPosition === "right") && (
              <Button
                type="button"
                variant="outline"
                onClick={controlsPosition === "both" ? increment : decrement}
                disabled={disabled || (controlsPosition === "both" ? internalValue === max : internalValue === min)}
                className={cn(
                  controlsPosition === "both" && "rounded-l-none",
                  controlsPosition === "right" && "rounded-t-none px-2 py-0"
                )}
                aria-label={controlsPosition === "both" ? "增加數值" : "減少數值"}
              >
                {controlsPosition === "both" ? (
                  <IconPlus className="h-3 w-3" />
                ) : (
                  <IconMinus className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";