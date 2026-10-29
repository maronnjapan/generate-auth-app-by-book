/**
 * ローカル検証用の設定。環境変数（.env）から読み、無ければ既定値を使う。
 *
 * ここにある値はすべて検証用で、本番の設定ではない。
 * - issuer は http://localhost:4000 のような平文 HTTP の URL にする。
 *   RFC 8628 §5.7 / RFC 6749 §1.6 は TLS を要求するが、同じ PC の中だけで
 *   動かす本書の検証では平文で試す。外部に公開する場合は HTTPS にする
 * - クライアントの client_id や secret は固定の文字列。本番では CSPRNG で作る
 */
import type { ClientRegistration } from './oidc-provider/config.js';

export type Environment = Readonly<Record<string, string | undefined>>;

export interface ServerSettings {
  host: string;
  port: number;
  issuer: string;
  clients: ClientRegistration[];
}

/** RFC 8628 §3.4 の grant_type。サンプル CLI アプリはこの値でトークンを要求する */
export const DEVICE_CODE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';

export function readSettings(env: Environment): ServerSettings {
  const host = env['HOST'] ?? 'localhost';
  const port = Number(env['PORT'] ?? '4000');
  const issuer = env['ISSUER'] ?? `http://${host}:${port}`;
  const sampleApiUrl = env['SAMPLE_API_URL'] ?? 'http://localhost:4001';

  const clients: ClientRegistration[] = [
    {
      // 第3章で作るサンプル CLI アプリ。
      // ターミナルで動く public client（秘密を安全に保持できない）なので、
      // クライアント認証は none。client_id だけを提示する。
      clientId: env['SAMPLE_CLI_CLIENT_ID'] ?? 'sample-cli',
      clientType: 'public',
      tokenEndpointAuthMethods: ['none'],
      // Device Authorization Grant を使うには、この grant_type の登録が必要
      // （登録が無いと device_authorization が unauthorized_client を返す）。
      grantTypes: [DEVICE_CODE_GRANT_TYPE],
      // このフローはリダイレクトを使わないが、登録メタデータとして配列は必要
      redirectUris: [],
    },
    {
      // 第3章で作るサンプル API。アクセストークンの検証に
      // Token Introspection（RFC 7662）を使うときに、この資格情報で /introspect を呼ぶ。
      clientId: env['SAMPLE_API_CLIENT_ID'] ?? 'sample-api',
      clientSecret: env['SAMPLE_API_CLIENT_SECRET'] ?? 'sample-api-secret',
      clientType: 'confidential',
      tokenEndpointAuthMethods: ['client_secret_basic'],
      grantTypes: ['authorization_code'],
      redirectUris: [`${sampleApiUrl}/unused-callback`],
    },
  ];

  return { host, port, issuer, clients };
}
