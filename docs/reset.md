# A.7 検証を最初からやり直す方法

やり直す範囲に応じて、次のどれかを行います。
どの操作も、先に起動中のプロセス（認証基盤、アプリ、API）を `Ctrl+C` で止めてから行ってください。

## 1. データだけ消す（ログイン状態、発行済みのコードやトークン）

本書の認証基盤はデータをメモリに持つので、プロセスを再起動すれば消えます。
ブラウザの Cookie（認証基盤のログイン状態、アプリのセッション）はブラウザ側に残るので、シークレットウィンドウを使うか、`localhost` の Cookie を削除してください。

## 2. 生成AIが作ったコードを消して、プロンプトから作り直す（第2章）

`chapter2/openid-provider/`、`chapter2/app-a/`、`chapter2/app-b/` の中身を、リポジトリにもともとあった README だけに戻します。

```bash
# 何が消えるかを先に確認する（-n は dry run）
git clean -ndx chapter2/openid-provider chapter2/app-a chapter2/app-b

# 消す（node_modules と .env も含めて、追跡していないファイルを消す）
git clean -fdx chapter2/openid-provider chapter2/app-a chapter2/app-b

# 生成コードをコミットしていた場合は、追跡中のファイルも戻す
git checkout -- chapter2/openid-provider chapter2/app-a chapter2/app-b
```

自分で変えた部分を残したい場合は、先に `git diff` や `git stash` で退避してください。

## 3. OSS の生成コードだけを作り直す（第3章）

```bash
cd chapter3/openid-provider
rm -rf src/oidc-provider
pnpm run generate
```

生成コードを手で変えていて差分を見たいときは、消さずに `--force` で上書きします。

```bash
cd chapter3/openid-provider
git add -A && git commit -m "before regenerate"   # 退避
pnpm run generate:force
git diff                                           # 自分の変更が消えた箇所を確認
```

## 4. 第3章の CLI アプリや API を作り直す

```bash
git clean -fdx chapter3/cli-app chapter3/sample-api
git checkout -- chapter3/cli-app chapter3/sample-api
```

## 5. 依存関係を入れ直す

```bash
# 各ディレクトリで
rm -rf node_modules
pnpm install
```

## 6. リポジトリ全体を初期状態に戻す

```bash
git stash -u          # 残したい変更があれば退避
git clean -fdx        # 追跡していないファイルをすべて消す（node_modules、.env、生成コード）
git checkout -- .     # 追跡中のファイルを戻す
```

`git clean -fdx` は元に戻せません。先に `-n` を付けて消える対象を確認してください。
