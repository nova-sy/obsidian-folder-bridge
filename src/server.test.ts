import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createFolderServer } from './server.ts';

const server = createFolderServer('Notes', () => ['工具/开发', '工具'], 'secret');
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
after(() => server.close());
const address = server.address();
if (!address || typeof address === 'string') throw new Error('No server address');
const url = `http://127.0.0.1:${address.port}/folders`;
const origin = 'chrome-extension://' + 'a'.repeat(32);

test('serves only authenticated extension requests and keeps nested paths', async () => {
  const preflight = await fetch(url, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'X-Folder-Bridge-Token' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  const rejected = await fetch(url, { headers: { Origin: origin } });
  assert.equal(rejected.status, 401);
  const browserPage = await fetch(url, { headers: { Origin: 'https://example.com', 'X-Folder-Bridge-Token': 'secret' } });
  assert.equal(browserPage.status, 403);
  const accepted = await fetch(url, { headers: { Origin: origin, 'X-Folder-Bridge-Token': 'secret' } });
  assert.equal(accepted.status, 200);
  assert.deepEqual(await accepted.json(), { vault: 'Notes', folders: ['工具', '工具/开发'] });
});
