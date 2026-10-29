# 第2章 生成AIで、ログインと SSO を作って試す

認証基盤を一つ、社内システムに見立てた Web アプリを二つ作り、ログインの集約と SSO を体験します。
そのあと PKCE を追加し、横取りした認可コードの扱いが変わることを確かめます。

## この章で作るもの

| 構成要素 | 作業場所 | URL | 作り方 |
|---|---|---|---|
| 検証用 OpenID Provider | `openid-provider/` | http://localhost:3000 | プロンプト B.1 を生成AIに渡す |
| Web アプリ A | `app-a/` | http://localhost:3001 | プロンプト B.2 を生成AIに渡す |
| Web アプリ B | `app-b/` | http://localhost:3002 | 同上（A と同じ構成で設定だけ違う） |

設定値はすべて [settings.md](settings.md) にまとめています。
生成AIが作った README に、依存関係のインストールと起動コマンドが書かれます。

## 進め方（2.3〜2.7）

### 2.3 リポジトリとプロンプトを用意する

- すぐに始めるなら、このリポジトリをクローンして `chapter2/` に移動する
- プロンプトは [`../prompts/`](../prompts/) にある。サンプルどおりに作る必要はなく、自分で構成やプロンプトを変えてもよい
- 三つのディレクトリは、それぞれ独立したプロジェクトとして `pnpm install` と起動を行う

### 2.4 プロンプトを渡して、実装してもらう

1. 認証基盤: `prompts/B01-openid-provider.md` を渡す（Claude Code なら `/b1-openid-provider`）
2. アプリ: `prompts/B02-web-apps.md` を渡す（`/b2-web-apps`）
3. 生成された README を読み、依存関係、設定する値、起動コマンドを確認する

B.1 は PKCE について何も指示していません。
生成結果に PKCE が入っている場合も、入っていない場合もあります。
どちらでも 2.6 の手順で比較できるようにしてあります。

うまく動かなかった場合は、エラーと実際に行った操作をそのまま生成AIに伝えてください。
公開仕様と照らして直したいときは `prompts/B07-verify-against-spec.md` を使います。

### 2.5 起動して、ログインと SSO を試す

ターミナルを三つ開き、それぞれで起動します。

```bash
# 1 枚目
cd chapter2/openid-provider && pnpm install && pnpm dev   # コマンド名は生成された README に従う
# 2 枚目
cd chapter2/app-a && pnpm install && pnpm dev
# 3 枚目
cd chapter2/app-b && pnpm install && pnpm dev
```

1. http://localhost:3001 を開き、「ログイン」を押す
2. 認証基盤（http://localhost:3000）のログイン画面で `alice` / `password` を入力する
3. App A に戻り、`sub`、`name`、`email` が表示される
4. 同じブラウザで http://localhost:3002 を開き、「ログイン」を押す
5. 認証基盤でパスワードを入力せずに App B に戻る（SSO）
6. App A と App B で同じ `sub` が表示されている

確認したい動きは、「二つのアプリのログインを共通の認証基盤に任せられた」ことと、「認証基盤のログイン状態を使って二つ目のアプリに入れた」ことの二つです。

### 2.6 気になった機能を追加してみる（PKCE）

1. `prompts/B03-check-features.md`（`/b3-check-features`）で、今の実装に PKCE が含まれているかを確認してもらう
2. `prompts/B04-pkce-comparison-setup.md`（`/b4-pkce-comparison-setup`）で、PKCE を使わない比較用の構成と、トークン交換の前に止める検証モードを用意してもらう
3. [verification/README.md](verification/README.md) の手順で、横取りした認可コードを別の実行環境から交換し、トークンを取得できることを確かめる
4. `prompts/B05-add-pkce.md`（`/b5-add-pkce`）で PKCE を追加してもらう
5. 同じ手順をもう一度行い、横取りした側は拒否され、正規の操作では成功することを確かめる

### 2.7 試した結果から、自分たちに必要なものを考える

次の問いに自分の言葉で答えてみてください。

- 二つのアプリのログインを認証基盤に任せると、ユーザーの操作はどう変わったか
- PKCE の追加前後で、同じ操作の結果はどう変わったか
- 実際の社内システムとの接続で、まだ確かめていないことは何か
- さらに調べたい仕様や機能は何か。それはなぜか

## ディレクトリ

```
chapter2/
├── README.md            # この文書
├── settings.md          # そろえる設定値
├── openid-provider/     # B.1 の作業場所（README のみ。中身は生成AIが作る）
├── app-a/               # B.2 の作業場所
├── app-b/               # B.2 の作業場所
└── verification/        # PKCE 追加前後の比較手順と、認可コード交換スクリプト
```

## やり直したいとき

[docs/reset.md](../docs/reset.md) を参照してください。
