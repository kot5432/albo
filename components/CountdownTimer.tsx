import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  isUrgent?: boolean
  onComplete?: () => void
}

export default function CountdownTimer({ targetDate, isUrgent = false, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        if (onComplete) onComplete()
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
      }

      const totalSeconds = Math.floor(difference / 1000)
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { hours, minutes, seconds, totalSeconds }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [targetDate, onComplete])

  const formatTime = (time: { hours, minutes, seconds }) => {
    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
      return "時間切れ"
    }

    const parts = []
    if (time.hours > 0) parts.push(`${time.hours}時間`)
    if (time.minutes > 0) parts.push(`${time.minutes}分`)
    if (time.seconds > 0) parts.push(`${time.seconds}秒`)

    return parts.join(' ')
  }

  return (
    <div className={`text-center ${isUrgent ? 'animate-pulse' : ''}`}>
      <div className="text-2xl font-bold mb-2">
        {formatTime(timeLeft)}
      </div>
      {timeLeft.totalSeconds > 0 && (
        <div className="text-sm text-gray-400">
          残り時間: {Math.floor(timeLeft.totalSeconds / 60)}分
        </div>
      )}
    </div>
  )
}
