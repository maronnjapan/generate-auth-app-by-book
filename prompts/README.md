# 付録B 生成AIに渡すプロンプト集

本書の各節で生成AIに渡すプロンプトです。
ファイルをそのまま読ませるか、内容を貼り付けて使います。
Claude Code では `.claude/commands/` のスラッシュコマンド（`/b1-openid-provider` など）が同じファイルを読み込みます。

## 渡し方

```text
> prompts/B01-openid-provider.md を読んで、その指示に従って chapter2/openid-provider/ に実装してください。
```

- 作業場所（ディレクトリ）を一緒に伝える
- B.3 と B.4 には `[ ]` の空欄がある。本書の例（PKCE）で試すなら、空欄を埋めずに「PKCE を確認してください」「記入例の PKCE で実装してください」と伝えればよい
- B.5 は「変更したい内容」を書き換えてから渡す
- 生成結果は毎回異なる。期待と違えば、下の「うまく動かなかった場合」の形で伝えて直してもらう

## 一覧（A.4 プロンプトと作業場所の対応）

| 付録 | ファイル | 本書の節 | 作業場所 | 作られるもの |
|---|---|---|---|---|
| B.1 | [B01-openid-provider.md](B01-openid-provider.md) | 2.4.1 | `chapter2/openid-provider/` | 検証用 OpenID Provider |
| B.2 | [B02-web-apps.md](B02-web-apps.md) | 2.4.2 | `chapter2/app-a/`、`chapter2/app-b/` | 認証基盤に接続する Web アプリ A と B |
| B.3 | [B03-check-features.md](B03-check-features.md) | 2.6.2 | `chapter2/`（変更しない） | 現在の実装に含まれる機能の報告（本書の例は PKCE） |
| B.4 | [B04-add-feature.md](B04-add-feature.md) | 2.6.3 | 任意（本書の例は `chapter2/`） | 気になった機能の追加（本書の例は PKCE）と、動作の確認方法 |
| B.5 | [B05-configure-generated-op.md](B05-configure-generated-op.md) | 3.4.4、3.7.3 | `chapter3/openid-provider/` | OSS で生成した認証基盤の設定・編集 |
| B.6 | [B06-device-cli-app.md](B06-device-cli-app.md) | 3.5.2 | `chapter3/cli-app/` | Device Authorization Grant を使うサンプル CLI アプリ |
| B.7 | [B07-sample-api.md](B07-sample-api.md) | 3.5.4 | `chapter3/sample-api/` | アクセストークンで利用するサンプル API |

## うまく動かなかった場合（2.4）

エラーと実際に行った操作を、そのまま生成AIに伝えます。
次の形にまとめると、生成AIが原因を切り分けやすくなります。

```text
## 期待していた動作
[例: App B でログインすると、認証基盤でパスワードを入力せずに App B に戻る]

## 実際の動作
[例: 認証基盤のログイン画面が毎回表示される。エラーメッセージ、HTTP ステータス、ログ、画面の文言をそのまま貼る]

## 再現手順
1. [起動したもの、環境変数]
2. [操作]
3. [結果]

## 依頼
原因を切り分けてから修正してください。
必要なら、次の公開仕様の該当する節を読み、節番号を示して、実装と違う点を説明してください。
修正後、同じ手順でもう一度試した結果を示してください。
- [参照する仕様。例: OpenID Connect Core 1.0 https://openid.net/specs/openid-connect-core-1_0.html]
```

参照する仕様の URL は [docs/versions.md](../docs/versions.md) にまとめています。
この確認は実装の正しさを保証しません。確認した範囲と未確認の範囲を分けて報告してもらってください。

## 設計上の意図

- B.1 は PKCE に触れていない。生成結果に PKCE が入っているかどうかは実行のたびに変わりうるので、B.3 で確かめてから、未実装なら B.4 で追加する流れにしている
- B.3 と B.4 はテンプレートで、PKCE 以外の機能にも使える。B.4 の末尾に PKCE の記入例を置いてある
- 設定値（ポート、client_id、ユーザー）は `chapter2/settings.md` と `chapter3/openid-provider/.env.example` に集め、プロンプトからはそこを参照している。値を変えるときは、その二つを先に変えてから、プロンプトの中の同じ値も書き換える
- 実装を依頼するプロンプト（B.3 以外）は、`CLAUDE.md` の共通ルールと合わせて、「README を書く」「実際に起動して確認する」「省略した仕様や、確認していないことを書き出す」を求めている。生成結果を読者が把握しやすくするため
- 第3章のプロンプトは、認証基盤の処理を生成AIに書かせない。認証基盤は OSS の CLI で生成し、生成AIにはクライアント（CLI アプリ）と API、設定の変更を任せる
