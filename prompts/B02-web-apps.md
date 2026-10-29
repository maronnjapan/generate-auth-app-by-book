# B.2 二つの Web アプリの実装

## 目的

社内システムに見立てた Web アプリ App A と App B を作ってください。
どちらも `chapter2/openid-provider/` の OpenID Provider（以下 OP）にログインを任せ、ログイン状態とユーザー情報を表示します。
二つのアプリで、認証基盤でのパスワード入力を繰り返さずにログインできること（SSO）を体験するのが目的です。

## 作業場所

`chapter2/app-a/` と `chapter2/app-b/`。
二つは同じ構成でよく、設定値だけが違います。片方を作って複製するか、共通のコードを両方に置いてください。
それぞれのディレクトリだけで `pnpm install` と起動ができる、独立したプロジェクトにしてください。

## 使う技術

- Node.js 22、pnpm、TypeScript、Hono、`@hono/node-server`
- OIDC クライアントライブラリは使わず、リダイレクトとトークン交換を自分で実装する。仕組みを見えるようにするため
- ID トークンは、少なくとも `iss`、`aud`、`exp`、`nonce` をペイロードで確認する。署名検証（JWKS から公開鍵を取得して RS256 を検証）は行ってよいが必須にしない。行わない場合は README に「未検証」と書く

## 設定値（`chapter2/settings.md` と同じ）

| 変数 | App A | App B |
|---|---|---|
| `PORT` | `3001` | `3002` |
| `APP_NAME` | `App A` | `App B` |
| `OP_ISSUER` | `http://localhost:3000` | `http://localhost:3000` |
| `CLIENT_ID` | `app-a` | `app-b` |
| `CLIENT_SECRET` | `app-a-secret` | `app-b-secret` |
| `REDIRECT_URI` | `http://localhost:3001/callback` | `http://localhost:3002/callback` |

- scope: `openid profile email`
- クライアント認証: `client_secret_post`
- OP のエンドポイントは `OP_ISSUER` の Discovery（`/.well-known/openid-configuration`）から取得する。取得に失敗したら issuer から `/authorize`、`/token`、`/userinfo` を組み立てる

## 画面と動き

| パス | 動き |
|---|---|
| `GET /` | 未ログインなら、アプリ名と「ログイン」リンク。ログイン済みなら、アプリ名、ユーザー情報（`sub`、`name`、`email`）、「ログアウト」リンク |
| `GET /login` | `state` と `nonce` を生成してセッションに保存し、OP の認可エンドポイントへリダイレクトする（`response_type=code`、`client_id`、`redirect_uri`、`scope`、`state`、`nonce`） |
| `GET /callback` | `state` がセッションの値と一致することを確認し、`code` をトークンエンドポイントで交換する。ID トークンの `iss`、`aud`、`exp`、`nonce` を確認し、UserInfo からユーザー情報を取得して、アプリのセッション Cookie（HttpOnly、SameSite=Lax）に保存し、`/` にリダイレクトする。失敗は理由を画面に表示する |
| `GET /logout` | アプリのセッションだけを削除して `/` に戻る。OP のログイン状態は残す（SSO を確認するため） |

セッションはメモリに持ち、Cookie にはセッション ID だけを入れてください。
画面は素朴な HTML でよく、ログイン状態とユーザー情報が分かれば十分です。

## 成果物

- 動くコード（app-a と app-b）
- 各ディレクトリの `README.md`: 依存関係のインストール、設定値、起動コマンド、確認手順
- 各ディレクトリの `.env.example`

## 確認手順（README に書く）

1. OP、App A、App B を起動する（ターミナルを三つ使う）
2. http://localhost:3001 で「ログイン」→ OP のログイン画面で `alice` / `password` → App A に戻り、ユーザー情報が表示される
3. 同じブラウザで http://localhost:3002 の「ログイン」→ OP でパスワードを再入力せずに App B に戻る
4. App A と App B で同じ `sub` が表示されている

## 進め方

1. 実装方針とファイル構成を短く説明してから実装する
2. 実装後、`pnpm install` と起動を実際に行い、`GET /` が表示されることと、`/login` が OP へのリダイレクト（302）を返すことを `curl -i` で確認する。ブラウザでのログインは読者が行うので、手順を README に書く。確認後はプロセスを止める
3. 確認していないことは README に明記する

## 守ること

- 設定値は表のとおりにする
- ローカルで動かすことだけを前提にする
- 回答と README は日本語で書く
