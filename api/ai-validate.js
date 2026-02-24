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

    const model = google('gemini-1.5-flash');

    const prompt = `
以下のテキストが具体的か抽象的を判定してください。
抽象的な表現の例：頑張る、努力する、がんばる、する、やる、取り組む
具体的な表現の例：毎日30分間プログラミングを学習する、1日10ページ読書する

テキスト：${text}

判定結果（具体的 or 抽象的）と理由を簡潔に：
`;

    const { text: result } = await generateText({
      model,
      prompt,
      maxTokens: 150,
      temperature: 0.3,
    });

    const isAbstract = result.includes('抽象') || result.includes('あいまい');
    
    return res.status(200).json({ 
      isValid: !isAbstract,
      message: isAbstract ? 'もっと具体的にしてください' : '✓ 具体的な表現です',
      details: result.trim(),
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
