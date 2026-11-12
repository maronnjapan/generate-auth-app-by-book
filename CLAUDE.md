# このリポジトリでの作業ルール（生成AI向け）

このリポジトリは、書籍『生成AIで認証基盤を作って試す』（仮題）のサンプルです。
読者は `prompts/` のプロンプトをあなたに渡し、章ごとのディレクトリに検証用のアプリを作ってもらいます。
目的は「本番品質の認証基盤を作ること」ではなく、「まず小さく作って動かし、認証認可の仕組みが自分たちの課題に合うかを確かめること」です。

## 全体のルール

- 回答と生成するドキュメント（README やコメント）は日本語で書く。コードの識別子は英語でよい
- 使う技術は TypeScript、Hono、`@hono/node-server`、pnpm、Node.js 22。TypeScript の実行には `tsx` を使ってよい。サーバーを持たない CLI アプリでは Hono を使わなくてよい。これ以外を使うときは理由を README に書く
- すべて同じ PC の `localhost` で動かす。デプロイ用の設定（Dockerfile、クラウドの設定、HTTPS 証明書）は足さない
- 各ディレクトリ（`chapter2/openid-provider/` など）は、その中だけで `pnpm install` と起動ができる独立したプロジェクトにする。ルートに `package.json` を作らない
- ポート、client_id、client_secret、redirect_uri、ユーザー名は決まった値を使う。第2章は `chapter2/settings.md`、第3章は `chapter3/README.md` と `chapter3/openid-provider/.env.example` に従う
- 設定値は `.env` から読めるようにし、`.env.example` を置く。`.env` はコミットしない
- 作ったものには必ず README.md を置き、依存関係のインストール、設定値、起動コマンド、動作確認の手順（curl の例を含む）を書く
- 実装したら実際に起動して確認する。確認後はプロセスを止める。確認していないことは「未確認」と明記する
- pnpm 10 が `pnpm install` のあとに表示する `Ignored build scripts: esbuild` の警告は、そのままで動くので対処しなくてよい
- 省略した仕様や、簡略化した処理は README に列挙する。黙って省かない
- 秘密情報（パスワード、client_secret、トークン）は検証用の固定値でよいが、ログやファイルにトークンの全文を残さない
- 既存の動き（ログイン、SSO）を壊す変更をするときは、先に影響範囲を説明する
- 公開仕様（RFC、OpenID Connect の仕様書）を参照するときは、節番号を示す。仕様どおりかの保証はしない。確認した範囲と未確認の範囲を分けて書く

## プロンプトと作業場所

| プロンプト | 作業場所 |
|---|---|
| `prompts/B01-openid-provider.md` | `chapter2/openid-provider/` |
| `prompts/B02-web-apps.md` | `chapter2/app-a/`、`chapter2/app-b/` |
| `prompts/B03-check-features.md` | `chapter2/`（コードを変更しない） |
| `prompts/B04-add-feature.md` | 読者が指定する（本書の例は `chapter2/` への PKCE の追加） |
| `prompts/B05-configure-generated-op.md` | `chapter3/openid-provider/` |
| `prompts/B06-device-cli-app.md` | `chapter3/cli-app/` |
| `prompts/B07-sample-api.md` | `chapter3/sample-api/` |

Claude Code では `.claude/commands/` のスラッシュコマンド（`/b1-openid-provider` など）が同じプロンプトを呼び出します。

## 第2章（`chapter2/`）のルール

- 認証基盤もアプリも、認証認可のライブラリ（OIDC クライアント、OP 実装）を使わず、リダイレクトとトークン交換を自分で実装する。仕組みを見えるようにするため
- JWT の署名と検証は Node.js の WebCrypto か `node:crypto` で行う。小さなライブラリ（`jose` など）を使ってもよいが、使うなら README に理由を書く
- データはメモリに持つ。DB は使わない。再起動すると消えてよい
- 認証基盤は `http://localhost:3000`、App A は `http://localhost:3001`、App B は `http://localhost:3002`
- Cookie の名前は `op_session`（認証基盤）、`app_a_session`（App A）、`app_b_session`（App B）と三つとも別にする。ブラウザーは Cookie をホスト名で管理してポートを区別しないので、同じ `localhost` で名前が重なると互いに上書きする
- PKCE について: B.1 と B.2 では指示していない。含めるかどうかは任せるが、B.1 で含める場合は必須にしない（`code_challenge` の無い認可リクエストも受け付ける）。読者は B.3 で有無を確認し、未実装なら B.4 で追加する。B.4 で追加するときの環境変数名は `REQUIRE_PKCE`（認証基盤）と `USE_PKCE`（アプリ）で、そのときの既定値はどちらも `true`

## 第3章（`chapter3/`）のルール

- `chapter3/openid-provider/src/oidc-provider/` は OSS の CLI（`maronn-oidc generate hono --enable device-authorization-grant`）の生成物。自分で OIDC の処理を書かず、`pnpm run generate` で生成する
- 生成物の中では、`.maronn-openid-connect.json`（生成時の構成の記録）を書き換えない。`features/enabled.ts` が有効な機能の一覧
- 自分で持つファイルは `src/server.ts`、`src/app.ts`、`src/settings.ts`、`src/signing-key.ts`。設定、署名鍵、クライアントとユーザーの登録はここで行う
- 生成物を編集するとき（画面の文言、設定値）は、変更したファイルと理由を README に残す。再生成（`pnpm run generate:force`）で消えるため、再生成の前にコミットする
- `@maronn-openid-connect/*` パッケージの `node_modules` を編集しない。バージョンは `package.json` に固定してある（CLI 0.15.1、core 0.10.0、experimental 0.0.16）。上げるときは再生成を検討する
- Device Authorization Grant（RFC 8628）の既知の制限: この OP は `scope` を必須にし、`openid` を含める必要がある。アクセストークンの `aud` は `<issuer>/userinfo` だけ（RFC 8628 に `resource` パラメータが無いため）。experimental パッケージの API は不安定
- 認証基盤は `http://localhost:4000`、サンプル API は `http://localhost:4001`、サンプル CLI アプリの client_id は `sample-cli`（public client、クライアント認証 none）、サンプル API の client_id は `sample-api`（client_secret `sample-api-secret`）

## 動作確認のしかた

- 認証基盤: `curl http://localhost:<port>/.well-known/openid-configuration` で Discovery が返ること
- ログインと SSO: ブラウザーの操作は読者が行う。自動化しない。手順を README に書く
- Device Authorization Grant: `curl -X POST http://localhost:4000/device_authorization -d client_id=sample-cli -d "scope=openid profile email"` が `user_code` と `verification_uri_complete` を返すこと
