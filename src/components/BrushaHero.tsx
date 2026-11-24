// --- Component ---
'use client'

/**
 * Brusha: an illustrated studio hero. A coral line draws the wordmark and flies it into the navbar, a paper-textured
 * meadow scene sways on its own, the sun's eyes follow the cursor and the girl's sweater changes colour on hover.
 *
 * Content (brand, logo, navigation, copy, the two girl images) is passed as props; the demo supplies the original studio.
 *
 * Dependencies: motion (motion/react), lucide-react
 * Fonts: Archivo (800, variable width) for the headline and Figtree (400-700); load them in the host page, the component
 * falls back to system sans until they are available.
 *
 * Usage: <Brusha brand='Studio' logo={{ src, alt, width, height }} copy={{ headline: ['We make', 'visual stories'], ... }} />
 */

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType, CSSProperties, ReactNode, RefObject, SVGProps } from 'react'
import { animate, AnimatePresence, domAnimation, LazyMotion, m, MotionConfig, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { MotionStyle, TargetAndTransition, Transition, Variants } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'

// Joins the truthy class names; the block's classes are passed through untouched
const cn = (...classes: Array< string | false | null | undefined | Array< string | false | undefined > >): string =>
  classes.flat().filter(Boolean).join(' ')

/* ------------------------------ Props ------------------------------ */

export interface BrushaImage {
  /** Image URL */
  src: string
  /** Alternative text; empty for decorative images */
  alt: string
  /** Intrinsic width in px, used to reserve the space */
  width: number
  /** Intrinsic height in px, used to reserve the space */
  height: number
}

export interface BrushaCta {
  /** Visible label */
  label: string
  /** Link target */
  href: string
}

export interface BrushaProps {
  /** Brand name, used for the logo's accessible name and as the text fallback when no logo is given. Default: empty */
  brand?: string
  /** The red wordmark image, cropped to the ink on a transparent background (the intro draws it letter by letter). Omit for a text brand */
  logo?: BrushaImage
  /** The girl on the stone, cropped to her outline; hoverSrc is a copy with the sweater recoloured that fades in on hover. Omit to hide her */
  girl?: BrushaImage & { hoverSrc: string }
  /** Navigation links; they sit before the call-to-action on desktop and in a menu on phones. Default: none */
  navLinks?: Array< { label: string; href: string } >
  /** Hero copy: headline lines, description lines (broken where the reference breaks them on desktop) and the three buttons */
  copy?: {
    headline: string[]
    description: string[]
    navCta: BrushaCta
    primaryCta: BrushaCta
    secondaryCta: BrushaCta
  }
  /** Forces reduced motion on or off; by default the visitor's prefers-reduced-motion setting is used */
  reducedMotion?: boolean
  /** Extra classes for the outer wrapper */
  className?: string
}

/* ----------------------------- Defaults ----------------------------- */

/**
 * Brand intro, in seconds: a coral line draws across the screen centre and erases left to right as the letters
 * form, so it turns into the wordmark, which holds a beat, then travels and shrinks into its navbar slot.
 * The navbar links follow as it lands, then the hero (INTRO, which starts at INTRO_START)
 */
const NAV_INTRO = {
  // The wordmark's size at the centre
  centreScale: { desktop: 2.8, mobile: 2.2 },

  // The coral line draws left → right
  line: { delay: 0.3, duration: 0.9 },

  // The line erases left → right as the letters form
  transform: { start: 1.2, duration: 1.5 },
  letterDuration: 0.5,

  // How far along the erase each letter starts forming, measured along the line so the B waits for its loop
  letterAt: [0.18, 0.43, 0.68, 0.88],

  // Centre → navbar
  move: { delay: 3.2, duration: 1.2 },
  links: { start: 4.1, stagger: 0.09 },
  cta: 4.4,

  // The plain logo image takes over and the intro layer is removed
  done: 4.6,

  // The gaps between letters in the logo file, in px of its 600 width
  letterEdges: [0, 60, 80, 98, 150]
}

// The hero waits for the logo to land in the navbar
const INTRO_START = 4.4

/**
 * Motion. Times are in seconds. One easing for the whole intro, no springs that
 * overshoot: the hero should settle, never bounce
 */

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Load sequence after INTRO_START: nav → headline → description → CTA → background artwork →
 * small details. The last item lands about 1.3s in
 */
const INTRO = {
  duration: 0.75,

  // The navbar has its own sequence: NAV_INTRO
  nav: 0,
  headline: [INTRO_START + 0.08, INTRO_START + 0.15],
  description: INTRO_START + 0.26,
  cta: INTRO_START + 0.34,

  // Background pieces, staggered from here
  artworkStart: INTRO_START + 0.36,
  artworkStagger: 0.02,

  // The girl, a beat after the plants around her
  figure: INTRO_START + 0.6,

  // The sun comes down from above into place
  sun: { delay: INTRO_START + 0.3, duration: 1.3, from: -260 },

  // Bird, trail, star
  detailStart: INTRO_START + 0.68,
  detailStagger: 0.06
}

// Cursor follow for the sun's eyes (mouse/trackpad only); hover reactions live in hover-motion.ts
const GAZE = {
  // Max travel of the sun's eyes, in its own SVG units
  sunEyeX: 7,
  sunEyeY: 4,

  // Overdamped: no overshoot
  eyeSpring: { stiffness: 170, damping: 26, mass: 0.6 }
}

/**
 * Every object sits in one shared 1424 × 457 frame (the full card by the bottom strip the artwork grows from):
 * x / y are its top-left corner and w its width in frame units, its height follows the SVG's proportions and
 * rotate is in degrees. The frame scales with the card, so a move here applies on every screen size
 */
const ILLUSTRATION_FRAME = { width: 1424, height: 457 }

// flip mirrors the piece horizontally (e.g. the left plant cluster reused on the right)
type IllustrationSlotType = { x: number; y: number; w: number; rotate?: number; flip?: boolean }

const ILLUSTRATION_LAYOUT = {
  // Back
  groundBack: { x: 0, y: 0, w: 1424 },
  waves: { x: 0, y: 0, w: 1424 },
  ground: { x: 0, y: 0, w: 1424 },
  yellowCircle: { x: 1206, y: 96, w: 104 },
  star: { x: 1144, y: 56, w: 66 },
  rightPlant: { x: 1276, y: -4, w: 150 },
  leftPlants: { x: 180, y: 156, w: 300 },

  // Middle
  centerLeaves: { x: 728, y: 250, w: 160 },
  bird: { x: 866, y: 50, w: 190 },
  birdTrail: { x: 982, y: 110, w: 206 },

  // Front, right side: the left plant cluster mirrored, a grass band across the front, and flowers
  rightPlants: { x: 1000, y: 146, w: 300, flip: true },

  // The girl, seated on the stone (her seat is ~86% down the image, at the stone top)
  girl: { x: 520, y: 34, w: 260 },
  grass: { x: 430, y: 310, w: 1710 },

  // Flowers at the stone's right foot, balancing the coral flower and daisies on its left
  pinkFlowerStone: { x: 653, y: 318, w: 142 },
  whiteFlowersStone: { x: 766, y: 316, w: 164 },
  whiteFlowersRight: { x: 1078, y: 258, w: 150 },
  pinkFlowerRight: { x: 1186, y: 302, w: 132 },

  // Scattered gap-fillers, drawn in frame units across x −240…1664
  meadowFlowers: { x: -240, y: 0, w: 1904 },
  sun: { x: -24, y: 160, w: 248 },
  eyeCard: { x: 12, y: 304, w: 184, rotate: -11 },
  whiteFlowers: { x: 260, y: 252, w: 164 },

  // Gap-fillers at the foot of the left plants
  smallFlowers: { x: 210, y: 396, w: 190 },
  pinkFlower: { x: 402, y: 306, w: 142 }
} satisfies Record< string, IllustrationSlotType >


interface BrushaContextValue {
  BRAND: string
  GIRL: BrushaImage & { hoverSrc: string }
  LOGO: BrushaImage
  NAV_LINKS: Array< { label: string; href: string } >
  COPY: NonNullable< BrushaProps['copy'] >
  REDUCED: boolean | undefined
}

const BrushaContext = createContext< BrushaContextValue | null >(null)

const useBrusha = () => {
  const value = useContext(BrushaContext)

  if (!value) throw new Error('Brusha parts must render inside <Brusha>')

  return value
}

// The visitor's reduced-motion setting, unless the reducedMotion prop forces it
const useReduce = () => {
  const { REDUCED } = useBrusha()
  const system = useReducedMotion()

  return REDUCED ?? system
}

/* ----------------------------- Parts ----------------------------- */


/**
 * Motion for individual pieces of the artwork. Idle: plants and flowers sway, each on its own tempo, and the
 * star floats. Hover plays once when the mouse touches one leaf, flower, star or bird (Motion's hover ignores
 * touch) and eases back on leave; both are off for reduced motion (MotionConfig in hero-illustration)
 */

/**
 * An idle loop as `run`, `rest` and `still` variants, played by the illustration's `animate` label (hero-illustration):
 * `run` loops, `rest` holds the loop's first pose so a loop that starts again never jumps, and `still` (reduced
 * motion) leaves the element untransformed. Each loop is one `transform` string, so Motion runs it natively
 * (compositor) instead of on the main thread; the SVG elements carry `fillBox` styles for the same pivot Motion
 * would have given their independent rotate / scale
 */
type LoopType = { variants: Variants }

// The variant labels hero-illustration sets: idle loops run on screen and rest while off screen or the tab is hidden
const LOOPS_RUN = 'run'
const LOOPS_REST = 'rest'
const LOOPS_STILL = 'still'

const idleLoop = (frames: string[], transition: Transition): LoopType => ({
  variants: {
    [LOOPS_RUN]: { transform: frames, transition },
    [LOOPS_REST]: { transform: frames[0], transition: { duration: 0 } },
    [LOOPS_STILL]: { transform: frames[0].replace(/-?\d+(\.\d+)?(?=px|deg)/g, '0'), transition: { duration: 0 } }
  }
})

/**
 * Back-and-forth loop (what `repeatType: 'mirror'` did): out and back as one keyframe run, so it stays native.
 * The easing is given per segment, as Motion applied it to each leg before
 */
const mirrorLoop = (from: string, to: string, transition: Transition): LoopType =>
  idleLoop([from, to, from], {
    ...transition,
    duration: (transition.duration ?? 0) * 2,
    repeat: Infinity,
    ease: ['easeInOut', 'easeInOut']
  })

// The pivot Motion gave an SVG element's independent rotate / scale: its own box, at origin x / y (0 to 1)
const fillBox = (x: number, y: number) =>
  ({ transformBox: 'fill-box', transformOrigin: `${+(x * 100).toFixed(2)}% ${+(y * 100).toFixed(2)}%` }) as const

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Return to rest when the hover ends: a soft ease, never a spring overshoot
const SETTLE: Transition = { duration: 0.45, ease: EASE_OUT }

/**
 * A single leaf, as if lightly brushed: left → right → small rebound → centre.
 * Pivots at the leaf's base (each leaf is drawn upright from its base at 0,0)
 */
const LEAF_SWAY: TargetAndTransition = {
  rotate: [0, 6, -5, 2, 0],
  transition: { duration: 1.1, ease: 'easeInOut' }
}

const LEAF_ORIGIN = { originX: 0.5, originY: 1 }

// A flower head grows a little and holds while hovered
const FLOWER_POP: TargetAndTransition = {
  scale: 1.1,
  transition: { duration: 0.35, ease: EASE_OUT }
}

// Both suns grow a little while hovered
const SUN_POP: TargetAndTransition = {
  scale: 1.12,
  transition: { duration: 0.4, ease: EASE_OUT }
}

// The spiky sun's rays turn slowly, a full circle every minute
const SUN_SPIN = idleLoop(['rotate(0deg)', 'rotate(360deg)'], { duration: 60, repeat: Infinity, ease: 'linear' })

/**
 * The eye card blinks when hovered: the upper lid and pupil close onto the lower
 * lid and open again (a quick blink, then a softer second one)
 */
const EYE_BLINK: TargetAndTransition = {
  scaleY: [1, 0.06, 1, 1, 0.06, 1],
  transition: { duration: 0.75, times: [0, 0.14, 0.32, 0.6, 0.74, 1], ease: 'easeInOut' }
}

// The star grows a little while hovered
const STAR_POP: TargetAndTransition = {
  scale: 1.2,
  transition: { duration: 0.35, ease: EASE_OUT }
}

/**
 * Idle sway, clearly visible left ↔ right, with each plant on its own tempo, direction and start (from `seed`)
 * so the garden never moves in lockstep. `amp` is the lean each way in degrees, set by depth: foreground
 * plants sway most, flowers less, background leaves least
 */
const plantSway = (amp: number, seed: number): LoopType => {
  const lean = (deg: number) => `rotate(${deg}deg)`

  return mirrorLoop(seed % 2 ? lean(amp) : lean(-amp), seed % 2 ? lean(-amp) : lean(amp), {
    // Seconds per lean: 1–2.4s
    duration: 1 + (seed % 5) * 0.35,
    delay: (seed % 4) * 0.25
  })
}

// Idle float for the star: a slow drift up and down
const STAR_FLOAT = mirrorLoop('translateY(-4px)', 'translateY(4px)', { duration: 2.6 })

/**
 * Bluebird in flight, holding its position: the body hovers up and down while the
 * wing beats from the shoulder and the tail flutters with each beat
 */
const BIRD_HOVER = mirrorLoop('translateY(-5px)', 'translateY(5px)', { duration: 2.6 })

// Down-stroke (near horizontal) ↔ up-stroke, in degrees
const WING_FLAP = mirrorLoop('rotate(26deg)', 'rotate(-18deg)', { duration: 1.4 })

// The shoulder, where the wing meets the body
const WING_ORIGIN = fillBox(0.09, 0.9)

const TAIL_FLUTTER = mirrorLoop('rotate(-3deg)', 'rotate(3deg)', { duration: 0.9 })

// The tail's root at the body
const TAIL_ORIGIN = fillBox(0, 0.12)

// A sway pivots at its base, as LEAF_ORIGIN does for the hover
const LEAF_BOX = fillBox(0.5, 1)

// Hover: on top of the hovering flight, the bird bobs once, like a stronger wingbeat
const BIRD_BOB: TargetAndTransition = {
  y: [0, -12, 3, -5, 0],
  transition: { duration: 1.3, ease: 'easeInOut' }
}

const { LumoraGroundShapes, BLUE_HILLS } = (() => {



// Blue hill outlines, shared with LumoraBlueWaves, which draws the drifting ripples clipped to them unfiltered
const BLUE_HILLS = [
  {
    id: 'lumora-waves-left-edge',
    clip: 'M-720 457 L -720 300 C -560 286, -380 298, -240 290 C -180 270, -80 258, -10 276 C 50 292, 100 318, 120 360 L 130 457 Z',
    x0: -720,
    x1: 130,
    y0: 258,
    y1: 457
  },
  {
    id: 'lumora-waves-left',
    clip: 'M92 457 C 96 360, 128 282, 196 258 C 236 244, 268 262, 300 250 C 352 230, 392 214, 446 228 C 508 244, 548 290, 556 352 C 562 400, 560 430, 560 457 Z',
    x0: 92,
    x1: 560,
    y0: 214,
    y1: 457
  },
  {
    id: 'lumora-waves-right',
    clip: 'M700 457 C 706 360, 760 300, 840 284 C 900 272, 950 262, 1010 250 C 1060 240, 1100 238, 1140 238 C 1200 236, 1300 220, 1350 226 C 1400 232, 1424 250, 1440 262 L 2140 262 L 2140 457 Z',
    x0: 700,
    x1: 2140,
    y0: 220,
    y1: 457
  },
  {
    id: 'lumora-waves-right-edge',
    clip: 'M1288 457 C 1292 380, 1330 330, 1384 322 C 1404 320, 1418 324, 1424 328 L 2140 330 V457 Z',
    x0: 1288,
    x1: 2140,
    y0: 320,
    y1: 457
  }
]

const CORNER_LEAVES = [
  // reaching out past the left edge of the frame
  { x: -150, y: 470, angle: -18, len: 170, half: 46, fill: '#428458', vein: '#8fbb84' },
  { x: -70, y: 470, angle: 8, len: 196, half: 50, fill: '#28633c', vein: '#6f9f6a' },
  { x: -10, y: 470, angle: 34, len: 150, half: 44, fill: '#428458', vein: '#8fbb84' },
  { x: -210, y: 470, angle: -46, len: 130, half: 42, fill: '#28633c', vein: '#6f9f6a' },
  { x: 176, y: 470, angle: -34, len: 132, half: 50, fill: '#28633c', vein: '#4f9466' },
  { x: 250, y: 470, angle: 18, len: 124, half: 48, fill: '#2f6b44', vein: '#6f9f6a' },
  { x: 120, y: 470, angle: -70, len: 96, half: 40, fill: '#2f6b44', vein: '#6f9f6a' },
  { x: 1352, y: 470, angle: -28, len: 120, half: 48, fill: '#28633c', vein: '#4f9466' },
  { x: 1420, y: 470, angle: 22, len: 116, half: 46, fill: '#2f6b44', vein: '#6f9f6a' }
]

// Broad leaf with a rounded tip
const roundLeaf = (len: number, half: number) =>
  `M0 0 C ${half * 1.25} ${-len * 0.2} ${half * 1.1} ${-len * 0.95} 0 ${-len} C ${-half * 1.1} ${-len * 0.95} ${-half * 1.25} ${-len * 0.2} 0 0 Z`

type LumoraGroundShapesProps = SVGProps< SVGSVGElement > & {
  /**
   * 'back': the blue hills only; 'front': rock, bushes and leaves. The ripple
   * layer goes between them. Omitted: everything
   */
  layer?: 'back' | 'front'
}

/**
 * The ground the whole composition grows from, in the full 1424×457 frame: blue and green paper hills, the sandy
 * centre rock and broad rounded leaves in both bottom corners. Its edges run out to x −720…2140, so very wide,
 * short screens never see where they end
 */
const LumoraGroundShapes = ({ layer, ...props }: LumoraGroundShapesProps) => {
  return (
    <svg viewBox='0 0 1424 457' aria-hidden {...props}>
      {layer !== 'front' && (
        <>
          <g id='left-edge-fill'>
            <path
              d='M-720 457 L -720 300 C -560 286, -380 298, -240 290 C -180 270, -80 258, -10 276 C 50 292, 100 318, 120 360 L 130 457 Z'
              fill='#7fc9f0'
            />
            <path d='M-200 300 C -150 282, -80 278, -30 290 C -70 306, -140 312, -200 300 Z' fill='#b6daed' />
            <path
              d='M-560 296 C -500 284, -420 284, -370 292 C -420 304, -500 306, -560 296 Z'
              fill='#b6daed'
              opacity='0.8'
            />
            <path
              d='M-720 457 L -720 392 C -560 380, -400 374, -260 384 C -200 362, -160 352, -110 352 C -40 350, 30 380, 70 457 Z'
              fill='#2f6b44'
            />
            <path d='M-190 392 C -150 372, -96 370, -60 386 C -100 402, -150 404, -190 392 Z' fill='#4f9466' />
          </g>

          <g id='left-blue-hill'>
            <path
              d='M92 457 C 96 360, 128 282, 196 258 C 236 244, 268 262, 300 250 C 352 230, 392 214, 446 228 C 508 244, 548 290, 556 352 C 562 400, 560 430, 560 457 Z'
              fill='#7fc9f0'
            />
            <path
              d='M300 252 C 352 232, 400 220, 450 232 C 470 250, 446 280, 404 286 C 360 292, 316 280, 300 252 Z'
              fill='#b6daed'
            />
            <path
              d='M120 360 C 140 320, 190 300, 230 316 C 250 340, 220 372, 180 380 C 150 386, 124 380, 120 360 Z'
              fill='#b6daed'
              opacity='0.8'
            />
            <path
              d='M470 300 C 500 296, 534 318, 546 352 C 520 362, 486 350, 470 300 Z'
              fill='#5fb3ea'
              opacity='0.45'
            />
            <path
              id='left-edge-blue'
              d='M-40 352 C -30 300, 10 270, 50 282 C 80 292, 84 330, 60 350 C 30 368, -10 366, -40 352 Z'
              fill='#7fc9f0'
            />
          </g>

          {/**
           * Right meadow hill: the same light blue as the left hill, running from just right of the centre
           * rock, behind the right-hand plants and flowers, out past the frame edge
           */}
          <g id='right-meadow-hill'>
            <path
              d='M700 457 C 706 360, 760 300, 840 284 C 900 272, 950 262, 1010 250 C 1060 240, 1100 238, 1140 238 C 1200 236, 1300 220, 1350 226 C 1400 232, 1424 250, 1440 262 L 2140 262 L 2140 457 Z'
              fill='#7fc9f0'
            />
            <path d='M1090 250 C 1140 232, 1210 236, 1250 250 C 1210 266, 1140 268, 1090 250 Z' fill='#b6daed' />
            <path
              d='M1290 238 C 1330 226, 1380 230, 1410 244 C 1374 254, 1326 252, 1290 238 Z'
              fill='#b6daed'
              opacity='0.8'
            />
            <path d='M880 300 C 910 282, 950 276, 980 284 C 950 300, 914 308, 880 300 Z' fill='#b6daed' opacity='0.8' />
            <path
              d='M760 360 C 780 330, 810 318, 834 326 C 814 348, 786 362, 760 360 Z'
              fill='#5fb3ea'
              opacity='0.45'
            />
          </g>

          <g id='right-blue-hill'>
            <path
              d='M1288 457 C 1292 380, 1330 330, 1384 322 C 1404 320, 1418 324, 1424 328 L 2140 330 V457 Z'
              fill='#7fc9f0'
            />
            <path
              d='M1336 360 C 1360 340, 1396 338, 1424 348 V392 C 1394 396, 1356 384, 1336 360 Z'
              fill='#7fc9f0'
              opacity='0.7'
            />
            <path
              id='right-sky-patch'
              d='M1330 300 C 1334 252, 1372 222, 1424 218 L 2140 216 V 336 L 1330 336 Z'
              fill='#b6daed'
            />
          </g>
        </>
      )}

      {layer !== 'back' && (
        <>
          <g id='centre-rock'>
            <path
              d='M420 457 C 424 378, 470 302, 560 280 C 620 266, 720 264, 792 280 C 872 300, 914 372, 922 457 Z'
              fill='#eedfcd'
            />
            <path d='M486 326 C 540 296, 630 282, 724 286 C 650 304, 566 318, 486 326 Z' fill='#f6ecde' />
            <path
              d='M860 360 C 884 390, 900 420, 906 452'
              fill='none'
              stroke='#dccbb3'
              strokeWidth='4'
              strokeLinecap='round'
              opacity='0.6'
            />
            <g fill='#dccbb3' opacity='0.7'>
              <circle cx='560' cy='420' r='2.2' />
              <circle cx='610' cy='398' r='1.8' />
              <circle cx='680' cy='432' r='2.4' />
              <circle cx='742' cy='404' r='1.6' />
              <circle cx='800' cy='436' r='2' />
              <circle cx='640' cy='446' r='1.6' />
              <circle cx='716' cy='330' r='1.8' />
              <circle cx='600' cy='350' r='2' />
              <circle cx='800' cy='340' r='1.6' />
              <circle cx='536' cy='440' r='1.4' />
            </g>
          </g>

          <g id='front-bushes'>
            <path
              d='M128 457 C 132 412, 176 372, 232 368 C 270 366, 296 384, 320 380 C 360 372, 420 368, 460 396 C 484 414, 490 440, 488 457 Z'
              fill='#2f6b44'
            />
            <path d='M180 400 C 216 382, 268 384, 296 404 C 260 418, 210 418, 180 400 Z' fill='#4f9466' />
            <path
              d='M1290 457 C 1296 420, 1330 392, 1376 388 C 1400 386, 1416 390, 1424 394 L 2140 396 V457 Z'
              fill='#2f6b44'
            />
            <path d='M1318 420 C 1346 404, 1388 402, 1414 414 C 1390 428, 1346 432, 1318 420 Z' fill='#4f9466' />
            <path
              id='bush-under-flower'
              d='M1150 457 C 1168 418, 1218 400, 1268 406 C 1300 412, 1312 438, 1314 457 Z'
              fill='#28633c'
            />
          </g>

          <g id='corner-leaves'>
            {CORNER_LEAVES.map((leaf, i) => (
              <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
                {/* idle: sways on its own tempo; hover: this leaf alone sways harder. Both pivot at its base. */}
                <m.g {...plantSway(2.5, i + 3)} style={LEAF_BOX}>
                  <m.g whileHover={LEAF_SWAY} transition={SETTLE} style={LEAF_ORIGIN}>
                    <path d={roundLeaf(leaf.len, leaf.half)} fill={leaf.fill} />
                    <g fill='none' stroke={leaf.vein} strokeWidth='2' strokeLinecap='round'>
                      <path d={`M0 -4 L0 ${-leaf.len * 0.9}`} />
                      <path
                        d={`M0 ${-leaf.len * 0.35} L ${leaf.half * 0.6} ${-leaf.len * 0.55} M0 ${-leaf.len * 0.35} L ${-leaf.half * 0.6} ${-leaf.len * 0.55}`}
                      />
                      <path
                        d={`M0 ${-leaf.len * 0.6} L ${leaf.half * 0.5} ${-leaf.len * 0.78} M0 ${-leaf.len * 0.6} L ${-leaf.half * 0.5} ${-leaf.len * 0.78}`}
                      />
                    </g>
                  </m.g>
                </m.g>
              </g>
            ))}
          </g>
        </>
      )}
    </svg>
  )
}


  return { LumoraGroundShapes, BLUE_HILLS }
})()

const { LumoraBlueWaves } = (() => {



// One period of a wave, in frame units; travelling exactly one period loops seamlessly
const PERIOD = 80

// A long wavy line: one quadratic hump, then smooth repeats every half period
const wavePath = (x: number, y: number, cycles: number) =>
  `M${x} ${y} q ${PERIOD / 4} -5 ${PERIOD / 2} 0 ` +
  Array.from({ length: cycles * 2 - 1 }, () => `t ${PERIOD / 2} 0`).join(' ')

/**
 * Water-like ripples clipped to the blue hills, drifting sideways forever (alternate rows in opposite directions).
 * Its own layer outside the paper-texture filter, so the moving lines never force a re-filter; reduced motion
 * (MotionConfig) leaves them still. Same frame as the ground
 */
const LumoraBlueWaves = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 1424 457' aria-hidden {...props}>
      {BLUE_HILLS.map(({ id, clip, x0, x1, y0, y1 }) => {
        const rows = Array.from({ length: Math.floor((y1 - y0) / 30) }, (_, i) => y0 + 18 + i * 30)
        const start = x0 - PERIOD * 2
        const cycles = Math.ceil((x1 - start) / PERIOD) + 2

        return (
          <g key={id}>
            <clipPath id={id}>
              <path d={clip} />
            </clipPath>
            <g
              clipPath={`url(#${id})`}
              fill='none'
              stroke='#dcf1fc'
              strokeWidth='2.4'
              strokeLinecap='round'
              opacity='0.6'
            >
              {rows.map((y, i) => (
                <m.path
                  key={y}
                  d={wavePath(start + (i % 2) * (PERIOD / 2), y, cycles)}
                  {...idleLoop(['translateX(0px)', `translateX(${i % 2 ? PERIOD : -PERIOD}px)`], {
                    duration: 5 + (i % 3) * 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  })}
                />
              ))}
            </g>
          </g>
        )
      })}
    </svg>
  )
}


  return { LumoraBlueWaves }
})()

