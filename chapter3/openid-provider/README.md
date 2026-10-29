# chapter3/openid-provider

OSS [maronn-openid-connect](https://github.com/maronnjapan/maronn-openid-connect) の CLI で生成した OpenID Provider を、Node.js で起動するための土台です。
章全体の手順は [../README.md](../README.md) にあります。

## ファイルの役割

| ファイル | 役割 | 誰が書くか |
|---|---|---|
| `package.json`、`pnpm-lock.yaml` | 依存関係（CLI 0.15.1、core 0.10.0、experimental 0.0.16、hono、@hono/node-server）とスクリプト | 用意済み |
| `tsconfig.json` | 生成コードの画面（hono/jsx）を型検査する設定 | 用意済み |
| `.env.example` | ローカル検証用の設定の例。`.env` にコピーする | 用意済み |
| `src/server.ts` | `@hono/node-server` で待ち受ける | 用意済み（変えてよい） |
| `src/app.ts` | 生成コードの `applyOidc()` を Hono のアプリに適用し、クライアントと検証用ユーザーを登録する | 用意済み（ユーザーやクライアントを足すならここ） |
| `src/settings.ts` | 環境変数から issuer やクライアント登録を読む | 用意済み |
| `src/signing-key.ts` | 起動のたびに RS256 鍵を作る | 用意済み |
| `src/oidc-provider/` | OpenID Provider 本体（エンドポイント、画面、機能、メモリ DB） | `pnpm run generate` が作る |

## スクリプト

| コマンド | 内容 |
|---|---|
| `pnpm run generate` | `maronn-oidc generate hono --enable device-authorization-grant --output ./src/oidc-provider` |
| `pnpm run generate:dry-run` | 書き込まずに、作られるファイルの一覧を表示する |
| `pnpm run generate:force` | 既にある生成コードを上書きする（先にコミットしておく） |
| `pnpm run graph` | 生成される OP のエンドポイントの図（Mermaid）を表示する |
| `pnpm start` | 起動する（`.env` があれば読む） |
| `pnpm dev` | ファイルの変更で再起動しながら起動する |
| `pnpm typecheck` | 型検査 |

`.env` が無いと Node.js が `.env not found. Continuing without it.` と表示しますが、既定値で動くので問題ありません。

## 手順

```bash
pnpm install
pnpm run generate
cp .env.example .env
pnpm typecheck
pnpm start
curl -s http://localhost:4000/.well-known/openid-configuration
```

## ユーザーとクライアントを足す

`src/app.ts` で `registerDevelopmentUsers(db)` のあとに、生成コードの `registerUser()` を呼びます。

```typescript
import { registerUser } from './oidc-provider/db/index.js';

await registerUser(db, {
  sub: 'carol',
  name: 'Carol',
  email: 'carol@example.com',
  email_verified: true,
  password: 'password',
});
```

クライアントは `src/settings.ts` の `clients` に足します。
Device Authorization Grant を使うクライアントは `grantTypes` に `urn:ietf:params:oauth:grant-type:device_code` が必要です。

## 生成コードを変えるとき

- 画面の文言: `src/oidc-provider/features/device-authorization-grant/views.tsx`（デバイスの画面）、`src/oidc-provider/views.tsx`（ログインと同意の画面）
- Device Authorization Grant の設定（有効期限 600 秒、ポーリング間隔 5 秒、ログイン失敗の上限 5 回）: `src/oidc-provider/features/device-authorization-grant/config.ts`
- トークンの有効期限など: `src/app.ts` の `applyOidc()` に渡す `config`（`src/oidc-provider/config.ts` の `ProviderConfig` を参照）

変更は `pnpm run generate:force` で消えます。再生成の前にコミットしてください。
`.maronn-openid-connect.json` は生成時の構成の記録なので、手で書き換えないでください。
生成AIに頼むときは `prompts/B08-configure-generated-op.md` を使います。

## 知っておくこと

- データはメモリに入ります。再起動するとユーザーのログイン状態、デバイスコード、トークンは消えます。クライアントとユーザーは起動のたびに登録し直します
- 署名鍵も起動のたびに変わります。再起動前に発行したトークンは検証できません
- この OP の Device Authorization Grant は `scope` を必須にし、`openid` を含める必要があります。アクセストークンの `aud` は `<issuer>/userinfo` だけです
- `@maronn-openid-connect/experimental` の API は安定していません。版を上げるときは再生成を検討してください
