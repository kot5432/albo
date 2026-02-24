import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
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

        return new Response(JSON.stringify({
            ...data,
            success: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Concretization error:', error);
        return new Response(JSON.stringify({
            error: '具体化に失敗しました',
            success: false
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
