import type { ReactNode } from 'react'

interface EmptyStateProps {
  /** Primary message, e.g. "No projects published yet." */
  message: string
  /** Optional action rendered below the message (e.g. a Link to the admin). */
  action?: ReactNode
  /** Vertical padding — py-20 (default) for standalone pages, py-16 for
   *  empty states nested inside an existing section (e.g. Home's featured
   *  work block, which already carries its own section spacing). */
  size?: 'default' | 'compact'
  className?: string
}

/**
 * Shared empty-state pattern for "no data yet" moments (Work, Blog, Home's
 * featured-work fallback, and future admin lists). Centralizes the copy
 * layout so each page doesn't hand-roll its own <div className="text-center
 * py-20">.
 */
export function EmptyState({ message, action, size = 'default', className }: EmptyStateProps) {
  return (
    <div className={`text-center ${size === 'compact' ? 'py-16' : 'py-20'} ${className ?? ''}`}>
      <p className={`text-gray-400${action ? ' mb-4' : ''}`}>{message}</p>
      {action}
    </div>
  )
}
