# 生成AIツールの初期設定

このリポジトリは Claude Code を想定して設定していますが、プロンプトはどのツールでも使えます。

## Claude Code

### 自動で読まれるもの

- `CLAUDE.md`: 作業ルール。起動時に自動で読み込まれる
- `.claude/commands/*.md`: スラッシュコマンド。`/b1-openid-provider` のように入力すると、対応するプロンプト（`prompts/B01-openid-provider.md`）を読んで作業を始める。コマンド名のあとに文章を書くと「追加の要望」として渡る

| コマンド | 呼び出すプロンプト |
|---|---|
| `/b1-openid-provider` | B01 OpenID Provider の実装 |
| `/b2-web-apps` | B02 二つの Web アプリの実装 |
| `/b3-check-features` | B03 既存の実装に含まれる機能の確認 |
| `/b4-pkce-comparison-setup` | B04 PKCE の比較用構成と検証手順 |
| `/b5-add-pkce` | B05 PKCE の追加と成功・拒否の確認 |
| `/b6-add-feature <機能と対象>` | B06 気になった機能の追加 |
| `/b7-verify-against-spec <期待と実際>` | B07 公開仕様を参照した確認・修正 |
| `/b8-configure-generated-op <変更内容>` | B08 生成した認証基盤の設定・編集 |
| `/b9-device-cli-app` | B09 サンプル CLI アプリの実装 |
| `/b10-sample-api` | B10 サンプル API の実装 |

### 権限の許可リスト（任意）

Claude Code は、コマンドを実行するたびに許可を求めます。
`pnpm` や `node`、`localhost` への `curl` を毎回許可するのが煩わしい場合は、`.claude/settings.json`（リポジトリで共有）か `.claude/settings.local.json`（自分だけ）に次を書きます。
このリポジトリには同梱していないので、必要なら自分で作ってください。

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm install)",
      "Bash(pnpm install:*)",
      "Bash(pnpm add:*)",
      "Bash(pnpm run:*)",
      "Bash(pnpm exec:*)",
      "Bash(pnpm dlx:*)",
      "Bash(pnpm maronn-oidc:*)",
      "Bash(pnpm start)",
      "Bash(pnpm dev)",
      "Bash(pnpm test)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm generate)",
      "Bash(node:*)",
      "Bash(npx tsx:*)",
      "Bash(curl http://localhost:*)",
      "Bash(curl -s http://localhost:*)",
      "Bash(curl -i http://localhost:*)",
      "Bash(curl -X POST http://localhost:*)"
    ]
  }
}
```

`Bash(node:*)` のように末尾に `:*` を付けると、その文字列で始まるコマンドをすべて許可します。
`curl` は `localhost` 宛てだけを許可しています。

### 使い方の例

```text
> /b1-openid-provider
```

または、スラッシュコマンドを使わずに次のように渡しても同じです。

```text
> prompts/B01-openid-provider.md を読んで、その指示に従って chapter2/openid-provider/ に実装してください。
```

## Codex CLI、Cursor、Gemini CLI など

- `AGENTS.md` を読むツールは、起動時に同じルールを読み込みます。読まないツールでは、最初に「`CLAUDE.md` を読んでください」と伝えてください
- プロンプトは `prompts/` のファイルをチャットに添付するか、「`prompts/B01-openid-provider.md` を読んで実装してください」と指示します
- 作業場所を明示してください（例: 「作業場所は `chapter2/openid-provider/` です」）

## プロンプトを自分で変える

`prompts/` のファイルは編集して構いません。
設定値（ポート、client_id など）を変えるときは、`chapter2/settings.md` または `chapter3/openid-provider/.env.example` も同時に変えて、認証基盤とアプリの設定をそろえてください。
