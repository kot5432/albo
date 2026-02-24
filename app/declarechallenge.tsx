"use client"
import React, { useState } from "react"
import { Challenge } from "./types"

type Props = {
  challenges: Challenge[]
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>
  onViewHistory: () => void
}

export default function DeclareChallenge({ challenges, setChallenges, onViewHistory }: Props) {
  const [input, setInput] = useState("")

  const declareChallenge = () => {
    if (!input.trim()) return
    const today = new Date().toLocaleString()
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      title: input,
      description: "",
      deadline: new Date(),
      status: "not_started",
      initialAction: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstActionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      actionLogs: [],
      isReasonShared: false,
      retryCount: 0
    }
    setChallenges(prev => [...prev, newChallenge])
    setInput("")
  }

  return (
    <div>
      <h1>挑戦を宣言する（簡易版）</h1>

      {/* 履歴ページに切り替えるボタン */}
      <button onClick={onViewHistory} style={{ marginBottom:"1rem" }}>
        履歴を見る
      </button>

      {/* 宣言入力 */}
      <div style={{ marginBottom:"1rem" }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="例：未踏ジュニアに応募する" 
        />
        <button onClick={declareChallenge}>宣言する</button>
      </div>

      {/* 挑戦ログ（簡易版） */}
      <div>
        <h2>挑戦ログ</h2>
        {challenges.map((c)=>(
          <div key={c.id}>
            {c.title} [{c.status}]
          </div>
        ))}
      </div>
    </div>
  )
}