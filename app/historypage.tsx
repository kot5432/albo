"use client"
import React from "react"
import { Challenge } from "./types"

type Props = {
  challenges: Challenge[]
  onBack: () => void
}

export default function HistoryPage({ challenges, onBack }: Props) {
  return (
    <div>
      <h1>履歴ページ（仮）</h1>

      {/* 宣言ページに戻るボタン */}
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        宣言ページに戻る
      </button>

      <div>
        <h2>過去挑戦リスト</h2>
        <ul>
          {challenges.map((c)=>(
            <li key={c.id}>{c.title} ({c.status})</li>
          ))}
        </ul>
      </div>
    </div>
  )
}