# B.7 公開仕様を参照した、実装の確認・修正（テンプレート）

期待と違う動作になったときに使います。`[ ]` を埋めてから渡してください。

---

## 期待していた動作

[例: App B でログインすると、OP でパスワードを入力せずに App B に戻る]

## 実際の動作

[例: OP のログイン画面が毎回表示される。エラーメッセージ、HTTP ステータス、ログ、画面の文言をそのまま貼る]

## 再現手順

1. [起動したもの、環境変数]
2. [操作]
3. [結果]

## 対象

- [`chapter2/openid-provider/` など]

## 参照する仕様

該当するものを残してください。

- RFC 6749 The OAuth 2.0 Authorization Framework https://www.rfc-editor.org/rfc/rfc6749
- RFC 6750 Bearer Token Usage https://www.rfc-editor.org/rfc/rfc6750
- RFC 7636 PKCE https://www.rfc-editor.org/rfc/rfc7636
- RFC 8628 Device Authorization Grant https://www.rfc-editor.org/rfc/rfc8628
- RFC 7662 Token Introspection https://www.rfc-editor.org/rfc/rfc7662
- RFC 9068 JWT Access Tokens https://www.rfc-editor.org/rfc/rfc9068
- OpenID Connect Core 1.0 https://openid.net/specs/openid-connect-core-1_0.html
- OpenID Connect Discovery 1.0 https://openid.net/specs/openid-connect-discovery-1_0.html
- OAuth 2.1（draft） https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/

## 依頼

1. 該当する仕様の節を読み、仕様が求める動作を節番号付きで引用する
2. 実装と照らし、どこが仕様と違うか、あるいは仕様どおりなのに期待と違うのかを示す
3. 仕様に合わせた修正を提案して実装する。仕様上の動作と求める動作が異なる場合は、修正せずにその旨と、別の仕組みや追加機能の候補を示す
4. 再現手順でもう一度試し、結果を示す

## 注意

- 修正しても動かないことだけで、その方式が不適切とは判断しない。原因の切り分けを先に行う
- この確認は実装の正しさを保証しない。確認した範囲と未確認の範囲を分けて書く
- 回答は日本語で書く
