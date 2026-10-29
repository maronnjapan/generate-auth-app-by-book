# B.5 PKCE の追加と、成功・拒否の確認

## 目的

横取りした認可コードへの対策として、PKCE（RFC 7636、S256）を OP と App A、App B に追加してください。
認可要求とトークン交換を結び付け、横取りした側が持たない `code_verifier` を交換時に要求することで、別の実行主体による交換を拒否します。
追加のあと、B.4 と同じ操作で、横取りした側は拒否され、正規の操作では成功することを確認します。

## 前提

- B.4 の作業が終わっている（`REQUIRE_PKCE`、`USE_PKCE`、`STOP_BEFORE_TOKEN_EXCHANGE`、`chapter2/verification/exchange-code.mjs`）
- 設定値は `chapter2/settings.md`

## 依頼

### 1. OP（`chapter2/openid-provider/`）

- `/authorize` で `code_challenge` と `code_challenge_method` を受け取り、認可コードと一緒に保存する。`code_challenge_method` は `S256` だけを受け付け、`plain` は拒否する
- `REQUIRE_PKCE=true` のとき、`code_challenge` の無い認可リクエストを `invalid_request` で拒否する。`false` のときは従来どおり受け付ける
- `/token` で `code_verifier` を受け取り、`BASE64URL(SHA256(code_verifier))` が保存した `code_challenge` と一致しなければ `invalid_grant` を返す（RFC 7636 §4.6）。`code_challenge` 付きで発行されたコードに `code_verifier` が無い場合も拒否する
- Discovery に `code_challenge_methods_supported: ["S256"]` を追加する
- 既定値を `REQUIRE_PKCE=true` にする（比較のために `false` に戻せる）

### 2. アプリ（`chapter2/app-a/`、`chapter2/app-b/`）

- `USE_PKCE=true` のとき、`code_verifier`（43〜128 文字の乱数、RFC 7636 §4.1）を生成してセッションに保存し、`code_challenge=BASE64URL(SHA256(code_verifier))` と `code_challenge_method=S256` を認可リクエストに付ける
- トークン交換時に `code_verifier` を送る
- `STOP_BEFORE_TOKEN_EXCHANGE=1` の画面に `code_verifier` を表示し、「交換を続ける」ボタンは `code_verifier` を使う
- 既定値を `USE_PKCE=true` にする

### 3. 変更内容と確認手順の提示

- 変更したファイルと内容の一覧
- 追加前後を比較する確認手順（下の A〜D）を `chapter2/verification/README.md` と各 README に反映する

## 確認手順

A. 拒否の確認: OP を `REQUIRE_PKCE=true`、App A を `STOP_BEFORE_TOKEN_EXCHANGE=1 USE_PKCE=true` で起動し、正規の手順（`code_challenge` 付き）で認可コードを取る。`code_verifier` を渡さずに `node chapter2/verification/exchange-code.mjs <認可コード>` を実行する。期待: 400 と `invalid_grant`

B. 正規の操作の確認: 新しい認可コードを取り、画面の「交換を続ける」ボタンを押す。または `node exchange-code.mjs <認可コード> <code_verifier>` を実行する。期待: 成功

C. ログインと SSO の確認: `STOP_BEFORE_TOKEN_EXCHANGE` を外して通常どおり起動し、App A でログインしたあと App B でパスワードを再入力せずに戻れる

D. 追加前の挙動の再現: OP を `REQUIRE_PKCE=false`、App A を `USE_PKCE=false` で起動し、A と同じ操作をする。期待: 成功（追加前と同じ）

## 成果物

- 変更したコード
- README の更新
- A、B、D について、交換スクリプトの出力。ブラウザの操作が必要な部分は手順として示す

## 守ること

- PKCE の細かな仕様の解説は不要。実装は RFC 7636 §4.1〜§4.6 の範囲に収める
- 既存の動きを壊さない。`REQUIRE_PKCE=false` と `USE_PKCE=false` で追加前の挙動に戻せること
- 回答と README は日本語で書く
