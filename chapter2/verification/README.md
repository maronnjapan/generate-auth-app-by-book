# A.6 PKCE の追加前後を比較するための検証操作

横取りした認可コードを、正規のアプリとは別の実行主体が交換できるかを確かめます。
同じ操作を PKCE の追加前と追加後に行い、結果の違いを比べます。

## 前提

- `prompts/B04-pkce-comparison-setup.md` の作業が終わっている。つまり次がそろっている
  - 認証基盤に `REQUIRE_PKCE`、アプリに `USE_PKCE` の環境変数がある（PKCE の無い実装では、どちらも `false` 相当のまま）
  - App A に `STOP_BEFORE_TOKEN_EXCHANGE=1` の検証モードがあり、`/callback` で認可コードを交換せずに画面に表示する。画面には「この認可コードで交換を続ける」ボタンがある
- このディレクトリの `exchange-code.mjs`（Node.js）または `exchange-code.sh`（curl）が、認証基盤のトークンエンドポイントに合っている（B.4 で確認済み）

## 「別の実行環境」とは

正規のアプリ（App A）のプロセスとは別の場所から、同じ認可コードを使ってトークンエンドポイントを呼びます。
本書では、別のターミナルで `exchange-code.mjs` を実行します。
ブラウザを変えること自体には意味がありません。注目するのは「認可コードを持っている別の実行主体が、交換できてしまうかどうか」です。

比較の条件を次のようにそろえます。

| 条件 | そろえ方 |
|---|---|
| 認可コードが未使用 | App A を `STOP_BEFORE_TOKEN_EXCHANGE=1` で起動し、交換前に止める。試行ごとに新しいコードを取る（コードは一回限り） |
| クライアント認証 | 横取りした側も同じ `client_id` と `client_secret` を使う（公開クライアント相当の条件。確認したいのは、コードとクライアントの資格情報を持つ別主体を、認証基盤が見分けられるか） |
| redirect_uri | 正規のアプリと同じ値を送る |
| 横取りした側が持たないもの | 正規のアプリのセッションにある `code_verifier`（PKCE 追加後） |

## 手順 1: PKCE の追加前（または PKCE を使わない構成）

1. 認証基盤を起動する。PKCE がある実装なら `REQUIRE_PKCE=false` を付ける

   ```bash
   cd chapter2/openid-provider
   REQUIRE_PKCE=false pnpm dev     # コマンド名は生成された README に従う
   ```

2. App A を検証モードで起動する

   ```bash
   cd chapter2/app-a
   STOP_BEFORE_TOKEN_EXCHANGE=1 USE_PKCE=false pnpm dev
   ```

3. ブラウザで http://localhost:3001 を開き、「ログイン」→ 認証基盤で `alice` / `password` を入力する
4. App A の `/callback` の画面に、認可コードと実行例が表示される。交換はまだ行われていない
5. 別のターミナルで、表示された認可コードを渡して交換する

   ```bash
   cd chapter2/verification
   node exchange-code.mjs <認可コード>
   ```

6. 期待する結果: `HTTP 200` と `access_token`、`id_token` が返る。横取りした側がトークンを取得できた

この時点で、App A の画面の「交換を続ける」ボタンを押すと、コードは使用済みなので失敗します。
これも一回限りの確認になります。

## 手順 2: PKCE の追加後

`prompts/B05-add-pkce.md` の作業のあとに行います。

1. 認証基盤を `REQUIRE_PKCE=true`（B.5 以降の既定値）で起動する
2. App A を `STOP_BEFORE_TOKEN_EXCHANGE=1 USE_PKCE=true` で起動する
3. ブラウザで http://localhost:3001 からログインする。App A は `code_challenge` を付けて認可を要求する（正規の手順）
4. `/callback` の画面に、認可コードと、App A のセッションが保持している `code_verifier` が表示される
5. 横取りした側として、`code_verifier` を渡さずに交換する

   ```bash
   node exchange-code.mjs <認可コード>
   ```

6. 期待する結果: `HTTP 400` と `invalid_grant`（実装によっては `invalid_request`）。拒否された
7. 正規の操作として、App A の画面の「交換を続ける」ボタンを押す。または、画面の `code_verifier` を渡して実行する

   ```bash
   node exchange-code.mjs <新しい認可コード> <code_verifier>
   ```

   拒否された試行でコードが消費される実装もあるので、拒否のあとは新しいコードを取り直してから試す
8. 期待する結果: `HTTP 200`。正規の操作では成功する
9. `STOP_BEFORE_TOKEN_EXCHANGE` を外して通常どおり起動し、ログインと SSO（App B でパスワードを再入力せずに戻れる）が引き続き動くことを確認する

## 結果の比較

| 操作 | PKCE 追加前 | PKCE 追加後 |
|---|---|---|
| 横取りした側（`code_verifier` なし）が交換 | 成功（200） | 拒否（400 `invalid_grant`） |
| 正規のアプリ（`code_verifier` あり）が交換 | 成功 | 成功 |
| ログインと SSO | 動く | 動く |

同じ検証条件でトークン交換の結果が変わったこと、正規の操作を維持したまま横取りした側の交換だけを拒否できたことが、PKCE の効果です。

## 補足

- 期待と違う結果になったら、期待していた動作と実際の動作を `prompts/B07-verify-against-spec.md` に書いて、RFC 7636 と照らして直してもらってください
- `exchange-code.mjs` の既定値は App A の設定です。App B で試すなら `CLIENT_ID=app-b CLIENT_SECRET=app-b-secret REDIRECT_URI=http://localhost:3002/callback` を付けます
- トークンエンドポイントが `client_secret_basic` だけを受け付ける実装なら `CLIENT_AUTH=basic` を付けます
