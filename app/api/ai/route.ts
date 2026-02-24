import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { goal, situation, fear, type } = await req.json()

  // Generate contextual suggestions based on user's fears and situation
  let prompt = ""

  if (type === "first") {
    prompt = `挑戦目標: ${goal}
状況: ${situation || "未入力"}
不安: ${fear || "未入力"}

以下の条件を考慮して、今日やるべき最小行動を提案してください：

1. 心理的ハードルを下げるものではなく、不安を軽減するもの
2. 完璧主義ではなく、「まずはこれだけ」を重視
3. 他人と比較しない、自分のペースを尊重
4. 失敗を恐れず、小さな一歩を重視
5. 行動した瞬間に実力が確定するようなもの

提案は具体的で、今日すぐに実行できるものにしてください。
形式：「〇〇する」のように簡潔に。`

  } else if (type === "retry") {
    prompt = `挑戦目標: ${goal}
不安: ${fear || "未入力"}

前回の挑戦でうまくいかなかったようです。今回は以下の点を考慮して、より簡単な初動を提案してください：

1. 前回より10倍簡単な行動
2. 準備が不要なもの
3. 2分で完了できるもの
4. 失敗の可能性が低いもの
5. 達成感を得やすいもの

完璧でなくてもいいのです。まずは始めることが大事です。`

  } else if (type === "stuck") {
    prompt = `挑戦目標: ${goal}
不安: ${fear || "未入力"}

挑戦が停滞しているようです。心理的プレッシャーを取り除き、以下のアプローチで提案してください：

1. 現状を肯定する（すでにここまで来た事実）
2. 次の一歩だけに集中
3. 達成基準を下げる（5分でできること）
4. 失失敗を許容する（完璧でなくてもいい）
5. 小さな成功体験を作る

進捗がなくても、自分を責めないでください。`

  }

  // Mock responses based on the context
  const responses = {
    first: `まずは${goal.split('、')[0]}の準備をする`,
    retry: `2分で${goal.split('、')[0]}を開くだけ`,
    stuck: `今日は${goal.split('、')[0]}を5分だけ見る`
  }

  const result = responses[type as keyof typeof responses] || "まずは一歩を踏み出す"

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return NextResponse.json({ message: result })
}