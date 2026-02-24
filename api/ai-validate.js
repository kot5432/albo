import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `
あなたは挑戦内容の具体性を判定する専門AIです。

以下の基準で評価してください。

【具体的の定義】
・行動が明確
・時間や量が定義されている
・今日から行動できる

【抽象的の定義】
・概念的（例：頑張る、成功する、変わる）
・期限や量がない
・何をすればいいか不明確

必ずJSONで返してください。

{
  "isConcrete": boolean,
  "reason": "なぜそう判断したか",
  "improvedExample": "抽象的な場合のみ具体例を出す"
}

判定対象：${text}
`;

    const { text: result } = await generateText({
      model,
      prompt,
      maxTokens: 300,
      temperature: 0.1,
    });

    // JSONを抽出（AIが前後にテキストを付けても大丈夫なように）
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIが有効なJSONを出力しませんでした');
    }

    const data = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      isValid: data.isConcrete,
      message: data.isConcrete ? '✓ 具体的な表現です' : 'もっと具体的にしてください',
      reason: data.reason,
      improvedExample: data.improvedExample,
      success: true
    });

  } catch (error) {
    console.error('Validation error:', error);

    // フォールバック：ルールベースチェック
    const abstractWords = ['頑張る', '努力する', 'がんばる', 'する', 'やる', '取り組む'];
    const isAbstract = abstractWords.some(word => text.includes(word));

    return res.status(200).json({
      isValid: !isAbstract,
      message: isAbstract ? '⚠ もっと具体的にしてください' : '✓ 具体的な表現です',
      success: true,
      fallback: true
    });
  }
}
