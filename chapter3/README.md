# 第3章 OSS を土台にして、発展的な機能を試す

自作 OSS の [maronn-openid-connect](https://github.com/maronnjapan/maronn-openid-connect) の CLI で、Device Authorization Grant（RFC 8628）を有効にした OpenID Provider を生成します。
そのうえで、認可を要求するサンプル CLI アプリと、アクセストークンを検証するサンプル API を生成AIで作り、ブラウザで承認してからトークンを取得する流れを同じ PC の中で動かします。

## この章の構成要素

| 構成要素 | ディレクトリ | URL | 作り方 |
|---|---|---|---|
| 認証基盤（OpenID Provider） | `openid-provider/` | http://localhost:4000 | OSS の CLI で生成する（土台は用意済み） |
| サンプル API | `sample-api/` | http://localhost:4001 | プロンプト B.10 を生成AIに渡す |
| サンプル CLI アプリ | `cli-app/` | なし（ターミナルで実行） | プロンプト B.9 を生成AIに渡す |
| ブラウザ | | | ログインと承認に使う |

二つの CLI を区別してください。

- OSS の CLI（`maronn-oidc`）は、認証基盤のアプリケーションコードを生成するツール
- サンプル CLI アプリは、その認証基盤を利用するクライアント。本書の教材として生成AIに作ってもらう

## ローカル検証用の設定（3.4.4）

`openid-provider/.env.example` の値です。`.env` にコピーして使います。

| 項目 | 値 | 備考 |
|---|---|---|
| 認証基盤の URL（issuer） | `http://localhost:4000` | 平文の HTTP。RFC 8628 §5.7 と RFC 6749 §1.6 は TLS を求めるが、同じ PC の中で試す本書の検証では平文で動かす。外部に公開するなら HTTPS にする |
| 検証用ユーザー | `testuser` / `password`、`otheruser` / `password` | 生成コードの `development.ts` にある開発用ユーザー。本番の DB には登録しない |
| サンプル CLI アプリのクライアント | `client_id`: `sample-cli`、public client、クライアント認証 `none` | ターミナルで動くアプリは秘密を安全に保持できないので、`client_secret` を持たない |
| 本フローを使うための登録 | `grantTypes` に `urn:ietf:params:oauth:grant-type:device_code` | 登録が無いと `/device_authorization` が `unauthorized_client` を返す |
| scope | `openid profile email` | この OP は `scope` を必須にし、`openid` を含める必要がある（RFC 8628 では省略可だが、OSS 側の既知の制限） |
| サンプル API のクライアント | `client_id`: `sample-api`、`client_secret`: `sample-api-secret`、`client_secret_basic` | API が `/introspect` でトークンを検証するときに使う |
| 署名鍵 | 起動のたびに生成する RS256 鍵 | 再起動すると発行済みのトークンは検証できなくなる |

これらは `openid-provider/src/settings.ts` と `src/app.ts` で登録しています。
認証認可の処理は生成コードと `@maronn-openid-connect/core` が担い、自分で持つのは設定、署名鍵、クライアントとユーザーの登録だけです。

## 3.4 機能を指定して、認証基盤を生成する

### 3.4.1 作業場所を用意する

```bash
cd chapter3/openid-provider
node -v        # v22.9 以上
pnpm install   # CLI 0.15.1、core 0.10.0、experimental 0.0.16 を pnpm-lock.yaml の版で入れる
```

第2章の実装とは別の作業場所です。
生成先は `src/oidc-provider/` に決めてあります（`package.json` の `generate` スクリプト）。

### 3.4.2 Device Authorization Grant を有効にして生成する

```bash
pnpm run generate
# 実体: maronn-oidc generate hono --enable device-authorization-grant --output ./src/oidc-provider
```

書き込む前に一覧だけ見るなら `pnpm run generate:dry-run` です。
生成が終わると、次のように表示されます（CLI 0.15.1 の場合）。

```
Done! Generated 170 files in ./src/oidc-provider

The screens (the .tsx files) use hono/jsx. Enable JSX in tsconfig.json:
  "jsx": "react-jsx", "jsxImportSource": "hono/jsx"

Next steps:
  1. Provide runtime config, signing keys, and client resolvers from env/DB/KV
  2. The data is kept in memory (db/): generate with --db sql or --db kv, or pass your own ProviderStores as storage
  3. Register your clients and users with registerClient() and registerUser() of db/ (registerDevelopmentUsers() of development.ts adds testuser and otheruser)
  4. Install dependencies: pnpm add hono @maronn-openid-connect/core @maronn-openid-connect/experimental
  5. Start the server
```

Next steps の 1〜4 は土台（`tsconfig.json`、`src/app.ts`、`package.json`）で済ませてあります。
生成直後にコミットしておくと、あとで生成コードを変えたときに差分を取り戻せます。

```bash
git add src/oidc-provider && git commit -m "chapter3: generate OP with device-authorization-grant"
```

### 3.4.3 生成された機能を確認する

```bash
ls src/oidc-provider/features/
cat src/oidc-provider/features/enabled.ts
cat src/oidc-provider/.maronn-openid-connect.json
ls -R src/oidc-provider/features/device-authorization-grant/
```

| 確認するもの | 場所 |
|---|---|
| デバイス認可を受け付ける処理（`POST /device_authorization`） | `features/device-authorization-grant/endpoints/device-authorization/`（`pipeline.ts` と `steps/`） |
| ブラウザでコードを確認・承認する画面（`GET/POST /device`、`/device/login`、`/device/approve`） | `features/device-authorization-grant/endpoints/device/`（`page.tsx` と `steps/`）、画面は `features/device-authorization-grant/views.tsx` |
| 承認結果に応じてトークンを発行する処理（`/token` の `device_code` グラント） | `features/device-authorization-grant/steps/dispatch-device-code.ts`（`endpoints/token/pipeline.ts` から呼ばれる） |
| 設定（有効期限、ポーリング間隔、ログイン失敗の上限） | `features/device-authorization-grant/config.ts` |
| 有効な機能の一覧 | `features/enabled.ts` |
| 生成時の構成情報（CLI の版、機能、scope、db） | `.maronn-openid-connect.json`（`deviceAuthorizationGrant: true`） |

既定で入る機能（`pkce`、`refresh-token`、`introspection`、`revocation`、`request-object`、`form-post-response-mode`、`implicit-flow`、`hybrid-flow`）に、`--enable` で `device-authorization-grant` を足した構成です。

### 3.4.4 ローカル検証用の設定を用意する

```bash
cp .env.example .env    # 値は上の表のとおり。変えなければそのままでよい
pnpm typecheck          # 生成コードと土台の型検査
```

### 3.4.5 認証基盤を起動する

```bash
pnpm start              # または pnpm dev（ファイル変更で再起動）
```

別のターミナルで確認します。

```bash
curl -s http://localhost:4000/.well-known/openid-configuration
```

`device_authorization_endpoint` が `http://localhost:4000/device_authorization`、`grant_types_supported` に `urn:ietf:params:oauth:grant-type:device_code` が含まれていれば、機能が入っています。
ブラウザで http://localhost:4000/device を開くと、ユーザーコードを入力する画面が出ます。

CLI アプリを作る前に、curl だけで流れを追うこともできます。

```bash
# 1. デバイス認可を要求する
curl -s -X POST http://localhost:4000/device_authorization \
  -d client_id=sample-cli -d "scope=openid profile email"
# → device_code, user_code, verification_uri, verification_uri_complete, expires_in (600), interval (5)

# 2. ブラウザで verification_uri_complete を開き、testuser / password でログインして Approve を押す

# 3. interval 秒以上あけて、トークンを要求する
curl -s -X POST http://localhost:4000/token \
  -d grant_type=urn:ietf:params:oauth:grant-type:device_code \
  -d device_code=<device_code> -d client_id=sample-cli
# 承認前: {"error":"authorization_pending",...}
# 間隔が短すぎる: {"error":"slow_down",...}（次の要求は 5 秒長く待つ）
# 承認後: access_token, id_token, token_type, expires_in, scope
# 拒否後: {"error":"access_denied",...}
```

## 3.5 検証用の CLI アプリとサンプル API を、生成AIで作る

1. サンプル API: `prompts/B10-sample-api.md` を渡す（Claude Code では `/b10-sample-api`）。`sample-api/` に作られる
2. サンプル CLI アプリ: `prompts/B09-device-cli-app.md` を渡す（`/b9-device-cli-app`）。`cli-app/` に作られる

CLI アプリは、承認用 URL（`verification_uri_complete`。ユーザーコードを含む）をクリックできる形でターミナルに表示し、承認後にアクセストークンを取得してサンプル API を呼びます。
サンプル API は、Token Introspection（RFC 7662）でアクセストークンを検証して応答します。

## 3.6 ブラウザで承認し、CLI アプリを使ってみる

ターミナルを三つ使います。

```bash
# 1 枚目: 認証基盤
cd chapter3/openid-provider && pnpm start
# 2 枚目: サンプル API
cd chapter3/sample-api && pnpm start        # コマンド名は生成された README に従う
# 3 枚目: サンプル CLI アプリ
cd chapter3/cli-app && pnpm start
```

1. CLI アプリが承認用 URL とユーザーコードを表示し、承認待ちになる
2. 同じ PC のブラウザで URL を開く。コードが入った状態で「Continue」を押し、`testuser` / `password` でログインし、画面のコードが CLI アプリの表示と同じことを確認して「Approve」を押す
3. CLI アプリがアクセストークンを取得し、サンプル API（`GET /me`）を呼んだ結果（`sub` など）を表示する
4. もう一度 CLI アプリを実行し、今度は「Deny」を押す。CLI アプリが `access_denied` を表示し、トークンを取得できないことを確認する

## 3.7 コマンドと生成物から、機能構成を振り返る

- 実行した生成コマンド: `maronn-oidc generate hono --enable device-authorization-grant --output ./src/oidc-provider`
- 既定の機能と、明示的に追加した機能: `src/oidc-provider/.maronn-openid-connect.json` の `features` と `features/enabled.ts`
- エンドポイントの図: `pnpm run graph`（Mermaid）。`pnpm exec maronn-oidc graph hono --enable device-authorization-grant --detail steps` で各エンドポイントの中のステップまで描ける
- 生成したコードの調整: `prompts/B08-configure-generated-op.md`（`/b8-configure-generated-op`）。画面の文言や設定値を変えるときに使う。変えたファイルは README に残す

確認できたことと、まだ確認していないことを分けて書き出してください。

| 区分 | 例 |
|---|---|
| ライブラリ側で確認されている範囲 | OSS の README に書かれた準拠仕様とテストの範囲（Device Authorization Grant は experimental で、API は不安定） |
| 今回の検証で確かめた範囲 | 承認と拒否、`authorization_pending` と `slow_down`、取得したトークンで API を呼べること |
| 自分で追加・変更した範囲 | 設定値、画面の文言、ユーザーの追加など（B.8 で変えたもの） |
| 次に試したい機能や条件 | アクセストークンの `aud` を API の URL にする（この OP は `<issuer>/userinfo` だけを入れる）、`--db` で永続化する、期限切れ（`expired_token`）の挙動、別の実験的機能（PAR、CIBA など） |

## ディレクトリ

```
chapter3/
├── README.md               # この文書
├── openid-provider/        # 認証基盤の土台。src/oidc-provider/ を pnpm run generate で作る
│   ├── package.json        # 版を固定した依存関係と、generate / start などのスクリプト
│   ├── tsconfig.json       # hono/jsx の設定込み
│   ├── .env.example        # ローカル検証用の設定
│   └── src/
│       ├── server.ts       # Node.js で起動する
│       ├── app.ts          # 生成コードを Hono に組み込み、クライアントとユーザーを登録する
│       ├── settings.ts     # 環境変数から設定を読む
│       ├── signing-key.ts  # 起動時に RS256 鍵を作る
│       └── oidc-provider/  # ← 生成物（最初は無い）
├── cli-app/                # B.9 の作業場所（README のみ）
└── sample-api/             # B.10 の作業場所（README のみ）
```
