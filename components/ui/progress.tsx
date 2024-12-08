"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-black-4",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-[--accent-color] to-purple-500 transition-all duration-500"
        style={{
          transform: `translateX(-${100 - Math.min(Math.max(value, 0), 100)}%)`
        }}
      />
    </div>
  )
)

Progress.displayName = "Progress"

export { Progress } 
