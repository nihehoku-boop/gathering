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
    const accentRatio = 1 - goldRatio
    
    // If progress is very low (< 10%), use solid accent color for better performance
    if (goldRatio < 0.1) {
      return 'var(--accent-color)'
    }
    
    // Create a smooth gradient from accent color to gold
    // Use multiple color stops for a smoother transition
    // Start: 100% accent color
    // Mid: Mix of accent and gold based on progress
    // End: More gold as progress increases
    
    // Calculate stop positions for smoother gradient
    const startStop = 0
    const midStop = 50 + (goldRatio * 30) // Mid point moves from 50% to 80% as progress increases
    const endStop = 100
    
    // For better browser support, use a simpler gradient with explicit color stops
    // The gradient transitions from accent color to a mix, then to gold
    if (goldRatio < 0.5) {
      // More accent color, less gold
      return `linear-gradient(90deg, var(--accent-color) ${startStop}%, var(--accent-color) ${midStop}%, color-mix(in srgb, var(--accent-color) ${accentRatio * 100}%, var(--gold-color) ${goldRatio * 100}%) ${endStop}%)`
    } else {
      // More gold, less accent color
      return `linear-gradient(90deg, var(--accent-color) ${startStop}%, color-mix(in srgb, var(--accent-color) ${accentRatio * 100}%, var(--gold-color) ${goldRatio * 100}%) ${midStop}%, var(--gold-color) ${endStop}%)`
    }
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

