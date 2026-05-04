# Google Play 先行ロードマップ

## 目的

iOS 対応より先に、Google Play / Android 版を優先して検討するための方針を整理する。

## 現在地

- PWA 版として URL 配布済み
- Android のホーム画面追加を確認済み
- Google ログイン、Firestore 保存、みんな共有、設定画面、PWA 更新通知まで確認済み
- まずは Google Play 先行で検討する

## Google Play 先行の理由

- Android / PWA との相性がよい
- 既存 Web アプリ資産を活かしやすい
- iOS より先に小さく検証しやすい
- まず Android で審査・テスター運用・ストア掲載の経験を積める

## 想定ルート

1. PWA 安定化
2. Capacitor で Android アプリ化を検討
3. Android 実機で動作確認
4. Google Play Console 登録
5. 内部テスト
6. クローズドテスト
7. 必要条件を満たしたら Production 申請
8. 問題なければ Google Play 公開
9. その後、iOS 対応を検討

## Google Play 公開前に必要なもの

- Google Play Console アカウント
- アプリアイコン
- スクリーンショット
- アプリ説明文
- プライバシーポリシー URL
- 利用規約 URL
- 問い合わせ先
- Data safety / データセーフティ回答
- 医療診断ではない注意書き
- データ削除依頼または削除方針の説明
- ログイン / ログアウト確認
- 共有 ON / OFF の説明

## 注意点

- 新しい個人デベロッパーアカウントの場合、Google Play の Production 公開前に、クローズドテストで 12 人以上のテスターが 14 日間継続参加する要件がある
- まずは内部テスト・クローズドテストで安定性を確認する
- 現時点では Capacitor 導入や Google Play 公開作業はまだ実施しない
- この docs 追加ではアプリ本体の機能を変更しない

## 今はまだ実装しないこと

- Capacitor 導入
- Android ビルド作成
- Google Play Console 登録
- App Store 対応
- React Native / Flutter 移行
- 新しい統計機能
- 今日のふりかえり
- 記録履歴改善
- バックアップ機能

## 完了条件

- Google Play 先行のロードマップが docs に追加されている
- アプリ本体の挙動は変わっていない
- Firebase 設定、Firestore Rules、Firestore データは変更されていない
