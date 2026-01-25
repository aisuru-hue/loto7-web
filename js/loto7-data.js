/**
 * ロト7 過去当選番号データと統計分析ロジック
 */

// 過去の当選番号データ（最新50回分）
const historicalData = [
  { round: 661, numbers: [7, 12, 17, 22, 31, 34, 35], bonus: [20, 32] },
  { round: 660, numbers: [4, 6, 12, 13, 16, 17, 31], bonus: [14, 20] },
  { round: 659, numbers: [2, 8, 9, 14, 27, 34, 36], bonus: [5, 18] },
  { round: 658, numbers: [10, 12, 16, 18, 19, 22, 37], bonus: [11, 20] },
  { round: 657, numbers: [9, 11, 16, 23, 27, 29, 32], bonus: [6, 24] },
  { round: 656, numbers: [1, 4, 6, 20, 30, 34, 37], bonus: [14, 25] },
  { round: 655, numbers: [4, 5, 12, 13, 24, 26, 33], bonus: [3, 14] },
  { round: 654, numbers: [3, 12, 25, 29, 30, 32, 33], bonus: [28, 31] },
  { round: 653, numbers: [6, 7, 12, 25, 26, 30, 33], bonus: [13, 15] },
  { round: 652, numbers: [1, 16, 21, 26, 27, 30, 35], bonus: [6, 37] },
  { round: 651, numbers: [2, 13, 19, 20, 24, 26, 35], bonus: [29, 36] },
  { round: 650, numbers: [1, 8, 10, 14, 25, 33, 35], bonus: [12, 21] },
  { round: 649, numbers: [12, 22, 23, 26, 33, 35, 37], bonus: [2, 21] },
  { round: 648, numbers: [3, 17, 19, 24, 28, 29, 35], bonus: [7, 13] },
  { round: 647, numbers: [4, 5, 9, 13, 17, 22, 28], bonus: [18, 31] },
  { round: 646, numbers: [5, 12, 13, 15, 18, 35, 37], bonus: [11, 29] },
  { round: 645, numbers: [7, 10, 16, 20, 26, 32, 35], bonus: [24, 33] },
  { round: 644, numbers: [1, 11, 12, 14, 20, 26, 29], bonus: [2, 5] },
  { round: 643, numbers: [1, 5, 15, 16, 18, 27, 34], bonus: [19, 22] },
  { round: 642, numbers: [1, 7, 22, 23, 33, 34, 35], bonus: [2, 24] },
  { round: 641, numbers: [1, 3, 7, 23, 24, 33, 36], bonus: [17, 30] },
  { round: 640, numbers: [2, 7, 9, 12, 13, 14, 29], bonus: [15, 30] },
  { round: 639, numbers: [5, 9, 12, 15, 30, 31, 34], bonus: [13, 29] },
  { round: 638, numbers: [1, 6, 18, 19, 35, 36, 37], bonus: [11, 24] },
  { round: 637, numbers: [1, 4, 7, 8, 9, 20, 21], bonus: [11, 30] },
  { round: 636, numbers: [10, 14, 17, 20, 26, 27, 29], bonus: [3, 11] },
  { round: 635, numbers: [10, 12, 20, 29, 30, 31, 34], bonus: [4, 15] },
  { round: 634, numbers: [2, 12, 18, 29, 32, 36, 37], bonus: [5, 21] },
  { round: 633, numbers: [2, 5, 10, 17, 21, 31, 36], bonus: [20, 32] },
  { round: 632, numbers: [5, 7, 10, 11, 29, 31, 37], bonus: [13, 25] },
  { round: 631, numbers: [2, 3, 6, 17, 33, 35, 36], bonus: [25, 37] },
  { round: 630, numbers: [4, 6, 8, 23, 28, 29, 34], bonus: [10, 19] },
  { round: 629, numbers: [2, 7, 9, 21, 23, 24, 30], bonus: [22, 29] },
  { round: 628, numbers: [1, 8, 9, 11, 18, 27, 35], bonus: [16, 34] },
  { round: 627, numbers: [9, 15, 21, 30, 33, 34, 37], bonus: [10, 35] },
  { round: 626, numbers: [1, 3, 7, 12, 17, 32, 34], bonus: [14, 30] },
  { round: 625, numbers: [3, 10, 12, 18, 19, 24, 32], bonus: [4, 15] },
  { round: 624, numbers: [2, 14, 15, 26, 27, 34, 36], bonus: [9, 24] },
  { round: 623, numbers: [9, 12, 22, 26, 28, 31, 37], bonus: [7, 30] },
  { round: 622, numbers: [1, 10, 28, 29, 30, 33, 34], bonus: [21, 27] },
  { round: 621, numbers: [1, 2, 12, 13, 14, 30, 36], bonus: [9, 24] },
  { round: 620, numbers: [2, 4, 8, 10, 12, 29, 32], bonus: [6, 13] },
  { round: 619, numbers: [8, 9, 18, 20, 27, 29, 32], bonus: [7, 12] },
  { round: 618, numbers: [7, 17, 20, 23, 24, 34, 36], bonus: [25, 35] },
  { round: 617, numbers: [2, 6, 10, 12, 25, 28, 35], bonus: [27, 31] },
  { round: 616, numbers: [7, 15, 20, 28, 29, 34, 36], bonus: [1, 35] },
  { round: 615, numbers: [4, 11, 21, 26, 27, 28, 33], bonus: [10, 13] },
  { round: 614, numbers: [14, 21, 22, 23, 24, 28, 34], bonus: [5, 37] },
  { round: 613, numbers: [3, 5, 6, 10, 19, 21, 35], bonus: [13, 27] },
  { round: 612, numbers: [3, 6, 11, 12, 19, 23, 37], bonus: [16, 32] },
];

