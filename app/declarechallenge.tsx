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
    setChallenges(prev => [
      ...prev,
      { content: input, status: "未開始", tasks: [], retryCount: 0, declareDate: today }
    ])
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
        {challenges.map((c,i)=>(
          <div key={i}>
            {c.content} [{c.status}]
          </div>
        ))}
      </div>
    </div>
  )
}