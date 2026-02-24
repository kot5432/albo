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
    const { challengeText } = req.body;

    if (!challengeText) {
      return res.status(400).json({ error: 'Challenge text is required' });
    }

    const model = google('gemini-1.5-flash');

    const prompt = `
以下の挑戦に対して、今日できる最小の行動を1つだけ提案してください。
ルール：
- 5分以内でできること
- 具体的で簡単な行動
- 心理的ハードルが最も低いもの
- 例：「エディタを開いてHello Worldを書く」「参考書を1ページ開く」

挑戦内容：${challengeText}

提案：
`;

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 100,
      temperature: 0.7,
    });

    return res.status(200).json({ 
      suggestion: text.trim(),
      success: true 
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    
    // フォールバック：ルールベースの提案
    const fallbackSuggestions = {
      'プログラミング': 'エディタを開いてHello Worldを書く',
      '勉強': '参考書を1ページ開く',
      '運動': 'ウェアに着替えてストレッチをする',
      '読書': '本を1分間開く',
      '料理': 'レシピを1つ読む',
      '掃除': '掃除機を1分かける',
      '英語': '英単語を1つ調べる',
      '音楽': '楽器を1分間触る',
      '絵': '鉛筆を1本用意する',
      'default': '準備を1分間する'
    };

    let suggestion = fallbackSuggestions.default;
    for (const [key, value] of Object.entries(fallbackSuggestions)) {
      if (challengeText.includes(key)) {
        suggestion = value;
        break;
      }
    }

    return res.status(200).json({ 
      suggestion,
      success: true,
      fallback: true
    });
  }
}