const { LumoraBirdTrail } = (() => {

// Looping ink line trailing behind the bird, drawn as a single path
const LumoraBirdTrail = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 206 96' fill='none' aria-hidden {...props}>
      <path
        d='M2 46 C 30 30, 60 14, 92 8 C 118 4, 128 14, 108 22 C 84 32, 82 46, 110 40 C 140 34, 132 54, 112 58 C 96 62, 108 72, 136 68 C 168 64, 196 66, 200 80 C 202 90, 190 93, 186 85'
        stroke='#141414'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}


  return { LumoraBirdTrail }
})()

const { LumoraBlueBird } = (() => {



/**
 * Paper-cut bluebird flying left, with separate groups for wing, tail, body, head and beak. It holds its
 * position: the body hovers, the wing flaps from the shoulder and the tail flutters, and hovering adds one bob
 */
const LumoraBlueBird = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 190 168' aria-hidden {...props}>
      {/* idle: hovering flight, bobbing gently in place */}
      <m.g id='bird-flight' {...BIRD_HOVER}>
        {/* hover: the bird bobs up and down once */}
        <m.g id='bird' whileHover={BIRD_BOB} transition={SETTLE}>
          <m.g id='tail' {...TAIL_FLUTTER} style={TAIL_ORIGIN}>
            <path
              d='M100 112 C 130 110, 160 104, 186 108 C 172 116, 162 120, 154 124 C 168 132, 174 140, 176 148 C 158 146, 146 142, 138 140 C 142 150, 140 160, 136 168 C 120 152, 108 134, 100 112 Z'
              fill='#3a98e8'
            />
            <path
              d='M120 120 L 170 112 M122 128 L 160 140 M118 132 L 134 158'
              stroke='#2e86d6'
              strokeWidth='1.5'
              opacity='0.7'
            />
          </m.g>

          <g id='body'>
            <ellipse cx='94' cy='98' rx='52' ry='30' transform='rotate(-12 94 98)' fill='#57acfa' />
            <path d='M50 104 C 70 122, 104 128, 130 116 C 108 136, 70 132, 50 104 Z' fill='#8cc4fb' />
          </g>

          {/* wing beats up and down from the shoulder */}
          <m.g id='wing' {...WING_FLAP} style={WING_ORIGIN}>
            <path
              d='M70 80 C 80 50, 110 20, 160 4 C 150 20, 150 30, 142 38 C 160 34, 172 36, 178 40 C 162 52, 152 58, 142 64 C 152 66, 158 72, 160 76 C 130 88, 100 92, 70 80 Z'
              fill='#68b2f8'
            />
            <path
              d='M84 74 L 150 14 M96 80 L 166 42 M108 84 L 152 72'
              stroke='#3a98e8'
              strokeWidth='1.5'
              opacity='0.7'
            />
          </m.g>

          <g id='head'>
            <circle cx='48' cy='80' r='25' fill='#57acfa' />
            <path id='beak' d='M26 75 L 1 85 L 26 91 Z' fill='#fd744a' />
            <circle id='eye' cx='42' cy='74' r='3.2' fill='#141414' />
          </g>
        </m.g>
      </m.g>
    </svg>
  )
}


  return { LumoraBlueBird }
})()

