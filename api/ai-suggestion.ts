import { groq } from '@ai-sdk/groq';
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
    const { text: challengeText } = body;

    if (!challengeText) {
      return new Response(JSON.stringify({ error: 'Challenge text is required' }), { status: 400 });
    }

    const model = groq('llama-3.1-8b-instant');

    const prompt = `
あなたは挑戦初動設計AIです。
ユーザーの挑戦を24時間以内に必ず動ける最小の具体的行動に分解してください。
抽象的にしないでください。

ルール：
- 5分以内でできること
- 具体的で簡単な行動
- 心理的ハードルが最も低いもの
- 例：「エディタを開いてHello Worldを書く」「参考書を1ページ開く」

挑戦内容：${challengeText}

提案：
`;

    const { text: result } = await generateText({
      model,
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({
      suggestion: result.trim(),
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Suggestion error:', error);
    return new Response(JSON.stringify({
      error: '提案の生成に失敗しました',
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
