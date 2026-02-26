import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const config = {
    runtime: 'edge',
};

// キーワード辞書による分類
const keywordClassification = (text: string): string | null => {
    const keywords = {
        '学習系': ['英語', '勉強', '学習', 'プログラミング', '資格', 'スキル', '読書', '講座', 'オンライン'],
        '健康系': ['筋トレ', 'ダイエット', 'ランニング', '運動', 'ジム', 'ストレッチ', 'ヨガ', 'ウォーキング', '食事', '睡眠'],
        '発信系': ['投稿', 'ブログ', 'SNS', 'X', 'ツイート', 'YouTube', '発信', 'アウトプット', '公開'],
        '創作系': ['アプリ', '開発', '小説', 'イラスト', '絵', '音楽', 'デザイン', '制作', '作成', '描く'],
        'ビジネス系': ['起業', '営業', '仕事', 'ビジネス', 'コンテスト', '応募', 'メール', '資料', '顧客'],
        '人間関係系': ['家族', '友人', '友達', '挨拶', '感謝', '話す', '連絡', 'コミュニケーション', '人間関係']
    };

    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => text.includes(word))) {
            return category;
        }
    }
    return null;
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

        // まずキーワード辞書で分類
        const keywordResult = keywordClassification(text);
        
        if (keywordResult) {
            return new Response(JSON.stringify({
                category: keywordResult,
                reason: `キーワードによる分類: ${keywordResult}`,
                method: 'keyword',
                success: true
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // キーワードで分類できない場合はAIで分類
        const model = groq('llama-3.1-8b-instant');

        const prompt = `
あなたは挑戦内容分類AIです。
以下の6カテゴリのどれに当てはまるか判定してください。

1. 学習系 - 知識・スキル習得（英語、プログラミング、資格勉強など）
2. 健康系 - 運動・食事・睡眠（筋トレ、ダイエット、ランニングなど）
3. 発信系 - 外部公開が含まれる（SNS投稿、ブログ、YouTubeなど）
4. 創作系 - 制作物を作る（アプリ開発、小説、イラストなど）
5. ビジネス系 - 成果を狙う行動（起業、営業、コンテスト応募など）
6. 人間関係系 - 対人行動（家族との時間、友達作り、感謝など）

挑戦内容：${text}

必ず1つだけ選んでください。
JSONで出力してください。

{
  "category": "",
  "reason": ""
}`;

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
            category: data.category,
            reason: data.reason,
            method: 'ai',
            success: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Classification error:', error);
        return new Response(JSON.stringify({
            error: '分類に失敗しました',
            success: false
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
