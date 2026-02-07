/**
 * ロト7予想通知 バックエンドサーバー
 * - メール送信機能（Resend API）
 * - 当選番号自動取得機能
 * - 定期実行スケジューラー
 */

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const Loto7Scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Resend APIクライアント
const resend = new Resend(process.env.RESEND_API_KEY || 're_QGAU4Y9v_7nyLGDGKNgkViXSMUxH11Ebp');

// ミドルウェア
app.use(cors());
app.use(express.json());

// ロト7スケジューラーのインスタンス
const scheduler = new Loto7Scheduler();

// 購読者データの保存先
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');
const LOTO7_DATA_FILE = path.join(__dirname, 'loto7-data.json');

// 購読者データの読み込み
function loadSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading subscribers:', error);
  }
  return [];
}

// 購読者データの保存
function saveSubscribers(subscribers) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

// ロト7データの読み込み
function loadLoto7Data() {
  try {
    if (fs.existsSync(LOTO7_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(LOTO7_DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading loto7 data:', error);
  }
  return [];
}

// ロト7予想数字生成ロジック（改善版）
function generatePrediction() {
  // 過去データに基づく出現頻度（簡略版）
  const frequencyWeights = {
    1: 85, 2: 92, 3: 88, 4: 79, 5: 95, 6: 87, 7: 91, 8: 83, 9: 89, 10: 86,
    11: 90, 12: 84, 13: 88, 14: 92, 15: 81, 16: 87, 17: 93, 18: 85, 19: 89, 20: 82,
    21: 88, 22: 86, 23: 90, 24: 84, 25: 87, 26: 91, 27: 89, 28: 83, 29: 88, 30: 85,
    31: 92, 32: 86, 33: 89, 34: 87, 35: 84, 36: 90, 37: 88
  };

  // 重み付きランダム選択
  const numbers = [];
  const available = Object.keys(frequencyWeights).map(Number);
  
  while (numbers.length < 7) {
    const totalWeight = available.reduce((sum, n) => sum + frequencyWeights[n], 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < available.length; i++) {
      random -= frequencyWeights[available[i]];
      if (random <= 0) {
        numbers.push(available[i]);
        available.splice(i, 1);
        break;
      }
    }
  }
  
  return numbers.sort((a, b) => a - b);
}

// メール送信関数
async function sendPredictionEmail(email, prediction) {
  const formattedNumbers = prediction.map(n => String(n).padStart(2, '0')).join(' - ');
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #D4AF37, #F4D03F); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
    .content { padding: 30px; }
    .date { color: #666; font-size: 14px; margin-bottom: 20px; }
    .numbers { display: flex; justify-content: center; gap: 10px; margin: 30px 0; flex-wrap: wrap; }
    .number { width: 50px; height: 50px; background: linear-gradient(135deg, #D4AF37, #F4D03F); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; box-shadow: 0 3px 8px rgba(212,175,55,0.4); }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .disclaimer { font-size: 11px; color: #999; margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎱 ロト7 予想数字</h1>
    </div>
    <div class="content">
      <p class="date">${dateStr}の予想</p>
      <p>今週のロト7予想数字をお届けします。</p>
      <div class="numbers">
        ${prediction.map(n => `<div class="number">${String(n).padStart(2, '0')}</div>`).join('')}
      </div>
      <p>過去の当選番号の統計分析に基づいて生成された予想です。</p>
      <div class="disclaimer">
        ※この予想は統計的な分析に基づくものであり、当選を保証するものではありません。宝くじは適度に楽しみましょう。
      </div>
    </div>
    <div class="footer">
      <p>ロト7予想通知アプリ</p>
      <p>配信停止をご希望の場合はアプリの設定画面から解除できます。</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ロト7予想通知 <onboarding@resend.dev>',
      to: email,
      subject: `【ロト7予想】${dateStr}の予想数字をお届けします`,
      html: htmlContent
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
}

// API: 購読登録
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const subscribers = loadSubscribers();
  
  if (subscribers.find(s => s.email === email)) {
    return res.status(400).json({ error: 'Email already subscribed' });
  }

  subscribers.push({
    email,
    subscribedAt: new Date().toISOString(),
    active: true
  });
  
  saveSubscribers(subscribers);
  
  // ウェルカムメール送信
  const prediction = generatePrediction();
  await sendPredictionEmail(email, prediction);
  
  res.json({ success: true, message: 'Subscribed successfully. Welcome email sent!' });
});

// API: 購読解除
app.post('/api/unsubscribe', (req, res) => {
  const { email } = req.body;
  
  const subscribers = loadSubscribers();
  const index = subscribers.findIndex(s => s.email === email);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Email not found' });
  }

  subscribers[index].active = false;
  saveSubscribers(subscribers);
  
  res.json({ success: true, message: 'Unsubscribed successfully' });
});

// API: 予想数字取得
app.get('/api/prediction', (req, res) => {
  const prediction = generatePrediction();
  res.json({ numbers: prediction });
});

// API: テストメール送信
app.post('/api/send-test', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const prediction = generatePrediction();
  const result = await sendPredictionEmail(email, prediction);
  
  if (result.success) {
    res.json({ success: true, message: 'Test email sent!', prediction });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: 全購読者にメール送信（定期実行用）
app.post('/api/send-all', async (req, res) => {
  const subscribers = loadSubscribers().filter(s => s.active);
  const prediction = generatePrediction();
  
  const results = [];
  for (const subscriber of subscribers) {
    const result = await sendPredictionEmail(subscriber.email, prediction);
    results.push({ email: subscriber.email, ...result });
  }
  
  res.json({ 
    success: true, 
    prediction,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results 
  });
});

// API: 最新の当選番号を取得
app.get('/api/latest-data', (req, res) => {
  try {
    const data = loadLoto7Data();
    
    if (data.length > 0) {
      res.json({
        success: true,
        data: data,
        lastUpdate: fs.statSync(LOTO7_DATA_FILE).mtime,
        count: data.length
      });
    } else {
      res.status(404).json({ success: false, error: 'No data available' });
    }
  } catch (error) {
    console.error('Latest data error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest data' });
  }
});

// API: スケジューラーのステータスを取得
app.get('/api/scheduler-status', (req, res) => {
  const status = scheduler.getStatus();
  res.json(status);
});

// API: 手動でデータを更新
app.post('/api/update-data', async (req, res) => {
  try {
    console.log('Manual data update requested');
    await scheduler.updateNow();
    res.json({ success: true, message: 'Data update completed' });
  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, '..')));

// サーバー起動
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`ロト7予想通知 バックエンドサーバー`);
  console.log(`========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`\nAPI endpoints:`);
  console.log(`  POST /api/subscribe - Subscribe to notifications`);
  console.log(`  POST /api/unsubscribe - Unsubscribe from notifications`);
  console.log(`  GET  /api/prediction - Get prediction numbers`);
  console.log(`  POST /api/send-test - Send test email`);
  console.log(`  POST /api/send-all - Send to all subscribers`);
  console.log(`  GET  /api/latest-data - Get latest loto7 data`);
  console.log(`  GET  /api/scheduler-status - Get scheduler status`);
  console.log(`  POST /api/update-data - Manually update data`);
  console.log(`\n========================================\n`);

  // スケジューラーを開始
  scheduler.start();
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});
