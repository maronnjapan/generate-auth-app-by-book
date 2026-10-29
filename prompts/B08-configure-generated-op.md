# B.8 OSS で生成した認証基盤の設定・編集

## 前提

`chapter3/openid-provider/src/oidc-provider/` は、OSS [maronn-openid-connect](https://github.com/maronnjapan/maronn-openid-connect) の CLI が生成したコードです。

- 生成コマンド: `maronn-oidc generate hono --enable device-authorization-grant --output ./src/oidc-provider`（`pnpm run generate`）
- CLI の版: `@maronn-openid-connect/cli` 0.15.1、生成コードが呼ぶ `@maronn-openid-connect/core` 0.10.0、`@maronn-openid-connect/experimental` 0.0.16
- 自分で持つファイル: `src/server.ts`、`src/app.ts`、`src/settings.ts`、`src/signing-key.ts`
- 生成時の構成の記録: `src/oidc-provider/.maronn-openid-connect.json`
- 有効な機能の一覧: `src/oidc-provider/features/enabled.ts`

## 変更したい内容

[例を残すか書き換えてください]

- `/device` の画面の文言を日本語にする
- ポーリング間隔（`interval`）を 5 秒から 3 秒に、デバイスコードの有効期限を 600 秒から 180 秒にする
- 検証用ユーザー `carol` / `password` を追加する
- アクセストークンの有効期限を 10 分にする
- 承認画面に表示する scope の説明を変える

## 依頼

1. 先に次を読む: `src/oidc-provider/.maronn-openid-connect.json`、`src/oidc-provider/features/enabled.ts`、`src/oidc-provider/config.ts`、`src/oidc-provider/features/device-authorization-grant/`（`config.ts`、`views.tsx`、`feature.ts`、`endpoints/`）、`src/settings.ts`、`src/app.ts`
2. 変更先を決めて、表で示す。目安は次のとおり

   | 変えたいもの | 場所 |
   |---|---|
   | issuer、トークンの有効期限などの `ProviderConfig` | `src/app.ts` の `applyOidc()` に渡す `config`（型は `src/oidc-provider/config.ts`） |
   | Device Authorization Grant の有効期限、ポーリング間隔、ログイン失敗の上限 | `src/oidc-provider/features/device-authorization-grant/config.ts` |
   | デバイスの画面（コード入力、ログイン、承認、完了） | `src/oidc-provider/features/device-authorization-grant/views.tsx`（hono/jsx） |
   | ログイン画面、同意画面、エラー画面 | `src/oidc-provider/views.tsx`、`src/oidc-provider/pages/` |
   | ユーザー、クライアント | `src/app.ts`（`registerUser()`、`registerClient()`）、`src/settings.ts` |
   | 処理の順番や検証の追加・削除 | 該当エンドポイントの `pipeline.ts` と `steps/`（`features/device-authorization-grant/endpoints/device-authorization/` など） |

3. 再生成しない。`.maronn-openid-connect.json` を書き換えない。`node_modules/@maronn-openid-connect/*` を編集しない
4. 変更後、`pnpm typecheck` と `pnpm start` を行い、`curl` で確認する（Discovery、`POST /device_authorization`）。ブラウザの確認は手順として示す。確認後はプロセスを止める
5. 変更したファイルと理由の一覧を `chapter3/openid-provider/README.md` の末尾に「自分で変更した範囲」として追記する（3.7.4 の振り返りに使う）

## 注意

- 生成コードに書いた変更は `pnpm run generate:force` で消える。変更の前にコミットする
- `@maronn-openid-connect/experimental` の API は安定していない。版を上げるときは再生成を検討する
- この OP の Device Authorization Grant は `scope` を必須にし、`openid` を含める必要がある（OSS 側の既知の制限）。これを変える依頼なら、該当ステップ（`endpoints/device-authorization/steps/validate-request.ts`）を変えることになるが、仕様の範囲を広げる変更であることを README に書く
- 回答と README は日本語で書く
