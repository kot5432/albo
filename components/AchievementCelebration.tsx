import React, { useEffect, useState } from 'react'

interface AchievementCelebrationProps {
  show: boolean
  onComplete: () => void
}

export default function AchievementCelebration({ show, onComplete }: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (show) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 text-center max-w-md">
        <div className="text-3xl font-bold text-white mb-4">🎉</div>
        <div className="text-xl text-white mb-6">初動完了！</div>
        <div className="text-gray-300 mb-8">
          <p className="text-lg mb-2">最初の一歩を踏み出しましたね！</p>
          <p className="text-sm">これからがんばっていきましょう。</p>
        </div>
      </div>
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `confetti-fall ${3 + (i % 3)}s ease-out forwards`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
