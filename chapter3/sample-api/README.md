# chapter3/sample-api

アクセストークンを検証して応答する、最小のサンプル API を作る作業場所です。
このディレクトリには最初、この README しかありません。

## 作り方

`prompts/B10-sample-api.md` を生成AIに渡してください（Claude Code では `/b10-sample-api`）。

## 接続先（`../openid-provider/.env.example` の既定値）

| 項目 | 値 |
|---|---|
| API の URL | `http://localhost:4001` |
| 認証基盤の issuer | `http://localhost:4000` |
| Introspection エンドポイント | `http://localhost:4000/introspect` |
| API のクライアント | `sample-api` / `sample-api-secret`（`client_secret_basic`） |

## エンドポイント

| パス | 役割 |
|---|---|
| `GET /health` | 起動確認（認証なし） |
| `GET /me` | `Authorization: Bearer <access_token>` を検証し、`sub` や `scope` を返す。無効なら 401 |

## 確認

```bash
curl -i http://localhost:4001/health
curl -i http://localhost:4001/me                                   # 401
curl -i -H "Authorization: Bearer <access_token>" http://localhost:4001/me   # 200
```
