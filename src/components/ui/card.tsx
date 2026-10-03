import * as React from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import { springs, clamp } from "@/lib/motion"

export interface CardProps
  extends Omit<
    React.ComponentProps<"div">,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
  > {
  /** Subtle 3D tilt + border glow that tracks the cursor. On by default —
   * set false for dense/data-table-style cards where tilt would feel noisy. */
  interactive?: boolean
}

// Tilt is intentionally small — "premium" reads as restrained, not gimmicky.
const TILT_MAX_DEG = 4

function Card({ className, interactive = true, onMouseMove, onMouseLeave, ...props }: CardProps) {
  const prefersReducedMotion = useReducedMotion()
  const ref = React.useRef<HTMLDivElement | null>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, springs.smooth)
  const springRotateY = useSpring(rotateY, springs.smooth)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e)
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty("--glow-x", `${px}%`)
    el.style.setProperty("--glow-y", `${py}%`)

    if (!interactive || prefersReducedMotion) return
    const nx = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(clamp(nx * TILT_MAX_DEG * 2, -TILT_MAX_DEG, TILT_MAX_DEG))
    rotateX.set(clamp(-ny * TILT_MAX_DEG * 2, -TILT_MAX_DEG, TILT_MAX_DEG))
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      data-slot="card"
      className={cn(
        "group/card relative flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-layer-sm [transform-style:preserve-3d]",
        interactive &&
          "transition-shadow duration-300 hover:shadow-layer-lg",
        // Cursor-tracked border glow — neutral, uses existing ring/accent tone
        // at low opacity so it doesn't introduce a new color.
        interactive &&
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] group-hover/card:before:opacity-100",
        interactive &&
          "before:bg-[radial-gradient(280px_circle_at_var(--glow-x,50%)_var(--glow-y,50%),theme(colors.ring/12%),transparent_70%)]",
        className
      )}
      style={
        interactive
          ? {
              rotateX: springRotateX,
              rotateY: springRotateY,
              perspective: 1000,
            }
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
