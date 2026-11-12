# B.4 気になった機能の追加

`[ ]` を埋めてから渡してください。
本書の例（2.6.3）では、末尾の「記入例: PKCE」の内容で渡します。
空欄を埋めずに「記入例の PKCE で実装してください」と伝えても構いません。
ほかの例: リフレッシュトークン、`prompt=login` による再認証、ログアウト、同意画面、`max_age`。

---

## 追加したい機能

[機能名]

## 参照する仕様

- [仕様名と URL、節番号。例: OpenID Connect Core 1.0 §12 Using Refresh Tokens https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens]

## 期待する動き

- [誰が] [どの操作をすると] [何が起きる]
- [追加前と変わる点]
- [変わらない点。例: ログインと SSO はそのまま]

## 対象

- [`chapter2/openid-provider/`、`chapter2/app-a/`、`chapter2/app-b/` など。認証基盤とアプリの両方か、片方か]

## 依頼

1. 現在のコードを読み、この機能がすでに入っていないかを確かめる。入っていれば、追加せずにその旨と実装箇所を報告する
2. 影響する箇所（ファイルと関数）を列挙してから実装する
3. 認証基盤とアプリの両方に必要な対応を行う。片方だけで済む場合は、その理由を書く
4. 既存の動き（ログインと SSO）を壊さない。設定で切り替えられるようにする場合は、環境変数名と既定値を決めて README に書く
5. 変更内容の一覧と、動作の確認方法を提示する。確認方法には、追加した処理が実際に使われたことが分かる手段（ログの出力、`curl` の例、ブラウザーでの操作）を含める
6. 仕様のうち省略した部分があれば列挙する
7. 実装後に起動して確認し、確認後はプロセスを止める。確認していないことは「未確認」と明記する

## 成果物

- 変更したコード
- README の更新（設定、確認手順、省略した仕様）
- 変更したファイルの一覧と、確認した結果

## 守ること

- ローカルで動かすことだけを前提にする
- 秘密情報（`code_verifier`、トークン、`client_secret`）の全文をログに出さない
- 第3章の生成コード（`chapter3/openid-provider/src/oidc-provider/`）を変える場合は、再生成で消えることを README に書き、`.maronn-openid-connect.json` は書き換えない
- 回答と README は日本語で書く

---

## 記入例: PKCE（本書 2.6.3）

### 追加したい機能

PKCE（Proof Key for Code Exchange）。`code_challenge_method` は `S256` だけに対応する。

### 参照する仕様

- RFC 7636 Proof Key for Code Exchange by OAuth Public Clients https://www.rfc-editor.org/rfc/rfc7636 （§4.1〜§4.6）

### 期待する動き

- アプリは、ログインのたびに `code_verifier`（43〜128 文字の乱数、§4.1）を作ってセッションに保存し、認可リクエストに `code_challenge`（`BASE64URL(SHA256(code_verifier))`、§4.2）と `code_challenge_method=S256` を付ける（§4.3）。トークンリクエストには `code_verifier` を付ける（§4.5）
- 認証基盤は、`code_challenge` を認可コードと一緒に保存する（§4.4）。トークンリクエストの `code_verifier` から計算した値が保存した値と一致しなければ、`invalid_grant` で拒否する（§4.6）
- 認証基盤は、既定では `code_challenge` の無い認可リクエストを `invalid_request` で拒否する（§4.4.1）
- 認証基盤の Discovery に `code_challenge_methods_supported: ["S256"]` が加わる
- 変わらない点: ログインと SSO はそのまま動く

### 対象

- `chapter2/openid-provider/`、`chapter2/app-a/`、`chapter2/app-b/`

### この例で決めておく設定

| 環境変数 | 対象 | 既定値 | 意味 |
|---|---|---|---|
| `REQUIRE_PKCE` | 認証基盤 | `true` | `false` にすると、`code_challenge` の無い認可リクエストも受け付ける（追加前の動き） |
| `USE_PKCE` | アプリ | `true` | `false` にすると、`code_challenge` と `code_verifier` を送らない（追加前の動き） |

### この例で提示してもらう確認方法

- `curl -s http://localhost:3000/.well-known/openid-configuration` の結果に `code_challenge_methods_supported` がある
- `curl -si http://localhost:3001/login` の `Location` ヘッダーに `code_challenge` と `code_challenge_method=S256` がある
- `code_challenge` の無い認可リクエストを `curl` で送ると、`invalid_request` で拒否される
- ログインしたとき、認証基盤のログに「PKCE の検証に成功した」ことが分かる行が一行出る（`code_verifier` の値は出さない）
- App A でログインしたあと、App B でパスワードを再入力せずにログインできる（SSO）
