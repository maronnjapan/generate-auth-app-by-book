# chapter2/app-a

第2章の Web アプリ App A（社内システムに見立てたアプリ）を作る作業場所です。
このディレクトリには最初、この README しかありません。

## 作り方

`prompts/B02-web-apps.md` を生成AIに渡してください（Claude Code では `/b2-web-apps`）。
app-a と app-b は同じ構成で、設定値だけが違います。

設定値は [../settings.md](../settings.md) のとおりです。

| 変数 | 値 |
|---|---|
| `PORT` | `3001` |
| `APP_NAME` | `App A` |
| `OP_ISSUER` | `http://localhost:3000` |
| `CLIENT_ID` | `app-a` |
| `CLIENT_SECRET` | `app-a-secret` |
| `REDIRECT_URI` | `http://localhost:3001/callback` |

## 起動と確認

生成された README に従ってください。
起動できたら http://localhost:3001 を開き、「ログイン」から認証基盤に移動できることを確認します。
app-b でもログインし、認証基盤でパスワードを再入力せずに戻れること（SSO）を確認します。

## 作り直したいとき

[docs/reset.md](../../docs/reset.md) を参照してください。
