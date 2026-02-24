"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Button from "@/components/Button"
import Card from "@/components/Card"
import { Challenge, ChallengeStatus } from "@/types"

export default function HistoryPage() {
  const [pastChallenges, setPastChallenges] = useState<Challenge[]>([])
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalDeclarations: 0,
    firstActionCompletions: 0,
    notStartedCount: 0,
    totalRetries: 0
  })

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    // Load past challenges from localStorage
    const savedHistory = localStorage.getItem('challengeHistory')
    const currentChallenge = localStorage.getItem('currentChallenge')
    
    let challenges: Challenge[] = []
    
    if (savedHistory) {
      try {
        challenges = JSON.parse(savedHistory)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
    
    // Add current challenge if exists
    if (currentChallenge) {
      try {
        const current = JSON.parse(currentChallenge)
        challenges.unshift(current)
      } catch (error) {
        console.error("Failed to parse current challenge:", error)
      }
    }
    
    // Convert string dates back to Date objects
    challenges = challenges.map(challenge => ({
      ...challenge,
      createdAt: new Date(challenge.createdAt),
      updatedAt: new Date(challenge.updatedAt),
      firstActionDeadline: new Date(challenge.firstActionDeadline),
      deadline: challenge.deadline ? new Date(challenge.deadline) : undefined,
      actionLogs: challenge.actionLogs.map((log: any) => ({
        ...log,
        date: new Date(log.date)
      }))
    }))
    
    setPastChallenges(challenges)
    calculateStats(challenges)
  }

  const calculateStats = (challenges: Challenge[]) => {
    const stats = {
      totalDeclarations: challenges.length,
      firstActionCompletions: challenges.filter(c => c.status === 'first_action' || c.status === 'in_progress' || c.status === 'completed').length,
      notStartedCount: challenges.filter(c => c.status === 'not_started' || c.status === 'failed').length,
      totalRetries: challenges.reduce((sum, c) => sum + c.retryCount, 0)
    }
    setStats(stats)
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

  const toggleExpanded = (challengeId: string) => {
    setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">挑戦履歴</h1>
          <p className="text-gray-400">過去の挑戦は成長の証</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalDeclarations}</div>
            <div className="text-sm text-gray-400">宣言数</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.firstActionCompletions}</div>
            <div className="text-sm text-gray-400">初動完了数</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.notStartedCount}</div>
            <div className="text-sm text-gray-400">未開始数</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.totalRetries}</div>
            <div className="text-sm text-gray-400">再挑戦数</div>
          </Card>
        </div>

        {/* Past Challenges List */}
        <div className="space-y-4">
          {pastChallenges.length === 0 ? (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">まだ挑戦履歴がありません</h3>
              <p className="text-gray-400 mb-6">最初の挑戦を始めてみましょう</p>
              <Link href="/">
                <Button>挑戦を始める</Button>
              </Link>
            </Card>
          ) : (
            pastChallenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>宣言日: {formatDate(challenge.createdAt)}</span>
                        {challenge.status === 'first_action' && challenge.actionLogs.length > 0 && (
                          <span>初動完了日: {formatDate(challenge.actionLogs[0].date)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm font-medium ${getStatusColor(challenge.status)}`}>
                        {getStatusText(challenge.status)}
                      </div>
                      {challenge.retryCount > 0 && (
                        <div className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                          再挑戦{challenge.retryCount}回
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-gray-300 text-sm line-clamp-2">{challenge.description}</p>
                    <button
                      onClick={() => toggleExpanded(challenge.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm ml-4"
                    >
                      {expandedChallenge === challenge.id ? '折りたたむ' : '詳細を見る'}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedChallenge === challenge.id && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <div className="space-y-4">
                        {challenge.reason && (
                          <div>
                            <h4 className="text-white font-medium mb-2">挑戦理由</h4>
                            <p className="text-gray-300 text-sm">{challenge.reason}</p>
                          </div>
                        )}

                        {challenge.initialAction && (
                          <div>
                            <h4 className="text-white font-medium mb-2">初動目標</h4>
                            <p className="text-gray-300 text-sm">{challenge.initialAction}</p>
                          </div>
                        )}

                        {challenge.actionLogs.length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">行動ログ</h4>
                            <div className="space-y-2">
                              {challenge.actionLogs.map((log, index) => (
                                <div key={log.id} className="bg-gray-700 rounded p-3 text-sm">
                                  <div className="text-gray-400 mb-1">{formatDate(log.date)}</div>
                                  <div className="text-white">{log.content}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Link href={`/challenge/${challenge.id}`}>
                            <Button variant="secondary" className="text-sm">
                              詳細を見る
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
