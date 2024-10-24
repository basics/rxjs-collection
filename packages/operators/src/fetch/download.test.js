import fetchMock from 'fetch-mock';
import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { download, downloadJSON } from './download.js';

describe('download operator', function () {
  beforeEach(function () {
    fetchMock.get(
      'https://httpbin.org/my-url-fast',
      new Response(JSON.stringify({ hello: 'fast world' }), {
        status: 200,
        headers: {
          'Content-type': 'application/json'
        }
      }),
      {
        delay: 1000
      }
    );
  });

  afterEach(function () {
    fetchMock.restore();
  });

  test('successfull download', () =>
    new Promise(done => {
      of('https://httpbin.org/my-url-fast')
        .pipe(downloadJSON())
        .subscribe({
          next: data => {
            expect(data).deep.equal({ hello: 'fast world' });
            done();
          },
          complete: e => console.log('COMPLETE', e)
        });
    }));
});
