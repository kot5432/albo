import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const config = {
    runtime: 'edge',
};

// ルールベースの難易度判定
const ruleBasedDifficulty = (text: string): number | null => {
    // Level 3：人生変化レベル
    const level3Keywords = ['起業', 'プロになる', '独立', '海外移住', '転職', '退職', '結婚', '離婚', '出産'];
    if (level3Keywords.some(keyword => text.includes(keyword))) {
        return 3;
    }

    // Level 1：習慣レベル
    const level1Patterns = [
        /毎日.*[0-9]+分/,
        /週[0-9]+回/,
        /日課/,
        /習慣/,
        /ルーティン/
    ];
    if (level1Patterns.some(pattern => pattern.test(text))) {
        return 1;
    }

    // Level 2：数値目標がある場合
    const level2Patterns = [
        /[0-9]+kg/,
        /TOEIC[0-9]+/,
        /[0-9]+点/,
        /ヶ月.*/,
        /週.*[0-9]+回/
    ];
    if (level2Patterns.some(pattern => pattern.test(text))) {
        return 2;
    }

    return null; // AIに委ねる
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
        }

        // まずルールベースで判定
        const ruleResult = ruleBasedDifficulty(text);
        if (ruleResult) {
            const levelNames = ['', '習慣レベル', '成長レベル', '人生変化レベル'];
            return new Response(JSON.stringify({
                difficultyLevel: ruleResult,
                difficulty: ['軽い', '中', '重'][ruleResult - 1],
                reason: `ルールベース判定：${levelNames[ruleResult]}`,
                method: 'rule',
                success: true
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // AIによる難易度判定
        const model = groq('llama-3.1-8b-instant');

        const prompt = `
あなたは挑戦難易度判定AIです。
以下の基準で判定してください。

Level1（習慣レベル）
・短時間の継続行動
・小さな行動目標

Level2（成長レベル）
・数値目標あり
・数ヶ月スパン
・スキル向上

Level3（人生変化レベル）
・人生に大きな影響
・職業や収入に関係
・社会的評価が関わる

必ず1つだけ選んでください。

JSON形式で出力：

{
  "difficultyLevel": 1 | 2 | 3,
  "reason": ""
}

挑戦内容：${text}`;

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
            difficultyLevel: data.difficultyLevel,
            difficulty: ['軽い', '中', '重'][data.difficultyLevel - 1],
            reason: data.reason,
            method: 'ai',
            success: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Difficulty assessment error:', error);
        return new Response(JSON.stringify({
            difficultyLevel: 2,
            difficulty: '中',
            reason: 'エラー時のフォールバック',
            method: 'fallback',
            success: false
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
