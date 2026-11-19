# 第2章 生成AIにログインと SSO を作ってもらう

認証基盤を一つ、Web アプリを二つ作り、ログインと SSO を体験します。
そのあと、気になった機能（本書の例は PKCE）を生成AIに追加してもらい、動かして確かめます。

## 今回の構成（2.1）

| 構成要素 | 作業場所 | URL | 作り方 |
|---|---|---|---|
| 検証用 OpenID Provider | `openid-provider/` | http://localhost:3000 | プロンプト B.1 を生成AIに渡す |
| Web アプリ A | `app-a/` | http://localhost:3001 | プロンプト B.2 を生成AIに渡す |
| Web アプリ B | `app-b/` | http://localhost:3002 | 同上（A と同じ構成で設定だけ違う） |

設定値はすべて [settings.md](settings.md) にまとめています。
生成AIが作った README に、依存関係のインストールと起動コマンドが書かれます。

## 進め方（2.3〜2.7）

### 2.3 サンプルリポジトリとプロンプトの準備

- すぐに始めるなら、このリポジトリをクローンして使う
- プロンプトは [`../prompts/`](../prompts/) にある。サンプルどおりに作る必要はなく、自分で構成やプロンプトを変えてもよい
- 三つのディレクトリは、それぞれ独立したプロジェクトとして `pnpm install` と起動を行う

### 2.4 実際に実装してもらう

1. 認証基盤: `prompts/B01-openid-provider.md` を渡す（Claude Code なら `/b1-openid-provider`）
2. アプリ: `prompts/B02-web-apps.md` を渡す（`/b2-web-apps`）
3. 生成された README を読み、依存関係、設定する値、起動コマンドを確認する

うまく動かなかった場合は、エラーと実際に行った操作をそのまま生成AIに伝えてください。
伝え方の型は [prompts/README.md](../prompts/README.md) の「うまく動かなかった場合」にあります。

### 2.5 ログインと SSO の動作確認

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
4. 同じブラウザーで http://localhost:3002 を開き、「ログイン」を押す
5. 認証基盤でパスワードを入力せずに App B に戻る（SSO）
6. App A と App B で同じ `sub` が表示されている

確認したい動きは、「二つのアプリのログインを共通の認証基盤に任せられた」ことと、「認証基盤のログイン状態を使って二つ目のアプリに入れた」ことの二つです。

### 2.6 気になった機能を追加してみる（本書の例は PKCE）

1. まず実装済みかを確認する（2.6.2）: `prompts/B03-check-features.md` を渡す（`/b3-check-features`）。コードは変更されず、機能の有無と実装箇所の報告が返る
2. 未実装なら PKCE を追加してもらう（2.6.3）: `prompts/B04-add-feature.md` を「記入例の PKCE で」と添えて渡す（`/b4-add-feature`）。実装済みだった場合は、報告された確認方法で動きを確かめるか、別の気になる機能を B.4 の空欄に書いて渡す
3. PKCE の動作確認をする（2.6.4）: 認証基盤と二つのアプリを再起動し、2.5 と同じ手順でログインと SSO を試す

PKCE を B.4 の記入例どおりに追加した場合は、次のコマンドで、追加した処理が使われていることを確かめられます。
生成結果によって応答の形は変わるので、生成AIが README に書いた確認方法も見てください。

```bash
# 認証基盤が PKCE（S256）に対応していると公開している
curl -s http://localhost:3000/.well-known/openid-configuration | grep -o '"code_challenge_methods_supported":[^]]*]'

# アプリが、認可リクエストに code_challenge を付けている
curl -si http://localhost:3001/login | grep -i '^location'

# code_challenge の無い認可リクエストは、認証基盤が拒否する（invalid_request）
curl -si "http://localhost:3000/authorize?response_type=code&client_id=app-a&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&scope=openid&state=test&nonce=test"
```

| 環境変数 | 対象 | 既定値 | 意味 |
|---|---|---|---|
| `REQUIRE_PKCE` | 認証基盤 | `true` | `false` にすると、`code_challenge` の無い認可リクエストも受け付ける（追加前の動き） |
| `USE_PKCE` | アプリ | `true` | `false` にすると、`code_challenge` と `code_verifier` を送らない（追加前の動き） |

### 2.7 生成AIだけで進める時の課題

試せるようになると、別の認証フローを試したい、別の種類のアプリから使いたい、複数の仕組みを組み合わせたい、という要求が出てきます。
生成AIだけで追加と変更を重ねると、何が実装されているかを把握しにくくなります。
第3章では、必要な機能を指定して認証基盤のコードを生成できる OSS を土台にします。
[../chapter3/README.md](../chapter3/README.md) に進んでください。

## ディレクトリ

```
chapter2/
├── README.md            # この文書
├── settings.md          # そろえる設定値
├── openid-provider/     # B.1 の作業場所（README のみ。中身は生成AIが作る）
├── app-a/               # B.2 の作業場所
└── app-b/               # B.2 の作業場所
```

## やり直したいとき

[docs/reset.md](../docs/reset.md) を参照してください。
