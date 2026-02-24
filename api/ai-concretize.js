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
ユーザーの挑戦をSMART原則に基づいて具体化してください。

SMARTとは：
S: 具体的
M: 測定可能
A: 実行可能
R: 意味がある
T: 期限がある

必ず今日から始められる内容にしてください。
抽象語は禁止です。
必ずJSONで返してください。

{
  "title": "具体化された挑戦タイトル",
  "description": "具体的かつ実行可能な行動内容",
  "metric": "測定可能な指標（例：30分、5ページ、1回）",
  "deadlineSuggestion": "推奨される期限（例：1週間、1ヶ月）"
}

対象の挑戦：${text}
`;

        const { text: result } = await generateText({
            model,
            prompt,
            maxTokens: 400,
            temperature: 0.7,
        });

        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AIが有効なJSONを出力しませんでした');
        }

        const data = JSON.parse(jsonMatch[0]);

        return res.status(200).json({
            ...data,
            success: true
        });

    } catch (error) {
        console.error('Concretization error:', error);
        return res.status(500).json({
            error: '具体化に失敗しました',
            success: false
        });
    }
}
