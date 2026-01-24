# ロト7予想通知 Webアプリ

過去の当選番号の統計分析に基づいて、ロト7の予想数字を生成するWebアプリです。

## 機能

- **予想数字生成**: 過去50回分の当選データに基づく統計分析で予想を生成
- **統計表示**: 出現頻度、奇数/偶数比率、過去の当選履歴を表示
- **メール通知**: 登録したメールアドレスに予想数字を送信
- **PWA対応**: スマホのホーム画面に追加してアプリのように使用可能
- **オフライン対応**: インターネット接続がなくても基本機能が動作

## ファイル構成

```
loto7-web/
├── index.html          # メインHTMLファイル
├── manifest.json       # PWAマニフェスト
├── sw.js              # Service Worker（オフライン対応）
├── css/
│   └── style.css      # スタイルシート
├── js/
│   ├── app.js         # メインアプリケーション
│   └── loto7-data.js  # ロト7データと統計分析
├── images/
│   └── icon.png       # アプリアイコン
└── server/            # バックエンドサーバー（オプション）
    ├── server.js      # Express サーバー
    ├── scraper.js     # データ自動更新スクリプト
    └── package.json   # 依存関係
```

## 使い方

### 方法1: 静的ファイルとして使う（簡単）

1. `loto7-web` フォルダをWebサーバーにアップロード
2. ブラウザでアクセス

**無料ホスティングサービス（おすすめ）:**
- [Netlify](https://netlify.com) - ドラッグ＆ドロップでデプロイ
- [Vercel](https://vercel.com) - GitHubと連携
- [GitHub Pages](https://pages.github.com) - 無料で静的サイトをホスト

### 方法2: ローカルで実行

```bash
# Python 3がインストールされている場合
cd loto7-web
python3 -m http.server 8080

# ブラウザで http://localhost:8080 にアクセス
```

### 方法3: バックエンドサーバー付きで実行（メール送信機能を使う場合）

```bash
cd loto7-web/server
npm install
node server.js

# 別のターミナルで
cd loto7-web
python3 -m http.server 8080
```

## Netlifyへのデプロイ手順（推奨）

1. [Netlify](https://netlify.com) にアクセスしてアカウント作成（無料）
2. 「Add new site」→「Deploy manually」を選択
3. `loto7-web` フォルダをドラッグ＆ドロップ
4. 数秒でデプロイ完了、URLが発行されます
5. そのURLにスマホでアクセスし、ホーム画面に追加

## メール通知の設定

メール通知機能を使うには、バックエンドサーバーが必要です。

1. `server/server.js` の `RESEND_API_KEY` を自分のAPIキーに変更
2. サーバーをデプロイ（Render.com、Railway.appなど）
3. `js/app.js` の `API_BASE_URL` をデプロイしたサーバーのURLに変更

## 注意事項

- この予想は統計的な分析に基づくものであり、当選を保証するものではありません
- 宝くじは適度に楽しみましょう
