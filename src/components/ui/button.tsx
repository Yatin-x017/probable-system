import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import { springs, clamp } from "@/lib/motion"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Cursor-follow attraction on hover. Disable inside dense tables/toolbars. */
  magnetic?: boolean
}

// Max magnetic pull, in px. Kept small — this is a nudge, not a chase.
const MAGNETIC_STRENGTH = 0.25
const MAGNETIC_MAX = 8

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      magnetic = true,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const localRef = React.useRef<HTMLButtonElement | null>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, springs.snappy)
    const springY = useSpring(y, springs.snappy)

    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        localRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      },
      [forwardedRef]
    )

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e)
      const el = localRef.current
      if (!el) return

      // Cursor-tracked sheen position (used by the ::before gradient below).
      const rect = el.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty("--sheen-x", `${px}%`)
      el.style.setProperty("--sheen-y", `${py}%`)

      if (!magnetic || prefersReducedMotion || size === "icon") return
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      x.set(clamp(relX * MAGNETIC_STRENGTH, -MAGNETIC_MAX, MAGNETIC_MAX))
      y.set(clamp(relY * MAGNETIC_STRENGTH, -MAGNETIC_MAX, MAGNETIC_MAX))
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e)
      x.set(0)
      y.set(0)
    }

    const Comp = asChild ? Slot : "button"
    const MotionComp = motion.create(Comp)

    return (
      <MotionComp
        ref={setRef}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(
          buttonVariants({ variant, size, className }),
          // Cursor-tracked sheen: a soft light sweep that follows the pointer.
          // Neutral white overlay so it reads correctly on every color variant.
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
          "before:bg-[radial-gradient(120px_circle_at_var(--sheen-x,50%)_var(--sheen-y,50%),theme(colors.white/18%),transparent_70%)]"
        )}
        style={{ x: springX, y: springY }}
        whileTap={{ scale: 0.96 }}
        transition={springs.press}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
