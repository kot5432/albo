"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import Card from "@/components/Card"
import { Challenge, ChallengeStatus } from "@/types"

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [expandedLogs, setExpandedLogs] = useState(false)

  useEffect(() => {
    // Load challenge from localStorage
    const savedChallenge = localStorage.getItem('currentChallenge')
    if (savedChallenge) {
      try {
        const parsedChallenge = JSON.parse(savedChallenge)
        if (parsedChallenge.id === params.id) {
          // Convert string dates back to Date objects
          parsedChallenge.createdAt = new Date(parsedChallenge.createdAt)
          parsedChallenge.updatedAt = new Date(parsedChallenge.updatedAt)
          parsedChallenge.firstActionDeadline = new Date(parsedChallenge.firstActionDeadline)
          if (parsedChallenge.deadline) {
            parsedChallenge.deadline = new Date(parsedChallenge.deadline)
          }
          parsedChallenge.actionLogs = parsedChallenge.actionLogs.map((log: any) => ({
            ...log,
            date: new Date(log.date)
          }))
          setChallenge(parsedChallenge)
        }
      } catch (error) {
        console.error("Failed to load challenge:", error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [params.id, router])

  const handleRetry = () => {
    if (!challenge) return

    const updatedChallenge: Challenge = {
      ...challenge,
      status: "not_started",
      retryCount: challenge.retryCount + 1,
      updatedAt: new Date(),
      firstActionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      actionLogs: []
    }

    setChallenge(updatedChallenge)
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!challenge) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold mb-2">挑戦詳細</h1>
        </div>

        {/* Challenge Info Card */}
        <Card className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{challenge.title}</h2>
              <p className="text-gray-400 mb-4">{challenge.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">宣言日:</span>
                  <span>{formatDate(challenge.createdAt)}</span>
                </div>
                {challenge.deadline && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">期限:</span>
                    <span>{formatDate(challenge.deadline)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">再挑戦回数:</span>
                  <span>{challenge.retryCount}回</span>
                </div>
              </div>
            </div>
            <div className={`text-right ${getStatusColor(challenge.status)}`}>
              <div className="text-lg font-medium">{getStatusText(challenge.status)}</div>
            </div>
          </div>

          {challenge.reason && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2">挑戦理由</h3>
              <p className="text-gray-300">{challenge.reason}</p>
            </div>
          )}

          {challenge.initialAction && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">初動目標</h3>
              <p className="text-gray-300">{challenge.initialAction}</p>
            </div>
          )}
        </Card>

        {/* Action Logs */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">行動ログ</h3>
            <button
              onClick={() => setExpandedLogs(!expandedLogs)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {expandedLogs ? '折りたたむ' : '展開する'}
            </button>
          </div>

          {challenge.actionLogs.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              まだ行動ログがありません
            </div>
          ) : (
            <div className="space-y-3">
              {challenge.actionLogs.map((log, index) => (
                <div key={log.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">
                        {formatDate(log.date)}
                      </div>
                      <div className="text-white">
                        {log.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        タイプ: {log.type === 'first_action' ? '初動' : log.type === 'daily_action' ? '日次' : '完了'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Retry Button */}
        {(challenge.status === 'failed' || challenge.status === 'completed') && (
          <Card>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">
                {challenge.status === 'failed' ? '挑戦を再開しますか？' : '新しい挑戦を始めますか？'}
              </h3>
              <p className="text-gray-400 mb-6">
                {challenge.status === 'failed' 
                  ? '失敗から学び、再挑戦することで成長できます。'
                  : '今回の成功を次の挑戦に活かしましょう。'
                }
              </p>
              <Button 
                onClick={handleRetry} 
                size="lg"
                className="text-lg px-8 py-4"
              >
                {challenge.status === 'failed' ? '再挑戦する' : '新たな挑戦を始める'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
