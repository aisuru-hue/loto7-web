/**
 * ロト7予想通知 Webアプリ メインスクリプト
 */

// APIエンドポイント
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : window.location.origin.replace(':8080', ':3001');

// ストレージキー
const STORAGE_KEYS = {
  PREDICTION: 'loto7_prediction',
  EMAIL: 'loto7_email',
  NOTIFICATION: 'loto7_notification_enabled',
};

// アプリケーション状態
const state = {
  currentPage: 'home',
  prediction: null,
  generatedAt: null,
  email: '',
  notificationEnabled: false,
};

// DOM要素
let elements = {};

/**
 * 初期化
 */
document.addEventListener('DOMContentLoaded', () => {
  initElements();
  loadState();
  renderCurrentPage();
  setupEventListeners();
  
  // 最新データの取得を試みる
  fetchLatestData();
});

/**
 * 最新の当選番号をサーバーから取得
 */
async function fetchLatestData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/latest`);
    if (response.ok) {
      const data = await response.json();
      
      // 新しいデータがあれば更新
      if (data && data.round) {
        const existingRound = Loto7.historicalData[0]?.round || 0;
        
        if (data.round > existingRound) {
          // 新しいデータを先頭に追加
          Loto7.historicalData.unshift({
            round: data.round,
            date: data.date,
            numbers: data.numbers,
            bonus: data.bonus
          });
          
          console.log('New draw data added:', data);
          
          // ページを再描画
          renderCurrentPage();
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch latest data:', error.message);
    // オフラインでも動作を続行
  }
}

/**
 * DOM要素の取得
 */
function initElements() {
  elements = {
    // ナビゲーション
    navBtns: document.querySelectorAll('.nav-btn'),
    
    // ページ
    homePage: document.getElementById('home-page'),
    statsPage: document.getElementById('stats-page'),
    settingsPage: document.getElementById('settings-page'),
    
    // ホームページ
    predictionBalls: document.getElementById('prediction-balls'),
    generatedAt: document.getElementById('generated-at'),
    generateBtn: document.getElementById('generate-btn'),
    nextDrawDate: document.getElementById('next-draw-date'),
    nextDrawRound: document.getElementById('next-draw-round'),
    statsDataCount: document.getElementById('stats-data-count'),
    statsOddEven: document.getElementById('stats-odd-even'),
    statsAvgSum: document.getElementById('stats-avg-sum'),
    statsHotNumbers: document.getElementById('stats-hot-numbers'),
    latestDrawRound: document.getElementById('latest-draw-round'),
    latestDrawNumbers: document.getElementById('latest-draw-numbers'),
    
    // 統計ページ
    hotNumbersBalls: document.getElementById('hot-numbers-balls'),
    coldNumbersBalls: document.getElementById('cold-numbers-balls'),
    frequencyChart: document.getElementById('frequency-chart'),
    ratioChart: document.getElementById('ratio-chart'),
    historyList: document.getElementById('history-list'),
    
    // 設定ページ
    emailInput: document.getElementById('email-input'),
    saveEmailBtn: document.getElementById('save-email-btn'),
    savedEmailDisplay: document.getElementById('saved-email-display'),
    savedEmailText: document.getElementById('saved-email-text'),
    editEmailBtn: document.getElementById('edit-email-btn'),
    deleteEmailBtn: document.getElementById('delete-email-btn'),
    emailForm: document.getElementById('email-form'),
    notificationSwitch: document.getElementById('notification-switch'),
    nextNotificationDate: document.getElementById('next-notification-date'),
    notificationInfo: document.getElementById('notification-info'),
    alertContainer: document.getElementById('alert-container'),
  };
}

/**
 * 状態の読み込み
 */
function loadState() {
  // 予想数字
  const storedPrediction = localStorage.getItem(STORAGE_KEYS.PREDICTION);
  if (storedPrediction) {
    const data = JSON.parse(storedPrediction);
    state.prediction = data.numbers;
    state.generatedAt = new Date(data.generatedAt);
  }
  
  // メールアドレス
  state.email = localStorage.getItem(STORAGE_KEYS.EMAIL) || '';
  
  // 通知設定
  state.notificationEnabled = localStorage.getItem(STORAGE_KEYS.NOTIFICATION) === 'true';
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // ナビゲーション
  elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });
  
  // 予想生成ボタン
  elements.generateBtn.addEventListener('click', handleGeneratePrediction);
  
  // メール保存ボタン
  elements.saveEmailBtn.addEventListener('click', handleSaveEmail);
  
  // メール編集ボタン
  elements.editEmailBtn.addEventListener('click', () => {
    elements.savedEmailDisplay.style.display = 'none';
    elements.emailForm.style.display = 'block';
    elements.emailInput.value = state.email;
  });
  
  // メール削除ボタン
  elements.deleteEmailBtn.addEventListener('click', handleDeleteEmail);
  
  // 通知スイッチ
  elements.notificationSwitch.addEventListener('change', handleToggleNotification);
  
  // Enterキーでメール保存
  elements.emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSaveEmail();
    }
  });
}

/**
 * ページ遷移
 */
function navigateTo(page) {
  state.currentPage = page;
  
  // ナビゲーションボタンの状態更新
  elements.navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  
  // ページの表示切り替え
  elements.homePage.classList.toggle('active', page === 'home');
  elements.statsPage.classList.toggle('active', page === 'stats');
  elements.settingsPage.classList.toggle('active', page === 'settings');
  
  // ページ固有の描画
  if (page === 'stats') {
    renderStatisticsPage();
  } else if (page === 'settings') {
    renderSettingsPage();
  }
}

/**
 * 現在のページを描画
 */
function renderCurrentPage() {
  renderHomePage();
  if (state.currentPage === 'stats') {
    renderStatisticsPage();
  } else if (state.currentPage === 'settings') {
    renderSettingsPage();
  }
}

/**
 * ホームページの描画
 */
function renderHomePage() {
  const stats = Loto7.getStatisticsSummary();
  const nextDraw = Loto7.getNextDrawDate();
  const latestDraw = Loto7.historicalData[0];
  
  // 予想数字がない場合は生成
  if (!state.prediction) {
    handleGeneratePrediction();
    return;
  }
  
  // 予想数字の表示
  renderNumberBalls(elements.predictionBalls, state.prediction, false);
  
  // 生成日時
  if (state.generatedAt) {
    elements.generatedAt.textContent = `生成日時: ${formatDateTime(state.generatedAt)}`;
  }
  
  // 次回抽選日
  elements.nextDrawDate.textContent = `${formatDate(nextDraw)} 18:45`;
  elements.nextDrawRound.textContent = `第${latestDraw.round + 1}回`;
  
  // 統計サマリー
  elements.statsDataCount.textContent = `過去${stats.totalDraws}回分`;
  elements.statsOddEven.textContent = `${stats.avgOddEvenRatio.odd.toFixed(1)} : ${stats.avgOddEvenRatio.even.toFixed(1)}`;
  elements.statsAvgSum.textContent = stats.avgSum;
  elements.statsHotNumbers.textContent = stats.hotNumbers.slice(0, 5).join(', ');
  
  // 直近の当選番号
  elements.latestDrawRound.textContent = `直近の当選番号（第${latestDraw.round}回）`;
  renderNumberBalls(elements.latestDrawNumbers, latestDraw.numbers, false, true);
  
  // ボーナス数字を追加
  latestDraw.bonus.forEach(num => {
    const ball = createNumberBall(num, true, true);
    elements.latestDrawNumbers.appendChild(ball);
  });
}

/**
 * 統計ページの描画
 */
function renderStatisticsPage() {
  const stats = Loto7.getStatisticsSummary();
  const oddEvenRatios = Loto7.calculateOddEvenRatio();
  
  // よく出る数字
  renderNumberBalls(elements.hotNumbersBalls, stats.hotNumbers, false);
  
  // あまり出ない数字
  renderNumberBalls(elements.coldNumbersBalls, stats.coldNumbers, true);
  
  // 出現頻度グラフ
  renderFrequencyChart(stats.frequency);
  
  // 奇数/偶数比率
  renderRatioChart(oddEvenRatios);
  
  // 過去の当選番号履歴
  renderHistoryList();
}

/**
 * 設定ページの描画
 */
function renderSettingsPage() {
  // メールアドレス表示
  if (state.email) {
    elements.savedEmailDisplay.style.display = 'block';
    elements.emailForm.style.display = 'none';
    elements.savedEmailText.textContent = state.email;
  } else {
    elements.savedEmailDisplay.style.display = 'none';
    elements.emailForm.style.display = 'block';
    elements.emailInput.value = '';
  }
  
  // 通知スイッチ
  elements.notificationSwitch.checked = state.notificationEnabled;
  
  // 次回通知日
  if (state.notificationEnabled && state.email) {
    const nextNotification = Loto7.getNextNotificationDate();
    elements.nextNotificationDate.textContent = formatDateTime(nextNotification);
    elements.notificationInfo.style.display = 'block';
  } else {
    elements.notificationInfo.style.display = 'none';
  }
}

/**
 * 数字ボールの描画
 */
function renderNumberBalls(container, numbers, isBonus = false, small = false) {
  container.innerHTML = '';
  numbers.forEach(num => {
    const ball = createNumberBall(num, isBonus, small);
    container.appendChild(ball);
  });
}

/**
 * 数字ボール要素の作成
 */
function createNumberBall(number, isBonus = false, small = false) {
  const ball = document.createElement('div');
  ball.className = 'number-ball';
  if (isBonus) ball.classList.add('bonus');
  if (small) ball.classList.add('small');
  ball.textContent = number.toString().padStart(2, '0');
  return ball;
}

/**
 * 出現頻度グラフの描画
 */
function renderFrequencyChart(frequency) {
  const maxCount = Math.max(...frequency.map(f => f.count));
  
  elements.frequencyChart.innerHTML = '';
  
  frequency.forEach(({ number, count }) => {
    const row = document.createElement('div');
    row.className = 'frequency-row';
    
    const percentage = (count / maxCount) * 100;
    const barClass = percentage >= 80 ? 'hot' : percentage >= 50 ? 'warm' : 'cold';
    
    row.innerHTML = `
      <span class="frequency-number">${number}</span>
      <div class="frequency-bar-container">
        <div class="frequency-bar ${barClass}" style="width: ${percentage}%"></div>
      </div>
      <span class="frequency-count">${count}</span>
    `;
    
    elements.frequencyChart.appendChild(row);
  });
}

/**
 * 奇数/偶数比率グラフの描画
 */
function renderRatioChart(ratios) {
  // 比率の分布を計算
  const distribution = new Map();
  ratios.forEach(r => {
    const key = `${r.odd}:${r.even}`;
    distribution.set(key, (distribution.get(key) || 0) + 1);
  });
  
  const sortedRatios = Array.from(distribution.entries())
    .sort((a, b) => b[1] - a[1]);
  
  elements.ratioChart.innerHTML = '';
  
  sortedRatios.forEach(([ratio, count]) => {
    const percentage = (count / ratios.length) * 100;
    
    const row = document.createElement('div');
    row.className = 'ratio-row';
    row.innerHTML = `
      <span class="ratio-label">${ratio}</span>
      <div class="ratio-bar-container">
        <div class="ratio-bar" style="width: ${percentage}%"></div>
      </div>
      <span class="ratio-percent">${percentage.toFixed(1)}%</span>
    `;
    
    elements.ratioChart.appendChild(row);
  });
}

/**
 * 過去の当選番号履歴の描画
 */
function renderHistoryList() {
  elements.historyList.innerHTML = '';
  
  Loto7.historicalData.slice(0, 10).forEach(draw => {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const roundLabel = document.createElement('div');
    roundLabel.className = 'history-round';
    roundLabel.textContent = `第${draw.round}回`;
    
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'history-numbers';
    
    draw.numbers.forEach(num => {
      numbersContainer.appendChild(createNumberBall(num, false, true));
    });
    
    draw.bonus.forEach(num => {
      numbersContainer.appendChild(createNumberBall(num, true, true));
    });
    
    item.appendChild(roundLabel);
    item.appendChild(numbersContainer);
    elements.historyList.appendChild(item);
  });
}

/**
 * 予想生成ハンドラ
 */
async function handleGeneratePrediction() {
  elements.generateBtn.disabled = true;
  elements.generateBtn.textContent = '生成中...';
  
  // ローディング表示
  elements.predictionBalls.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div class="loading-text">生成中...</div>
    </div>
  `;
  
  // 少し遅延を入れてアニメーション効果
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 予想生成
  state.prediction = Loto7.generatePrediction();
  state.generatedAt = new Date();
  
  // 保存
  localStorage.setItem(STORAGE_KEYS.PREDICTION, JSON.stringify({
    numbers: state.prediction,
    generatedAt: state.generatedAt.toISOString(),
  }));
  
  // 描画
  renderHomePage();
  
  elements.generateBtn.disabled = false;
  elements.generateBtn.textContent = '新しい予想を生成';
}