const { LumoraCenterLeaves } = (() => {



// A clump of leaves just right of the centre rock
type LeafType = { x: number; y: number; angle: number; len: number; half: number; tone: 'dark' | 'mid' }

const TONES = {
  dark: { fill: '#28633c', light: '#336f45', vein: '#6f9f6a' },
  mid: { fill: '#428458', light: '#4f9466', vein: '#8fbb84' }
}

const LEAVES: LeafType[] = [
  { x: 40, y: 207, angle: -6, len: 168, half: 30, tone: 'mid' },
  { x: 58, y: 207, angle: 14, len: 120, half: 24, tone: 'dark' },
  { x: 118, y: 207, angle: 22, len: 104, half: 24, tone: 'dark' },
  { x: 128, y: 207, angle: -18, len: 84, half: 20, tone: 'mid' }
]

const leafPath = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} C ${-half * 0.8} ${-len * 0.7} ${-half} ${-len * 0.22} 0 0 Z`

const halfPath = (len: number, half: number) => `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} Z`

const LumoraCenterLeaves = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 160 207' aria-hidden {...props}>
      {/* idle: the whole clump sways softly from its base; each leaf leans on top */}
      <m.g {...plantSway(2.5, 4)} style={fillBox(0.45, 1)}>
        {LEAVES.map((leaf, i) => {
          const tone = TONES[leaf.tone]

          return (
            <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
              {/* idle: sways on its own tempo; hover: this leaf alone sways harder. Both pivot at its base. */}
              <m.g {...plantSway(4, i + 2)} style={LEAF_BOX}>
                <m.g whileHover={LEAF_SWAY} transition={SETTLE} style={LEAF_ORIGIN}>
                  <path d={leafPath(leaf.len, leaf.half)} fill={tone.fill} />
                  <path d={halfPath(leaf.len, leaf.half)} fill={tone.light} />
                  <path d={`M0 0 L0 ${-leaf.len * 0.9}`} stroke={tone.vein} strokeWidth='1.5' strokeLinecap='round' />
                </m.g>
              </m.g>
            </g>
          )
        })}
      </m.g>
    </svg>
  )
}


  return { LumoraCenterLeaves }
})()

const { LumoraEyeCard } = (() => {



// Taped paper card with an ink-drawn eye that blinks when the card is hovered
const LumoraEyeCard = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 200 176' aria-hidden {...props}>
      <m.g id='eye-card' whileHover='blink'>
        <g id='card'>
          <rect x='6' y='14' width='188' height='162' rx='3' fill='#f8ede0' />
          <rect x='6' y='14' width='188' height='162' rx='3' fill='none' stroke='#ece0cf' strokeWidth='1.5' />
        </g>

        <g id='tape'>
          <rect
            x='16'
            y='2'
            width='30'
            height='42'
            rx='2'
            fill='#fdd15f'
            opacity='0.92'
            transform='rotate(-14 31 23)'
          />
        </g>

        <g id='eye-drawing' fill='none' stroke='#141414' strokeLinecap='round' strokeLinejoin='round'>
          <path id='brow' d='M56 60 C 80 44, 118 42, 146 56' strokeWidth='6' />
          <path id='lower-lid' d='M50 104 C 80 122, 124 122, 152 102' strokeWidth='2.5' />
          {/* upper lid + pupil close down onto the lower lid on hover */}
          <m.g
            id='eye-open'
            variants={{ blink: EYE_BLINK }}
            style={{ transformBox: 'view-box', transformOrigin: '104px 114px' }}
          >
            <path id='lid' d='M46 104 C 72 74, 124 70, 156 100' strokeWidth='4' />
            <circle id='iris' cx='104' cy='98' r='18' fill='#141414' stroke='none' />
            <circle cx='110' cy='92' r='4' fill='#f8ede0' stroke='none' />
          </m.g>
          <g id='lashes' strokeWidth='2.2'>
            <path d='M64 114 L 58 126' />
            <path d='M78 119 L 74 132' />
            <path d='M94 121 L 92 134' />
            <path d='M110 121 L 111 134' />
            <path d='M126 118 L 129 130' />
            <path d='M140 112 L 145 123' />
          </g>
        </g>
      </m.g>
    </svg>
  )
}


  return { LumoraEyeCard }
})()

const { LumoraGrass } = (() => {



/**
 * A band of grass from the front of the centre rock to the right edge, in frame units (viewBox x 430…2140,
 * y 310…457): low over the rock so the stone shows above it, a little taller beyond. Blades are grouped into
 * clumps that sway gently, each on its own tempo
 */
const GREENS = ['#28633c', '#428458', '#2f6b44', '#4f9466']
const GROUND = 457

// Blade height along x: low across the stone, a little taller beyond
const heightAt = (x: number, i: number) => {
  const wobble = [0, 14, -8, 20, -4, 10, -12][i % 7]

  // Low in front of the stone, so it shows above
  if (x < 930) return 44 + wobble * 0.6

  return 62 + wobble
}

const blade = (x: number, h: number, lean: number, w: number) =>
  `M${x - w} ${GROUND} C ${x - w * 0.4} ${GROUND - h * 0.5}, ${x + lean * 0.6} ${GROUND - h * 0.85}, ${x + lean} ${GROUND - h} C ${x + lean * 0.4} ${GROUND - h * 0.6}, ${x + w * 0.6} ${GROUND - h * 0.3}, ${x + w} ${GROUND} Z`

// Blades per swaying clump
const CLUMP = 6

const BLADES = Array.from({ length: 122 }, (_, i) => {
  const x = 440 + i * 14 + ((i * 7) % 5)
  const lean = [-10, 8, -4, 12, -7, 5, -12, 9][i % 8]

  return { x, h: heightAt(x, i), lean, w: (x < 820 ? 7 : 5) + (i % 3), fill: GREENS[i % GREENS.length] }
})

const CLUMPS = Array.from({ length: Math.ceil(BLADES.length / CLUMP) }, (_, c) =>
  BLADES.slice(c * CLUMP, c * CLUMP + CLUMP)
)

const LumoraGrass = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='430 310 1710 147' aria-hidden {...props}>
      {/* solid grass band behind the blades, low across the stone's foot */}
      <path
        id='grass-mound'
        d='M432 457 C 436 432, 460 422, 500 420 C 640 416, 800 416, 920 414 C 1000 414, 1300 410, 2140 412 L 2140 457 Z'
        fill='#2f6b44'
      />
      {CLUMPS.map((clump, c) => (
        <m.g key={c} id={`grass-clump-${c}`} {...plantSway(2.5, c + 20)} style={fillBox(0.5, 1)}>
          {clump.map(b => (
            <path key={b.x} d={blade(b.x, b.h, b.lean, b.w)} fill={b.fill} />
          ))}
        </m.g>
      ))}
    </svg>
  )
}


  return { LumoraGrass }
})()

const { LumoraIntroLine } = (() => {



// The wordmark's own red
const INK = '#e04a3c'

// From the moment the line starts drawing to the end of the erase
const SPAN = NAV_INTRO.transform.start + NAV_INTRO.transform.duration - NAV_INTRO.line.delay

/**
 * One coral line for the brand intro: drawn left → right (a loose curve with a loop over the B),
 * then erased left → right while the letters form where its tail passes
 */
const LumoraIntroLine = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 600 137' aria-hidden {...props}>
      <m.path
        id='intro-line'
        d='M-14 98 C 20 98, 44 44, 82 42 C 122 40, 136 90, 98 98 C 66 104, 58 66, 112 62 C 190 56, 250 106, 330 92 C 400 80, 430 58, 500 66 C 556 72, 588 96, 616 92'
        fill='none'
        stroke={INK}
        strokeWidth='11'
        strokeLinecap='round'
        strokeLinejoin='round'
        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 0, 1], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: SPAN,
          delay: NAV_INTRO.line.delay,
          times: [0, NAV_INTRO.line.duration / SPAN, (NAV_INTRO.transform.start - NAV_INTRO.line.delay) / SPAN, 1],

          // The erase runs at a steady pace, in step with the letters
          ease: ['easeOut', 'linear', 'linear'],

          // Fades out at the very end so the round cap of the emptied line leaves no dot
          opacity: {
            delay: NAV_INTRO.line.delay,
            duration: SPAN,
            times: [0, 0.04, 0.95, 1],
            ease: 'linear'
          }
        }}
      />
    </svg>
  )
}


  return { LumoraIntroLine }
})()

const { LumoraLeftPlants } = (() => {



// Cluster of tall cut-paper leaves behind the white and pink flowers
type LeafType = { x: number; y: number; angle: number; len: number; half: number; tone: 'dark' | 'mid' }

const TONES = {
  dark: { fill: '#28633c', light: '#336f45', vein: '#6f9f6a' },
  mid: { fill: '#428458', light: '#4f9466', vein: '#8fbb84' }
}

const LEAVES: LeafType[] = [
  // far left, leaning out
  { x: 46, y: 304, angle: -40, len: 128, half: 22, tone: 'dark' },
  { x: 66, y: 304, angle: -16, len: 176, half: 26, tone: 'mid' },

  { x: 92, y: 304, angle: -28, len: 150, half: 24, tone: 'dark' },

  // tall centre leaf, with a broad lighter one beside it
  { x: 116, y: 304, angle: -3, len: 262, half: 34, tone: 'dark' },
  { x: 142, y: 304, angle: 12, len: 206, half: 32, tone: 'mid' },
  { x: 200, y: 304, angle: 26, len: 150, half: 24, tone: 'dark' },

  // pair reaching up and right
  { x: 176, y: 112, angle: 36, len: 112, half: 20, tone: 'dark' },
  { x: 182, y: 140, angle: 64, len: 104, half: 19, tone: 'mid' },

  // low leaves at the pink flower's foot
  { x: 232, y: 304, angle: -14, len: 96, half: 20, tone: 'mid' },
  { x: 262, y: 304, angle: 34, len: 98, half: 20, tone: 'dark' }
]

const leafPath = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} C ${-half * 0.8} ${-len * 0.7} ${-half} ${-len * 0.22} 0 0 Z`

