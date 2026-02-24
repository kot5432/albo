// lib/openai.ts

export async function callOpenAI(prompt: string): Promise<string> {
  console.log("=== AIに渡されたプロンプト ===")
  console.log(prompt)

  // フェーズ判定（簡易）
  if (prompt.includes("もう一度だけ")) {
    return "もう一度だけ：1文字だけ書く"
  }

  if (prompt.includes("今日はこれだけ")) {
    return "今日はこれだけ：机に座る"
  }

  return "今やること：ノートを開く"
}