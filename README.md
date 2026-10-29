# generate-auth-app-by-book

書籍『生成AIで認証基盤を作って試す ―― 必要な機能を見つけるための、認証認可のはじめ方』（仮題）のサンプルリポジトリです。

生成AIに渡すプロンプト、章ごとの作業場所、起動と検証の手順をまとめています。
第2章では生成AIだけで OpenID Provider と二つの Web アプリを作り、ログインの集約と SSO、PKCE の追加前後を試します。
第3章では自作 OSS の [maronn-openid-connect](https://github.com/maronnjapan/maronn-openid-connect) を土台に、Device Authorization Grant を使う CLI アプリとサンプル API を動かします。

本書で作る認証基盤はすべて検証用です。本番の利用を想定していません。

## A.1 必要な実行環境

| 項目 | 値 |
|---|---|
| Node.js | 22.9 以上（`.node-version` に `22` を記載） |
| pnpm | 10 系（`corepack enable` または `npm i -g pnpm`） |
| 生成AIのコーディングツール | Claude Code を想定。Cursor、Codex CLI、Gemini CLI などでも `prompts/` のファイルを読ませれば使える |
| ブラウザ | Chrome、Edge、Firefox、Safari のいずれか |
| ターミナル | 2〜4 枚開けるもの（認証基盤とアプリを同時に起動する） |

外部サービスのアカウント、契約、デプロイ先は不要です。
すべて同じ PC の中（`localhost`）で動かします。

## A.2 リポジトリの取得方法

```bash
git clone https://github.com/maronnjapan/generate-auth-app-by-book.git
cd generate-auth-app-by-book
node -v   # v22.x
pnpm -v   # 10.x
```

ルートに `package.json` はありません。
各ディレクトリが独立したプロジェクトで、それぞれの中で `pnpm install` と起動を行います。

## A.3 章ごとのディレクトリ構成

```
.
├── README.md                 # この文書（付録A）
├── CLAUDE.md                 # 生成AI（Claude Code）向けの共通ルール
├── AGENTS.md                 # 他の生成AIツール向けの同じルール
├── .claude/commands/         # prompts/ を呼び出すスラッシュコマンド（/b1-openid-provider など）
├── docs/
│   ├── ai-tools.md           # 生成AIツールの初期設定（権限の許可リストなど）
│   ├── reset.md              # A.7 検証を最初からやり直す方法
│   └── versions.md           # A.8 使用したパッケージのバージョンと参照資料
├── prompts/                  # 付録B プロンプト集（B01〜B10）
├── chapter2/                 # 第2章: 生成AIで、ログインと SSO を作って試す
│   ├── README.md             # 章の進め方（2.3〜2.7）
│   ├── settings.md           # 認証基盤とアプリでそろえる設定値
│   ├── openid-provider/      # 検証用 OpenID Provider の作業場所（B.1）
│   ├── app-a/                # Web アプリ A の作業場所（B.2）
│   ├── app-b/                # Web アプリ B の作業場所（B.2）
│   └── verification/         # A.6 PKCE の追加前後を比較する検証手順と、認可コード交換スクリプト
└── chapter3/                 # 第3章: OSS を土台にして、発展的な機能を試す
    ├── README.md             # 章の進め方（3.4〜3.7）
    ├── openid-provider/      # maronn-oidc で生成する認証基盤の土台（生成物はここに作る）
    ├── cli-app/              # サンプル CLI アプリの作業場所（B.9）
    └── sample-api/           # サンプル API の作業場所（B.10）
```

第2章の `openid-provider/`、`app-a/`、`app-b/` と、第3章の `cli-app/`、`sample-api/` は、README だけを置いた空の作業場所です。
中身はプロンプトを渡して生成AIに作ってもらいます。
第3章の `openid-provider/` だけは、OSS の CLI が生成したコードを Node.js で起動するための土台（`package.json`、`src/server.ts` など）をあらかじめ置いています。

## A.4 プロンプトと実装対象の対応

| プロンプト | 本書の節 | 実装対象 | 作られるもの |
|---|---|---|---|
| [B01 OpenID Provider の実装](prompts/B01-openid-provider.md) | 2.4.1 | `chapter2/openid-provider/` | 検証用 OP（discovery、authorize、login、token、userinfo） |
| [B02 二つの Web アプリの実装](prompts/B02-web-apps.md) | 2.4.2 | `chapter2/app-a/`、`chapter2/app-b/` | OP にログインを任せる Web アプリ A と B |
| [B03 既存の実装に含まれる機能の確認](prompts/B03-check-features.md) | 2.6.1 | `chapter2/` | PKCE などの有無をまとめた報告（コードは変更しない） |
| [B04 PKCE の比較用構成と検証手順](prompts/B04-pkce-comparison-setup.md) | 2.6.1、2.6.2 | `chapter2/` | PKCE を使わない構成、交換前に止める検証モード、交換手順 |
| [B05 PKCE の追加と成功・拒否の確認](prompts/B05-add-pkce.md) | 2.6.3〜2.6.5 | `chapter2/` | PKCE（S256）と、追加前後の比較手順 |
| [B06 気になった機能の追加](prompts/B06-add-feature-template.md) | 2.6、2.8 | 任意 | 機能追加の依頼テンプレート |
| [B07 公開仕様を参照した確認・修正](prompts/B07-verify-against-spec.md) | 2.4 補足、2.7.3 | 任意 | 仕様と照らした修正と再試行 |
| [B08 生成した認証基盤の設定・編集](prompts/B08-configure-generated-op.md) | 3.4.4、3.7.3 | `chapter3/openid-provider/` | 画面の文言や設定の変更 |
| [B09 サンプル CLI アプリの実装](prompts/B09-device-cli-app.md) | 3.5 | `chapter3/cli-app/` | Device Authorization Grant を使う CLI アプリ |
| [B10 サンプル API の実装](prompts/B10-sample-api.md) | 3.5.4 | `chapter3/sample-api/` | アクセストークンを検証する最小の API |

渡し方は [prompts/README.md](prompts/README.md) を参照してください。
Claude Code では `/b1-openid-provider` のようなスラッシュコマンドでも呼び出せます。

## A.5 認証基盤・Web アプリ・サンプル CLI アプリ・サンプル API の起動方法

| 構成要素 | 章 | ディレクトリ | URL | 起動方法の記載場所 |
|---|---|---|---|---|
| 認証基盤（生成AIで作る） | 2 | `chapter2/openid-provider/` | http://localhost:3000 | 生成された README（B.1 が作る） |
| Web アプリ A | 2 | `chapter2/app-a/` | http://localhost:3001 | 生成された README（B.2 が作る） |
| Web アプリ B | 2 | `chapter2/app-b/` | http://localhost:3002 | 生成された README（B.2 が作る） |
| 認証基盤（OSS で生成） | 3 | `chapter3/openid-provider/` | http://localhost:4000 | [chapter3/README.md](chapter3/README.md) |
| サンプル API | 3 | `chapter3/sample-api/` | http://localhost:4001 | 生成された README（B.10 が作る） |
| サンプル CLI アプリ | 3 | `chapter3/cli-app/` | なし（ターミナルで実行） | 生成された README（B.9 が作る） |

第2章と第3章はポートを分けているので、同時に起動しても衝突しません。
ポートを変える場合は、[chapter2/settings.md](chapter2/settings.md) か `chapter3/openid-provider/.env.example` の値を先に変え、関係するアプリの設定もそろえてください。

## A.6 PKCE の追加前後を比較するための検証操作

[chapter2/verification/README.md](chapter2/verification/README.md) に手順をまとめています。
認可コードを交換するスクリプトは `chapter2/verification/exchange-code.mjs`（Node.js）と `exchange-code.sh`（curl）です。

## A.7 検証を最初からやり直す方法

[docs/reset.md](docs/reset.md) を参照してください。

## A.8 本書で使用したパッケージのバージョンと参照資料

[docs/versions.md](docs/versions.md) を参照してください。

## 生成AIツールの初期設定

- `CLAUDE.md`: Claude Code が自動で読む、このリポジトリでの作業ルール
- `AGENTS.md`: Codex CLI や Cursor など、`AGENTS.md` を読むツール向けの同じ内容
- `.claude/commands/`: `prompts/` の各プロンプトを呼び出すスラッシュコマンド
- [docs/ai-tools.md](docs/ai-tools.md): 権限の許可リストの例と、他ツールでの使い方

## ライセンスと注意

サンプルは検証用途に限って使ってください。
ここで作る認証基盤をそのまま本番に使うことは想定していません。
