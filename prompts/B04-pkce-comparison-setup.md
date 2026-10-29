# B.4 PKCE の比較用構成と、認可コードの交換を試す検証手順の作成

## 目的

横取りした認可コードで、正規のアプリとは別の実行主体がトークンを取得できるかを確かめたい。
そのために、PKCE を使わないローカル検証構成と、認可コードをトークンに交換する前に処理を止める検証モードを用意してください。
同じ検証を PKCE の追加後にも行い、結果を比較します。

## 前提

- B.3 の確認結果（今の実装に PKCE があるかどうか、変更が必要な箇所）
- 設定値は `chapter2/settings.md`
- 検証手順の下書きとスクリプトが `chapter2/verification/` にある（`README.md`、`exchange-code.mjs`、`exchange-code.sh`）

## 依頼

### 1. PKCE を使わないローカル検証構成

- 実装に PKCE が無い場合: 現状のままでよい。ただし、あとで追加するときのために、OP に `REQUIRE_PKCE`、アプリに `USE_PKCE` の環境変数を読む箇所だけ用意し（今は何もしない）、README に「現在は PKCE 無し」と明記する
- 実装に PKCE がある場合: OP に `REQUIRE_PKCE`（`true` / `false`）、アプリに `USE_PKCE`（`true` / `false`）を追加する。`USE_PKCE=false` のアプリは `code_challenge` を送らず、`REQUIRE_PKCE=false` の OP は `code_challenge` の無い認可リクエストを受け付け、`code_verifier` が無くても交換を許可する。既定値は現状の挙動を保つ

### 2. トークン交換の前に止める検証モード（App A だけでよい）

- 環境変数 `STOP_BEFORE_TOKEN_EXCHANGE=1` のとき、`GET /callback` は認可コードを交換せず、次を画面に表示する
  - 認可コード
  - `redirect_uri`、`client_id`
  - `USE_PKCE=true` のとき、セッションに保持している `code_verifier`
  - `chapter2/verification/exchange-code.mjs` の実行例（`node exchange-code.mjs <認可コード>`）
- 画面に「この認可コードで交換を続ける」ボタン（`POST /callback/continue`）を置き、正規のアプリとして交換を完了して `/` に戻れるようにする。`USE_PKCE=true` なら `code_verifier` を使う
- 未設定のときは従来どおり自動で交換する

### 3. 交換スクリプトの確認

`chapter2/verification/exchange-code.mjs` と `exchange-code.sh` が、この OP のトークンエンドポイントとクライアント認証方式（`client_secret_post`）で動くことを確認し、合わなければ修正してください。
実行方法と環境変数（`TOKEN_ENDPOINT`、`CLIENT_ID`、`CLIENT_SECRET`、`REDIRECT_URI`）は `chapter2/verification/README.md` にあります。

### 4. 検証手順の読み合わせ

`chapter2/verification/README.md` の手順が、この実装で成り立つかを読み直し、ずれているところ（ポート、画面の文言、環境変数名、エラーの名前）を直してください。

## 検証手順（最終的に README に反映する内容）

1. OP を `REQUIRE_PKCE=false`（PKCE が無い実装ならそのまま）で起動する
2. App A を `STOP_BEFORE_TOKEN_EXCHANGE=1 USE_PKCE=false` で起動する
3. ブラウザで App A からログインし、`/callback` の画面で認可コードを控える（交換はまだ行われていない）
4. 別のターミナルで `node chapter2/verification/exchange-code.mjs <認可コード>` を実行する
5. 期待する結果: 200 とトークン。認可コードを持つ別の実行主体が交換できた

## 説明に含めること

- ブラウザの違いではなく、認可コードを持つ別の実行主体が交換できてしまう点に注目する
- 本検証では、横取りした側も同じクライアント認証情報を持つ条件にそろえる（公開クライアント相当）。確認したいのは「コードとクライアントの資格情報を持つ別の主体を、OP が見分けられるか」
- 認可コードは一回限りなので、試行ごとに新しいコードを取る

## 成果物

- 変更したコードと、変更したファイルの一覧
- 各 README の更新（環境変数と検証モードの説明）
- `chapter2/verification/README.md` の修正（必要な場合）
- 実際に手順 1〜5 を一度行った結果（交換スクリプトの出力）。ブラウザでのログインは読者が行うので、その部分は手順として示す

## 守ること

- 既存のログインと SSO の動きを壊さない。既定値は現状を保つ
- 回答と README は日本語で書く
