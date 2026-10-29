# B.6 気になった機能の追加（テンプレート）

`[ ]` を埋めてから渡してください。
例: リフレッシュトークン、`prompt=login` による再認証、ログアウト、同意画面、`max_age`、別の認証フロー。

---

## 追加したい機能

[機能名]

## 参照する仕様

- [仕様名と URL、節番号。例: OpenID Connect Core 1.0 §12 Refresh Tokens https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens]

## 期待する動き

- [誰が] [どの操作をすると] [何が起きる]
- [追加前と変わる点]
- [変わらない点。例: ログインと SSO はそのまま]

## 対象

- [`chapter2/openid-provider/`、`chapter2/app-a/`、`chapter2/app-b/`、`chapter3/openid-provider/` など。認証基盤とアプリの両方か、片方か]

## 依頼

1. 現在のコードを読み、影響する箇所（ファイルと関数）を列挙してから実装する
2. 既存の動き（ログイン、SSO、PKCE の検証）を壊さない。設定フラグで切り替えられるなら、既定値と環境変数名を決めて README に書く
3. 変更内容の一覧と、追加前後を比較できる確認手順を提示する（`curl` の例や、ブラウザでの操作）
4. 仕様のうち省略した部分があれば列挙する
5. 実装後に起動して確認し、確認後はプロセスを止める。確認していないことは明記する

## 成果物

- 変更したコード
- README の更新（設定、確認手順、省略した仕様）
- 確認結果

## 守ること

- ローカルで動かすことだけを前提にする
- 第3章の生成コード（`chapter3/openid-provider/src/oidc-provider/`）を変える場合は、再生成で消えることを README に書き、`.maronn-openid-connect.json` は書き換えない
- 回答と README は日本語で書く
