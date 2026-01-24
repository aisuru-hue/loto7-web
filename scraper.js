/**
 * ロト7当選番号スクレイピング
 * みずほ銀行公式サイトから最新の当選番号を取得
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// データ保存先
const DATA_FILE = path.join(__dirname, 'loto7-latest.json');

/**
 * HTMLからロト7当選番号を抽出
 */
function parseHtml(html) {
  const results = [];
  
  // テーブルから当選番号を抽出するパターン
  // みずほ銀行のページ構造に基づく
  const tableRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const numberRegex = /(\d{2})/g;
  const roundRegex = /第(\d+)回/;
  const dateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
  
  // 回号を探す
  const roundMatch = html.match(roundRegex);
  const round = roundMatch ? parseInt(roundMatch[1]) : null;
  
  // 日付を探す
  const dateMatch = html.match(dateRegex);
  const date = dateMatch 
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
    : null;
  
  // 本数字を探す（7つの連続した2桁数字）
  const mainNumbersSection = html.match(/本数字[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})[\s\S]*?(\d{2})/);
  
  // ボーナス数字を探す
  const bonusSection = html.match(/ボーナス数字[\s\S]*?\((\d{2})\)[\s\S]*?\((\d{2})\)/);
  
  if (mainNumbersSection && round) {
    const numbers = [
      parseInt(mainNumbersSection[1]),
      parseInt(mainNumbersSection[2]),
      parseInt(mainNumbersSection[3]),
      parseInt(mainNumbersSection[4]),
      parseInt(mainNumbersSection[5]),
      parseInt(mainNumbersSection[6]),
      parseInt(mainNumbersSection[7])
    ].sort((a, b) => a - b);
    
    const bonus = bonusSection 
      ? [parseInt(bonusSection[1]), parseInt(bonusSection[2])].sort((a, b) => a - b)
      : [];
    
    return {
      round,
      date,
      numbers,
      bonus,
      fetchedAt: new Date().toISOString()
    };
  }
  
  return null;
}

/**
 * みずほ銀行からデータを取得
 */
function fetchFromMizuho() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.mizuhobank.co.jp/takarakuji/check/loto/loto7/index.html';
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = parseHtml(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 保存されたデータを読み込む
 */
function loadSavedData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading saved data:', error);
  }
  return null;
}

/**
 * データを保存
 */
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * 最新データを取得（キャッシュ付き）
 */
async function getLatestData(forceRefresh = false) {
  const saved = loadSavedData();
  
  // キャッシュが1時間以内なら再利用
  if (!forceRefresh && saved) {
    const fetchedAt = new Date(saved.fetchedAt);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (fetchedAt > hourAgo) {
      console.log('Using cached data');
      return saved;
    }
  }
  
  try {
    console.log('Fetching fresh data from Mizuho...');
    const fresh = await fetchFromMizuho();
    
    if (fresh) {
      saveData(fresh);
      console.log('Data updated:', fresh);
      return fresh;
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
  
  // フェッチ失敗時はキャッシュを返す
  return saved;
}

// CLIとして実行された場合
if (require.main === module) {
  getLatestData(true).then(data => {
    console.log('Latest Loto7 data:');
    console.log(JSON.stringify(data, null, 2));
  }).catch(console.error);
}

module.exports = { getLatestData, fetchFromMizuho, loadSavedData };
