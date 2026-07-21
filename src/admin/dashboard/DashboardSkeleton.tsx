function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-[length:200%_100%] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-8">
      <Shimmer className="mb-1 h-7 w-64" />
      <Shimmer className="mb-8 h-4 w-40" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>

      <div className="mb-6">
        <Shimmer className="h-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Shimmer className="h-64 rounded-xl" />
        <Shimmer className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
