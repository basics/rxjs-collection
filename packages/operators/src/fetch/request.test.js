import fetchMock from 'fetch-mock';
import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log.js';
import { request } from './request.js';

describe('request observable with default operators', function () {
  beforeEach(function () {
    let counter = 0;
    fetchMock.mockGlobal().get(
      'https://httpbin.org/my-url-fast',
      () => {
        return new Response(JSON.stringify({ hello: 'fast world' }), {
          status: ++counter > 2 ? 200 : 404,
          headers: { 'Content-type': 'application/json' }
        });
      },
      { delay: 0, repeat: 4 }
    );
  });

  afterEach(function () {
    fetchMock.unmockGlobal();
  });

  test('successfull request', () =>
    new Promise(done => {
      of('https://httpbin.org/my-url-fast')
        .pipe(request(), log(false))
        .subscribe({
          next: resp => expect(resp).deep.includes({ ok: true }),
          complete: () => done()
        });
    }));
});