const halfPath = (len: number, half: number) => `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} Z`

const LumoraLeftPlants = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 300 304' aria-hidden {...props}>
      {/* idle: the whole cluster sways softly from its base; each leaf leans on top */}
      <m.g {...plantSway(2.5, 1)} style={fillBox(0.4, 1)}>
        <g id='stems' fill='none' stroke='#28633c' strokeWidth='4' strokeLinecap='round'>
          <path d='M168 304 C 168 240, 172 180, 178 120' />
        </g>

        <g id='leaves'>
          {LEAVES.map((leaf, i) => {
            const tone = TONES[leaf.tone]

            return (
              <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
                {/* idle: sways on its own tempo; hover: this leaf alone sways harder. Both pivot at its base. */}
                <m.g {...plantSway(4, i)} style={LEAF_BOX}>
                  <m.g whileHover={LEAF_SWAY} transition={SETTLE} style={LEAF_ORIGIN}>
                    <path d={leafPath(leaf.len, leaf.half)} fill={tone.fill} />
                    <path d={halfPath(leaf.len, leaf.half)} fill={tone.light} />
                    <path d={`M0 0 L0 ${-leaf.len * 0.9}`} stroke={tone.vein} strokeWidth='1.5' strokeLinecap='round' />
                  </m.g>
                </m.g>
              </g>
            )
          })}
        </g>
      </m.g>
    </svg>
  )
}


  return { LumoraLeftPlants }
})()

