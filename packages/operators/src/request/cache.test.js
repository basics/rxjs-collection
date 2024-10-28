import fetchMock from 'fetch-mock';
import { defer, of, tap } from 'rxjs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { cache } from './cache';
import { requestText } from './request';

describe('cache', function () {
  beforeEach(function () {
    let counter = 0;
    fetchMock.mockGlobal().get(
      'https://httpbin.org/my-url-fast',
      () => {
        return new Response(++counter, {
          status: 200,
          headers: { 'Content-type': 'plain/text' }
        });
      },
      { delay: 0, repeat: 2 }
    );
  });

  afterEach(function () {
    fetchMock.unmockGlobal();
  });

  test('cache resetted after 100ms', async function () {
    const a = of('https://httpbin.org/my-url-fast').pipe(requestText(), cache(1000));
    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('1'),
        complete: () => done()
      });
    });

    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('1'),
        complete: () => done()
      });
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('2'),
        complete: () => done()
      });
    });
  });
});
