# A.6 最初からやり直したい場合

やり直す範囲に応じて、次のどれかを行います。
どの操作も、先に起動中のプロセス（認証基盤、アプリ、API）を `Ctrl+C` で止めてから行ってください。

手順の中に出てくる `git clean -fdx` で消したファイルは、元に戻せません。
先に `-n` を付けて実行し、消える対象を確認してください。

## 1. データだけ消す（ログイン状態、発行済みのコードやトークン）

本書の認証基盤はデータをメモリに持つので、プロセスを再起動すれば消えます。
ブラウザーの Cookie（認証基盤のログイン状態、アプリのセッション）はブラウザー側に残るので、シークレットウィンドウを使うか、`localhost` の Cookie を削除してください。

## 2. 生成AIが作ったコードを消して、プロンプトから作り直す（第2章）

`chapter2/openid-provider/`、`chapter2/app-a/`、`chapter2/app-b/` の中身を、リポジトリにもともとあった README だけに戻します。

```bash
# 何が消えるかを先に確認する（-n は dry run）
git clean -ndx chapter2/openid-provider chapter2/app-a chapter2/app-b

# 追跡していないファイル（生成されたコード、node_modules、.env）を消す
git clean -fdx chapter2/openid-provider chapter2/app-a chapter2/app-b

# 生成AIが書き換えた README を、元の内容に戻す
git checkout -- chapter2/openid-provider chapter2/app-a chapter2/app-b
```

これは、生成されたコードをコミットしていない場合の手順です。
コミットしていた場合は、三つ目のコマンドの代わりに、次のコマンドを実行します。

```bash
# 三つの作業場所を、クローンした時点の内容に戻す
git restore --source=origin/main --staged --worktree -- chapter2/openid-provider chapter2/app-a chapter2/app-b
```

戻した結果は、まだコミットしていない変更として残ります。
`git status` で内容を確かめてから、コミットしてください。

自分で変えた部分を残したい場合は、先に `git diff` や `git stash` で退避してください。

## 3. OSS の生成コードだけを作り直す（第3章）

```bash
cd chapter3/openid-provider
rm -rf src/oidc-provider
pnpm run generate
```

生成コードを手で変えていて、どこを変えたのかを確かめたいときは、消さずに `--force` で上書きします。

```bash
cd chapter3/openid-provider
git add src/oidc-provider && git commit -m "before regenerate"   # 退避
pnpm run generate:force
git diff                                                          # 自分の変更が消えた箇所を確認
```

上書きすると、作業中のファイルは生成直後の内容になります。
`git diff` には、自分が書き換えた箇所が、生成直後の内容に戻る差分として表示されます。
書き換えたあとの状態に戻すには、次のコマンドを実行します。

```bash
git checkout -- src/oidc-provider
```

## 4. 第3章の CLI アプリや API を作り直す

```bash
git clean -fdx chapter3/cli-app chapter3/sample-api
git checkout -- chapter3/cli-app chapter3/sample-api
```

生成されたコードをコミットしていた場合は、第2章と同じように、二つ目のコマンドを次のものに置き換えます。

```bash
git restore --source=origin/main --staged --worktree -- chapter3/cli-app chapter3/sample-api
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

生成されたコードをコミットしていた場合、この手順では、コミットした内容までは戻りません。
その場合は、別のディレクトリにクローンし直すのが、手間のかからない方法です。
