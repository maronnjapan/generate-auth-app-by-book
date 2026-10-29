# 付録B 生成AIに渡すプロンプト集

本書の各節で生成AIに渡すプロンプトです。
ファイルをそのまま読ませるか、内容を貼り付けて使います。
Claude Code では `.claude/commands/` のスラッシュコマンド（`/b1-openid-provider` など）が同じファイルを読み込みます。

## 渡し方

```text
> prompts/B01-openid-provider.md を読んで、その指示に従って chapter2/openid-provider/ に実装してください。
```

- 作業場所（ディレクトリ）を一緒に伝える
- B.6 と B.7 はテンプレートなので、`[ ]` の空欄を埋めてから渡す
- 生成結果は毎回異なる。期待と違えば、エラーと実際に行った操作をそのまま伝えて直してもらう

## 一覧（A.4 プロンプトと実装対象の対応）

| ファイル | 本書の節 | 実装対象 | 作られるもの |
|---|---|---|---|
| [B01-openid-provider.md](B01-openid-provider.md) | 2.4.1 | `chapter2/openid-provider/` | 検証用 OpenID Provider |
| [B02-web-apps.md](B02-web-apps.md) | 2.4.2 | `chapter2/app-a/`、`chapter2/app-b/` | 認証基盤に接続する Web アプリ A と B |
| [B03-check-features.md](B03-check-features.md) | 2.6.1 | `chapter2/`（変更しない） | 現在の実装に含まれる機能の報告 |
| [B04-pkce-comparison-setup.md](B04-pkce-comparison-setup.md) | 2.6.1、2.6.2 | `chapter2/`、`chapter2/verification/` | PKCE を使わない構成、交換前に止める検証モード、交換手順 |
| [B05-add-pkce.md](B05-add-pkce.md) | 2.6.3〜2.6.5 | `chapter2/`、`chapter2/verification/` | PKCE の追加と、成功・拒否の確認手順 |
| [B06-add-feature-template.md](B06-add-feature-template.md) | 2.6、2.8 | 任意 | 気になった機能を追加する依頼のテンプレート |
| [B07-verify-against-spec.md](B07-verify-against-spec.md) | 2.4 補足、2.7.3 | 任意 | 公開仕様を参照した確認・修正のテンプレート |
| [B08-configure-generated-op.md](B08-configure-generated-op.md) | 3.4.4、3.7.3 | `chapter3/openid-provider/` | OSS で生成した認証基盤の設定・編集 |
| [B09-device-cli-app.md](B09-device-cli-app.md) | 3.5 | `chapter3/cli-app/` | Device Authorization Grant を使うサンプル CLI アプリ |
| [B10-sample-api.md](B10-sample-api.md) | 3.5.4 | `chapter3/sample-api/` | アクセストークンで利用するサンプル API |

## 設計上の意図

- B.1 は PKCE に触れていない。生成結果に PKCE が入っているかどうかを B.3 で確かめ、B.4 で比較用の構成を作り、B.5 で追加する流れにしている
- 設定値（ポート、client_id、ユーザー）は `chapter2/settings.md` と `chapter3/openid-provider/.env.example` に集め、プロンプトからはそこを参照している。値を変えるときはその二つを先に変える
- どのプロンプトも「README を書く」「実際に起動して確認する」「省略した仕様を列挙する」を求めている。生成結果を読者が把握しやすくするため
- 第3章のプロンプトは、認証基盤の処理を生成AIに書かせない。認証基盤は OSS の CLI で生成し、生成AIにはクライアント（CLI アプリ）と API、設定の変更を任せる
