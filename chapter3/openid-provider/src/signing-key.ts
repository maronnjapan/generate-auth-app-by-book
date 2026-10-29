/**
 * 起動のたびに作る RS256 の署名鍵。
 *
 * 検証用なので鍵は保存しない。再起動すると、それまでに発行したトークンは
 * 検証できなくなる（JWKS の鍵が変わる）。鍵を固定したい場合は、
 * JWK を環境変数やファイルから読み込む SigningKeyProvider に置き換える。
 */
import {
  createCachedSigningKeyProvider,
  type SigningKey,
  type SigningKeyProvider,
} from '@maronn-openid-connect/core';

export function createEphemeralSigningKeyProvider(keyId: string): SigningKeyProvider {
  const keyPromise = generateSigningKey(keyId);
  return createCachedSigningKeyProvider(
    {
      async getSigningKeys(): Promise<SigningKey[]> {
        return [await keyPromise];
      },
    },
    60_000,
  );
}

async function generateSigningKey(keyId: string): Promise<SigningKey> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = (await crypto.subtle.exportKey('jwk', keyPair.publicKey)) as JsonWebKey & {
    alg?: string;
    use?: string;
    kid?: string;
  };
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  publicJwk.kid = keyId;
  return { privateKey: keyPair.privateKey, publicJwk, keyId };
}
