"use client"
import { useState, useEffect } from "react"
import Button from "@/components/Button"
import Card from "@/components/Card"
import Input from "@/components/Input"
import Modal from "@/components/Modal"
import { SharedReason } from "@/types"

export default function ReasonsPage() {
  const [myReason, setMyReason] = useState('')
  const [sharedReasons, setSharedReasons] = useState<SharedReason[]>([])
  const [showMyReasonModal, setShowMyReasonModal] = useState(false)
  const [hasSharedReason, setHasSharedReason] = useState(false)

  useEffect(() => {
    loadSharedReasons()
    checkMySharedReason()
  }, [])

  const loadSharedReasons = () => {
    // Load shared reasons from localStorage or API
    const savedReasons = localStorage.getItem('sharedReasons')
    if (savedReasons) {
      try {
        const parsedReasons = JSON.parse(savedReasons)
        const reasonsWithDates = parsedReasons.map((reason: any) => ({
          ...reason,
          createdAt: new Date(reason.createdAt)
        }))
        setSharedReasons(reasonsWithDates)
      } catch (error) {
        console.error("Failed to load shared reasons:", error)
      }
    } else {
      // Load mock reasons for demo
      const mockReasons: SharedReason[] = [
        {
          id: '1',
          content: '自分を信じたいから。過去の自分を超えたい。',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        },
        {
          id: '2',
          content: '諦めたくない夢がある。子供の頃の情熱を取り戻したい。',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        },
        {
          id: '3',
          content: '挑戦すること自体が目的。過程を楽しみたい。',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        },
        {
          id: '4',
          content: '小さな成功を積み重ねて、自信をつけたい。',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        },
        {
          id: '5',
          content: '周りの人に影響を与えたい。自分の変化から始めたい。',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        }
      ]
      setSharedReasons(mockReasons)
      localStorage.setItem('sharedReasons', JSON.stringify(mockReasons))
    }
  }

  const checkMySharedReason = () => {
    const savedMyReason = localStorage.getItem('mySharedReason')
    if (savedMyReason) {
      setMyReason(savedMyReason)
      setHasSharedReason(true)
    }
  }

  const saveMyReason = () => {
    if (!myReason.trim()) return

    const newSharedReason: SharedReason = {
      id: Date.now().toString(),
      content: myReason,
      createdAt: new Date(),
      isAnonymous: true
    }

    // Save to localStorage
    localStorage.setItem('mySharedReason', myReason)
    
    // Add to shared reasons
    const updatedReasons = [newSharedReason, ...sharedReasons]
    localStorage.setItem('sharedReasons', JSON.stringify(updatedReasons))
    setSharedReasons(updatedReasons)
    
    setHasSharedReason(true)
    setShowMyReasonModal(false)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return `${Math.floor(diffDays / 30)}ヶ月前`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">挑戦理由</h1>
          <p className="text-gray-400">なぜ挑戦するのか、共有し合おう</p>
        </div>

        {/* My Reason Section */}
        <Card className="mb-12">
          <div className="text-center">
            {hasSharedReason ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">あなたの理由</h3>
                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                  <p className="text-gray-300 text-lg">{myReason}</p>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => setShowMyReasonModal(true)}
                >
                  理由を編集する
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4">あなたの理由を教えてください</h3>
                <p className="text-gray-400 mb-6">
                  なぜこの挑戦をするのか、正直に書いてみましょう
                </p>
                <Button 
                  onClick={() => setShowMyReasonModal(true)}
                  className="text-lg px-8 py-4"
                >
                  理由を書く
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Shared Reasons */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">他人の理由</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sharedReasons.map((reason) => (
              <Card 
                key={reason.id} 
                className="p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">匿</span>
                      </div>
                      <span className="text-gray-400 text-sm">{formatDate(reason.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {reason.content}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* My Reason Modal */}
        <Modal isOpen={showMyReasonModal} onClose={() => setShowMyReasonModal(false)}>
          <h2 className="text-2xl font-bold text-white mb-4">
            {hasSharedReason ? '理由を編集' : '理由を書く'}
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            なぜこの挑戦をするのか、正直に書いてください。匿名で共有されます。
          </p>
          
          <Input
            type="textarea"
            placeholder="例：自分を信じたいから、諦めたくない夢があるから、挑戦すること自体が目的だから..."
            value={myReason}
            onChange={setMyReason}
            rows={6}
            className="mb-6"
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowMyReasonModal(false)}
            >
              キャンセル
            </Button>
            <Button 
              onClick={saveMyReason}
              disabled={!myReason.trim()}
            >
              {hasSharedReason ? '更新する' : '保存する'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
