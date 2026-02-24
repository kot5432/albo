"use client"
import { useState, useEffect } from "react"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Modal from "@/components/Modal"
import Input from "@/components/Input"
import { Challenge } from "@/types"

export default function HomePage() {
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    // Load challenge from localStorage
    const savedChallenge = localStorage.getItem('currentChallenge')
    if (savedChallenge) {
      try {
        const challenge = JSON.parse(savedChallenge)
        setCurrentChallenge(challenge)
      } catch (error) {
        console.error("Failed to load challenge:", error)
      }
    }

    // Load stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setActiveCount(data.activeCount)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setActiveCount(Math.floor(Math.random() * 100) + 50) // Mock data
    }
  }

  if (currentChallenge) {
    // Redirect to home page if user has an active challenge
    window.location.href = '/home'
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="text-center max-w-4xl mx-auto space-y-16">
          {/* Logo */}
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img src="/logo.svg" alt="Alba" className="w-full h-full object-contain" />
          </div>

          {/* Headlines */}
          <div className="space-y-6">
            <h1 className="text-6xl font-light text-white leading-tight">
              思いを<br />
              覚悟に変える
            </h1>
            <p className="text-xl text-gray-400">
              小さな一歩から始める挑戦
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => setShowChallengeModal(true)}
            size="lg"
            className="text-xl px-12 py-6"
          >
            挑戦を書く
          </Button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-900 px-8 py-8">
        <div className="text-center text-gray-500 text-sm">
          今<span className="text-blue-400 font-medium">{activeCount}</span>人が挑戦中
        </div>
      </div>

      {/* Challenge Creation Modal */}
      <ChallengeCreationModal 
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onComplete={(challenge) => {
          setCurrentChallenge(challenge)
          setShowChallengeModal(false)
          window.location.href = '/home'
        }}
      />
    </div>
  )
}

// Challenge Creation Modal Component
interface ChallengeCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (challenge: Challenge) => void
}

function ChallengeCreationModal({ isOpen, onClose, onComplete }: ChallengeCreationModalProps) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [initialAction, setInitialAction] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleNext = async () => {
    if (step === 1) {
      // Generate AI suggestion
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'initial',
            goal: title,
            situation: description 
          })
        })
        const data = await response.json()
        setAiSuggestion(data.suggestion)
        setInitialAction(data.suggestion)
      } catch (error) {
        setAiSuggestion('まずは3分だけ始めてみましょう')
        setInitialAction('まずは3分だけ始めてみましょう')
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      // Create challenge
      const challenge: Challenge = {
        id: Date.now().toString(),
        title,
        description,
        deadline: new Date(deadline),
        status: 'not_started',
        initialAction,
        createdAt: new Date(),
        updatedAt: new Date(),
        firstActionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        actionLogs: [],
        isReasonShared: false,
        retryCount: 0
      }
      
      localStorage.setItem('currentChallenge', JSON.stringify(challenge))
      onComplete(challenge)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-white mb-4">挑戦内容を入力</h2>
              <p className="text-gray-400">今日から挑戦する内容を具体的に書いてください</p>
            </div>
            
            <div className="space-y-6">
              <Input
                label="挑戦名（1行）"
                placeholder="例：毎日30分勉強する"
                value={title}
                onChange={setTitle}
              />
              
              <Input
                type="textarea"
                label="詳細"
                placeholder="具体的な目標や状況を書いてください"
                value={description}
                onChange={setDescription}
                rows={4}
              />
              
              <Input
                type="date"
                label="期限"
                value={deadline}
                onChange={setDeadline}
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-white mb-4">AI最小行動提案</h2>
              <p className="text-gray-400">初動のハードルを下げるための最小行動です</p>
            </div>
            
            <Card variant="elevated" className="bg-gray-800 text-white">
              <p className="text-lg">{aiSuggestion}</p>
            </Card>
            
            <Input
              type="textarea"
              label="編集する（任意）"
              value={initialAction}
              onChange={setInitialAction}
              rows={3}
            />
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-white mb-4">不可逆確認</h2>
              <p className="text-gray-400">
                この宣言は削除できません。<br />
                達成できなかった場合でも履歴に残ります。
              </p>
            </div>
            
            <Card variant="default" className="bg-gray-800">
              <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
              <p className="text-gray-400 mb-4">{description}</p>
              <p className="text-blue-400 text-sm">初動：{initialAction}</p>
            </Card>
            
            <label className="flex items-center text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              理解した
            </label>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {renderStep()}
      
      <div className="flex justify-between mt-12">
        {step > 1 && (
          <Button 
            variant="secondary" 
            onClick={() => setStep(step - 1)}
          >
            戻る
          </Button>
        )}
        
        <div className="ml-auto">
          <Button 
            onClick={handleNext}
            disabled={(step === 1 && (!title || !deadline)) || (step === 3 && !confirmed)}
            size="lg"
          >
            {step === 3 ? 'この挑戦を始める' : '次へ'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
