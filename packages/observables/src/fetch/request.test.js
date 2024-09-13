import { TestScheduler } from 'rxjs/testing';
import { requestObservable } from './request.js';
import fetchMock from 'fetch-mock';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';
import { concatMap, lastValueFrom, tap } from 'rxjs';

function jsonOk(body) {
  var mockResponse = new globalThis.Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  });

  return Promise.resolve(mockResponse);
}

const MOCK_JSON = {
  'your keys': 'your values'
};

describe('', function () {
  let testScheduler;

  beforeEach(function () {
    fetchMock.get(
      'http://httpbin.org/my-url-slow',
      { hello: 'slow world' },
      {
        delay: 1000 // fake a slow network
      }
    );

    fetchMock.get(
      'http://httpbin.org/my-url-fast',
      { hello: 'fast world' },
      {
        delay: 0 // fake a slow network
      }
    );

    testScheduler = new TestScheduler((actual, expected) => {
      console.log(actual, expected);
      expect(actual).deep.equal(expected);
    });
  });

  afterEach(function () {
    fetchMock.restore();
  });

  test('check', async function () {
    const expectedValues = {
      a: { hello: 'fast world' }
    };

    // const resp = await lastValueFrom(
    //   requestObservable('http://httpbin.org/my-url-fast').pipe(concatMap(e => e.json()))
    // );
    // console.log(resp);

    // testScheduler.run(({ expectObservable, cold }) => {
    //   expectObservable(
    //     requestObservable('http://httpbin.org/my-url-fast').pipe(
    //       concatMap(e => e.json()),
    //       tap(console.log)
    //     ),
    //     '!'
    //   ).toBe('a', expectedValues);
    // });

    requestObservable('http://httpbin.org/my-url-fast').subscribe(async e => {
      expect(await e.json()).deep.equal({ hello: 'fast world' });
    });
  });
});
