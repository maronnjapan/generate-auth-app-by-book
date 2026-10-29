# chapter2/openid-provider

第2章の検証用 OpenID Provider を作る作業場所です。
このディレクトリには最初、この README しかありません。

## 作り方

`prompts/B01-openid-provider.md` を生成AIに渡してください（Claude Code では `/b1-openid-provider`）。
生成AIが、このディレクトリに `package.json`、`src/`、`README.md`、`.env.example` を作ります。

設定値は [../settings.md](../settings.md) のとおりです。

| 項目 | 値 |
|---|---|
| URL / issuer | http://localhost:3000 |
| ユーザー | `alice` / `password`、`bob` / `password` |
| クライアント | `app-a`（`app-a-secret`、`http://localhost:3001/callback`）、`app-b`（`app-b-secret`、`http://localhost:3002/callback`） |

## 起動と確認

生成された README に従ってください。
起動できたら、別のターミナルで Discovery が返ることを確認します。

```bash
curl -s http://localhost:3000/.well-known/openid-configuration
```

## 作り直したいとき

[docs/reset.md](../../docs/reset.md) の「2. 生成AIが作ったコードを消して、プロンプトから作り直す」を参照してください。
