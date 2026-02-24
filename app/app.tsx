"use client"
import React, { useState } from "react"
import DeclareChallenge from "./declarechallenge"
import HistoryPage from "./historypage"
import { Challenge } from "./types"

export default function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [view, setView] = useState<"declare" | "history">("declare") // 現在表示ページ

  return (
    <div style={{ padding: "2rem" }}>
      {view === "declare" && (
        <DeclareChallenge
          challenges={challenges}
          setChallenges={setChallenges}
          onViewHistory={() => setView("history")} // 履歴ページに切り替え
        />
      )}

      {view === "history" && (
        <HistoryPage
          challenges={challenges}
          onBack={() => setView("declare")} // 宣言ページに戻る
        />
      )}
    </div>
  )
}