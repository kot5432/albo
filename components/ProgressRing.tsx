interface ProgressRingProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function ProgressRing({ progress, size = 'md', color = 'blue' }: ProgressRingProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500'
  }

  const circumference = 2 * Math.PI
  const radius = size === 'sm' ? 8 : size === 'md' ? 12 : 16
  const strokeWidth = 3

  const normalizedRadius = radius - strokeWidth / 2
  const backgroundLength = circumference * normalizedRadius
  const dashArray = `${progress * backgroundLength / 100} ${backgroundLength}`

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      >
        <circle
          cx="12"
          cy="12"
          r={normalizedRadius}
          className={colorClasses[color]}
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r={normalizedRadius}
          fill="none"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          transform="rotate(-90deg)"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-xs">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
