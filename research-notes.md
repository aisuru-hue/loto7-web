# ロト7 Webアプリ追加機能 調査メモ

## 1. メール送信サービス

### 推奨: Resend
- 無料枠: 月3,000通まで
- 簡単なAPI
- 日本語ドキュメントあり
- https://resend.com/

### 代替: SendGrid
- 無料枠: 1日100通まで（月約3,000通）
- 老舗サービス
- https://sendgrid.com/

## 2. ロト7データ取得

### みずほ銀行公式サイト
- URL: https://www.mizuhobank.co.jp/takarakuji/check/loto/loto7/index.html
- 最新の当選番号が掲載
- 過去データ: https://www.mizuhobank.co.jp/takarakuji/check/loto/backnumber/detail.html?fromto=1_20&type=loto7

### データ取得方法
- 公式APIは存在しない
- スクレイピングで取得可能
- CORSの制限があるため、サーバーサイドで取得する必要あり

### 第659回（2026年1月9日）のデータ
- 本数字: 02, 08, 09, 14, 27, 34, 36
- ボーナス数字: (05), (18)
