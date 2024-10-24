import * as nFetch from 'node-fetch';
import { afterAll, beforeAll } from 'vitest';

const backup = new Map([
  ['fetch', [global.fetch, nFetch.default]],
  ['Blob', [global.Blob, nFetch.Blob]],
  ['File', [global.File, nFetch.File]],
  ['FormData', [global.FormData, nFetch.FormData]],
  ['Request', [global.Request, nFetch.Request]]
]);

beforeAll(() => {
  Array.from(backup.entries()).forEach(([name, [, poly]]) => (global[String(name)] = poly));
});
afterAll(() => {
  Array.from(backup.entries()).forEach(([name, [orig]]) => (global[String(name)] = orig));
});
