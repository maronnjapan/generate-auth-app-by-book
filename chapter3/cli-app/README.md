# chapter3/cli-app

Device Authorization Grant（RFC 8628）を使うサンプル CLI アプリを作る作業場所です。
このディレクトリには最初、この README しかありません。

## 作り方

`prompts/B09-device-cli-app.md` を生成AIに渡してください（Claude Code では `/b9-device-cli-app`）。

## 接続先（`../openid-provider/.env.example` の既定値）

| 項目 | 値 |
|---|---|
| 認証基盤の issuer | `http://localhost:4000` |
| client_id | `sample-cli`（public client。client_secret は無い） |
| grant_type | `urn:ietf:params:oauth:grant-type:device_code` |
| scope | `openid profile email` |
| サンプル API | `http://localhost:4001/me` |

## 確かめる動き

1. CLI アプリが認可を要求し、承認用 URL とユーザーコードを表示して待つ
2. ブラウザで URL を開き、`testuser` / `password` でログインして承認する
3. CLI アプリがアクセストークンを取得し、サンプル API を呼んだ結果を表示する
4. 承認しなかった場合は `access_denied` が表示され、トークンを取得できない
