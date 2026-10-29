/**
 * Node.js で OpenID Provider を起動する: `pnpm start`（または `pnpm dev`）。
 */
import { serve } from '@hono/node-server';
import { createServerApp } from './app.js';
import { readSettings } from './settings.js';

const { host, port, issuer } = readSettings(process.env);
const app = await createServerApp(process.env);

serve({ fetch: app.fetch, hostname: host, port }, () => {
  console.log(`OpenID Provider listening on ${issuer}`);
  console.log(`  discovery: ${issuer}/.well-known/openid-configuration`);
  console.log('  users: testuser / password, otheruser / password');
});
