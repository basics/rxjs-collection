import { requestObservable } from './request.js';
import fetchMock from 'fetch-mock';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

describe('request observable with default operators', function () {
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

  test('successfull request', () =>
    new Promise(done => {
      requestObservable('https://httpbin.org/my-url-fast').subscribe(async e => {
        expect(e.ok).equal(true);
        expect(await e.json()).deep.equal({ hello: 'fast world' });
        done();
      });
    }));
});
