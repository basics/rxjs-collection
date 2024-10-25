import fetchMock from 'fetch-mock';
import { of, take } from 'rxjs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { log } from '../log';
import { polling } from './polling';
import { resolveJSON } from './response';

describe('polling', function () {
  beforeEach(function () {
    let counter = 0;
    fetchMock.mockGlobal().get('https://httpbin.org/my-url-fast', () => {
      if (counter++ < 2) {
        return new Response(JSON.stringify({ hello: 'fast world' }), {
          status: 200,
          headers: { 'Content-type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ hello: 'faster world' }), {
        status: 200,
        headers: { 'Content-type': 'application/json' }
      });
    });
  });

  afterEach(function () {
    fetchMock.unmockGlobal();
  });

  test('auto polling', async function () {
    const expected = [{ hello: 'fast world' }, { hello: 'faster world' }];

    return new Promise(done => {
      of(new URL('https://httpbin.org/my-url-fast'))
        .pipe(polling(), log(false), resolveJSON(), log(false), take(2))
        .subscribe({
          next: e => expect(e).deep.include(expected.shift()),
          complete: () => done()
        });
    });
  });
});