/**
 * メール保存ハンドラ
 */
async function handleSaveEmail() {
  const email = elements.emailInput.value.trim();
  
  if (!email) {
    showAlert('メールアドレスを入力してください', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showAlert('有効なメールアドレスを入力してください', 'error');
    return;
  }
  
  // ボタンを無効化
  elements.saveEmailBtn.disabled = true;
  elements.saveEmailBtn.textContent = '登録中...';
  
  try {
    // サーバーに購読登録
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      state.email = email;
      localStorage.setItem(STORAGE_KEYS.EMAIL, email);
      showAlert('メールアドレスを登録しました。ウェルカムメールを送信しました！', 'success');
    } else {
      // 既に登録済みの場合もローカルに保存
      if (result.error === 'Email already subscribed') {
        state.email = email;
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
        showAlert('このメールアドレスは既に登録されています', 'info');
      } else {
        showAlert(result.error || '登録に失敗しました', 'error');
      }
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    // オフラインでもローカルに保存
    state.email = email;
    localStorage.setItem(STORAGE_KEYS.EMAIL, email);
    showAlert('メールアドレスを保存しました（オフラインモード）', 'success');
  } finally {
    elements.saveEmailBtn.disabled = false;
    elements.saveEmailBtn.textContent = '登録する';
  }
  
  renderSettingsPage();
}

/**
 * メール削除ハンドラ
 */
async function handleDeleteEmail() {
  if (!confirm('登録されているメールアドレスを削除しますか？')) {
    return;
  }
  
  try {
    // サーバーから購読解除
    await fetch(`${API_BASE_URL}/api/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.email })
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
  }
  
  state.email = '';
  state.notificationEnabled = false;
  localStorage.removeItem(STORAGE_KEYS.EMAIL);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION, 'false');
  
  showAlert('メールアドレスを削除しました', 'success');
  renderSettingsPage();
}

/**
 * 通知切り替えハンドラ
 */
function handleToggleNotification() {
  const enabled = elements.notificationSwitch.checked;
  
  if (enabled && !state.email) {
    elements.notificationSwitch.checked = false;
    showAlert('通知を有効にするには、まずメールアドレスを登録してください', 'error');
    return;
  }
  
  state.notificationEnabled = enabled;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION, enabled.toString());
  
  renderSettingsPage();
}

/**
 * アラート表示
 */
function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  elements.alertContainer.innerHTML = '';
  elements.alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

/**
 * メールアドレスのバリデーション
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 日付フォーマット
 */
function formatDate(date) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

/**
 * 日時フォーマット
 */
function formatDateTime(date) {
  return date.toLocaleString('ja-JP');
}
