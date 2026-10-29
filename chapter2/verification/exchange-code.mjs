#!/usr/bin/env node
/**
 * 横取りした認可コードを、正規のアプリとは別の実行主体として交換してみるスクリプト。
 *
 * 使い方:
 *   node exchange-code.mjs <認可コード> [code_verifier]
 *
 * 環境変数（省略時は chapter2/settings.md の App A の値）:
 *   TOKEN_ENDPOINT  既定 http://localhost:3000/token
 *   CLIENT_ID       既定 app-a
 *   CLIENT_SECRET   既定 app-a-secret
 *   REDIRECT_URI    既定 http://localhost:3001/callback
 *   CLIENT_AUTH     既定 post（client_secret_post）。basic で client_secret_basic
 *
 * 期待する結果:
 *   PKCE なし（または REQUIRE_PKCE=false）: 200 とトークン → 横取りした側が交換できた
 *   PKCE あり、code_verifier なし:            400 invalid_grant → 拒否された
 *   PKCE あり、正しい code_verifier:          200 → 正規の操作では成功する
 */
const [code, codeVerifier] = process.argv.slice(2);
if (!code) {
  console.error('使い方: node exchange-code.mjs <認可コード> [code_verifier]');
  process.exit(2);
}

const tokenEndpoint = process.env.TOKEN_ENDPOINT ?? 'http://localhost:3000/token';
const clientId = process.env.CLIENT_ID ?? 'app-a';
const clientSecret = process.env.CLIENT_SECRET ?? 'app-a-secret';
const redirectUri = process.env.REDIRECT_URI ?? 'http://localhost:3001/callback';
const clientAuth = process.env.CLIENT_AUTH ?? 'post';

const body = new URLSearchParams({
  grant_type: 'authorization_code',
  code,
  redirect_uri: redirectUri,
});
const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
if (clientAuth === 'basic') {
  headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
} else {
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
}
if (codeVerifier) {
  body.set('code_verifier', codeVerifier);
}

console.log(`POST ${tokenEndpoint}`);
console.log(`  client_id=${clientId}  client_auth=${clientAuth}  redirect_uri=${redirectUri}`);
console.log(`  code=${code.slice(0, 8)}...  code_verifier=${codeVerifier ? '(あり)' : '(なし)'}`);

const response = await fetch(tokenEndpoint, { method: 'POST', headers, body: body.toString() });
const text = await response.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = null;
}

console.log(`\nHTTP ${response.status}`);
if (json === null) {
  console.log(text);
} else {
  const shown = { ...json };
  for (const key of ['access_token', 'id_token', 'refresh_token']) {
    if (typeof shown[key] === 'string') {
      shown[key] = `${shown[key].slice(0, 16)}... (${shown[key].length} 文字)`;
    }
  }
  console.log(JSON.stringify(shown, null, 2));
}

if (response.ok) {
  console.log('\n結果: トークンを取得できた。認可コードを持つ別の実行主体が交換できたことになる');
} else if (json?.error) {
  console.log(`\n結果: 拒否された（${json.error}${json.error_description ? `: ${json.error_description}` : ''}）`);
} else {
  console.log('\n結果: 失敗（内容は上の応答を確認する）');
}
