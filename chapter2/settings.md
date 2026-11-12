# 第2章 認証基盤とアプリでそろえる設定値

生成AIに渡すプロンプト（B.1〜B.4）はこの表の値を前提にしています。
値を変える場合は、この表を先に変えてから、プロンプトと各アプリの `.env` をそろえてください。

## URL とポート

| 構成要素 | ディレクトリ | URL |
|---|---|---|
| 認証基盤（OpenID Provider） | `chapter2/openid-provider/` | `http://localhost:3000`（issuer も同じ値） |
| Web アプリ A | `chapter2/app-a/` | `http://localhost:3001` |
| Web アプリ B | `chapter2/app-b/` | `http://localhost:3002` |

## 検証用ユーザー（認証基盤に登録）

| ユーザー名（sub） | パスワード | name | email |
|---|---|---|---|
| `alice` | `password` | Alice Example | alice@example.com |
| `bob` | `password` | Bob Example | bob@example.com |

## クライアント登録（認証基盤に登録）

| アプリ | client_id | client_secret | redirect_uri |
|---|---|---|---|
| App A | `app-a` | `app-a-secret` | `http://localhost:3001/callback` |
| App B | `app-b` | `app-b-secret` | `http://localhost:3002/callback` |

- クライアント認証の方式: `client_secret_post`（`client_secret_basic` も受け付けてよい）
- scope: `openid profile email`
- response_type: `code`

## 認証基盤のエンドポイント

| パス | 役割 |
|---|---|
| `GET /.well-known/openid-configuration` | Discovery |
| `GET /.well-known/jwks.json` | ID トークンの署名を検証する公開鍵 |
| `GET /authorize` | 認可エンドポイント |
| `GET /login`、`POST /login` | 認証基盤のログイン画面 |
| `POST /token` | トークンエンドポイント |
| `GET /userinfo` | UserInfo |

## Web アプリの画面

| パス | 役割 |
|---|---|
| `GET /` | ログイン状態とユーザー情報（sub、name、email）の表示 |
| `GET /login` | 認証基盤の `/authorize` へリダイレクト |
| `GET /callback` | 認可コードを受け取り、トークンに交換する |
| `GET /logout` | アプリのセッションだけを消す（認証基盤のログイン状態は残す） |

## 環境変数

### 認証基盤

| 変数 | 既定値 | 意味 |
|---|---|---|
| `PORT` | `3000` | 待ち受けポート |
| `ISSUER` | `http://localhost:3000` | issuer。Discovery の各 URL の基準 |
| `REQUIRE_PKCE` | `true` | B.4 の記入例で PKCE を追加したあとに使う。`true` なら `code_challenge` の無い認可リクエストを拒否する。`false` にすると追加前と同じく受け付ける |

### Web アプリ（A と B で同じ名前、値だけ違う）

| 変数 | App A の値 | App B の値 |
|---|---|---|
| `PORT` | `3001` | `3002` |
| `APP_NAME` | `App A` | `App B` |
| `OP_ISSUER` | `http://localhost:3000` | 同じ |
| `CLIENT_ID` | `app-a` | `app-b` |
| `CLIENT_SECRET` | `app-a-secret` | `app-b-secret` |
| `REDIRECT_URI` | `http://localhost:3001/callback` | `http://localhost:3002/callback` |
| `SESSION_COOKIE_NAME` | `app_a_session` | `app_b_session` |
| `USE_PKCE` | `true` | 同じ（B.4 の記入例で PKCE を追加したあとに使う。`false` にすると `code_challenge` と `code_verifier` を送らない） |

## Cookie

| 構成要素 | Cookie の名前 | 役割 |
|---|---|---|
| 認証基盤 | `op_session` | 認証基盤のログイン状態。これが SSO の土台になる |
| App A | `app_a_session` | App A のセッション |
| App B | `app_b_session` | App B のセッション |

- どれも HttpOnly、SameSite=Lax、Path=/ にする
- Cookie の名前は必ず三つとも別にする。ブラウザーは Cookie をホスト名で管理し、ポートを区別しない（RFC 6265 §8.5）。`localhost:3000`、`localhost:3001`、`localhost:3002` は同じ `localhost` として扱われるので、名前が同じだと互いの Cookie を上書きし、片方のアプリでログインするともう片方がログアウトしたように見える
