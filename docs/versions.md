# A.7 本書で使用したパッケージのバージョンと参照資料

確認日: 2026-11-12

## 実行環境

| ソフトウェア | バージョン | 備考 |
|---|---|---|
| Node.js | 22.23.4（22.9 以上で可） | `node --env-file-if-exists` と `fetch`、WebCrypto を使う |
| pnpm | 10.28.0（10 系で可） | 入っていなければ `npm install -g pnpm@10` |
| TypeScript | 5.9 系 | 第3章の `package.json` は `^5.9.0`。OSS 本体は 7.0 系を使っているが、生成コードは 5.9 でも型検査が通ることを確認した |
| tsx | 4.23 系 | TypeScript をそのまま実行する |
| ブラウザー | Chromium | ログイン、SSO、Device Authorization Grant の承認と拒否を確認した。Firefox と Safari は未確認 |

## 第3章で使う OSS のパッケージ（npm）

| パッケージ | バージョン | 役割 |
|---|---|---|
| `@maronn-openid-connect/cli` | 0.15.1 | `maronn-oidc generate hono` で OpenID Provider のコードを生成する |
| `@maronn-openid-connect/core` | 0.10.0 | 生成コードが呼ぶ、検証やトークン生成の処理 |
| `@maronn-openid-connect/experimental` | 0.0.16 | Device Authorization Grant など実験的機能の処理（API は不安定） |
| `hono` | 4.13 系 | 生成コードが使う Web フレームワーク（画面は hono/jsx） |
| `@hono/node-server` | 2.1 系 | Hono を Node.js で動かす |

`chapter3/openid-provider/package.json` と `pnpm-lock.yaml` にこの版を固定しています。
新しい版で試すときは、`package.json` の版を上げてから `pnpm install` し、生成コードを `pnpm run generate:force` で作り直してください（作り直す前にコミットしておくと差分を比較できます）。

第2章は生成AIが作るので、パッケージの版は生成結果によって変わります。
生成された `package.json` と `pnpm-lock.yaml` をコミットしておけば、同じ版で再現できます。

## 参照資料

### 仕様

| 仕様 | URL | 本書で関係する章 |
|---|---|---|
| RFC 6749 The OAuth 2.0 Authorization Framework | https://www.rfc-editor.org/rfc/rfc6749 | 第2章（認可コード、トークンエンドポイント、クライアント認証）、第3章 3.4.4（§3.1 と §3.2 の TLS 要件） |
| RFC 6750 The OAuth 2.0 Authorization Framework: Bearer Token Usage | https://www.rfc-editor.org/rfc/rfc6750 | 第2章、第3章（Authorization: Bearer） |
| RFC 7636 Proof Key for Code Exchange by OAuth Public Clients（PKCE） | https://www.rfc-editor.org/rfc/rfc7636 | 第2章 2.6（気になった機能の追加の例） |
| RFC 8628 OAuth 2.0 Device Authorization Grant | https://www.rfc-editor.org/rfc/rfc8628 | 第3章 |
| RFC 6265 HTTP State Management Mechanism | https://www.rfc-editor.org/rfc/rfc6265 | 第2章（§8.5: Cookie はポートを区別しない） |
| RFC 7662 OAuth 2.0 Token Introspection | https://www.rfc-editor.org/rfc/rfc7662 | 第3章（サンプル API の検証） |
| RFC 7009 OAuth 2.0 Token Revocation | https://www.rfc-editor.org/rfc/rfc7009 | 第3章 3.2.4、3.2.6（OSS が対応する仕様） |
| RFC 9068 JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens | https://www.rfc-editor.org/rfc/rfc9068 | 第3章（生成 OP のアクセストークン形式） |
| RFC 7591 OAuth 2.0 Dynamic Client Registration Protocol | https://www.rfc-editor.org/rfc/rfc7591 | 第3章 3.1.3（ダイナミッククライアント登録） |
| OpenID Connect Dynamic Client Registration 1.0 | https://openid.net/specs/openid-connect-registration-1_0.html | 第3章 3.1.3（ダイナミッククライアント登録） |
| RFC 8693 OAuth 2.0 Token Exchange | https://www.rfc-editor.org/rfc/rfc8693 | 第3章 3.1.2（クロスアプリアクセス） |
| RFC 7523 JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants | https://www.rfc-editor.org/rfc/rfc7523 | 第3章 3.1.2（クロスアプリアクセス） |
| OpenID Connect Core 1.0 | https://openid.net/specs/openid-connect-core-1_0.html | 第2章（ID トークン、UserInfo、認可コードフロー） |
| OpenID Connect Discovery 1.0 | https://openid.net/specs/openid-connect-discovery-1_0.html | 第2章、第3章（`/.well-known/openid-configuration`） |
| The OAuth 2.1 Authorization Framework（draft） | https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/ | 第2章 2.6（PKCE を必須とする流れ）、第3章（OSS が準拠を掲げる仕様） |
| Identity Assertion JWT Authorization Grant（draft） | https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/ | 第3章 3.1.2（クロスアプリアクセス） |

### OSS

| 資料 | URL |
|---|---|
| maronn-openid-connect リポジトリ | https://github.com/maronnjapan/maronn-openid-connect |
| CLI の README（オプション、生成物の構成、機能トグル） | https://github.com/maronnjapan/maronn-openid-connect/tree/main/packages/cli#readme |
| experimental パッケージの README（対応範囲と位置づけ） | https://github.com/maronnjapan/maronn-openid-connect/tree/main/packages/experimental#readme |
| core パッケージの README | https://github.com/maronnjapan/maronn-openid-connect/tree/main/packages/core#readme |

### フレームワーク

| 資料 | URL |
|---|---|
| Hono | https://hono.dev/ |
| @hono/node-server | https://github.com/honojs/node-server |
