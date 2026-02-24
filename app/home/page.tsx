"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Input from "@/components/Input"
import CountdownTimer from "@/components/CountdownTimer"
import ProgressBar from "@/components/ProgressBar"
import Modal from "@/components/Modal"
import { Challenge, ChallengeStatus } from "@/types"

export default function HomePage() {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [activeCount, setActiveCount] = useState(0)
  const [firstActionCount, setFirstActionCount] = useState(0)
  const [otherReasons, setOtherReasons] = useState<string[]>([])

  useEffect(() => {
    // Load challenge from localStorage
    const savedChallenge = localStorage.getItem('currentChallenge')
    if (savedChallenge) {
      try {
        const challenge = JSON.parse(savedChallenge)
        // Convert string dates back to Date objects
        challenge.createdAt = new Date(challenge.createdAt)
        challenge.updatedAt = new Date(challenge.updatedAt)
        challenge.firstActionDeadline = new Date(challenge.firstActionDeadline)
        if (challenge.deadline) {
          challenge.deadline = new Date(challenge.deadline)
        }
        setCurrentChallenge(challenge)
      } catch (error) {
        console.error("Failed to load challenge:", error)
        window.location.href = '/'
      }
    } else {
      window.location.href = '/'
    }

    // Load stats
    fetchStats()
    loadOtherReasons()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setActiveCount(data.activeCount)
      setFirstActionCount(data.firstActionCount)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setActiveCount(Math.floor(Math.random() * 100) + 50)
      setFirstActionCount(Math.floor(Math.random() * 50) + 20)
    }
  }

  const loadOtherReasons = () => {
    // Mock other people's reasons
    const mockReasons = [
      "自分を信じたいから",
      "諦めたくない夢がある",
      "子供の頃の情熱を取り戻したい",
      "挑戦すること自体が目的",
      "小さな成功を積み重ねたい"
    ]
    setOtherReasons(mockReasons.sort(() => Math.random() - 0.5).slice(0, 3))
  }

  const handleFirstActionComplete = () => {
    if (!currentChallenge) return
    
    const updatedChallenge: Challenge = {
      ...currentChallenge,
      status: "first_action",
      updatedAt: new Date(),
    }
    
    setCurrentChallenge(updatedChallenge)
    localStorage.setItem('currentChallenge', JSON.stringify(updatedChallenge))
  }

  const getStatusText = (status: ChallengeStatus) => {
    switch (status) {
      case "not_started": return "未開始"
      case "first_action": return "初動完了"
      case "in_progress": return "継続中"
      case "completed": return "完了"
      case "failed": return "失敗"
      default: return "不明"
    }
  }

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case "not_started": return "text-yellow-400"
      case "first_action": return "text-green-400"
      case "in_progress": return "text-blue-400"
      case "completed": return "text-emerald-400"
      case "failed": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const resetChallenge = () => {
    localStorage.removeItem('currentChallenge')
    window.location.href = '/'
  }

  if (!currentChallenge) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img src="/logo.svg" alt="Alba" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light mb-2">Alba</h1>
          <p className="text-gray-400 text-sm sm:text-base">思いを挑戦に変える</p>
        </div>

        {/* Reset Button */}
        <div className="text-center mb-6">
          <Button 
            variant="secondary" 
            onClick={resetChallenge}
            className="text-sm"
          >
            新しい挑戦を始める
          </Button>
        </div>

        {/* Card 1: あなたの挑戦 */}
        <Card className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">{currentChallenge.title}</h2>
              <p className="text-gray-400 text-sm">{currentChallenge.description}</p>
            </div>
            <div className={`text-right sm:text-right ${getStatusColor(currentChallenge.status)}`}>
              <div className="text-sm font-medium">{getStatusText(currentChallenge.status)}</div>
            </div>
          </div>

          {/* Before First Action */}
          {currentChallenge.status === "not_started" && (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">残り時間</div>
                <CountdownTimer 
                  targetDate={currentChallenge.firstActionDeadline}
                  onComplete={() => {
                    // Handle timeout
                    const updatedChallenge: Challenge = {
                      ...currentChallenge,
                      status: "failed",
                      updatedAt: new Date()
                    }
                    setCurrentChallenge(updatedChallenge)
                    localStorage.setItem('currentChallenge', JSON.stringify(updatedChallenge))
                  }}
                />
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">今日やること</div>
                <div className="text-white">{currentChallenge.initialAction}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/challenge/${currentChallenge.id}`} className="flex-1">
                  <Button variant="secondary">
                    挑戦詳細
                  </Button>
                </Link>
                <Link href="/record" className="flex-1">
                  <Button>
                    記録画面へ
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* After First Action */}
          {currentChallenge.status !== "not_started" && (
            <div className="space-y-4">
              {/* Status with light animation */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-400 font-medium text-sm sm:text-base">初動完了</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/challenge/${currentChallenge.id}`} className="flex-1">
                  <Button variant="secondary">
                    挑戦詳細
                  </Button>
                </Link>
                <Link href="/record" className="flex-1">
                  <Button>
                    記録画面へ
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Card 2: 他人の挑戦状況 */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-white font-medium mb-4">他人の挑戦状況</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{activeCount}</div>
              <div className="text-sm text-gray-400">人が挑戦中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">{firstActionCount}</div>
              <div className="text-sm text-gray-400">人が初動中</div>
            </div>
          </div>
        </Card>

        {/* Card 3: 自分の理由 */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-white font-medium mb-4">自分の理由</h3>
          {currentChallenge.reason ? (
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white">{currentChallenge.reason}</p>
            </div>
          ) : (
            <Link href="/reasons" className="block">
              <Button variant="secondary" className="w-full">
                理由を書く
              </Button>
            </Link>
          )}
        </Card>

        {/* Card 4: 他人の理由 */}
        {otherReasons.length > 0 && (
          <Card>
            <h3 className="text-white font-medium mb-4">他人の理由</h3>
            <div className="space-y-3">
              {otherReasons.map((reason, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 transform transition-all duration-200 hover:scale-105">
                  <p className="text-white text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
