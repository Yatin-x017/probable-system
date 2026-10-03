import { motion } from 'framer-motion'

const COLORS = ['#4A90E2', '#FF6B6B', '#FFD93D']
const PIECES = 24

export default function Confetti() {
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const angle = (i / PIECES) * Math.PI * 2 + Math.random() * 0.4
    const distance = 90 + Math.random() * 140
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance - 40
    const color = COLORS[i % COLORS.length]
    const size = 6 + Math.random() * 5
    const rotate = Math.random() * 360

    return (
      <motion.span
        key={i}
        initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
        animate={{ opacity: 0, x, y: y + 220, rotate, scale: 1 }}
        transition={{ duration: 1.1 + Math.random() * 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size,
          height: size * 1.4,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
    )
  })

  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{pieces}</div>
}
