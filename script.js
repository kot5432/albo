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

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateUI();
        this.startCountdown();
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
            this.showModal('declarationModal');
        });

        // 宣言作成 -> AI提案
        document.getElementById('nextToAI').addEventListener('click', async () => {
            const challengeInput = document.getElementById('challengeInput').value.trim();
            const deadline = document.getElementById('deadline').value;
            const reason = document.getElementById('challengeReason').value.trim();

            if (!challengeInput) {
                this.showError('挑戦内容を入力してください');
                return;
            }

            if (!deadline) {
                this.showError('期限を設定してください');
                return;
            }

            // AI提案生成
            const aiSuggestion = await this.generateAISuggestion(challengeInput);
            document.getElementById('aiSuggestion').textContent = aiSuggestion;
            document.getElementById('editableAction').value = aiSuggestion;

            this.hideModal('declarationModal');
            this.showModal('aiActionModal');
        });

        // AI提案 -> 不可逆確認
        document.getElementById('approveAction').addEventListener('click', () => {
            const action = document.getElementById('editableAction').value.trim();
            if (!action) {
                this.showError('今日の行動を入力してください');
                return;
            }

            this.hideModal('aiActionModal');
            this.showModal('irreversibleModal');
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

        // 入力チェック
        document.getElementById('challengeInput').addEventListener('input', (e) => {
            this.checkInputValidity(e.target.value);
        });

        // AIで具体化ボタン
        document.getElementById('autoConcretize').addEventListener('click', () => {
            this.concretizeChallenge();
        });
    }

    // AI提案生成
    async generateAISuggestion(challengeText) {
        try {
            const response = await fetch('/api/ai-suggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ challengeText }),
            });

            const data = await response.json();

            if (data.success) {
                return data.suggestion;
            } else {
                throw new Error(data.error || 'AI提案の生成に失敗しました');
            }
        } catch (error) {
            console.error('AI suggestion error:', error);

            // フォールバック：ルールベースの提案
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

    // 入力の妥当性チェック
    async checkInputValidity(input) {
        const checkStatus = document.querySelector('.check-status');
        const autoConcretizeBtn = document.getElementById('autoConcretize');

        if (!input) {
            checkStatus.textContent = '';
            autoConcretizeBtn.style.display = 'none';
            return false;
        }

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

                if (!data.isValid) {
                    autoConcretizeBtn.style.display = 'block';
                    // 理由をツールチップやタイトルのように表示することも可能
                    checkStatus.title = data.reason || '';
                } else {
                    autoConcretizeBtn.style.display = 'none';
                }

                return data.isValid;
            }
        } catch (error) {
            console.error('Validation error:', error);
        }

        // フォールバック：ルールベースチェック
        const abstractWords = ['頑張る', '努力する', 'がんばる', 'する', 'やる', '取り組む'];
        const isAbstract = abstractWords.some(word => input.includes(word));

        if (isAbstract) {
            checkStatus.textContent = '⚠ もっと具体的にしてください';
            checkStatus.style.color = '#FF5722';
            autoConcretizeBtn.style.display = 'block';
        } else if (input.length < 5) {
            checkStatus.textContent = '⚠ もっと詳しく書いてください';
            checkStatus.style.color = '#FF5722';
            autoConcretizeBtn.style.display = 'none';
        } else {
            checkStatus.textContent = '✓ 具体的な表現です';
            checkStatus.style.color = '#4CAF50';
            autoConcretizeBtn.style.display = 'none';
        }

        return !isAbstract && input.length >= 5;
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
        const challengeText = document.getElementById('challengeInput').value.trim();
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