const { LumoraMeadowFlowers } = (() => {



type FlowerType = {
  id: string

  // Bloom centre
  x: number
  y: number
  petals: number
  len: number
  half: number
  fill: string
  stroke?: string
  core: number
  leaf?: 'left' | 'right'

  // Degrees each way
  sway: number

  // Tempo, direction and start
  seed: number
}

const FLOWERS: FlowerType[] = [
  // far left, beside the sun (wide screens)
  {
    id: 'meadow-flower-left-high',
    x: -97,
    y: 376,
    petals: 5,
    len: 14,
    half: 7,
    fill: '#ffffff',
    stroke: '#e6e3da',
    core: 4,
    leaf: 'right',
    sway: 4,
    seed: 10
  },
  {
    id: 'meadow-flower-left-low',
    x: -28,
    y: 431,
    petals: 6,
    len: 11,
    half: 5.5,
    fill: '#fec430',
    core: 3.5,
    leaf: 'left',
    sway: 4.5,
    seed: 11
  },

  // in the grass over the front of the centre rock
  {
    id: 'meadow-flower-rock-coral',
    x: 548,
    y: 418,
    petals: 6,
    len: 12,
    half: 6,
    fill: '#fd9d82',
    core: 3.8,
    leaf: 'right',
    sway: 4.5,
    seed: 16
  },
  {
    id: 'meadow-flower-rock-white',
    x: 618,
    y: 424,
    petals: 5,
    len: 13,
    half: 6.5,
    fill: '#ffffff',
    stroke: '#e6e3da',
    core: 4,
    leaf: 'left',
    sway: 4,
    seed: 17
  },

  // between the centre leaves
  {
    id: 'meadow-flower-centre',
    x: 822,
    y: 408,
    petals: 6,
    len: 17,
    half: 8,
    fill: '#fd9d82',
    core: 5,
    leaf: 'left',
    sway: 4,
    seed: 12
  },

  // in the right-hand meadow
  {
    id: 'meadow-flower-purple-foot',
    x: 1224,
    y: 417,
    petals: 5,
    len: 18,
    half: 8.5,
    fill: '#ffffff',
    stroke: '#e6e3da',
    core: 5.5,
    leaf: 'right',
    sway: 4,
    seed: 13
  },

  // on the right hill, a tall-stemmed bloom (wide screens)
  {
    id: 'meadow-flower-right-tall',
    x: 1456,
    y: 282,
    petals: 5,
    len: 22,
    half: 10,
    fill: '#c39cf0',
    core: 6,
    leaf: 'left',
    sway: 3,
    seed: 14
  },

  // far right foot (wide screens)
  {
    id: 'meadow-flower-right-low',
    x: 1489,
    y: 411,
    petals: 6,
    len: 14,
    half: 6.5,
    fill: '#fd9d82',
    core: 4,
    leaf: 'right',
    sway: 4.5,
    seed: 15
  }
]

// Stems run down to the frame's bottom edge
const GROUND = 457

const petal = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.3} ${half} ${-len * 0.85} 0 ${-len} C ${-half} ${-len * 0.85} ${-half} ${-len * 0.3} 0 0 Z`

const leafPath = (f: FlowerType) => {
  const y = f.y + (GROUND - f.y) * 0.55
  const dir = f.leaf === 'left' ? -1 : 1

  return `M${f.x} ${y} C ${f.x + dir * 10} ${y - 9}, ${f.x + dir * 22} ${y - 8}, ${f.x + dir * 26} ${y - 2} C ${f.x + dir * 18} ${y + 4}, ${f.x + dir * 8} ${y + 4}, ${f.x} ${y} Z`
}

/**
 * Extra flowers filling the meadow's gaps, in the frame's own units (viewBox x −240…1664, so the ones past its
 * edges show on wide screens). Each sways from the base of its stem and grows a little when hovered
 */
const LumoraMeadowFlowers = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='-240 0 1904 457' aria-hidden {...props}>
      {FLOWERS.map(f => (
        <m.g key={f.id} id={f.id} {...plantSway(f.sway, f.seed)} style={fillBox(0.5, 1)}>
          <path
            d={`M${f.x} ${f.y + 4} C ${f.x - 1} ${f.y + (GROUND - f.y) * 0.4}, ${f.x + 2} ${f.y + (GROUND - f.y) * 0.7}, ${f.x + 1} ${GROUND}`}
            fill='none'
            stroke='#2f6b44'
            strokeWidth='3'
            strokeLinecap='round'
          />
          {f.leaf && <path d={leafPath(f)} fill='#428458' />}
          <m.g whileHover={FLOWER_POP} transition={SETTLE}>
            <g transform={`translate(${f.x} ${f.y})`}>
              {Array.from({ length: f.petals }, (_, i) => (
                <path
                  key={i}
                  d={petal(f.len, f.half)}
                  transform={`rotate(${(360 / f.petals) * i + 18})`}
                  fill={f.fill}
                  stroke={f.stroke ?? 'none'}
                  strokeWidth='1.2'
                />
              ))}
              <circle r={f.core} fill='#fec108' />
              <circle r={f.core * 0.45} cx={-f.core * 0.2} cy={-f.core * 0.2} fill='#fed659' />
            </g>
          </m.g>
        </m.g>
      ))}
    </svg>
  )
}


  return { LumoraMeadowFlowers }
})()

const { LumoraPaperTexture } = (() => {

/**
 * Filter definitions only: each piece (.lm-piece) gets a mottled watercolour / cut-paper texture clipped to its
 * outline, padded for shapes that overhang their box. Brightness-neutral: each noise layer scales the colour by
 * (1 − k/2 + k·noise), so it lightens and darkens around the true colour instead of dimming it
 */
const LumoraPaperTexture = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg width='0' height='0' aria-hidden focusable='false' style={{ position: 'absolute' }} {...props}>
      <filter id='lumora-paper' x='-20%' y='-20%' width='140%' height='140%' colorInterpolationFilters='sRGB'>
        {/* soft blotches, like pigment pooling in watercolor paper */}
        <feTurbulence type='fractalNoise' baseFrequency='0.018 0.024' numOctaves='3' seed='7' result='blotNoise' />
        <feColorMatrix in='blotNoise' type='matrix' values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1' result='blot' />
        <feComposite
          in='SourceGraphic'
          in2='blot'
          operator='arithmetic'
          k1='0.22'
          k2='0.89'
          k3='0'
          k4='0'
          result='blotted'
        />

        {/* fine fibre grain */}
        <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' seed='3' result='grainNoise' />
        <feColorMatrix
          in='grainNoise'
          type='matrix'
          values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1'
          result='grain'
        />
        <feComposite
          in='blotted'
          in2='grain'
          operator='arithmetic'
          k1='0.12'
          k2='0.94'
          k3='0'
          k4='0'
          result='textured'
        />

        <feComposite in='textured' in2='SourceGraphic' operator='in' />
      </filter>
      {/* same texture, for the ground and grass that reach far past the frame */}
      <filter id='lumora-paper-wide' x='-55%' y='-20%' width='210%' height='140%' colorInterpolationFilters='sRGB'>
        {/* soft blotches, like pigment pooling in watercolor paper */}
        <feTurbulence type='fractalNoise' baseFrequency='0.018 0.024' numOctaves='3' seed='7' result='blotNoise' />
        <feColorMatrix in='blotNoise' type='matrix' values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1' result='blot' />
        <feComposite
          in='SourceGraphic'
          in2='blot'
          operator='arithmetic'
          k1='0.22'
          k2='0.89'
          k3='0'
          k4='0'
          result='blotted'
        />

        {/* fine fibre grain */}
        <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' seed='3' result='grainNoise' />
        <feColorMatrix
          in='grainNoise'
          type='matrix'
          values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1'
          result='grain'
        />
        <feComposite
          in='blotted'
          in2='grain'
          operator='arithmetic'
          k1='0.12'
          k2='0.94'
          k3='0'
          k4='0'
          result='textured'
        />

        <feComposite in='textured' in2='SourceGraphic' operator='in' />
      </filter>
    </svg>
  )
}


  return { LumoraPaperTexture }
})()

const { LumoraPinkFlower } = (() => {



/**
 * Coral layered bloom: a back row of broad rounded petals fanned upward and a
 * paler front row, sitting in a cup of leaves
 */
const BACK = [-78, -54, -30, -8, 14, 36, 58, 80].map((angle, i) => ({
  angle,
  len: [56, 70, 80, 84, 84, 78, 68, 54][i],
  half: 17,
  fill: i % 2 ? '#fd8b70' : '#fd9d82'
}))

const FRONT = [-56, -24, 6, 34, 62].map((angle, i) => ({
  angle,
  len: [44, 54, 58, 52, 42][i],
  half: 16,
  fill: i % 2 ? '#fcaf93' : '#fdbba0'
}))

// Broad petal with a rounded, slightly squared tip
const petal = (len: number, half: number) =>
  `M0 0 C ${half * 1.3} ${-len * 0.25} ${half * 1.2} ${-len} 0 ${-len} C ${-half * 1.2} ${-len} ${-half * 1.3} ${-len * 0.25} 0 0 Z`

const LumoraPinkFlower = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 142 160' aria-hidden {...props}>
      {/* idle: the whole plant sways on its own tempo from its base; hover still grows the head */}
      <m.g {...plantSway(5, 6)} style={fillBox(0.5, 1)}>
        <g id='stem' fill='none' stroke='#28633c' strokeWidth='4' strokeLinecap='round'>
          <path d='M70 110 C 70 130, 72 146, 74 160' />
        </g>

        {/* hover: the bloom grows a little, from its base */}
        <m.g id='bloom' whileHover={FLOWER_POP} transition={SETTLE} style={{ originX: 0.5, originY: 0.9 }}>
          <g id='back-petals' transform='translate(71 108)'>
            {BACK.map((p, i) => (
              <g key={i} transform={`rotate(${p.angle})`}>
                <path d={petal(p.len, p.half)} fill={p.fill} />
                <path d={`M0 -8 L0 ${-p.len * 0.82}`} stroke='#f2705a' strokeWidth='1.3' opacity='0.55' />
              </g>
            ))}
          </g>

          <g id='front-petals' transform='translate(71 110)'>
            {FRONT.map((p, i) => (
              <g key={i} transform={`rotate(${p.angle})`}>
                <path d={petal(p.len, p.half)} fill={p.fill} />
                <path d={`M0 -6 L0 ${-p.len * 0.78}`} stroke='#f58e76' strokeWidth='1.2' opacity='0.6' />
              </g>
            ))}
          </g>
        </m.g>

        <g id='base-leaves'>
          <path d='M70 126 C 50 110, 20 108, 6 118 C 22 136, 52 140, 70 126 Z' fill='#428458' />
          <path d='M72 128 C 92 112, 124 110, 138 120 C 122 138, 92 142, 72 128 Z' fill='#2f6b44' />
        </g>
      </m.g>
    </svg>
  )
}


  return { LumoraPinkFlower }
})()

const { LumoraRightPlant } = (() => {



/**
 * Tall leafy stalk on the card's right edge: broad lance leaves alternating up
 * one stem, a few tiny yellow buds at its foot
 */
type LeafType = { x: number; y: number; angle: number; len: number; half: number; tone: 'dark' | 'mid' }

const TONES = {
  dark: { fill: '#28633c', light: '#336f45', vein: '#6f9f6a' },
  mid: { fill: '#428458', light: '#4f9466', vein: '#8fbb84' }
}

const LEAVES: LeafType[] = [
  { x: 86, y: 96, angle: -10, len: 96, half: 26, tone: 'dark' },
  { x: 98, y: 122, angle: 34, len: 98, half: 25, tone: 'mid' },
  { x: 82, y: 190, angle: -38, len: 102, half: 27, tone: 'mid' },
  { x: 96, y: 212, angle: 44, len: 100, half: 26, tone: 'dark' },
  { x: 82, y: 280, angle: -50, len: 96, half: 25, tone: 'dark' },
  { x: 98, y: 302, angle: 50, len: 90, half: 24, tone: 'mid' },
  { x: 86, y: 362, angle: -60, len: 80, half: 22, tone: 'mid' }
]

const leafPath = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} C ${-half * 0.8} ${-len * 0.7} ${-half} ${-len * 0.22} 0 0 Z`

const halfPath = (len: number, half: number) => `M0 0 C ${half} ${-len * 0.22} ${half * 0.8} ${-len * 0.7} 0 ${-len} Z`

const LumoraRightPlant = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 150 452' aria-hidden {...props}>
      {/* idle: the whole stalk sways softly from its base, and each leaf leans on top of that */}
      <m.g {...plantSway(2.5, 7)} style={fillBox(0.65, 1)}>
        <g id='stem' fill='none' stroke='#28633c' strokeWidth='4.5' strokeLinecap='round'>
          <path d='M100 452 C 96 330, 90 200, 86 90' />
        </g>

        <g id='leaves'>
          {LEAVES.map((leaf, i) => {
            const tone = TONES[leaf.tone]

            return (
              <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
                {/* idle: sways on its own tempo; hover: this leaf alone sways harder. Both pivot at its base. */}
                <m.g {...plantSway(4, i + 5)} style={LEAF_BOX}>
                  <m.g whileHover={LEAF_SWAY} transition={SETTLE} style={LEAF_ORIGIN}>
                    <path d={leafPath(leaf.len, leaf.half)} fill={tone.fill} />
                    <path d={halfPath(leaf.len, leaf.half)} fill={tone.light} />
                    <path d={`M0 0 L0 ${-leaf.len * 0.9}`} stroke={tone.vein} strokeWidth='1.5' strokeLinecap='round' />
                  </m.g>
                </m.g>
              </g>
            )
          })}
        </g>

        <g id='buds' fill='#f8c630'>
          <circle cx='126' cy='402' r='5' />
          <circle cx='138' cy='396' r='4' />
          <circle cx='144' cy='410' r='4.5' />
        </g>
      </m.g>
    </svg>
  )
}


  return { LumoraRightPlant }
})()

