"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { gold?: boolean; enableGradient?: boolean }
>(({ className, value, gold, enableGradient = true, ...props }, ref) => {
  const progressValue = value || 0
  const isNearComplete = progressValue >= 90 && progressValue < 100
  
  // Calculate gradient colors based on progress
  const getGradient = () => {
    // If gradient is disabled, use solid color
    if (!enableGradient) {
      return gold ? 'var(--gold-color)' : 'var(--accent-color)'
    }
    
    if (gold) {
      // Gold gradient for completed collections
      return 'linear-gradient(90deg, var(--gold-color-dark) 0%, var(--gold-color) 50%, var(--gold-color-hover) 100%)'
    }
    
    // Accent color to gold gradient as progress increases
    // Always start with accent color at 0%
    const goldRatio = Math.min(progressValue / 100, 1)
    
    // If progress is very low (< 10%), use solid accent color for better performance
    if (goldRatio < 0.1) {
      return 'var(--accent-color)'
    }
    
    // Create a smooth gradient from accent color to gold
    // Use a simple two-color gradient for better browser compatibility
    // The gradient always starts with accent color and transitions to gold
    // We use a mid-point that shifts based on progress for smoother transition
    const midPoint = 30 + (goldRatio * 40) // Mid point moves from 30% to 70% as progress increases
    
    // Simple gradient: accent color at start, transitioning to gold at end
    // This ensures the gradient always starts with the user's accent color
    return `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${midPoint}%, var(--gold-color) 100%)`
  }
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]",
        isNearComplete && enableGradient && "animate-pulse-glow",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all duration-500 ease-out"
        style={{ 
          transform: `translateX(-${100 - progressValue}%)`,
          background: getGradient(),
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

