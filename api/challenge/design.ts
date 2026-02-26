import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const config = {
    runtime: 'edge',
};

// 型定義
export type ChallengeAIResponse = {
  isConcrete: boolean;
  refinedChallenge: {
    title: string;
    description: string;
  };
  category: "学習系" | "健康系" | "発信系" | "創作系" | "ビジネス系" | "人間関係系";
  difficultyLevel: 1 | 2 | 3;
  initialAction: {
    title: string;
    description: string;
    estimatedMinutes: number;
    actionType: "mini_execution" | "environment" | "public_commitment";
  };
  designReason: string;
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { challengeText, deadline, seriousness, reason } = body;

    if (!challengeText) {
      return new Response(JSON.stringify({ error: 'Challenge text is required' }), { status: 400 });
    }

    // 本気度に基づく戦略調整
    const getStrategyBySeriousness = (level: number) => {
      if (level <= 2) return 'low_commitment'; // 低い本気度：より簡単な初動
      if (level <= 4) return 'medium_commitment'; // 中程度：バランス型
      return 'high_commitment'; // 高い本気度：より強い初動
    };

    const strategy = getStrategyBySeriousness(seriousness || 3);

    const model = groq('llama-3.1-8b-instant');

    // システムプロンプト
    const systemPrompt = `あなたは挑戦設計AIです。

目的：
ユーザーの挑戦を構造化し、
24時間以内に必ず実行できる最小初動を設計すること。

手順：
1. 挑戦が具体的か判定
2. 抽象的なら具体化
3. カテゴリ分類
4. 難易度判定（1〜3）
5. カテゴリ×難易度×本気度に基づき初動設計

【カテゴリ定義】
学習系：知識習得
健康系：身体行動
発信系：公開を伴う
創作系：制作物を作る
ビジネス系：成果や収益
人間関係系：対人行動

【難易度定義】
1：習慣レベル（短時間継続）
2：成長レベル（数値目標あり）
3：人生変化レベル（大きな影響）

【本気度戦略】
low_commitment：超簡単な初動（5分程度）
medium_commitment：バランス型初動（10分程度）
high_commitment：より強い初動（環境構築＋公開）

【初動条件】
・5〜15分以内
・今日実行可能
・物理的行動
・抽象語禁止
・心理論禁止
・命令形で簡潔

JSONのみ出力。以下の形式に厳密に従うこと：

{
  "isConcrete": boolean,
  "refinedChallenge": {
    "title": "改善後の挑戦タイトル",
    "description": "改善後の挑戦説明"
  },
  "category": "学習系|健康系|発信系|創作系|ビジネス系|人間関係系",
  "difficultyLevel": 1|2|3,
  "initialAction": {
    "title": "初動タイトル",
    "description": "初動の具体的な説明",
    "estimatedMinutes": 5-15の数字,
    "actionType": "mini_execution|environment|public_commitment"
  },
  "designReason": "なぜこの初動が最適かの理由"
}`;

    // ユーザープロンプト構築
    const userPrompt = `挑戦内容: ${challengeText}
期限: ${deadline || '未設定'}
本気度: ${seriousness || 3}/5
理由: ${reason || '未設定'}`;

    const { text: result } = await generateText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxRetries: 3,
      temperature: 0.4,
    });

    // JSONレスポンスを抽出
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AIが有効なJSONを出力しませんでした');
    }

    const aiResponse: ChallengeAIResponse = JSON.parse(jsonMatch[0]);

    // ガード処理
    if (!aiResponse.initialAction?.title) {
      throw new Error('Invalid AI response: missing initialAction title');
    }

    if (aiResponse.initialAction.estimatedMinutes > 15 || aiResponse.initialAction.estimatedMinutes < 5) {
      // 時間が範囲外の場合は修正
      aiResponse.initialAction.estimatedMinutes = Math.max(5, Math.min(15, aiResponse.initialAction.estimatedMinutes));
    }

    // カテゴリのバリデーション
    const validCategories = ["学習系", "健康系", "発信系", "創作系", "ビジネス系", "人間関係系"];
    if (!validCategories.includes(aiResponse.category)) {
      aiResponse.category = "学習系"; // デフォルト
    }

    // 難易度のバリデーション
    if (![1, 2, 3].includes(aiResponse.difficultyLevel)) {
      aiResponse.difficultyLevel = 2; // デフォルト
    }

    // アクションタイプのバリデーション
    const validActionTypes = ["mini_execution", "environment", "public_commitment"];
    if (!validActionTypes.includes(aiResponse.initialAction.actionType)) {
      aiResponse.initialAction.actionType = "mini_execution"; // デフォルト
    }

    return new Response(JSON.stringify({
      ...aiResponse,
      success: true,
      strategy: strategy
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Challenge design error:', error);
    
    // フォールバックレスポンス
    const fallbackText = '挑戦';
    return new Response(JSON.stringify({
      isConcrete: true,
      refinedChallenge: {
        title: fallbackText,
        description: fallbackText
      },
      category: "学習系",
      difficultyLevel: 2,
      initialAction: {
        title: "準備を始める",
        description: "挑戦の準備を5分間行う",
        estimatedMinutes: 5,
        actionType: "environment"
      },
      designReason: "エラー時のフォールバック対応",
      success: false,
      error: 'AI設計に失敗しました'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
