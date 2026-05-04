# にゃん・ノート

猫の健康記録を日々残すアプリです。

## 現在版（v0.3 mini）

- v0.3 mini
- PWA更新通知を追加
- 既存機能は維持

## v0.1 安定版

現在の実装を **v0.1 安定版** として区切ります。

v0.1 では以下が安定動作します。

- 猫プロフィール
- 日次記録
- メモ
- 記録カレンダー
- Firestore 保存
- Firebase 匿名認証
- JSON バックアップ（書き出し・読み込み）
- `publicCats` によるみんな画面

## 目的

- 毎日のごはん・飲水・排泄・体重などを記録し、猫の体調変化を継続的に把握する。

## 現在できること

- 猫プロフィール登録・編集・削除
- 日次記録の保存・編集・削除
- メモ欄
- 記録カレンダー
- Firestore 保存
- Firebase 匿名認証
- JSON バックアップ書き出し・読み込み（読み込みはまず localStorage 復元のみ）
- `publicCats` による公開プロフィール分離
- みんな画面で公開プロフィール一覧表示
- 統計画面で `publicCats` の公開プロフィール統計を表示（`records` / メモは統計対象外）
- プライバシーポリシーページ（`/privacy.html`）の表示
- 初回起動時に「プライバシーと利用上の注意」を確認してから利用開始（同意状態は localStorage に保存）

## データ方針

- `cats` / `records` は本人用データ
- `publicCats` は公開用プロフィール
- `records` / メモ / 写真データは公開しない
- 「みんな」画面には `publicCats` の公開プロフィールのみ表示する
- 地域非公開の場合、`publicCats` には都道府県・市区町村を保存しない

## 今後の予定

- 統計画面
- 市区町村フィルター
- Google ログイン / Apple ログイン

## ローカル実行

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## Auth 切り分け（auth-test.html / Firebase Hosting）

### 目的

`auth-test.html` を GitHub Pages と Firebase Hosting の両方で実行し、Google ログイン失敗の原因が

- GitHub Pages + Firebase Auth handler の組み合わせ由来か
- それとも Firebase / Google OAuth 設定由来か

を切り分けます。

### 現在の既知結果（GitHub Pages）

- 検証 URL: `https://yas0222.github.io/nyan-note/auth-test.html`
- 匿名ログイン: 成功
- Google ログイン / リンク: popup 側に `The requested action is invalid.` が出て失敗
- 呼び出し元ページでは `auth/popup-closed-by-user` 扱いになることがある

### Firebase Hosting 側の準備

このリポジトリには Firebase Hosting 検証用に以下を追加済みです。

- `firebase.json`（静的公開設定）
- `.firebaserc`（デフォルトプロジェクト `neko222-ym`）

`auth-test.html` 自体は既存ファイルをそのまま使います（Firebase 設定は本番 `neko222-ym` のまま）。

### Firebase Hosting での検証手順

1. Firebase CLI へログイン

```bash
firebase login
```

2. 念のため対象プロジェクトを確認

```bash
firebase use neko222-ym
```

3. Hosting へデプロイ（最小検証）

```bash
firebase deploy --only hosting
```

4. 以下の URL で `auth-test.html` を開く

- `https://neko222-ym.web.app/auth-test.html`
- `https://neko222-ym.firebaseapp.com/auth-test.html`

5. 画面上で順に検証

- `匿名ログイン`
- `Googleでログイン / リンク`

### 結果の判定

- Firebase Hosting では成功する場合
  - GitHub Pages 側ドメイン起因（またはその組み合わせ起因）の可能性が高い
  - 次アクション: 本番アプリを Firebase Hosting に移行する検討へ進む

- Firebase Hosting でも失敗する場合
  - 本番 Firebase / Google OAuth 設定側の可能性が高い
  - 次アクション: Google OAuth Client 設定、Firebase Authentication（Google プロバイダ・承認済みドメイン・OAuth 関連設定）を再確認または再作成する

### 注意

- この手順は `auth-test.html` の切り分け専用です。
- 本番アプリ全体を Firebase Hosting へ移行する作業はまだ実施しません。
- Firestore データ、localStorage、猫データ、共有データには影響しません。


## Firebase Hosting デプロイ（最小手順）

以下の 3 コマンドを順に実行してください。

```bash
firebase login
firebase use neko222-ym
firebase deploy --only hosting
```

デプロイ後、次の URL で `auth-test.html` を確認できます。

- https://neko222-ym.web.app/auth-test.html
- https://neko222-ym.firebaseapp.com/auth-test.html
