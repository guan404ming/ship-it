"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxProps) {
  const ref = React.useRef<React.ElementRef<typeof CheckboxPrimitive.Root>>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      if (typeof indeterminate === 'boolean') {
        ref.current.dataset.indeterminate = String(indeterminate);
      }
    }
  }, [indeterminate]);
  
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[indeterminate=true]:bg-primary data-[indeterminate=true]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {indeterminate ? (
          <div className="h-[2px] w-[10px] bg-current rounded-sm" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
