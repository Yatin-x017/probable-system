// Shared motion language for the entire app.
// Every interactive element should pull its transitions from here so that
// hovers, presses, and reveals all feel like one physical system instead of
// a pile of unrelated CSS transitions.

import { useRef } from "react"
import { useScroll, useTransform, useReducedMotion, type Transition, type Variants, type MotionValue } from "framer-motion"

/**
 * Spring presets. Named by feel, not by number, so usage stays readable:
 *   transition={springs.snappy}
 */
export const springs = {
  // Small UI controls: buttons, toggles, checkboxes. Fast settle, tiny overshoot.
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  } satisfies Transition,

  // Cards, modals, nav — slightly slower and heavier so it reads as "weight".
  smooth: {
    type: "spring",
    stiffness: 260,
    damping: 26,
    mass: 0.9,
  } satisfies Transition,

  // Hero content, page-level reveals. Noticeable overshoot, unhurried settle.
  bouncy: {
    type: "spring",
    stiffness: 210,
    damping: 18,
    mass: 1,
  } satisfies Transition,

  // Press feedback. Near-instant, almost no bounce — presses shouldn't wobble.
  press: {
    type: "spring",
    stiffness: 650,
    damping: 40,
    mass: 0.5,
  } satisfies Transition,
} as const

/** Standard hover/tap scale values shared by every clickable element. */
export const pressable = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.975 },
} as const

/** Fade-up reveal used for scroll-triggered content. Pair with viewport={{ once: true }}. */
export const revealUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: springs.smooth,
} as const

/** Reduced-motion variant of revealUp: fade only, no translation, no spring overshoot. */
const revealUpReduced = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.15 },
} as const

/**
 * Reduced-motion-aware version of `revealUp`. Prefer this over the raw
 * `revealUp` export at every call site — it's the single place that checks
 * `prefers-reduced-motion` so individual pages don't have to remember to.
 *   <motion.h2 {...useRevealUp()}>
 */
export function useRevealUp() {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? revealUpReduced : revealUp
}

/**
 * Stagger container + item pair for scroll-triggered lists (skill groups,
 * timeline entries, card grids). Pair the container with whileInView so the
 * whole group only staggers once, the first time it enters view.
 *   <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
 *     <motion.div variants={staggerItem} /> ...
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: springs.smooth },
}

/** Reduced-motion variants: no stagger delay, no translation, quick fade. */
const staggerContainerReduced: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0, delayChildren: 0 } },
}
const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
}

/**
 * Reduced-motion-aware version of the `staggerContainer`/`staggerItem` pair.
 * Same single-checkpoint rationale as `useRevealUp`.
 *   const stagger = useStagger()
 *   <motion.div variants={stagger.container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
 *     <motion.div variants={stagger.item} /> ...
 */
export function useStagger(): { container: Variants; item: Variants } {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion
    ? { container: staggerContainerReduced, item: staggerItemReduced }
    : { container: staggerContainer, item: staggerItem }
}

/**
 * Route-level page transition. A plain tween, not a spring — an exit
 * animation has to finish predictably and fully, where a spring's tail
 * would linger or get cut off mid-settle when the next route mounts.
 * Kept understated (small y-shift, no scale) so it reads as "the page
 * settled in" rather than a slide/wipe gimmick.
 */
export const pageTransition: Transition = {
  duration: 0.32,
  ease: [0.4, 0, 0.2, 1],
}
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/** Clamp a value between min/max — used for magnetic-hover offset math. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Scroll-linked parallax offset for a single element — real choreography,
 * not just a viewport fade. Tracks the element's own progress through the
 * viewport and returns a `y` MotionValue to feed into `style={{ y }}`.
 * Respects prefers-reduced-motion by collapsing to a flat 0.
 */
export function useParallax(distance = 60): { ref: React.RefObject<HTMLElement | null>; y: MotionValue<number> } {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-distance, distance])
  return { ref, y }
}
