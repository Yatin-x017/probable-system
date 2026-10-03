import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ThreeDMarqueeProps {
  images: string[]
  className?: string
}

// A tilted, drifting photo grid. Rebuilt from scratch (rather than porting
// Aceternity's original markup) because their version leans on Tailwind v4
// utilities (`transform-3d`, `rotate-x-*`) and magic pixel offsets tuned to
// their own demo's dimensions — neither of which holds up in a Tailwind v3
// project, and the offsets pushed the whole grid outside the visible box.
// This version only uses plain CSS (perspective + rotateX/rotateZ) applied
// via inline style, centered with flex, so there's nothing that can silently
// clip it out of view.
export function ThreeDMarquee({ images, className }: ThreeDMarqueeProps) {
  if (images.length === 0) return null

  // Repeat the uploaded images so the grid always has enough tiles to look
  // full, even if only 1-3 images have been uploaded so far.
  const MIN_TILES = 16
  const tileCount = Math.max(MIN_TILES, images.length)
  const tiles = Array.from({ length: tileCount }, (_, i) => images[i % images.length])

  const columns = 4
  const chunkSize = Math.ceil(tiles.length / columns)
  const chunks = Array.from({ length: columns }, (_, col) =>
    tiles.slice(col * chunkSize, col * chunkSize + chunkSize)
  )

  return (
    <div
      className={cn(
        'relative mx-auto h-[420px] sm:h-[520px] w-full overflow-hidden rounded-2xl bg-gray-50',
        className
      )}
      style={{ perspective: '1800px' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="grid grid-cols-4 gap-4 sm:gap-6"
          style={{
            width: '150%',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(50deg) rotateZ(35deg) scale(0.9)',
          }}
        >
          {chunks.map((col, colIndex) => (
            <motion.div
              key={colIndex}
              className="flex flex-col gap-4 sm:gap-6"
              animate={{ y: colIndex % 2 === 0 ? [0, -60, 0] : [0, 60, 0] }}
              transition={{
                duration: colIndex % 2 === 0 ? 9 : 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {col.map((src, rowIndex) => (
                <img
                  key={colIndex + '-' + rowIndex}
                  src={src}
                  alt="Work sample"
                  className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg ring-1 ring-black/5"
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fade the tilted grid into the section background at top/bottom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
    </div>
  )
}
