import React from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showPercentage?: boolean
}

export default function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full bg-gray-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${clampedProgress}%` }}
      />
      {showPercentage && (
        <div className="text-center text-sm text-gray-400 mt-1">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}
