// アプリケーション状態管理
class ChallengeApp {
    constructor() {
        this.currentChallenge = null;
        this.challengeHistory = [];
        this.notes = '';
        this.othersReasons = [
            "自分を変えたいと思ったから",
            "今のままではいけないと感じた",
            "新しい可能性を試したい",
            "自信を持ちたいから",
            "誰かの役に立ちたいから",
            "挑戦すること自体が目的だから"
        ];
        this.countdownTimer = null;
        this.startTime = null;

        this.init();
    }

    // 挑戦タイプ別のテンプレート
    challengeTemplates = {
        learning: {
            actions: ['英語学習する', 'プログラミングする', '読書する', 'オンライン講座を受ける'],
            amounts: ['30分', '1時間', '5ページ', '1レッスン'],
            examples: '毎日30分英語学習する'
        },
        health: {
            actions: ['筋トレする', 'ランニングする', 'ストレッチする', 'ヨガする'],
            amounts: ['30分', '5km', '3セット', '15分'],
            examples: '週3回ジムで筋トレする'
        },
        creative: {
            actions: ['絵を描く', '文章を書く', '音楽を作る', 'デザインする'],
            amounts: ['1時間', '1作品', '500文字', '1曲'],
            examples: '毎日1時間絵を描く'
        },
        business: {
            actions: ['メール返信する', '資料作成する', 'ネットワーキングする', 'スキルアップする'],
            amounts: ['10通', '1ページ', '1人', '30分'],
            examples: '毎日10通ビジネスメールを返信する'
        },
        social: {
            actions: ['友人と連絡する', '家族と話す', 'コミュニティに参加する'],
            amounts: ['1人', '30分', '1回'],
            examples: '週に1回友人と連絡する'
        },
        publish: {
            actions: ['ブログを書く', 'SNS投稿する', '動画投稿する', '発信する'],
            amounts: ['1記事', '1投稿', '1本', '1ツイート'],
            examples: '毎日1ツイート発信する'
        }
    };

    // カテゴリ別最小行動テンプレート
    minimalActionTemplates = {
        '学習系': {
            patterns: [
                '5分だけ{action}をやってみる',
                '1ページだけ{action}の教材を開く',
                '1問だけ{action}の問題を解く',
                '{action}のアプリを開いてチュートリアルを始める'
            ],
            focus: '体験型'
        },
        '健康系': {
            patterns: [
                '{action}の準備をする（シューズを出す、ウェアを用意する）',
                '1回だけ{action}をやってみる',
                '5分だけ{action}の軽いバージョンをやる',
                '{action}の時間をカレンダーに予約する'
            ],
            focus: '環境構築＋超短縮'
        },
        '発信系': {
            patterns: [
                'SNSで{action}を宣言投稿する',
                '1回だけ{action}をやってみる（下書きでもOK）',
                '{action}の下書きを1つ作る',
                '{action}のアイデアを1つ書き出す'
            ],
            focus: '公開型'
        },
        '創作系': {
            patterns: [
                '{action}の新しいファイルを作る',
                '1画面だけ{action}をやってみる',
                '100文字だけ{action}を書く',
                '{action}の準備を整える（道具を用意する）'
            ],
            focus: '小さな完成'
        },
        'ビジネス系': {
            patterns: [
                '1通だけ{action}のメールを送る',
                '1人に{action}について相談する',
                '1社だけ{action}の情報を調べる',
                '{action}の計画を1つ書き出す'
            ],
            focus: '接触行動'
        },
        '人間関係系': {
            patterns: [
                '1人だけ{action}のメッセージを送る',
                '1回だけ{action}の挨拶をする',
                '今日1人に{action}で感謝を伝える',
                '{action}の時間を5分だけ取る'
            ],
            focus: '具体的接触'
        }
    };

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateUI();
        this.startCountdown();
        this.setupDeadlineInput();
        this.setupChallengeInput();
        this.setupDeadlineInput();
        this.setupSeriousnessSlider();