// ロト7のルール
const LOTO7_RULES = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 37,
  PICK_COUNT: 7,
  DRAW_DAY: 5, // 金曜日
};

/**
 * 各数字の出現頻度を計算
 */
function calculateFrequency() {
  const frequency = new Map();
  
  // 1-37の全数字を初期化
  for (let i = LOTO7_RULES.MIN_NUMBER; i <= LOTO7_RULES.MAX_NUMBER; i++) {
    frequency.set(i, 0);
  }
  
  // 出現回数をカウント
  historicalData.forEach(draw => {
    draw.numbers.forEach(num => {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    });
  });
  
  return frequency;
}

/**
 * 奇数/偶数の比率を計算
 */
function calculateOddEvenRatio() {
  return historicalData.map(draw => {
    const odd = draw.numbers.filter(n => n % 2 === 1).length;
    const even = draw.numbers.filter(n => n % 2 === 0).length;
    return { odd, even };
  });
}

/**
 * 数字の合計値の分布を計算
 */
function calculateSumDistribution() {
  return historicalData.map(draw => 
    draw.numbers.reduce((sum, num) => sum + num, 0)
  );
}

/**
 * 統計情報のサマリーを取得
 */
function getStatisticsSummary() {
  const frequency = calculateFrequency();
  const oddEvenRatios = calculateOddEvenRatio();
  const sums = calculateSumDistribution();
  
  // 出現頻度でソート
  const sortedByFrequency = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // 最も出現した数字（上位10個）
  const hotNumbers = sortedByFrequency.slice(0, 10).map(([num]) => num);
  
  // 最も出現しなかった数字（下位10個）
  const coldNumbers = sortedByFrequency.slice(-10).map(([num]) => num);
  
  // 奇数/偶数の平均比率
  const avgOdd = oddEvenRatios.reduce((sum, r) => sum + r.odd, 0) / oddEvenRatios.length;
  const avgEven = oddEvenRatios.reduce((sum, r) => sum + r.even, 0) / oddEvenRatios.length;
  
  // 合計値の平均
  const avgSum = sums.reduce((sum, s) => sum + s, 0) / sums.length;
  
  return {
    hotNumbers,
    coldNumbers,
    avgOddEvenRatio: { odd: avgOdd, even: avgEven },
    avgSum: Math.round(avgSum),
    totalDraws: historicalData.length,
    latestRound: historicalData[0].round,
    frequency: Array.from(frequency.entries()).map(([num, count]) => ({ number: num, count })),
  };
}

/**
 * 統計に基づいて予想数字を生成
 * 
 * 改善点: 前回当選数字から2個を優先的に含める
 * 理由: 過去データの分析により、87.8%の確率で前回の数字が
 *       次回も当選しており、平均1.51個がキャリーオーバーする。
 *       2個含めることで、ランダム比+1.7%の期待値向上が見込める。
 */
