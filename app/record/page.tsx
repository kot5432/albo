"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Modal from "@/components/Modal"
import { Challenge, ChallengeStatus } from "@/types"

export default function RecordPage() {
  const router = useRouter()
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [todayRecord, setTodayRecord] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [showAISuggestion, setShowAISuggestion] = useState(false)

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
        challenge.actionLogs = challenge.actionLogs.map((log: any) => ({
          ...log,
          date: new Date(log.date)
        }))
        setCurrentChallenge(challenge)
      } catch (error) {
        console.error("Failed to load challenge:", error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setSelectedImage(result)
          setImagePreview(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveRecord = () => {
    if (!currentChallenge || !todayRecord.trim()) return

    const updatedChallenge: Challenge = {
      ...currentChallenge,
      updatedAt: new Date(),
      actionLogs: [
        ...(currentChallenge.actionLogs || []),
        {
          id: Date.now().toString(),
          challengeId: currentChallenge.id,
          date: new Date(),
          content: todayRecord,
          type: 'daily_action' as const,
          imageUrl: selectedImage
        }
      ]
    }

    setCurrentChallenge(updatedChallenge)
    localStorage.setItem('currentChallenge', JSON.stringify(updatedChallenge))
    
    // Reset form
    setTodayRecord('')
    setSelectedImage(null)
    setImagePreview(null)
    
    // Show success feedback
    alert('記録を保存しました！')
  }

  const handleAISuggestion = async () => {
    if (!currentChallenge) return
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'stuck',
          goal: currentChallenge.title,
          situation: currentChallenge.description 
        })
      })
      const data = await response.json()
      setAiSuggestion(data.suggestion)
      setShowAISuggestion(true)
    } catch (error) {
      setAiSuggestion('今日は5分だけでも進めてみましょう。小さな一歩が大きな変化になります。')
      setShowAISuggestion(true)
    }
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

  if (!currentChallenge) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← 戻る
          </button>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.svg" alt="Alba" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">今日の記録</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {formatDate(new Date())}の行動を振り返り、記録します
          </p>
        </div>

        {/* Challenge Info */}
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

          {/* Status with light animation */}
          {currentChallenge.status !== "not_started" && (
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-400 font-medium text-sm sm:text-base">初動完了</span>
            </div>
          )}
        </Card>

        {/* Record Input */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-white font-medium mb-4 sm:mb-6">今日やったこと</h3>
          
          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                自分の言葉で入力してください
              </label>
              <Input
                type="textarea"
                placeholder="今日やったことを具体的に書いてください..."
                value={todayRecord}
                onChange={setTodayRecord}
                rows={6}
                className="mb-2"
              />
              <p className="text-xs text-gray-400">
                ※ 抽象的な表現は避け、具体的な行動を記録してください
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                画像添付（任意）
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  画像を選択
                </label>
                
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-700 text-xs sm:text-sm"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ※ 画像は記録の参考として保存されます
              </p>
            </div>
          </div>
        </Card>

        {/* AI Suggestion */}
        <Card className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h3 className="text-white font-medium text-base sm:text-lg">AIアドバイス</h3>
            <Button
              variant="secondary"
              onClick={handleAISuggestion}
              className="text-sm sm:text-base w-full sm:w-auto"
            >
              提案してもらう
            </Button>
          </div>
          
          {showAISuggestion && (
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white text-sm sm:text-base">{aiSuggestion}</p>
            </div>
          )}
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSaveRecord}
            disabled={!todayRecord.trim()}
            size="lg"
            className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
          >
            記録する
          </Button>
        </div>

        {/* Image Preview Modal */}
        <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
          <h2 className="text-2xl font-bold text-white mb-4">画像プレビュー</h2>
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-96 object-contain rounded-lg"
            />
          )}
          <div className="flex justify-end mt-4">
            <Button 
              variant="secondary"
              onClick={() => setShowPreviewModal(false)}
            >
              閉じる
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
