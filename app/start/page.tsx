"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Challenge } from "@/types"

export default function StartPage() {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState("")
  const [situation, setSituation] = useState("")
  const [deadline, setDeadline] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [editedAction, setEditedAction] = useState("")
  const [loading, setLoading] = useState(false)
  const [understood, setUnderstood] = useState(false)
  const [fear, setFear] = useState("")
  const router = useRouter()

  const generateAIAction = async () => {
    if (!goal.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          situation,
          fear,
          type: "first",
        }),
      })

      const data = await res.json()
      setAiSuggestion(data.message)
      setEditedAction(data.message)
      setStep(2)
    } catch (error) {
      console.error("AI生成エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmChallenge = () => {
    if (!understood) return
    
    // Create challenge object
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      title: goal,
      description: goal,
      deadline: deadline ? new Date(deadline) : undefined,
      status: "not_started",
      firstActionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
      updatedAt: new Date(),
      reason: "",
      isReasonShared: false,
      actionLogs: [],
      retryCount: 0,
      initialAction: editedAction
    }

    // Save to localStorage (in real app, this would be saved to database)
    localStorage.setItem('currentChallenge', JSON.stringify(newChallenge))
    
    router.push("/")
  }

  const retryAI = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          type: "retry",
        }),
      })

      const data = await res.json()
      setAiSuggestion(data.message)
      setEditedAction(data.message)
    } catch (error) {
      console.error("AI再生成エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">挑戦を宣言する</h1>
          <p className="text-muted">思いを覚悟に変える</p>
        </div>

        {/* Step 1: Challenge Input */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">挑戦内容を入力</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">挑戦する内容</label>
                <textarea
                  className="input-field w-full h-24 resize-none"
                  placeholder="例：未踏ジュニアに応募する、毎日30分プログラミングする、英語のブログを始める"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">いつまでに達成したいか</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">現在の状態（任意）</label>
                <textarea
                  className="input-field w-full h-20 resize-none"
                  placeholder="例：情報は集めているが、一歩が踏み出せない"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">恐れや不安（任意）</label>
                <textarea
                  className="input-field w-full h-16 resize-none"
                  placeholder="例：完璧にこなしたい、失敗が怖い、他人と比べてしまう"
                  value={fear}
                  onChange={(e) => setFear(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-400 font-medium mb-2">💡 ヒント</p>
              <p className="text-white text-sm">
                小さく初めて深くするのがコツです。完璧を目指すのではなく、
                「今日これだけやる」を考えましょう。
              </p>
            </div>

            <button
              onClick={generateAIAction}
              disabled={loading || !goal.trim()}
              className="btn-primary w-full mt-6"
            >
              {loading ? "生成中..." : "次へ"}
            </button>
          </div>
        )}

        {/* Step 2: AI Suggestion */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">今日やる最小行動</h2>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted mb-2">AIが提案する初動アクション:</p>
              <p className="text-white">{aiSuggestion}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">編集する（任意）</label>
              <textarea
                className="input-field w-full h-20 resize-none"
                value={editedAction}
                onChange={(e) => setEditedAction(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={retryAI}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                {loading ? "再生成中..." : "もう一度だけ"}
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary flex-1"
              >
                このアクションで決定
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Irreversible Confirmation */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">最終確認</h2>
            
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-medium mb-2">⚠️ 重要な確認</p>
              <p className="text-white text-sm mb-4">
                この宣言は削除できません。達成できなかった場合でも履歴に残ります。
              </p>
              <p className="text-white text-sm">
                本気で挑戦する覚悟がある場合のみ、次に進んでください。
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted mb-2">挑戦内容:</p>
              <p className="text-white font-medium">{goal}</p>
              {deadline && (
                <p className="text-sm text-muted mt-2">期限: {deadline}</p>
              )}
              <p className="text-sm text-accent mt-2">初動: {editedAction}</p>
            </div>

            <label className="flex items-center mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-white">理解しました</span>
            </label>

            <button
              onClick={confirmChallenge}
              disabled={!understood}
              className="btn-primary w-full"
            >
              この挑戦を始める
            </button>
          </div>
        )}
      </div>
    </div>
  )
}