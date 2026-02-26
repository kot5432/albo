import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { text: challengeText, category, difficultyLevel } = body;

    if (!challengeText) {
      return new Response(JSON.stringify({ error: 'Challenge text is required' }), { status: 400 });
    }

    const model = groq('llama-3.1-8b-instant');

    // 共通システムプロンプト
    const basePrompt = `あなたは「挑戦初動設計AI」です。

目的：
ユーザーの挑戦を24時間以内に必ず実行できる
最小かつ具体的な物理行動に変換すること。

絶対条件：
・5〜15分以内で終わる
・今日実行可能
・抽象語禁止（例：頑張る、意識する、考える）
・心理論禁止
・準備だけで終わらない
・命令形で簡潔に

JSON形式のみで出力すること。

{
  "initialActionTitle": "",
  "initialActionDescription": "",
  "estimatedMinutes": number,
  "actionType": "environment | mini_execution | public_commitment",
  "whyThisFitsCategory": ""
}`;

    // カテゴリ別追加指示
    const categoryPrompts = {
      '学習系': `
この挑戦は学習系です。

最優先は「超短時間の実行体験」です。

推奨：
・1問解く
・5分だけやる
・1ページ読む
・1動画見る（短い）

環境準備だけで終わらせないこと。
必ず「学習そのもの」を含める。`,
      
      '健康系': `
この挑戦は健康系です。

最優先は「身体を実際に動かすこと」。

推奨：
・1回だけやる
・5分歩く
・3回だけ実行する

環境構築は補助として許可。
しかし必ず身体動作を含めること。`,
      
      '発信系': `
この挑戦は発信系です。

最優先は「実際に公開すること」。

推奨：
・1投稿する
・宣言を公開する
・下書きを1つ完成させる

公開性を含めるとより良い。`,
      
      '創作系': `
この挑戦は創作系です。

最優先は「小さくても完成させること」。

推奨：
・1ファイル作る
・100文字書く
・1画面作る
・1スケッチ描く

途中で止まらないよう「完成単位」を設定する。`,
      
      'ビジネス系': `
この挑戦はビジネス系です。

最優先は「外部との接触」。

推奨：
・1通送る
・1人に連絡する
・1社調査する

思考だけで終わらせないこと。`,
      
      '人間関係系': `
この挑戦は人間関係系です。

最優先は「具体的な接触」。

推奨：
・1メッセージ送る
・今日1回挨拶する
・感謝を1回伝える

抽象的な改善は禁止。`
    };

    // カテゴリに応じてプロンプトを動的に結合
    const categoryPrompt = category && categoryPrompts[category as keyof typeof categoryPrompts] 
      ? categoryPrompts[category as keyof typeof categoryPrompts] 
      : '';

    // 難易度別の戦略マトリクス
    const getStrategyByLevel = (level: number) => {
      if (level === 1) return 'mini_execution'; // すぐ実行
      if (level === 2) return 'mini_execution_plus_structure'; // 実行＋環境構築
      if (level === 3) return 'public_commitment_plus_structure'; // 公開＋環境構築
      return 'mini_execution'; // デフォルト
    };

    const strategy = getStrategyByLevel(difficultyLevel || 2);

    // 難易度別の追加指示
    const difficultyPrompts = {
      1: '\n\nこの挑戦はLevel1（習慣レベル）です。\n戦略：すぐ実行（mini_execution）\n5分程度の超短時間で終わる体験型の行動を提案してください。環境構築は不要です。',
      2: '\n\nこの挑戦はLevel2（成長レベル）です。\n戦略：実行＋環境構築（mini_execution_plus_structure）\n10分前後の具体的な行動＋簡単な準備行動を提案してください。',
      3: '\n\nこの挑戦はLevel3（人生変化レベル）です。\n戦略：公開＋環境構築（public_commitment_plus_structure）\n環境構築＋公開宣言＋接触行動を組み合わせた心理的ハードルを下げる行動を提案してください。'
    };

    const difficultyPrompt = difficultyLevel && difficultyPrompts[difficultyLevel as keyof typeof difficultyPrompts]
      ? difficultyPrompts[difficultyLevel as keyof typeof difficultyPrompts]
      : difficultyPrompts[2]; // デフォルトはLevel2

    const finalPrompt = `${basePrompt}

${categoryPrompt}

${difficultyPrompt}

挑戦内容：${challengeText}

上記の条件とカテゴリ別指示、難易度別指示に従って、最適な初動行動をJSONで出力してください。`;

    const { text: result } = await generateText({
      model,
      prompt: finalPrompt,
      maxRetries: 3,
      temperature: 0.3, // より一貫性を出すために温度を下げる
    });

    // JSONレスポンスを抽出
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIが有効なJSONを出力しませんでした');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      ...aiResponse,
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Suggestion error:', error);
    
    // フォールバックレスポンス
    return new Response(JSON.stringify({
      initialActionTitle: '準備を始める',
      initialActionDescription: '挑戦の準備を5分間行う',
      estimatedMinutes: 5,
      actionType: 'environment',
      whyThisFitsCategory: 'エラー時のフォールバック対応',
      success: false,
      error: 'AI提案の生成に失敗しました'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
