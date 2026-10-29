# B.9 Device Authorization Grant を使うサンプル CLI アプリの実装

## 目的

ターミナルで動く CLI アプリから、第3章の認証基盤に認可を要求し、ユーザーがブラウザで承認したあとにアクセストークンを取得して、サンプル API を呼ぶまでを動かしてください。
OAuth 2.0 Device Authorization Grant（RFC 8628）を使います。

## 作業場所

`chapter3/cli-app/`。このディレクトリだけで `pnpm install` と実行ができる、独立したプロジェクトにしてください。

## 接続先（`chapter3/openid-provider/.env.example` の既定値）

| 項目 | 値 |
|---|---|
| issuer | `http://localhost:4000` |
| Discovery | `http://localhost:4000/.well-known/openid-configuration`（`device_authorization_endpoint` と `token_endpoint` はここから取得する） |
| client_id | `sample-cli`。public client で `client_secret` は無い（クライアント認証 `none`）。要求には `client_id` だけを付ける |
| grant_type | `urn:ietf:params:oauth:grant-type:device_code` |
| scope | `openid profile email`（この認証基盤は `scope` を必須にし、`openid` を含める必要がある） |
| サンプル API | `GET http://localhost:4001/me` |

## 使う技術

- Node.js 22、pnpm、TypeScript、`tsx`（`pnpm start` で実行できるようにする）
- HTTP は `fetch`。依存は最小にする（CLI の引数解析やブラウザ起動に小さなライブラリを使ってよい）

## 動き（RFC 8628）

1. Discovery からエンドポイントを取得する
2. `POST device_authorization_endpoint`（`client_id`、`scope`）を送り、`device_code`、`user_code`、`verification_uri`、`verification_uri_complete`、`expires_in`、`interval` を受け取る（§3.1、§3.2）
3. ターミナルに表示する
   - 承認用 URL: `verification_uri_complete`（ユーザーコードを含む）を、クリックしやすいように単独の行に出す。対応する端末では OSC 8 のハイパーリンクにしてもよい
   - ユーザーコード: ブラウザの画面に表示されるコードと見比べるため
   - 有効期限（`expires_in` 秒）
   - オプション `--open` を付けたときだけ、既定のブラウザで URL を開く（既定では開かない。URL を手入力しなくて済む形にするのが目的）
4. `interval` 秒ごとに `POST token_endpoint`（`grant_type`、`device_code`、`client_id`）を送る（§3.4、§3.5）
   - `authorization_pending`: 待っていることを表示して続ける
   - `slow_down`: 間隔を 5 秒長くして続ける
   - `access_denied`: 「承認されませんでした」と表示して終了コード 1 で終わる
   - `expired_token`: 「期限切れです。もう一度実行してください」と表示して終了コード 1 で終わる
   - それ以外のエラー: `error` と `error_description` をそのまま表示して終わる
   - `expires_in` を過ぎたら、ポーリングをやめて期限切れとして終わる
5. 成功したら `token_type`、`expires_in`、`scope` を表示する。`access_token` と `id_token` は全文を表示せず、先頭の数文字と長さだけにする。`--show-tokens` を付けたときは全文を表示する
6. `GET http://localhost:4001/me` を `Authorization: Bearer <access_token>` で呼び、HTTP ステータスと JSON を表示する。API が起動していなければ、その旨を表示する

## 設定

`.env`（`.env.example` を置く）

| 変数 | 既定値 |
|---|---|
| `OP_ISSUER` | `http://localhost:4000` |
| `CLIENT_ID` | `sample-cli` |
| `SCOPE` | `openid profile email` |
| `API_URL` | `http://localhost:4001` |

## 成果物

- 動くコード
- `README.md`: 依存関係のインストール、設定、実行コマンド、確認手順。承認した場合と拒否した場合の両方について、期待する表示を書く
- `.env.example`

## 進め方

1. 実装方針を短く説明してから実装する
2. 実装後、認証基盤（`chapter3/openid-provider`）を起動した状態で一度実行し、承認用 URL とユーザーコードが表示されて承認待ちになるところまでを確認する。ブラウザでの承認は読者が行うので、自動化しない。確認後はプロセスを止める
3. 確認していないことは README に明記する

## 守ること

- トークンをファイルに保存しない
- 認証基盤側のコードは変えない
- 回答と README は日本語で書く