const { LumoraSmallFlowers } = (() => {



/**
 * Two small flowers filling the gaps at the foot of the left plants: a white
 * daisy and a coral bloom. Each sways on its own and grows a little on hover
 */
const petal = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.3} ${half} ${-len * 0.85} 0 ${-len} C ${-half} ${-len * 0.85} ${-half} ${-len * 0.3} 0 0 Z`

type BloomProps = {
  cx: number
  cy: number
  petals: number
  len: number
  half: number
  fill: string
  stroke?: string
  core: number
}

const Bloom = ({ cx, cy, petals, len, half, fill, stroke, core }: BloomProps) => (
  <g transform={`translate(${cx} ${cy})`}>
    {Array.from({ length: petals }, (_, i) => (
      <path
        key={i}
        d={petal(len, half)}
        transform={`rotate(${(360 / petals) * i + 18})`}
        fill={fill}
        stroke={stroke ?? 'none'}
        strokeWidth='1.2'
      />
    ))}
    <circle r={core} fill='#fec108' />
    <circle r={core * 0.45} cx={-core * 0.2} cy={-core * 0.2} fill='#fed659' />
  </g>
)

const LumoraSmallFlowers = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 190 61' aria-hidden {...props}>
      {/* small white daisy, under the daisies above it */}
      <m.g id='small-flower-daisy' {...plantSway(4, 8)} style={fillBox(0.5, 1)}>
        <g fill='none' stroke='#2f6b44' strokeWidth='3' strokeLinecap='round'>
          <path d='M32 46 C 32 52, 33 57, 34 61' />
        </g>
        <path d='M33 56 C 24 50, 14 50, 10 54 C 16 59, 26 60, 33 56 Z' fill='#428458' />
        <m.g whileHover={FLOWER_POP} transition={SETTLE}>
          <Bloom cx={32} cy={38} petals={5} len={17} half={8} fill='#ffffff' stroke='#e6e3da' core={5} />
        </m.g>
      </m.g>

      {/* small coral bloom, next to the coral flower */}
      <m.g id='small-flower-coral' {...plantSway(4, 9)} style={fillBox(0.5, 1)}>
        <g fill='none' stroke='#2f6b44' strokeWidth='3' strokeLinecap='round'>
          <path d='M154 44 C 155 51, 155 56, 156 61' />
        </g>
        <path d='M155 54 C 164 47, 175 47, 180 51 C 173 57, 162 58, 155 54 Z' fill='#2f6b44' />
        <m.g whileHover={FLOWER_POP} transition={SETTLE}>
          <Bloom cx={154} cy={36} petals={6} len={15} half={7} fill='#fd9d82' core={4.5} />
        </m.g>
      </m.g>
    </svg>
  )
}


  return { LumoraSmallFlowers }
})()

const { LumoraStar } = (() => {



// Small five-point paper star above the right plant
const LumoraStar = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 66 64' aria-hidden {...props}>
      {/* idle: floats up and down; hover: grows a little */}
      <m.g {...STAR_FLOAT}>
        <m.g whileHover={STAR_POP} transition={SETTLE}>
          <path
            d='M33 2 L41.5 22.5 L63 24 L46.5 38.5 L52 61 L33 49 L13.5 61.5 L19.5 38.5 L3 24.5 L24.5 22 Z'
            fill='#fec405'
            strokeLinejoin='round'
            stroke='#fec405'
            strokeWidth='3'
          />
          <path d='M33 10 L38 23.5 L33 40 Z' fill='#fed659' />
        </m.g>
      </m.g>
    </svg>
  )
}


  return { LumoraStar }
})()

const { LumoraSunCharacter } = (() => {



/**
 * Spiky paper-cut sun with two oval eyes; the spikes are slightly uneven on purpose. Its rays turn slowly
 * around the face (the face and eyes stay upright), and the whole sun grows a little on hover
 */
const CENTER = { x: 118, y: 96 }
const SPIKES = 9
const OUTER = [104, 92, 108, 96, 102, 90, 106, 98, 94]
const INNER = 54

const spikePoints = Array.from({ length: SPIKES * 2 }, (_, i) => {
  const angle = (i / (SPIKES * 2)) * Math.PI * 2 - Math.PI / 2
  const r = i % 2 === 0 ? OUTER[i / 2] : INNER

  return `${(CENTER.x + Math.cos(angle) * r).toFixed(1)},${(CENTER.y + Math.sin(angle) * r).toFixed(1)}`
}).join(' ')

type LumoraSunCharacterProps = SVGProps< SVGSVGElement > & {
  // Cursor-follow for the eyes (from the gaze hook); static without it
  eyesStyle?: MotionStyle
}

const LumoraSunCharacter = ({ eyesStyle, ...props }: LumoraSunCharacterProps) => {
  return (
    <svg viewBox='0 0 232 196' aria-hidden {...props}>
      <m.g
        id='sun'
        whileHover={SUN_POP}
        transition={SETTLE}
        style={{ transformBox: 'view-box', transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
      >
        <g id='sun-body'>
          <m.g
            id='sun-rays'
            {...SUN_SPIN}
            style={{ transformBox: 'view-box', transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
          >
            <polygon points={spikePoints} fill='#fec405' stroke='#fec405' strokeWidth='4' strokeLinejoin='round' />
          </m.g>
          <circle cx={CENTER.x} cy={CENTER.y} r='58' fill='#fec405' />
          <path d='M78 70 C 90 50, 118 42, 140 48 C 116 54, 96 62, 78 70 Z' fill='#fed659' />
        </g>

        {/* eyes follow the cursor */}
        <m.g id='sun-eyes' fill='#141414' style={eyesStyle}>
          <ellipse cx='102' cy='106' rx='6.5' ry='13' />
          <ellipse cx='132' cy='106' rx='6.5' ry='13' />
        </m.g>
      </m.g>
    </svg>
  )
}


  return { LumoraSunCharacter }
})()

const { LumoraWhiteFlowers } = (() => {



// One large and one small white daisy on green stems
const petal = (len: number, half: number) =>
  `M0 0 C ${half} ${-len * 0.3} ${half} ${-len * 0.85} 0 ${-len} C ${-half} ${-len * 0.85} ${-half} ${-len * 0.3} 0 0 Z`

const Daisy = ({
  cx,
  cy,
  petals,
  len,
  half,
  core
}: {
  cx: number
  cy: number
  petals: number
  len: number
  half: number
  core: number
}) => (
  <g transform={`translate(${cx} ${cy})`}>
    {Array.from({ length: petals }, (_, i) => (
      <path
        key={i}
        d={petal(len, half)}
        transform={`rotate(${(360 / petals) * i + 12})`}
        fill='#ffffff'
        stroke='#e6e3da'
        strokeWidth='1.5'
      />
    ))}
    <circle r={core} fill='#fec108' />
    <circle r={core * 0.45} cx={-core * 0.2} cy={-core * 0.2} fill='#fed659' />
  </g>
)

const LumoraWhiteFlowers = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 164 210' aria-hidden {...props}>
      {/* idle: the whole plant sways on its own tempo from its base; hover still grows the head */}
      <m.g {...plantSway(3, 2)} style={fillBox(0.5, 1)}>
        <g id='stems' fill='none' stroke='#2f6b44' strokeWidth='4' strokeLinecap='round'>
          <path d='M107 70 C 104 120, 98 160, 94 210' />
          <path d='M37 128 C 40 160, 46 186, 50 210' />
        </g>
        <g id='stem-leaves'>
          <path d='M100 150 C 116 130, 140 128, 150 134 C 138 150, 116 156, 100 150 Z' fill='#428458' />
          <path d='M44 176 C 30 160, 12 158, 4 164 C 14 178, 32 182, 44 176 Z' fill='#28633c' />
        </g>

        {/* hover: each daisy head grows a little on its own */}
        <m.g id='large-daisy' whileHover={FLOWER_POP} transition={SETTLE}>
          <Daisy cx={107} cy={56} petals={6} len={48} half={20} core={11} />
        </m.g>
        <m.g id='small-daisy' whileHover={FLOWER_POP} transition={SETTLE}>
          <Daisy cx={37} cy={116} petals={5} len={30} half={13} core={7} />
        </m.g>
      </m.g>
    </svg>
  )
}


  return { LumoraWhiteFlowers }
})()

const { LumoraYellowCircle } = (() => {



// A hand-cut yellow sun disc, slightly out of round, that grows a little on hover
const LumoraYellowCircle = (props: SVGProps< SVGSVGElement >) => {
  return (
    <svg viewBox='0 0 104 104' aria-hidden {...props}>
      <m.g whileHover={SUN_POP} transition={SETTLE}>
        <path
          d='M52 3 C 80 2, 102 24, 101 53 C 100 80, 78 102, 50 101 C 23 100, 2 78, 3 51 C 4 24, 25 4, 52 3 Z'
          fill='#fec430'
        />
        <path d='M20 30 C 30 14, 52 8, 70 12 C 52 18, 34 26, 20 30 Z' fill='#fdd15f' />
      </m.g>
    </svg>
  )
}


  return { LumoraYellowCircle }
})()




type EntranceType = {
  delay?: number

  // Starting offset: px, or a string such as '100%' for a masked line reveal
  y?: number | string
  scale?: number
  duration?: number
}

// The custom properties .lm-enter (index.css) reads for one element's entrance
const revealStyle = ({ delay = 0, y = 16, scale = 1, duration = INTRO.duration }: EntranceType) =>
  ({
    '--lm-delay': `${delay}s`,
    '--lm-dur': `${duration}s`,
    '--lm-y': typeof y === 'number' ? `${y}px` : y,
    '--lm-s': scale
  }) as CSSProperties

type HeroRevealProps = {
  children: ReactNode
  delay?: number
  y?: number | string
  as?: 'div' | 'span'
  className?: string
}

/**
 * One-shot entrance used by the copy: fade in while sliding into place. A CSS animation, so it plays
 * from the first paint rather than after hydration, and the copy stays server-rendered
 */
const HeroReveal = ({ children, delay = 0, y = 16, as: Tag = 'div', className }: HeroRevealProps) => {
  return (
    <Tag style={revealStyle({ delay, y })} className={cn('lm-enter', className)}>
      {children}
    </Tag>
  )
}






const clamp = (v: number) => Math.min(1, Math.max(-1, v))

/**
 * The sun's eyes follow the cursor, read relative to the closest <section> around `anchorRef` and normalised
 * to −1…1 through Motion values, so moving the mouse never re-renders React. Overdamped springs, mouse and
 * trackpad only, back to rest when the cursor leaves, and off for reduced motion
 */
const useCursorGaze = (anchorRef: RefObject< HTMLElement | null >) => {
  // Hooks
  const reduce = useReduce()

  const nx = useMotionValue(0)
  const ny = useMotionValue(0)

  const x = useSpring(
    useTransform(nx, v => v * GAZE.sunEyeX),
    GAZE.eyeSpring
  )

  const y = useSpring(
    useTransform(ny, v => v * GAZE.sunEyeY),
    GAZE.eyeSpring
  )

  useEffect(() => {
    const hero = anchorRef.current?.closest('section')

    if (!hero || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    // The hero's rect is cached: re-read only on the first move after a resize or a scroll, never on every move
    let r = hero.getBoundingClientRect()
    let stale = false

    const markStale = () => {
      stale = true
    }

    const resizeObserver = new ResizeObserver(markStale)

    resizeObserver.observe(hero)
    window.addEventListener('scroll', markStale, { passive: true })
    window.addEventListener('resize', markStale)

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return

      if (stale) {
        r = hero.getBoundingClientRect()
        stale = false
      }

      nx.set(clamp(((e.clientX - r.left) / r.width) * 2 - 1))
      ny.set(clamp(((e.clientY - r.top) / r.height) * 2 - 1))
    }

    const handlePointerLeave = () => {
      nx.set(0)
      ny.set(0)
    }

    hero.addEventListener('pointermove', handlePointerMove)
    hero.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', markStale)
      window.removeEventListener('resize', markStale)
      hero.removeEventListener('pointermove', handlePointerMove)
      hero.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [anchorRef, reduce, nx, ny])

  return { sunEyesStyle: { x, y } }
}






const LETTERS = ['y', 'a', 't', 's']

/**
 * Brand intro and navbar logo as one element: the wordmark is measured in its navbar slot, offset to a larger
 * size at the screen centre, formed from slices of the real logo as a coral line erases, then animated back
 * into the slot so it lands pixel-identical; reduced motion shows the logo in the navbar from the start
 */
const LogoIntro = () => {
  const { LOGO } = useBrusha()

  // States
  const [done, setDone] = useState(false)

  // Refs
  const ref = useRef< HTMLSpanElement >(null)

  // Hooks
  const reduce = useReduce()

  // Vars
  const t = (delay: number, duration: number) => (reduce ? { duration: 0 } : { delay, duration, ease: EASE })
  const edges = NAV_INTRO.letterEdges.map(e => (e / LOGO.width) * 100)
  const size = 'h-5 w-auto md:h-[max(19px,calc(1.5*var(--u)))]'

  // Measures the navbar slot before the first paint and starts from the screen centre
  useLayoutEffect(() => {
    const el = ref.current

    if (!el) return

    if (reduce) {
      // The logo is simply there, in the navbar
      setDone(true)

      return
    }

    // Measured with no transform on it, so a re-run (React's dev double-run, a re-mount) reads the slot itself
    el.style.transform = 'none'

    const r = el.getBoundingClientRect()
    const big = window.innerWidth < 768 ? NAV_INTRO.centreScale.mobile : NAV_INTRO.centreScale.desktop

    // The slot's own centre; scaling about the centre doesn't move it
    const slotX = r.left + r.width / 2
    const slotY = r.top + r.height / 2

    // Starts at the screen centre, then travels into the slot as one native transform
    const from = `translate(${window.innerWidth / 2 - slotX}px, ${window.innerHeight / 2 - slotY}px) scale(${big})`

    el.style.transform = from

    const { delay, duration } = NAV_INTRO.move
    const move = animate(el, { transform: [from, 'translate(0px, 0px) scale(1)'] }, { delay, duration, ease: EASE })
    const handOff = window.setTimeout(() => setDone(true), NAV_INTRO.done * 1000)

    return () => {
      move.stop()
      window.clearTimeout(handOff)
    }
  }, [reduce])

  const img = (className: string, style?: CSSProperties, alt = '') => (
    <img
      src={LOGO.src}
      alt={alt}
      width={LOGO.width}
      height={LOGO.height}
      fetchPriority='high'
      decoding='async'
      className={className}
      style={style}
    />
  )

  if (done) return img(cn('block', size), undefined, LOGO.alt)

  return (
    <span ref={ref} className='relative block'>
      {/* The final image holds the navbar space; it shows once the intro is done */}
      {img(cn('block opacity-0', size), undefined, LOGO.alt)}

      <LumoraIntroLine className='pointer-events-none absolute inset-0 h-full w-full overflow-visible' />

      {/* The letters: slices of the real wordmark, forming where the line passes */}
      <span id='brusha-letters' className='absolute inset-0'>
        {LETTERS.map((l, i) => {
          const first = i === 0
          const delay = NAV_INTRO.transform.start + NAV_INTRO.letterAt[i] * NAV_INTRO.transform.duration

          return (
            <m.span
              key={l}
              id={`letter-${l}`}
              className='absolute inset-0'
              initial={{ opacity: 0, transform: `translateY(4px) scale(${first ? 0.9 : 0.94})` }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              transition={t(delay, NAV_INTRO.letterDuration)}
              style={{ clipPath: `inset(-20% ${100 - edges[i + 1]}% -20% ${edges[i]}%)` }}
            >
              {img('block h-full w-auto')}
            </m.span>
          )
        })}
      </span>
    </span>
  )
}







/**
 * The wordmark paints in (LogoIntro), then the links and the Get in touch button fade up, each holding its
 * final space from the start so nothing shifts. Below 768px the links move into a small menu that closes on
 * a link tap, Escape or the toggle; reduced motion shows everything at once
 */
const HeroNavbar = () => {
  const { BRAND, LOGO, NAV_LINKS, COPY } = useBrusha()

  // States
  const [open, setOpen] = useState(false)

  // Hooks
  const reduce = useReduce()

  // Vars

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleToggle = () => {
    setOpen(v => !v)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <header className='lm-pad-x relative z-20 flex items-center justify-between pt-[max(16px,calc(1.7*var(--u)))]'>
      <a href='#top' className='lm-nav-logo flex shrink-0 items-center' aria-label={`${BRAND} home`}>
        {LOGO.src ? <LogoIntro /> : BRAND}
      </a>

      {/* Links sit on the right, just before the Get in touch button */}
      <div className='flex items-center gap-2.5 md:gap-[max(24px,calc(2.9*var(--u)))]'>
        <nav aria-label='Primary' className='hidden md:block'>
          <ul className='lm-nav-list flex items-center gap-[max(24px,calc(2.9*var(--u)))] text-[max(14px,calc(0.97*var(--u)))] font-medium'>
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.label}
                style={revealStyle({ delay: NAV_INTRO.links.start + i * NAV_INTRO.links.stagger, y: 6, duration: 0.4 })}
                className='lm-enter'
              >
                <a href={link.href} className='lm-nav-link'>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* The wrapper animates, so the button's own hover lift (CSS transform) stays intact */}
        <div style={revealStyle({ delay: NAV_INTRO.cta, y: 5, scale: 0.96, duration: 0.45 })} className='lm-enter'>
          <a
            href={COPY.navCta.href}
            className='lm-nav-cta bg-lm-primary flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-white sm:gap-2.5 sm:px-[18px] md:h-[max(36px,calc(2.65*var(--u)))] md:px-[max(18px,calc(1.4*var(--u)))] md:text-[max(14px,calc(1.06*var(--u)))]'
          >
            {COPY.navCta.label}
            <ArrowRight aria-hidden className='lm-nav-arrow size-4' strokeWidth={2} />
          </a>
        </div>

        {/* On phones the links live in a small menu */}
        <button
          type='button'
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls='lm-mobile-menu'
          onClick={handleToggle}
          style={revealStyle({ delay: NAV_INTRO.cta, y: 5, duration: 0.45 })}
          className='lm-enter border-lm-ink/15 text-lm-ink flex size-10 shrink-0 items-center justify-center rounded-full border md:hidden'
        >
          {open ? <X aria-hidden className='size-[18px]' /> : <Menu aria-hidden className='size-[18px]' />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id='lm-mobile-menu'
            aria-label='Primary'
            className='lm-pad-x absolute inset-x-0 top-full z-30 mt-3 md:hidden'
            initial={{ opacity: 0, transform: 'translateY(-8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-8px)' }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: EASE }}
          >
            <ul className='bg-lm-card border-lm-ink/10 ml-auto flex w-full max-w-[280px] flex-col rounded-2xl border p-2 shadow-[0_18px_40px_-20px_rgb(18_18_18/0.35)]'>
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={handleClose}
                    className='hover:text-lm-primary focus-visible:text-lm-primary block rounded-xl px-4 py-3 text-[16px] font-medium'
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  )
}





const HeroContent = () => {
  const { COPY } = useBrusha()

  return (
    <div className='lm-copy lm-pad-x relative z-10 pt-[max(40px,calc(3*var(--u)))]'>
      <h1 className='lm-headline flex flex-col'>
        {/**
         * Each line slides up from behind its own mask; the small padding keeps the glyph tops
         * from being clipped by the tight line-height, and the flex column lets the negative
         * margins cancel it exactly instead of collapsing
         */}
        {COPY.headline.map((line, i) => (
          <span key={line} className='-my-[0.06em] block overflow-hidden py-[0.06em] md:whitespace-nowrap'>
            <HeroReveal as='span' delay={INTRO.headline[i] ?? 0} y='100%' className='block'>
              {line}
            </HeroReveal>
          </span>
        ))}
      </h1>

      <HeroReveal delay={INTRO.description}>
        <p className='lm-description text-lm-body mt-[max(16px,calc(1.1*var(--u)))] max-w-[550px] md:w-fit md:max-w-none md:pl-[calc(0.15*var(--u))]'>
          {COPY.description.map(line => (
            <span key={line} className='md:block'>
              {line}{' '}
            </span>
          ))}
        </p>
      </HeroReveal>

      <HeroReveal delay={INTRO.cta}>
        <div className='mt-[max(20px,calc(1.4*var(--u)))] flex flex-wrap items-center gap-x-[max(24px,calc(2.3*var(--u)))] gap-y-4'>
          <a
            href={COPY.primaryCta.href}
            className='lm-primary-cta bg-lm-primary flex h-11 items-center gap-3 rounded-full px-6 text-[15px] font-medium text-white md:h-[max(40px,calc(2.9*var(--u)))] md:px-[max(22px,calc(1.75*var(--u)))] md:text-[max(15px,calc(1.1*var(--u)))]'
          >
            {COPY.primaryCta.label}
            <ArrowRight aria-hidden className='lm-primary-arrow size-4' strokeWidth={2} />
          </a>
          <a
            href={COPY.secondaryCta.href}
            className='text-[15px] font-medium underline decoration-[1.5px] underline-offset-[7px] md:text-[max(15px,calc(1.15*var(--u)))]'
          >
            {COPY.secondaryCta.label}
          </a>
        </div>
      </HeroReveal>
    </div>
  )
}









type PieceName = keyof typeof ILLUSTRATION_LAYOUT

type PieceType = {
  name: PieceName
  Svg: ComponentType< SVGProps< SVGSVGElement > >

  // Minor decoration, dropped on phones where the strip is cropped to its centre
  minor?: boolean

  // Entrance group: background artwork, or a small detail that lands last
  enter?: 'artwork' | 'figure' | 'sun' | 'detail'

  // Drawn outside the paper-texture filter (for continuously moving layers)
  bare?: boolean

  // Reaches far past the frame's edges (needs the wider texture filter region)
  wide?: boolean

  /**
   * Reacts to hover on its own shapes (a leaf sways, a flower or the star grows,
   * the bird bobs). Only the element under the mouse reacts
   */
  hover?: boolean
}

// The ground in two layers, with the ripples on the blue hills between them
const LumoraGroundBack = (props: SVGProps< SVGSVGElement >) => <LumoraGroundShapes layer='back' {...props} />
const LumoraGroundFront = (props: SVGProps< SVGSVGElement >) => <LumoraGroundShapes layer='front' {...props} />

/**
 * Paint order, back to front. Each entry is its own positioned layer, so any
 * one object can be targeted (data-piece) and animated on its own
 */
const PIECES: PieceType[] = [
  // Back
  { name: 'groundBack', Svg: LumoraGroundBack, wide: true },
  { name: 'waves', Svg: LumoraBlueWaves, bare: true },
  { name: 'ground', Svg: LumoraGroundFront, hover: true, wide: true },
  { name: 'yellowCircle', Svg: LumoraYellowCircle, hover: true },
  { name: 'star', Svg: LumoraStar, minor: true, enter: 'detail', hover: true },
  { name: 'leftPlants', Svg: LumoraLeftPlants, hover: true },

  // Middle
  { name: 'centerLeaves', Svg: LumoraCenterLeaves, hover: true },
  { name: 'birdTrail', Svg: LumoraBirdTrail, minor: true, enter: 'detail' },
  { name: 'bird', Svg: LumoraBlueBird, enter: 'detail', hover: true },

  // Rendered as an <img> (see below)
  { name: 'girl', Svg: LumoraGrass, enter: 'figure' },
  { name: 'grass', Svg: LumoraGrass, wide: true },
  { name: 'pinkFlowerStone', Svg: LumoraPinkFlower, hover: true },

  // Across the front, over the rock's foot
  { name: 'whiteFlowersStone', Svg: LumoraWhiteFlowers, hover: true },

  // Right-hand foliage sits in front of the grass, up on the slope
  { name: 'rightPlant', Svg: LumoraRightPlant, hover: true },

  // The left cluster, mirrored
  { name: 'rightPlants', Svg: LumoraLeftPlants, hover: true },
  { name: 'whiteFlowersRight', Svg: LumoraWhiteFlowers, hover: true },
  { name: 'pinkFlowerRight', Svg: LumoraPinkFlower, hover: true },

  // Front
  { name: 'meadowFlowers', Svg: LumoraMeadowFlowers, hover: true },
  { name: 'sun', Svg: LumoraSunCharacter, enter: 'sun' },
  { name: 'eyeCard', Svg: LumoraEyeCard, hover: true },
  { name: 'whiteFlowers', Svg: LumoraWhiteFlowers, hover: true },
  { name: 'smallFlowers', Svg: LumoraSmallFlowers, hover: true },
  { name: 'pinkFlower', Svg: LumoraPinkFlower, hover: true }
]

const pct = (value: number, of: number) => `${(value / of) * 100}%`

// Entrance per piece: the artwork rises from the bottom in paint order and the small details land last
const entrance = (piece: PieceType, artworkIndex: number, detailIndex: number) => {
  if (piece.enter === 'sun')
    return { delay: INTRO.sun.delay, y: INTRO.sun.from, scale: 1, duration: INTRO.sun.duration }
  if (piece.enter === 'figure') return { delay: INTRO.figure, y: 35, scale: 0.97 }
  if (piece.enter === 'detail') return { delay: INTRO.detailStart + detailIndex * INTRO.detailStagger, y: 18, scale: 1 }

  return { delay: INTRO.artworkStart + artworkIndex * INTRO.artworkStagger, y: 40, scale: 1 }
}

const HeroIllustration = () => {
  const { GIRL } = useBrusha()

  const { REDUCED } = useBrusha()

  // States

  // The idle loops (plants, waves, sun, star, bird) play only while the artwork is on screen and the tab is visible
  const [loopsRun, setLoopsRun] = useState(true)

  // Refs
  const ref = useRef< HTMLDivElement >(null)

  // Hooks
  const { sunEyesStyle } = useCursorGaze(ref)
  const reduce = useReduce()

  useEffect(() => {
    const element = ref.current

    if (!element) return

    let onScreen = true

    const sync = () => setLoopsRun(onScreen && !document.hidden)

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })

    observer.observe(element)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  // Vars
  const { width, height } = ILLUSTRATION_FRAME

  let artworkIndex = 0
  let detailIndex = 0

  // reducedMotion='user': hover reactions skip their movement for visitors who ask for less motion
  return (
    <MotionConfig reducedMotion={REDUCED === undefined ? 'user' : REDUCED ? 'always' : 'never'}>
      <m.div
        ref={ref}
        aria-hidden
        animate={reduce ? LOOPS_STILL : loopsRun ? LOOPS_RUN : LOOPS_REST}
        className='lm-illustration pointer-events-none z-0 select-none'
      >
        <LumoraPaperTexture />
        {PIECES.map(piece => {
          const { name, Svg, minor } = piece
          const slot: IllustrationSlotType = ILLUSTRATION_LAYOUT[name]
          const enter = entrance(piece, artworkIndex, detailIndex)

          if (piece.enter === 'detail') detailIndex++
          else if (piece.enter !== 'figure' && piece.enter !== 'sun') artworkIndex++

          return (
            <div
              key={name}
              data-piece={name}
              className={cn('lm-enter absolute', minor && 'hidden sm:block')}
              style={{
                left: pct(slot.x, width),
                top: pct(slot.y, height),
                width: pct(slot.w, width),
                rotate: `${slot.rotate ?? 0}deg`,
                transform: slot.flip ? 'scaleX(-1)' : undefined,
                ...revealStyle(enter)
              }}
            >
              {/**
               * The paper texture sits on this inner layer, so the entrance moves an already-textured layer
               * instead of re-filtering it every frame. On hover the girl's sweater changes colour: a recoloured
               * copy fades in on top
               */}
              {name === 'girl' ? !GIRL.src ? null : (
                <div className='group pointer-events-auto relative'>
                  <img
                    src={GIRL.src}
                    alt={GIRL.alt}
                    width={GIRL.width}
                    height={GIRL.height}
                    decoding='async'
                    className='block h-auto w-full'
                  />
                  <img
                    src={GIRL.hoverSrc}
                    alt=''
                    width={GIRL.width}
                    height={GIRL.height}
                    decoding='async'
                    className='absolute inset-0 block h-auto w-full opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100'
                  />
                </div>
              ) : name === 'sun' ? (
                <div className='lm-piece lm-touchable'>
                  <LumoraSunCharacter className='block h-auto w-full overflow-visible' eyesStyle={sunEyesStyle} />
                </div>
              ) : (
                <div
                  className={cn(
                    !piece.bare && ['lm-piece', piece.wide && 'lm-piece-wide', piece.hover && 'lm-touchable']
                  )}
                >
                  <Svg className='block h-auto w-full overflow-visible' />
                </div>
              )}
            </div>
          )
        })}
      </m.div>
    </MotionConfig>
  )
}



const HeroSection = () => {
  return (
    <section className='lm-card lm-grain bg-lm-card font-lm-sans text-lm-ink relative isolate flex w-full flex-col overflow-hidden antialiased'>
      <HeroNavbar />
      <HeroContent />
      <HeroIllustration />
    </section>
  )
}


/* ----------------------------- Root ----------------------------- */

const BLOCK_CSS = `/* Theme tokens of the block (its @theme), scoped to the component */
[data-slot='brusha'],
.lm-card {
  --color-lm-card: #f8f6f1;
  --color-lm-ink: #121212;
  --color-lm-body: #4a4a48;
  --color-lm-primary: #d24b3e;
  --color-lm-primary-deep: #b93f33;

  --font-lm-display: 'Archivo', 'Arial Black', ui-sans-serif, system-ui, sans-serif;
  --font-lm-sans: 'Figtree', ui-sans-serif, system-ui, sans-serif;
}

/* The utilities the block's @theme generated (bg-lm-card, text-lm-ink, font-lm-sans, ...), defined here because the host's Tailwind does not know these tokens */
@layer utilities {
  .border-lm-ink\\/10 {
    border-color: color-mix(in srgb, #121212 10%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklab, var(--color-lm-ink) 10%, transparent);
    }
  }
  .border-lm-ink\\/15 {
    border-color: color-mix(in srgb, #121212 15%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklab, var(--color-lm-ink) 15%, transparent);
    }
  }
  .bg-lm-card {
    background-color: var(--color-lm-card);
  }
  .bg-lm-primary {
    background-color: var(--color-lm-primary);
  }
  .font-lm-sans {
    font-family: var(--font-lm-sans);
  }
  .text-lm-body {
    color: var(--color-lm-body);
  }
  .text-lm-ink {
    color: var(--color-lm-ink);
  }
  @media (hover: hover) {
    .hover\\:text-lm-primary:hover {
      color: var(--color-lm-primary);
    }
  }
  .focus-visible\\:text-lm-primary:focus-visible {
    color: var(--color-lm-primary);
  }
}

/* ---------- Hero ----------
   Full-bleed size container. Every measurement inside is in --u, one layout unit:
   1% of the hero's width, so type, spacing and artwork scale together like the
   reference. (Custom properties resolve where they're used, so cqw here still
   measures this container.) */
.lm-card {
  container-type: inline-size;
  --u: 1cqw;
  min-height: 100svh;
}

/* Desktop is exactly one screen with no scroll. The layout needs 64 units of
   height (copy ≤ 36u, then a clear gap above the artwork's tallest left-hand
   piece, the sun, which reaches ~22u up from the bottom). On screens wider than
   that proportion the unit follows the height instead (100svh / 64 ≈ 1.5625svh),
   so the copy and the artwork can never collide. */
@media (min-width: 1024px) {
  .lm-card {
    --u: min(1cqw, 1.5625svh);
    height: 100svh;
  }
}

/* One-shot entrance for the copy, nav and artwork: fade in while sliding (and scaling) into place.
   CSS, not motion, so it plays from the first paint instead of waiting for hydration. Each element
   sets --lm-delay, --lm-dur, --lm-y and --lm-s (revealStyle in hero-reveal.tsx). Fill 'backwards':
   nothing lingers once it has played. */
.lm-enter {
  animation: lm-enter var(--lm-dur, 0.75s) cubic-bezier(0.22, 1, 0.36, 1) var(--lm-delay, 0s) backwards;
}

@keyframes lm-enter {
  from {
    opacity: 0;
    translate: 0 var(--lm-y, 16px);
    scale: var(--lm-s, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-enter {
    animation: none;
  }
}

/* Paper grain over the card and the artwork: the collage texture without images. */
.lm-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.3 0 0 0 0 0.25 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
  opacity: 0.22;
}

.lm-pad-x {
  padding-left: max(20px, calc(2.5 * var(--u)));
  padding-right: max(20px, calc(2.25 * var(--u)));
}

/* Breathing room between the buttons and the artwork on phones. */
.lm-copy {
  padding-bottom: 28px;
}

/* The copy box reaches down over the artwork (its bottom padding keeps the text
   clear of it), so the box itself ignores the pointer and only the real text and
   links take it. Otherwise it would swallow hovers meant for the plants and flowers. */
.lm-copy {
  pointer-events: none;
}

.lm-copy h1,
.lm-copy p,
.lm-copy a {
  pointer-events: auto;
}

/* ---------- Type ---------- */
.lm-headline {
  font-family: var(--font-lm-display);
  font-weight: 800;
  font-stretch: 107%;
  font-size: calc(13cqw - 1px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.lm-description {
  font-size: 16px;
  line-height: 1.4;
}

/* ---------- Illustration ----------
   Mobile: the strip sits under the copy, drawn wider than the card and centred on
   the centre of the composition, and the edges crop away.
   From 768px it is pinned to the card's bottom edge at full width. */
.lm-illustration {
  position: relative;
  /* phones: drawn wider than the screen and cropped, centred on the girl, who sits
     at ~45.6% of the strip: margin = 50% − 0.456 × width */
  width: 240%;
  margin-left: -59.5%;
  margin-top: auto; /* pinned to the bottom of the screen-tall hero */
  aspect-ratio: 1424 / 457;
}

/* Paper texture per piece (defined by LumoraPaperTexture). Per piece rather than on
   the whole strip, so a moving leaf only re-filters its own piece, not everything. */
.lm-piece {
  filter: url(#lumora-paper);
}

/* layers that run far past the frame's edges (ground, grass) get a wider filter region */
.lm-piece.lm-piece-wide {
  filter: url(#lumora-paper-wide);
}

/* The artwork ignores the pointer (so it never blocks the copy or CTAs), except
   the painted shapes of the plants, flowers, star and bird: hover follows their outlines,
   not their boxes. */
.lm-touchable svg * {
  pointer-events: visiblePainted;
}

/* large phones / small tablets: a little less zoom, so the strip isn't too tall */
@media (min-width: 480px) {
  .lm-illustration {
    width: 190%;
    margin-left: -36.6%;
  }
}

@media (min-width: 640px) {
  .lm-illustration {
    width: 165%;
    margin-left: -25.2%;
  }
}

/* short phones: a slightly smaller strip so the hero needs less scrolling */
@media (max-width: 479px) and (max-height: 700px) {
  .lm-illustration {
    width: 210%;
    margin-left: -45.8%;
  }
}

@media (min-width: 768px) {
  .lm-headline {
    font-size: calc(8.8 * var(--u) - 1px);
    line-height: 0.9;
  }

  .lm-description {
    font-size: clamp(15px, calc(1.32 * var(--u)), 21px);
    line-height: 1.25;
  }

  /* The copy column fills the space between the nav and the artwork. */
  .lm-copy {
    padding-left: calc(2 * var(--u));

    /* Reserve the artwork's height (~22u at the sun) plus a 2u gap, and centre
       the copy in what's left: tight screens keep it under the nav, taller ones
       get even space above and below instead of one big hole over the artwork. */
    padding-bottom: calc(24 * var(--u));
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .lm-illustration {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    margin: 0;
  }
}

/* Same unit as the copy, centred: full width until the height limit kicks in. */
@media (min-width: 1024px) {
  .lm-illustration {
    left: 50%;
    width: calc(100 * var(--u));
    translate: -50% 0;
  }
}

/* Portrait tablets: a full-width strip would leave the artwork tiny under a tall
   empty page, so draw it 1.5× wide, cropped and centred on the composition (its centre sits at
   45% of the strip), give the headline more size, and reserve the taller strip. */
@media (min-width: 768px) and (orientation: portrait) {
  .lm-headline {
    font-size: calc(10 * var(--u) - 1px);
  }

  .lm-copy {
    padding-bottom: calc(36 * var(--u));
  }

  .lm-illustration {
    left: -29.8%; /* 175% wide, still centred on the girl */
    width: 175%;
    translate: none;
  }
}

/* ---------- Navigation hover ----------
   Links: the hovered one turns brand primary and an underline draws in from the
   left and leaves to the right; the other links and the logo stay as they are. Get in touch:
   the brand-red pill (same as View our work) lifts a pixel with a soft shadow and deepens, its arrow turns to ↗,
   and it presses in slightly when clicked. Focus-visible shows the same
   states for keyboard users; hover styles only apply where hover exists. */
.lm-nav-link {
  position: relative;
  display: inline-block;
  padding-block: 4px;
  transition:
    opacity 0.25s ease,
    color 0.25s ease;
}

.lm-nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1.5px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.lm-nav-link:focus-visible {
  color: var(--color-lm-primary);
}

.lm-nav-link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

.lm-nav-logo,
.lm-nav-cta {
  transition:
    opacity 0.25s ease,
    background-color 0.25s ease,
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease;
}

.lm-nav-cta:active {
  transform: scale(0.97);
}

.lm-nav-arrow {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.lm-nav-cta:focus-visible .lm-nav-arrow {
  transform: translateX(2px) rotate(-45deg);
}

@media (hover: hover) {
  /* The hovered link turns brand primary; the underline follows (currentColor). */
  .lm-nav-link:hover {
    color: var(--color-lm-primary);
  }

  .lm-nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .lm-nav-cta:hover {
    background-color: var(--color-lm-primary-deep);
    transform: translateY(-1px);
    box-shadow: 0 10px 22px -12px rgb(210 75 62 / 0.65);
  }

  .lm-nav-cta:hover:active {
    transform: translateY(0) scale(0.97);
  }

  .lm-nav-cta:hover .lm-nav-arrow {
    transform: translateX(2px) rotate(-45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-nav-link::after,
  .lm-nav-arrow,
  .lm-nav-cta {
    transition: none;
  }

  .lm-nav-cta:hover,
  .lm-nav-cta:active {
    transform: none;
  }
}

/* ---------- Primary CTA (View our work) ----------
   Brand primary fill. Hover: lifts a pixel with a soft primary-tinted shadow,
   deepens, and the arrow turns to ↗ — the same language as the nav button. */
.lm-primary-cta {
  transition:
    background-color 0.25s ease,
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease;
}

.lm-primary-cta:active {
  transform: scale(0.97);
}

.lm-primary-arrow {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.lm-primary-cta:focus-visible .lm-primary-arrow {
  transform: translateX(2px) rotate(-45deg);
}

@media (hover: hover) {
  .lm-primary-cta:hover {
    background-color: var(--color-lm-primary-deep);
    transform: translateY(-1px);
    box-shadow: 0 12px 26px -12px rgb(210 75 62 / 0.65);
  }

  .lm-primary-cta:hover:active {
    transform: translateY(0) scale(0.97);
  }

  .lm-primary-cta:hover .lm-primary-arrow {
    transform: translateX(2px) rotate(-45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-primary-cta,
  .lm-primary-arrow {
    transition: none;
  }

  .lm-primary-cta:hover,
  .lm-primary-cta:active {
    transform: none;
  }
}
`

const EMPTY_IMAGE = { src: '', alt: '', width: 1, height: 1 }

const Brusha = ({
  brand = '',
  logo,
  girl,
  navLinks = [],
  copy = {
    headline: [],
    description: [],
    navCta: { label: '', href: '#' },
    primaryCta: { label: '', href: '#' },
    secondaryCta: { label: '', href: '#' }
  },
  reducedMotion,
  className
}: BrushaProps) => {
  const value: BrushaContextValue = {
    BRAND: brand,
    GIRL: girl ?? { ...EMPTY_IMAGE, hoverSrc: '' },
    LOGO: logo ?? EMPTY_IMAGE,
    NAV_LINKS: navLinks,
    COPY: copy,
    REDUCED: reducedMotion
  }

  return (
    <BrushaContext.Provider value={value}>
      <LazyMotion features={domAnimation}>
        <style>{BLOCK_CSS}</style>
        <div data-slot='brusha' className={className} style={FILL}>
          <HeroSection />
        </div>
      </LazyMotion>
    </BrushaContext.Provider>
  )
}

// Fills its container even inside a centring flex/grid host
const FILL = { width: '100%' } as const

export { Brusha }
export default Brusha

