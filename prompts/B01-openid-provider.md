# B.1 OpenID Provider の実装

## 目的

検証用の OpenID Provider（以下 OP）を TypeScript と Hono で作ってください。
社内システムに見立てた二つの Web アプリ（App A、App B）が、この OP にログインを任せます。
目的は「まず動かして、ログインの集約と SSO を体験すること」です。本番品質は求めません。

## 作業場所

`chapter2/openid-provider/`。このディレクトリだけで `pnpm install` と起動ができる、独立したプロジェクトにしてください。
作業場所に最初からある README.md は、成果物の README で上書きして構いません。

## 使う技術

- Node.js 22、pnpm、TypeScript、Hono、`@hono/node-server`
- OIDC や OAuth のライブラリ（OP 実装、クライアントライブラリ）は使わない。仕組みを見えるようにするため
- JWT の署名は Node.js の WebCrypto または `node:crypto` で行う。`jose` のような小さなライブラリを使う場合は、理由を README に書く
- データ（ユーザー、クライアント、認可コード、トークン、セッション）はメモリに持つ。DB は使わない

## 設定値（`chapter2/settings.md` と同じ）

| 項目 | 値 |
|---|---|
| URL と issuer | `http://localhost:3000` |
| 検証用ユーザー | `alice` / `password`（name: Alice Example、email: alice@example.com）、`bob` / `password`（name: Bob Example、email: bob@example.com）。`sub` にはユーザー名（`alice`、`bob`）を使う |
| クライアント App A | client_id `app-a`、client_secret `app-a-secret`、redirect_uri `http://localhost:3001/callback` |
| クライアント App B | client_id `app-b`、client_secret `app-b-secret`、redirect_uri `http://localhost:3002/callback` |
| scope | `openid profile email` |
| クライアント認証 | `client_secret_post`（`client_secret_basic` も受け付けてよい） |
| 環境変数 | `PORT`（既定 3000）、`ISSUER`（既定 `http://localhost:3000`） |
| OP のセッション Cookie の名前 | `op_session` |

ユーザーとクライアントの登録は、コード中の一箇所（設定ファイルや配列）にまとめ、増やしやすくしてください。

## 実装する機能

1. Discovery: `GET /.well-known/openid-configuration`。`issuer`、`authorization_endpoint`、`token_endpoint`、`userinfo_endpoint`、`jwks_uri`、`response_types_supported: ["code"]`、`grant_types_supported: ["authorization_code"]`、`scopes_supported`、`id_token_signing_alg_values_supported: ["RS256"]`、`subject_types_supported: ["public"]`、`token_endpoint_auth_methods_supported` を返す
2. JWKS: `GET /.well-known/jwks.json`。起動時に生成した RS256 鍵の公開鍵を返す
3. 認可エンドポイント: `GET /authorize`。`response_type=code`、`client_id`、`redirect_uri`、`scope`、`state`、`nonce` を受け付ける。`client_id` と `redirect_uri` は登録値と完全一致で検証し、不一致ならリダイレクトせずにエラー画面を返す。この検証を通ったあとのエラー（`response_type` や `scope` の不備など）は、`redirect_uri` に `error`、`error_description`、`state` を付けてリダイレクトで返す（RFC 6749 §4.1.2.1）。未ログインならログイン画面へ。ログイン済み（OP のセッション Cookie が有効）なら、ログイン画面を出さずに認可コードを発行して `redirect_uri` に `code` と `state` を付けてリダイレクトする
4. ログイン画面: `GET /login`、`POST /login`。ユーザー名とパスワードのフォーム。成功で OP のセッション Cookie（名前は `op_session`。HttpOnly、SameSite=Lax、Path=/）を発行し、元の認可リクエストを続行して認可コードを返す。失敗はエラーを表示して再入力
5. トークンエンドポイント: `POST /token`。`grant_type=authorization_code`。クライアント認証を行い、`code` が未使用で有効期限内（5 分）であること、`redirect_uri` と `client_id` が認可時と一致することを確認する。`access_token`（不透明なランダム文字列でよい）、`token_type: "Bearer"`、`expires_in`、`id_token` を返す。`id_token` は RS256 署名の JWT で、`iss`、`sub`、`aud`（client_id）、`exp`、`iat`、`nonce`（認可時に受け取った値）を含める。認可コードは一回使ったら無効にする
6. UserInfo: `GET /userinfo`。`Authorization: Bearer` のアクセストークンを検証し、`sub` と、scope に `profile` があれば `name`、`email` があれば `email` を返す。トークンが無ければ 401 と `WWW-Authenticate: Bearer`、トークンが無効なら 401 と `WWW-Authenticate: Bearer error="invalid_token"` を返す（RFC 6750 §3、§3.1）
7. エラー応答: トークンエンドポイントのエラーは OAuth の形式（JSON の `error`、`error_description`）で返す
8. トップページ: `GET /`。OP の名前と issuer、Discovery へのリンクを表示する簡単なページを返す（読者がブラウザーで `http://localhost:3000` を開いたときに、起動していることが分かるようにするため）

## 今回は含めなくてよいもの

- 同意画面、リフレッシュトークン、ログアウト、Implicit Flow と Hybrid Flow、Dynamic Client Registration
- レート制限やアカウントロックなどの本番向けの対策
- HTTPS（ローカルの平文 HTTP で動かす）

上に書いていない仕様については任せます。含めたもの、省いたものを README に列挙してください。

## 成果物

- 動くコード
- `README.md`: 依存関係のインストール、設定する値、起動コマンド、動作確認の手順（`curl` で Discovery と JWKS を取る例、ブラウザーでの確認）、含めた仕様と省いた仕様の一覧
- `.env.example`

## 進め方

1. 実装方針とファイル構成を短く説明してから実装する
2. 実装後、`pnpm install` と起動を実際に行い、`curl` で Discovery と JWKS が返ることを確認する。確認後はプロセスを止める
3. 動作確認できていないことは「未確認」と README に明記する

## 守ること

- ローカルで動かすことだけを前提にする。デプロイ用の設定は足さない
- サーバーは `localhost` でだけ待ち受ける（`@hono/node-server` の `serve()` に `hostname: 'localhost'` を渡す）。検証用の固定パスワードを使うので、同じネットワークのほかの機器から接続できないようにする
- ポート、client_id、redirect_uri、ユーザー名は表のとおりにする（App A と App B の設定とそろえるため）
- Cookie の名前は `op_session` にする。ブラウザーは Cookie をホスト名で管理し、ポートを区別しないので、同じ `localhost` で動く App A（`app_a_session`）と App B（`app_b_session`）の Cookie と名前が重なると、互いに上書きしてしまう
- 回答と README は日本語で書く
