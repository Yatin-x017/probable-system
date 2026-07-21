interface VideoPlaceholderProps {
  color?: string
  label?: string
  className?: string
}

export default function VideoPlaceholder({
  color = '#4A90E2',
  label = 'Video placeholder — asset swap in Stage 8',
  className = '',
}: VideoPlaceholderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}
      style={{ backgroundColor: color + '18' }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${color}40 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>
      <div className="text-center z-10">
        <div
          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <svg
            className="w-6 h-6 ml-1"
            style={{ color }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  )
}
