# にゃん・ノート（1週間運用プロトタイプ）

猫の健康を日次で管理する、ローカル保存（localStorage）版のプロトタイプです。

## 実装済み機能

- 猫プロフィールの追加・編集・削除
- 日次記録の追加・編集・削除
- 記録の「日付降順」表示（新しい日付が先頭）
- 猫ごとの「今日の記録済み / 未記録」表示
- 入力値バリデーション（必須・範囲・形式）
- データ完全リセット
- サンプルデータ初期表示 + サンプルデータだけ削除
- スマホ向けUI調整（余白・文字サイズ・ボタン最低サイズ）

## 技術構成

- React 18（CDN / import map）
- Babel Standalone（ブラウザ上でJSX変換）
- localStorage（永続化）

## 動作確認方法

1. サーバー起動

```bash
python3 -m http.server 8000
```

2. ブラウザで開く

- `http://localhost:8000`

3. 確認チェックリスト

- 「猫プロフィール」タブで追加 → 一覧反映、編集・削除可能
- 「日次記録」タブで追加 → 日付降順で表示、編集・削除可能
- 「ホーム」タブで各猫の当日ステータス（記録済み/未記録）表示
- 不正値入力時にエラーメッセージ表示（例: 年齢31、食事量501）
- 「設定」タブでサンプルデータ削除、完全リセットが動作
- リロード後もデータが保持される（localStorage）

## データ構造（現状）

localStorageキー: `cat-health-prototype-v1`

```json
{
  "sampleDataIncluded": true,
  "cats": [
    {
      "id": "cat-...",
      "name": "もなか",
      "age": 3,
      "gender": "♀",
      "emoji": "🐱",
      "memo": "",
      "source": "sample|user"
    }
  ],
  "records": [
    {
      "id": "rec-...",
      "catId": "cat-...",
      "date": "2026-04-25",
      "food": 70,
      "water": 200,
      "poop": 1,
      "pee": 3,
      "note": "",
      "source": "sample|user"
    }
  ]
}
```

## 今後DB化する方針

### 1) スキーマ分離

- `cats` テーブル
  - `id`, `owner_id`, `name`, `age`, `gender`, `emoji`, `memo`, `created_at`, `updated_at`
- `daily_records` テーブル
  - `id`, `cat_id`, `date`, `food_g`, `water_ml`, `poop_count`, `pee_count`, `note`, `created_at`, `updated_at`
- `UNIQUE(cat_id, date)` 制約で「1日1記録」を担保（必要に応じて複数記録仕様へ変更可能）

### 2) API化

- `GET /cats`, `POST /cats`, `PATCH /cats/:id`, `DELETE /cats/:id`
- `GET /records?catId=&from=&to=`, `POST /records`, `PATCH /records/:id`, `DELETE /records/:id`
- フロントは現在の state 操作を API クライアント層へ置き換え

### 3) マイグレーション

- 初回起動時に localStorage から既存データを読み、APIへ一括投入する移行導線を用意
- 移行完了フラグを保存し、二重投入を防止

### 4) バリデーション共通化

- 現在のフロントバリデーションを、将来的にサーバー側（zod / joi / framework標準）にも実装
- フロントはUX用、サーバーは真正性担保として二重化
