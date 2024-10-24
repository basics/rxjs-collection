import fetchMock from 'fetch-mock';
import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log.js';
import { download, downloadJSON } from './download.js';
import { resolveJSON } from './resolve.js';

describe('download operator', function () {
  beforeEach(function () {
    fetchMock.mockGlobal().get(
      'https://httpbin.org/my-url-fast',
      () => {
        return new Response(JSON.stringify({ hello: 'fast world' }), {
          status: 200,
          headers: { 'Content-type': 'application/json' }
        });
      },
      { delay: 1000 }
    );
  });

  afterEach(function () {
    fetchMock.unmockGlobal();
  });

  test('successfull download - indirect json resolve', () =>
    new Promise(done => {
      of('https://httpbin.org/my-url-fast')
        .pipe(download(), log(false), resolveJSON(), log(false))
        .subscribe({
          next: data => expect(data).deep.equal({ hello: 'fast world' }),
          complete: () => done()
        });
    }));

  test('successfull download - direct json resolve', () =>
    new Promise(done => {
      of('https://httpbin.org/my-url-fast')
        .pipe(downloadJSON(), log(false))
        .subscribe({
          next: data => expect(data).deep.equal({ hello: 'fast world' }),
          complete: () => done()
        });
    }));
});