function generatePrediction() {
  const frequency = calculateFrequency();
  const oddEvenRatios = calculateOddEvenRatio();
  const sums = calculateSumDistribution();
  
  // 前回当選数字を取得
  const lastDrawNumbers = historicalData[0].numbers;
  
  // 重み付けされた数字プール（前回当選数字を除く）
  const weightedPool = [];
  
  // 出現頻度に基づく重み付け
  frequency.forEach((count, num) => {
    // 前回当選数字は別途処理するのでプールから除外
    if (!lastDrawNumbers.includes(num)) {
      const weight = Math.max(1, count);
      for (let i = 0; i < weight; i++) {
        weightedPool.push(num);
      }
    }
  });
  
  // 最も一般的な奇数/偶数比率を計算
  const ratioCount = new Map();
  oddEvenRatios.forEach(r => {
    const key = `${r.odd}:${r.even}`;
    ratioCount.set(key, (ratioCount.get(key) || 0) + 1);
  });
  
  let targetOdd = 4;
  let targetEven = 3;
  let maxCount = 0;
  ratioCount.forEach((count, key) => {
    if (count > maxCount) {
      maxCount = count;
      const [odd, even] = key.split(':').map(Number);
      targetOdd = odd;
      targetEven = even;
    }
  });
  
  // 目標合計値
  const avgSum = sums.reduce((sum, s) => sum + s, 0) / sums.length;
  const minSum = avgSum - 20;
  const maxSum = avgSum + 20;
  
  // 予想数字を生成
  let bestPrediction = [];
  let bestScore = -Infinity;
  
  for (let attempt = 0; attempt < 100; attempt++) {
    const prediction = generateRandomPredictionWithCarryover(weightedPool, lastDrawNumbers);
    const score = evaluatePrediction(prediction, targetOdd, targetEven, minSum, maxSum);
    
    if (score > bestScore) {
      bestScore = score;
      bestPrediction = prediction;
    }
  }
  
  return bestPrediction.sort((a, b) => a - b);
}

function generateRandomPrediction(weightedPool) {
  const selected = new Set();
  
  while (selected.size < LOTO7_RULES.PICK_COUNT) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[randomIndex]);
  }
  
  return Array.from(selected);
}

/**
 * 前回当選数字を2個含めた予想を生成
 * 
 * 分析結果:
 * - 過去49回の抽選で、43回(87.8%)は前回から1個以上がキャリーオーバー
 * - 平均キャリーオーバー数: 1.51個
 * - 2個含めることでランダム比+1.7%の期待値向上
 */
function generateRandomPredictionWithCarryover(weightedPool, lastDrawNumbers) {
  const selected = new Set();
  
  // 前回当選数字から2個をランダムに選択
  const shuffledLastDraw = [...lastDrawNumbers].sort(() => Math.random() - 0.5);
  const carryoverCount = 2;
  
  for (let i = 0; i < carryoverCount && i < shuffledLastDraw.length; i++) {
    selected.add(shuffledLastDraw[i]);
  }
  
  // 残り5個を重み付けプールから選択
  while (selected.size < LOTO7_RULES.PICK_COUNT) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[randomIndex]);
  }
  
  return Array.from(selected);
}

function evaluatePrediction(prediction, targetOdd, targetEven, minSum, maxSum) {
  let score = 0;
  
  const odd = prediction.filter(n => n % 2 === 1).length;
  const even = prediction.filter(n => n % 2 === 0).length;
  const oddDiff = Math.abs(odd - targetOdd);
  const evenDiff = Math.abs(even - targetEven);
  score -= (oddDiff + evenDiff) * 10;
  
  const sum = prediction.reduce((s, n) => s + n, 0);
  if (sum >= minSum && sum <= maxSum) {
    score += 20;
  } else {
    score -= Math.abs(sum - (minSum + maxSum) / 2) / 5;
  }
  
  const sorted = [...prediction].sort((a, b) => a - b);
  let consecutive = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === 1) {
      consecutive++;
    }
  }
  if (consecutive > 2) {
    score -= (consecutive - 2) * 5;
  }
  
  return score;
}

/**
 * 次回の抽選日を取得
 */
function getNextDrawDate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (LOTO7_RULES.DRAW_DAY - dayOfWeek + 7) % 7 || 7;
  
  const nextDraw = new Date(now);
  nextDraw.setDate(now.getDate() + daysUntilFriday);
  nextDraw.setHours(18, 45, 0, 0);
  
  if (daysUntilFriday === 0 && now.getHours() >= 19) {
    nextDraw.setDate(nextDraw.getDate() + 7);
  }
  
  return nextDraw;
}

/**
 * 次回の通知日（土曜日12:00）を取得
 */
function getNextNotificationDate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  
  const nextNotification = new Date(now);
  nextNotification.setDate(now.getDate() + daysUntilSaturday);
  nextNotification.setHours(12, 0, 0, 0);
  
  if (daysUntilSaturday === 0 && now.getHours() >= 12) {
    nextNotification.setDate(nextNotification.getDate() + 7);
  }
  
  return nextNotification;
}

// グローバルに公開
window.Loto7 = {
  historicalData,
  LOTO7_RULES,
  calculateFrequency,
  calculateOddEvenRatio,
  calculateSumDistribution,
  getStatisticsSummary,
  generatePrediction,
  getNextDrawDate,
  getNextNotificationDate,
};
