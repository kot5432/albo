import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let text = '';
  try {
    const body = await req.json();
    text = body.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const model = groq('llama-3.1-8b-instant');

    const prompt = `
あなたは挑戦内容の「意味の有無」と「具体性」を判定する専門家です。

以下の【判定フロー】に従って、厳格かつ柔軟に判定してください。

### 【STEP 1：意味があるか？】
・日本語として意味が通じる言葉であること。
・× 拒絶：あいうえお、あぽいづふぁ、asdfgh、などのキーボード叩きや音の羅列。
・これらに該当する場合は、即座に isValid: false とし、理由は「意味のある言葉を入力してください」としてください。

### 【STEP 2：具体的か？】
・何をするかが明確であること。数値（時間、量）があるとより良い。
・◯ 合格例：「JSというプログラミング言語を一日30分勉強する」「腕立てを毎日10回する」
・△ 改善の余地（isValid: trueだが改善案を出す）：「プログラミングを学ぶ」「運動する」
・× 抽象的すぎる（isValid: false）：「頑張る」「成功する」「幸せになる」

### 【判定のゴール】
・「JSというプログラミング言語を一日30分勉強する」のような具体的な入力は、文句なしの合格（isValid: true）です。

必ず以下のJSON形式で回答してください：
{
  "isConcrete": boolean,
  "reason": "なぜそう判断したか",
  "improvedExample": "具体的でない場合にのみ、より具体的にするための提案"
}

判定対象：${text}
`;

    const { text: result } = await generateText({
      model,
      prompt,
      maxRetries: 3,
      temperature: 0.1,
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIが有効なJSONを出力しませんでした');
    }

    const data = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      isValid: data.isConcrete,
      message: data.isConcrete ? '✓ 具体的な表現です' : 'もっと具体的にしてください',
      reason: data.reason,
      improvedExample: data.improvedExample,
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Validation error:', error);

    // AIが失敗した場合は、ユーザーに具体入力を促す（安全側に倒す）
    return new Response(JSON.stringify({
      isValid: false,
      message: 'もっと具体的に入力してください',
      success: true,
      fallback: true,
      reason: 'AIによる判定に失敗しました。意味の通じる文章を入力してください。'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
