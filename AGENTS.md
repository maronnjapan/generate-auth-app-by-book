# AGENTS.md

このリポジトリで作業する生成AIツール向けの案内です。
ルールの本体は [CLAUDE.md](CLAUDE.md) にあります。Claude Code 以外のツール（Codex CLI、Cursor、Gemini CLI など）も、最初に `CLAUDE.md` を読んでから作業してください。

要点だけを再掲します。

- 回答と README は日本語。技術は TypeScript、Hono、pnpm、Node.js 22。すべて `localhost` で動かす
- 作業場所と設定値は決まっている。第2章は `chapter2/settings.md`、第3章は `chapter3/README.md`
- プロンプトは `prompts/` の B.1〜B.7（`B01-openid-provider.md`〜`B07-sample-api.md`）。読者が指定したファイルを最後まで読んでから作業する
- 作ったものには README（インストール、設定、起動、確認手順）と `.env.example` を置く
- 実装後は実際に起動して確認し、確認後にプロセスを止める。未確認の点は明記する
- 第3章の `chapter3/openid-provider/src/oidc-provider/` は OSS の CLI の生成物。手で OIDC の処理を書かず、`pnpm run generate` で生成する。`.maronn-openid-connect.json` を書き換えない
