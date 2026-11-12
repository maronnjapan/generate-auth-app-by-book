# B.7 アクセストークンで利用するサンプル API の実装

## 目的

CLI アプリが取得したアクセストークンを検証して応答する、最小の API を作ってください。
API 自体の機能は最小限でよく、「アクセストークンの検証に成功した」と分かる応答を返すのが目的です。

## 作業場所

`chapter3/sample-api/`。このディレクトリだけで `pnpm install` と起動ができる、独立したプロジェクトにしてください。
作業場所に最初からある README.md は、成果物の README で上書きして構いません。

## 接続先（`chapter3/README.md` の「ローカル検証用の設定」と同じ）

| 項目 | 値 |
|---|---|
| API の URL | `http://localhost:4001` |
| 認証基盤の issuer | `http://localhost:4000` |
| Discovery | `http://localhost:4000/.well-known/openid-configuration`（`introspection_endpoint` と `jwks_uri` はここから取得する） |
| API のクライアント | client_id `sample-api`、client_secret `sample-api-secret`、クライアント認証 `client_secret_basic`（認証基盤側では `chapter3/openid-provider/.env.example` の `SAMPLE_API_CLIENT_ID` と `SAMPLE_API_CLIENT_SECRET` で登録している） |

## 使う技術

- Node.js 22、pnpm、TypeScript、Hono、`@hono/node-server`、`tsx`（`pnpm start` で起動できるようにする）

## エンドポイント

| パス | 動き |
|---|---|
| `GET /health` | `{"status":"ok"}` を返す（認証なし） |
| `GET /me` | `Authorization: Bearer <access_token>` を必須にする（RFC 6750 §2.1）。検証に成功したら 200 と `{ "sub", "scope", "client_id", "message": "アクセストークンの検証に成功しました" }` を返す |

`GET /me` が成功以外のときの応答は、次のとおりにしてください（RFC 6750 §3、§3.1）。

| 場合 | 応答 |
|---|---|
| `Authorization` ヘッダーが無い、または `Bearer` の形式でない | 401 と `WWW-Authenticate: Bearer`（エラーコードは付けない） |
| トークンが無効（でたらめな文字列、期限切れ、失効など） | 401 と `WWW-Authenticate: Bearer error="invalid_token"` |
| トークンは有効だが、`scope` に `openid` が無い | 403 と `WWW-Authenticate: Bearer error="insufficient_scope"` |
| 認証基盤に接続できないなど、検証そのものができなかった | 503（トークンが無効と分かったわけではないので、401 にしない） |

## アクセストークンの検証

既定は Token Introspection（RFC 7662）にしてください。

- Discovery の `introspection_endpoint`（既定値では `http://localhost:4000/introspect`）に、`Authorization: Basic base64(sample-api:sample-api-secret)` と `token=<access_token>&token_type_hint=access_token` を POST する（RFC 7662 §2.1）
- 応答の `active` が `true` なら有効（RFC 7662 §2.2）。`sub`、`scope`、`client_id` を応答に使う
- 応答に `token_type` があり、`Bearer` 以外（リフレッシュトークンなど）なら無効として扱う
- `scope` に `openid` が含まれることを確認する（最小の確認）

任意で、環境変数 `VERIFY_MODE=jwt` のときは JWKS で署名を検証する方式も用意してよい（`jose` を使ってよい）。
その場合は、署名に加えて、`typ` ヘッダーが `at+jwt` であること（RFC 9068 §2.1、§4）、`iss` が認証基盤の issuer と一致すること、`exp` が期限内であることを確認する。

注意: この認証基盤が Device Authorization Grant で発行するアクセストークンの `aud` は `["http://localhost:4000/userinfo"]` だけです（RFC 8628 には `resource` パラメータが無く、生成コードは UserInfo エンドポイントだけを `aud` に入れる）。
したがって `aud` が API の URL であることは要求しないでください。
この点は README に「今回確認しなかったこと（`aud` による宛先の限定）」として書いてください。

## 設定

`.env`（`.env.example` を置く）

| 変数 | 既定値 |
|---|---|
| `PORT` | `4001` |
| `OP_ISSUER` | `http://localhost:4000` |
| `API_CLIENT_ID` | `sample-api` |
| `API_CLIENT_SECRET` | `sample-api-secret` |
| `VERIFY_MODE` | `introspection` |

## 成果物

- 動くコード
- `README.md`: 依存関係のインストール、設定、起動コマンド、`curl` での確認（トークン無しで 401、でたらめなトークンで 401、有効なトークンで 200）、検証方式の説明、確認しなかったこと
- `.env.example`

## 進め方

1. 実装方針を短く説明してから実装する
2. 実装後、認証基盤（`chapter3/openid-provider`）が起動している状態で API を起動し、`GET /health` が 200、トークン無しの `GET /me` とでたらめなトークンの `GET /me` が 401 になることを `curl -i` で確認する。認証基盤が起動していなければ、`chapter3/openid-provider` で `pnpm start` を実行して起動する。有効なトークンでの確認は、認証基盤と CLI アプリを使う手順として README に書く。確認後は、自分が起動したプロセスを止める
3. 確認していないことは README に明記する

## 守ること

- 認証基盤側のコードは変えない
- トークンをログに全文出さない
- サーバーは `localhost` でだけ待ち受ける（`@hono/node-server` の `serve()` に `hostname: 'localhost'` を渡す）
- 回答と README は日本語で書く