        // 初期画面の振り分け
        if (this.currentChallenge) {
            this.showScreen('home');
        } else {
            this.showScreen('lp');
        }
    }

    // 本気度スライダーのセットアップ
    setupSeriousnessSlider() {
        const slider = document.getElementById('seriousness');
        const valueDisplay = document.getElementById('seriousnessValue');
        const deadlineSelect = document.getElementById('deadline');
        const deadlineDate = document.getElementById('deadlineDate');
        const deadlineQuickSelect = document.getElementById('deadlineQuickSelect');

        // スライダー値の更新
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            this.validateChallengeInput();
        });

        // 期限選択の制御
        deadlineSelect.addEventListener('change', () => {
            if (deadlineSelect.value === 'custom') {
                deadlineDate.style.display = 'block';
                deadlineQuickSelect.style.display = 'flex';
                this.setupDeadlineQuickSelect();
            } else {
                deadlineDate.style.display = 'none';
                deadlineQuickSelect.style.display = 'none';
            }
            this.validateChallengeInput();
        });

        // 入力バリデーション
        [document.getElementById('challengeText'), document.getElementById('reason')].forEach(element => {
            element.addEventListener('input', () => this.validateChallengeInput());
        });
    }

    // 期限クイック選択のセットアップ
    setupDeadlineQuickSelect() {
        const deadlineDate = document.getElementById('deadlineDate');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);

        // 日付の制限を設定
        deadlineDate.min = tomorrow.toISOString().split('T')[0];
        deadlineDate.max = maxDate.toISOString().split('T')[0];

        // クイック選択ボタンのイベントリスナー
        document.querySelectorAll('#deadlineQuickSelect .btn-quick').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = parseInt(e.target.dataset.days);
                const targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + days);
                deadlineDate.value = targetDate.toISOString().split('T')[0];
            });
        });
    }

    // 挑戦入力のバリデーション
    validateChallengeInput() {
        const challengeText = document.getElementById('challengeText').value.trim();
        const deadline = document.getElementById('deadline').value;
        const deadlineDate = document.getElementById('deadlineDate').value;
        const seriousness = document.getElementById('seriousness').value;
        const nextBtn = document.getElementById('nextToAI');

        const isValid = challengeText && 
                        seriousness && 
                        (deadline !== 'custom' || deadlineDate);

        nextBtn.disabled = !isValid;
    }

    // 期限入力のセットアップ
    setupChallengeInput() {
        const challengeType = document.getElementById('challengeType');
        const frequency = document.getElementById('frequency');
        const weeklyTimes = document.getElementById('weeklyTimes');
        const action = document.getElementById('action');
        const amount = document.getElementById('amount');
        const timeContext = document.getElementById('timeContext');
        const preview = document.getElementById('challengePreview');

        // 初期状態
        preview.classList.add('empty');
        preview.textContent = '入力すると挑戦内容が表示されます';

        // イベントリスナー
        [challengeType, frequency, weeklyTimes, action, amount, timeContext].forEach(element => {
            element.addEventListener('input', () => this.updateChallengePreview());
            element.addEventListener('change', () => this.updateChallengePreview());
        });

        // 頻度選択の制御
        frequency.addEventListener('change', () => {
            if (frequency.value === 'times') {
                weeklyTimes.style.display = 'inline-block';
            } else {
                weeklyTimes.style.display = 'none';
            }
        });

        // 挑戦タイプ選択時のヒント表示
        challengeType.addEventListener('change', () => {
            if (challengeType.value && this.challengeTemplates[challengeType.value]) {
                const template = this.challengeTemplates[challengeType.value];
                action.placeholder = `例：${template.actions[0]}`;
                amount.placeholder = `例：${template.amounts[0]}`;
            }
        });
    }

    // 挑戦プレビュー更新
    updateChallengePreview() {
        const challengeType = document.getElementById('challengeType').value;
        const frequency = document.getElementById('frequency').value;
        const weeklyTimes = document.getElementById('weeklyTimes').value;
        const action = document.getElementById('action').value;
        const amount = document.getElementById('amount').value;
        const timeContext = document.getElementById('timeContext').value;
        const preview = document.getElementById('challengePreview');

        // 頻度テキストの生成
        let frequencyText = '';
        if (frequency === 'daily') {
            frequencyText = '毎日';
        } else if (frequency === 'weekly') {
            frequencyText = '毎週';
        } else if (frequency === 'times' && weeklyTimes) {
            frequencyText = `週${weeklyTimes}回`;
        }

        // プレビューの生成
        if (frequencyText && action && amount) {
            let previewText = `${frequencyText}${action}を${amount}`;
            if (timeContext) {
                previewText += `（${timeContext}）`;
            }
            preview.textContent = previewText;
            preview.classList.remove('empty');
        } else {
            preview.textContent = '入力すると挑戦内容が表示されます';
            preview.classList.add('empty');
        }

        // バリデーションとボタン制御
        this.validateChallengeInput();
    }

    // 挑戦入力のバリデーション
    validateChallengeInput() {
        const challengeType = document.getElementById('challengeType').value;
        const frequency = document.getElementById('frequency').value;
        const weeklyTimes = document.getElementById('weeklyTimes').value;
        const action = document.getElementById('action').value;
        const amount = document.getElementById('amount').value;
        const deadline = document.getElementById('deadline').value;
        const nextBtn = document.getElementById('nextToAI');

        const isValid = challengeType && 
                        frequency && 
                        (frequency !== 'times' || weeklyTimes) && 
                        action && 
                        amount && 
                        deadline;

        nextBtn.disabled = !isValid;
    }

    // 期限入力のセットアップ
    setupDeadlineInput() {
        const deadlineInput = document.getElementById('deadline');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);

        // 日付の制限を設定
        deadlineInput.min = tomorrow.toISOString().split('T')[0];
        deadlineInput.max = maxDate.toISOString().split('T')[0];

        // クイック選択ボタンのイベントリスナー
        document.querySelectorAll('.btn-quick').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = parseInt(e.target.dataset.days);
                const targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + days);
                deadlineInput.value = targetDate.toISOString().split('T')[0];
                
                // 選択されたボタンの視覚的フィードバック
                document.querySelectorAll('.btn-quick').forEach(b => b.style.background = '#f8f9fa');
                e.target.style.background = '#4A90E2';
                e.target.style.color = 'white';
            });
        });

        // 日付変更時にボタンの色をリセット
        deadlineInput.addEventListener('change', () => {
            document.querySelectorAll('.btn-quick').forEach(b => {
                b.style.background = '#f8f9fa';
                b.style.color = '';
            });
        });
    }

    // ローカルストレージからデータ読み込み
    loadFromStorage() {
        const saved = localStorage.getItem('challengeApp');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentChallenge = data.currentChallenge || null;
            this.challengeHistory = data.challengeHistory || [];
            this.notes = data.notes || '';
            this.startTime = data.startTime || null;
        }
    }

    // ローカルストレージにデータ保存
    saveToStorage() {
        const data = {
            currentChallenge: this.currentChallenge,
            challengeHistory: this.challengeHistory,
            notes: this.notes,
            startTime: this.startTime
        };
        localStorage.setItem('challengeApp', JSON.stringify(data));
    }

    // イベントリスナー設定
    bindEvents() {
        // LP -> 宣言作成
        document.getElementById('startChallenge').addEventListener('click', () => {
            this.showScreen('declarationScreen');
        });

        // 宣言作成 -> AI設計
        document.getElementById('nextToAI').addEventListener('click', async () => {
            const challengeText = document.getElementById('challengeText').value.trim();
            const deadline = document.getElementById('deadline').value;
            const deadlineDate = document.getElementById('deadlineDate').value;
            const seriousness = document.getElementById('seriousness').value;
            const reason = document.getElementById('reason').value.trim();

            if (!challengeText) {
                this.showError('挑戦内容を入力してください');
                return;
            }

            // 期限の処理
            let finalDeadline = '';
            if (deadline === 'custom' && deadlineDate) {
                finalDeadline = deadlineDate;
            } else if (deadline === '1month') {
                const date = new Date();
                date.setMonth(date.getMonth() + 1);
                finalDeadline = date.toISOString().split('T')[0];
            } else if (deadline === '3months') {
                const date = new Date();
                date.setMonth(date.getMonth() + 3);
                finalDeadline = date.toISOString().split('T')[0];
            } else if (deadline === '6months') {
                const date = new Date();
                date.setMonth(date.getMonth() + 6);
                finalDeadline = date.toISOString().split('T')[0];
            }

            // AI設計を呼び出し
            const design = await this.generateChallengeDesign(challengeText, finalDeadline, seriousness, reason);
            this.displayDesignResults(design);
            this.showScreen('aiDesignScreen');
        });

        // AI設計画面 -> 戻る
        document.getElementById('backToDeclaration').addEventListener('click', () => {
            this.showScreen('declarationScreen');
        });

        // AI設計 -> 承認
        document.getElementById('approveDesign').addEventListener('click', () => {
            this.createChallengeFromDesign();
        });

        // AI提案 -> 不可逆確認
        document.getElementById('approveAction').addEventListener('click', () => {
            const action = document.getElementById('editableAction').value.trim();
            if (!action) {
                this.showError('今日の行動を入力してください');
                return;
            }

            this.showScreen('irreversibleScreen');
        });

        // 不可逆確認 -> ホーム
        document.getElementById('understandCheck').addEventListener('change', (e) => {
            document.getElementById('startChallengeFinal').disabled = !e.target.checked;
        });

        document.getElementById('startChallengeFinal').addEventListener('click', () => {
            this.createChallenge();
        });

        // ホーム画面ボタン
        document.getElementById('viewDetails').addEventListener('click', () => {
            this.showChallengeDetails();
        });

        document.getElementById('openRecord').addEventListener('click', () => {
            this.showModal('recordModal');
        });

        document.getElementById('viewHistory').addEventListener('click', () => {
            this.showHistory();
        });

        document.getElementById('openNotes').addEventListener('click', () => {
            this.showNotes();
        });

        // 記録モーダル
        document.getElementById('saveRecord').addEventListener('click', () => {
            this.saveRecord();
        });

        // 画像プレビュー
        document.getElementById('recordImage').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        // 挑戦詳細モーダル
        document.getElementById('retryChallenge').addEventListener('click', () => {
            this.retryChallenge();
        });

        // 履歴画面
        document.getElementById('backToHome').addEventListener('click', () => {
            this.showScreen('home');
        });

        // 構想ノート
        document.getElementById('saveNotes').addEventListener('click', () => {
            this.saveNotes();
        });

        document.getElementById('convertToChallenge').addEventListener('click', () => {
            this.convertNotesToChallenge();
        });

        // 挑戦理由
        document.getElementById('saveReason').addEventListener('click', () => {
            this.saveReason();
        });

        // モーダル背景クリックで閉じる
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // AIで具体化ボタン
        document.getElementById('autoConcretize').addEventListener('click', () => {
            this.concretizeChallenge();
        });
    }

    // 構造化された挑戦テキストを取得
    getChallengeText() {
        const frequency = document.getElementById('frequency').value;
        const weeklyTimes = document.getElementById('weeklyTimes').value;
        const action = document.getElementById('action').value;
        const amount = document.getElementById('amount').value;
        const timeContext = document.getElementById('timeContext').value;

        // 頻度テキストの生成
        let frequencyText = '';
        if (frequency === 'daily') {
            frequencyText = '毎日';
        } else if (frequency === 'weekly') {
            frequencyText = '毎週';
        } else if (frequency === 'times' && weeklyTimes) {
            frequencyText = `週${weeklyTimes}回`;
        }

        if (!frequencyText || !action || !amount) {
            return '';
        }

        let challengeText = `${frequencyText}${action}を${amount}`;
        if (timeContext) {
            challengeText += `（${timeContext}）`;
        }

        return challengeText;
    }

    // AI設計生成
    async generateChallengeDesign(challengeText, deadline, seriousness, reason) {
        try {
            const response = await fetch('/api/challenge/design', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    challengeText,
                    deadline,
                    seriousness: parseInt(seriousness),
                    reason
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Challenge design error:', error);
            throw new Error('AI設計の生成に失敗しました');
        }
    }

    // 設計結果の表示
    displayDesignResults(design) {
        const resultsContainer = document.getElementById('designResults');
        
        const categoryClass = this.getCategoryClass(design.category);
        const difficultyClass = this.getDifficultyClass(design.difficultyLevel);
        const actionTypeLabel = this.getActionTypeLabel(design.initialAction.actionType);

        resultsContainer.innerHTML = `
            ${!design.isConcrete && design.refinedChallenge ? `
            <div class="design-section refined-challenge">
                <h3>🎯 改善された挑戦</h3>
                <p><strong>${design.refinedChallenge.title}</strong></p>
                <p>${design.refinedChallenge.description}</p>
            </div>
            ` : ''}
            
            <div class="design-section">
                <h3>📊 挑戦分析</h3>
                <p>
                    <span class="category-badge ${categoryClass}">${design.category}</span>
                    <span class="difficulty-badge ${difficultyClass}">Level ${design.difficultyLevel}</span>
                </p>
            </div>
            
            <div class="design-section initial-action">
                <h3>🚀 最小初動</h3>
                <p><strong>${design.initialAction.title}</strong></p>
                <div class="action-details">
                    <p>${design.initialAction.description}</p>
                    <p class="action-time">⏱️ 所要時間：${design.initialAction.estimatedMinutes}分</p>
                    <p>🎯 アクションタイプ：${actionTypeLabel}</p>
                </div>
            </div>
            
            <div class="design-section design-reason">
                <h3>💡 設計理由</h3>
                <p>${design.designReason}</p>
            </div>
        `;
    }

    // カテゴリクラスの取得
    getCategoryClass(category) {
        const classMap = {
            '学習系': 'category-learning',
            '健康系': 'category-health',
            '発信系': 'category-publish',
            '創作系': 'category-creative',
            'ビジネス系': 'category-business',
            '人間関係系': 'category-social'
        };
        return classMap[category] || 'category-learning';
    }

    // 難易度クラスの取得
    getDifficultyClass(level) {
        return `difficulty-${level}`;
    }

    // 設計結果から挑戦を作成
    createChallengeFromDesign() {
        const challengeText = document.getElementById('challengeText').value.trim();
        const deadline = document.getElementById('deadline').value;
        const deadlineDate = document.getElementById('deadlineDate').value;
        const seriousness = document.getElementById('seriousness').value;
        const reason = document.getElementById('reason').value.trim();

        // 期限の処理
        let finalDeadline = '';
        if (deadline === 'custom' && deadlineDate) {
            finalDeadline = deadlineDate;
        } else if (deadline === '1month') {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            finalDeadline = date.toISOString().split('T')[0];
        } else if (deadline === '3months') {
            const date = new Date();
            date.setMonth(date.getMonth() + 3);
            finalDeadline = date.toISOString().split('T')[0];
        } else if (deadline === '6months') {
            const date = new Date();
            date.setMonth(date.getMonth() + 6);
            finalDeadline = date.toISOString().split('T')[0];
        }

        // AI設計結果を取得（現在表示されているもの）
        const designResults = document.getElementById('designResults');
        const actionTitle = designResults.querySelector('.initial-action strong')?.textContent || '挑戦を始める';
        const actionDescription = designResults.querySelector('.action-details p')?.textContent || '準備を始める';

        this.currentChallenge = {
            id: Date.now(),
            title: challengeText,
            deadline: finalDeadline,
            firstAction: actionTitle,
            reason: reason,
            seriousness: parseInt(seriousness),
            startDate: new Date().toISOString(),
            status: 'active',
            records: [],
            createdAt: new Date().toISOString()
        };

        this.startTime = new Date().toISOString();
        this.saveToStorage();

        this.showScreen('home');
        this.updateUI();
        this.startCountdown();
    }
    async generateAISuggestion(challengeText) {
        try {
            // 4段階処理
            // 1. 具体性判定（既存のバリデーション）
            // 2. カテゴリ分類
            const category = await this.classifyChallenge(challengeText);
            
            // 3. 難易度判定
            const difficulty = await this.assessDifficulty(challengeText);
            
            // 4. カテゴリ別初動生成（難易度レベル情報を含む）
            const response = await fetch('/api/ai-suggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    challengeText,
                    category: category.category,
                    difficultyLevel: difficulty.difficultyLevel
                }),
            });

            const data = await response.json();

            if (data.success && data.initialActionTitle) {
                // 新しいJSON形式のレスポンスを処理
                const { initialActionTitle, initialActionDescription, estimatedMinutes, actionType, whyThisFitsCategory } = data;
                
                // 難易度情報を追加
                const difficultyLabel = this.getDifficultyLabel(difficulty.difficultyLevel);
                
                // 詳細な説明を生成
                let detailedDescription = `${initialActionDescription}\n\n⏱️ 所要時間：${estimatedMinutes}分\n🎯 アクションタイプ：${this.getActionTypeLabel(actionType)}\n💡 この行動が選ばれた理由：${whyThisFitsCategory}\n📊 挑戦難易度：${difficultyLabel}`;
                
                return detailedDescription;
            } else {
                throw new Error(data.error || 'AI提案の生成に失敗しました');
            }
        } catch (error) {
            console.error('AI suggestion error:', error);

            // フォールバック：カテゴリ別テンプレートを使用
            const category = await this.classifyChallenge(challengeText);
            const template = this.minimalActionTemplates[category.category];
            if (template) {
                const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)];
                return pattern.replace('{action}', this.extractAction(challengeText));
            }

            // 最終フォールバック：ルールベースの提案
            const suggestions = {
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

            for (const [key, value] of Object.entries(suggestions)) {
                if (challengeText.includes(key)) {
                    return value;
                }
            }
            return suggestions.default;
        }
    }

    // 難易度判定
    async assessDifficulty(text) {
        try {
            const response = await fetch('/api/ai-difficulty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Difficulty assessment error:', error);
            // フォールバック：デフォルト難易度
            return { difficulty: '中', difficultyLevel: 2, reason: 'フォールバック' };
        }
    }

    // 難易度の日本語ラベルを取得
    getDifficultyLabel(difficultyLevel) {
        const labels = {
            1: '🟢 Level 1：習慣レベル',
            2: '🟡 Level 2：成長レベル', 
            3: '🔴 Level 3：人生変化レベル'
        };
        return labels[difficultyLevel] || '🟡 Level 2：成長レベル';
    }

    // アクションタイプの日本語ラベルを取得
    getActionTypeLabel(actionType) {
        const labels = {
            'environment': '環境構築型',
            'mini_execution': '体験型',
            'public_commitment': '公開型'
        };
        return labels[actionType] || 'その他';
    }

    // 挑戦分類
    async classifyChallenge(text) {
        try {
            const response = await fetch('/api/ai-classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Classification error:', error);
            // フォールバック：デフォルト分類
            return { category: '学習系', reason: 'フォールバック' };
        }
    }

    // 行動内容の抽出
    extractAction(challengeText) {
        // 簡単な行動抽出ロジック
        const patterns = [
            /(.+)を(.+)/,
            /(.+)する/,
            /(.+)やる/
        ];
        
        for (const pattern of patterns) {
            const match = challengeText.match(pattern);
            if (match) {
                return match[1] || match[0];
            }
        }
        
        return '挑戦';
    }

    // 入力の妥当性チェック
    async checkInputValidity(input) {
        const checkStatus = document.querySelector('.check-status');
        const autoConcretizeBtn = document.getElementById('autoConcretize');

        if (!input || input.length < 2) {
            checkStatus.textContent = '';
            checkStatus.style.opacity = '0';
            autoConcretizeBtn.style.display = 'none';
            document.getElementById('nextToAI').disabled = true; // 無効化
            return false;
        }

        checkStatus.textContent = '...チェック中';
        checkStatus.style.color = 'var(--text-secondary)';
        checkStatus.style.opacity = '1';

        try {
            const response = await fetch('/api/ai-validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: input }),
            });

            const data = await response.json();

            if (data.success) {
                checkStatus.textContent = data.message;
                checkStatus.style.color = data.isValid ? '#4CAF50' : '#FF5722';

                // バリデーション結果に応じて「次へ」ボタンを制御
                const nextBtn = document.getElementById('nextToAI');
                nextBtn.disabled = !data.isValid;

                if (!data.isValid) {
                    autoConcretizeBtn.style.display = 'block';
                    checkStatus.title = data.reason || '';
                } else {
                    autoConcretizeBtn.style.display = 'none';
                }

                return data.isValid;
            }
        } catch (error) {
            console.error('Validation error:', error);
            // エラー時は安全のため「次へ」を無効化
            document.getElementById('nextToAI').disabled = true;
        }

        return false;
    }

    // AIによる具体化を実行
    async concretizeChallenge() {
        const input = document.getElementById('challengeInput');
        const autoConcretizeBtn = document.getElementById('autoConcretize');
        const originalText = input.value;

        try {
            autoConcretizeBtn.disabled = true;
            autoConcretizeBtn.textContent = '具体化中...';

            const response = await fetch('/api/ai-concretize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: originalText }),
            });

            const data = await response.json();

            if (data.success) {
                // 具体化された内容を反映
                input.value = `${data.title}\n${data.description}\n（指標：${data.metric}）`;
                // 期限の提案があれば反映（任意）
                if (data.deadlineSuggestion && !document.getElementById('deadline').value) {
                    // 推奨期限をセットするなどの処理
                }

                // 再バリデーション
                this.checkInputValidity(input.value);
            }
        } catch (error) {
            console.error('Concretize error:', error);
            this.showError('AIによる具体化に失敗しました');
        } finally {
            autoConcretizeBtn.disabled = false;
            autoConcretizeBtn.textContent = 'AIで具体化する';
        }
    }

    // 挑戦作成
    createChallenge() {
        const challengeText = this.getChallengeText();
        const deadline = document.getElementById('deadline').value;
        const firstAction = document.getElementById('editableAction').value.trim();
        const reason = document.getElementById('challengeReason').value.trim();

        this.currentChallenge = {
            id: Date.now(),
            title: challengeText,
            deadline: deadline,
            firstAction: firstAction,
            reason: reason,
            startDate: new Date().toISOString(),
            status: 'active',
            records: [],
            createdAt: new Date().toISOString()
        };

        this.startTime = new Date().toISOString();
        this.saveToStorage();

        this.hideModal('irreversibleModal');
        this.showScreen('home');
        this.updateUI();
        this.startCountdown();
    }

    // カウントダウン開始
    startCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }

        if (!this.startTime || !this.currentChallenge) {
            return;
        }

        this.countdownTimer = setInterval(() => {
            const now = new Date();
            const start = new Date(this.startTime);
            const elapsed = now - start;
            const remaining = 24 * 60 * 60 * 1000 - elapsed; // 24時間

            if (remaining <= 0) {
                clearInterval(this.countdownTimer);
                document.getElementById('timeRemaining').textContent = '時間切れ';
                this.currentChallenge.status = 'failed';
                this.saveToStorage();
                return;
            }

            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            document.getElementById('timeRemaining').textContent =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 記録保存
    saveRecord() {
        const recordText = document.getElementById('recordText').value.trim();
        if (!recordText) {
            this.showError('記録を入力してください');
            return;
        }

        const record = {
            id: Date.now(),
            text: recordText,
            date: new Date().toISOString(),
            image: document.getElementById('imagePreview').innerHTML || null
        };

        this.currentChallenge.records.push(record);
        this.saveToStorage();

        document.getElementById('recordText').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('recordImage').value = '';

        this.hideModal('recordModal');
        this.updateUI();
    }

    // 画像プレビュー
    previewImage(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        };
        reader.readAsDataURL(file);
    }

    // 挑戦詳細表示
    showChallengeDetails() {
        if (!this.currentChallenge) return;

        document.getElementById('detailTitle').textContent = this.currentChallenge.title;
        document.getElementById('detailStartDate').textContent = new Date(this.currentChallenge.startDate).toLocaleDateString();
        document.getElementById('detailDeadline').textContent = new Date(this.currentChallenge.deadline).toLocaleDateString();
        document.getElementById('detailStatus').textContent = this.getStatusText(this.currentChallenge.status);

        const actionLogList = document.getElementById('actionLogList');
        actionLogList.innerHTML = '';

        if (this.currentChallenge.records.length === 0) {
            actionLogList.innerHTML = '<p>まだ記録がありません</p>';
        } else {
            this.currentChallenge.records.forEach(record => {
                const item = document.createElement('div');
                item.className = 'action-item';
                item.innerHTML = `
                    <div class="date">${new Date(record.date).toLocaleString()}</div>
                    <div>${record.text}</div>
                    ${record.image ? record.image : ''}
                `;
                actionLogList.appendChild(item);
            });
        }

        this.showModal('detailsModal');
    }

    // 再挑戦
    retryChallenge() {
        if (!this.currentChallenge) return;

        // 現在の挑戦を履歴に追加
        this.challengeHistory.push({ ...this.currentChallenge });

        // 新しい挑戦として再設定
        this.currentChallenge = {
            ...this.currentChallenge,
            id: Date.now(),
            startDate: new Date().toISOString(),
            status: 'active',
            records: []
        };

        this.startTime = new Date().toISOString();
        this.saveToStorage();

        this.hideModal('detailsModal');
        this.updateUI();
        this.startCountdown();
    }

    // 履歴表示
    showHistory() {
        this.showScreen('history');

        // 統計更新
        document.getElementById('totalChallenges').textContent = this.challengeHistory.length;

        const completed = this.challengeHistory.filter(c => c.status === 'completed').length;
        const rate = this.challengeHistory.length > 0 ? Math.round((completed / this.challengeHistory.length) * 100) : 0;
        document.getElementById('achievementRate').textContent = `${rate}%`;

        // 履歴リスト
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        if (this.challengeHistory.length === 0) {
            historyList.innerHTML = '<p>まだ履歴がありません</p>';
        } else {
            this.challengeHistory.forEach(challenge => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <h4>${challenge.title}</h4>
                    <div class="meta">
                        開始: ${new Date(challenge.startDate).toLocaleDateString()} | 
                        期限: ${new Date(challenge.deadline).toLocaleDateString()} | 
                        状態: ${this.getStatusText(challenge.status)}
                    </div>
                    <div class="meta">記録数: ${challenge.records.length}</div>
                `;
                historyList.appendChild(item);
            });
        }
    }

    // 構想ノート表示
    showNotes() {
        document.getElementById('notesContent').value = this.notes;
        this.showModal('notesModal');
    }

    // 構想ノート保存
    saveNotes() {
        this.notes = document.getElementById('notesContent').value;
        this.saveToStorage();
        this.hideModal('notesModal');
    }

    // 構想ノートから挑戦へ
    convertNotesToChallenge() {
        const notesContent = document.getElementById('notesContent').value.trim();
        if (!notesContent) {
            this.showError('構想を入力してください');
            return;
        }

        document.getElementById('challengeInput').value = notesContent;
        this.hideModal('notesModal');
        this.showModal('declarationModal');
    }

    // 挑戦理由保存
    saveReason() {
        const reason = document.getElementById('reasonInput').value.trim();
        if (reason) {
            this.othersReasons.push(reason);
            // 他人の理由をランダム表示
            this.displayRandomReasons();
        }
        this.hideModal('reasonModal');
    }

    // ランダムな理由表示
    displayRandomReasons() {
        const reasonsList = document.getElementById('reasonsList');
        reasonsList.innerHTML = '';

        // ランダムに3つ表示
        const shuffled = [...this.othersReasons].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach(reason => {
            const item = document.createElement('div');
            item.className = 'reason-item';
            item.textContent = reason;
            reasonsList.appendChild(item);
        });
    }

    // UI更新
    updateUI() {
        if (this.currentChallenge) {
            document.getElementById('challengeTitle').textContent = this.currentChallenge.title;
            document.getElementById('challengeStatus').textContent = this.getStatusText(this.currentChallenge.status);
            document.getElementById('todayAction').textContent = this.currentChallenge.firstAction;

            // 他人の挑戦人数をランダムに変化
            const count = 100 + Math.floor(Math.random() * 50);
            document.getElementById('othersCount').textContent = count;
        } else {
            document.getElementById('challengeTitle').textContent = '挑戦を始めてください';
            document.getElementById('challengeStatus').textContent = '未開始';
            document.getElementById('todayAction').textContent = '-';
        }
    }

    // ステータステキスト取得
    getStatusText(status) {
        const statusMap = {
            'active': '進行中',
            'completed': '達成',
            'failed': '期限切れ'
        };
        return statusMap[status] || '不明';
    }

    // 画面切り替え
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // ホーム画面以外はスクロール禁止（没入感のため）
        if (screenId === 'home' || screenId === 'history' || screenId === 'notes') {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);
        }
    }

    // モーダル表示
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.classList.add('no-scroll');

        // 没入感アニメーション用のクラス追加
        const content = document.querySelector(`#${modalId} .modal-content`);
        if (content) {
            content.classList.add('reveal-text');
        }

        // 理由モーダルの場合はランダム理由を表示
        if (modalId === 'reasonModal') {
            this.displayRandomReasons();
        }
    }

    // モーダル非表示
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');

        // 他にアクティブなモーダルがなければno-scrollを解除
        const activeModals = document.querySelectorAll('.modal.active');
        if (activeModals.length === 0) {
            document.body.classList.remove('no-scroll');
        }

        const content = document.querySelector(`#${modalId} .modal-content`);
        if (content) {
            content.classList.remove('reveal-text');
        }
    }

    // エラー表示
    showError(message) {
        alert(message); // 簡易的なエラー表示
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new ChallengeApp();
});
