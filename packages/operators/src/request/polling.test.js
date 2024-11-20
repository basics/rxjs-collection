import fetchMock from 'fetch-mock';
import { concatMap, map, of, take, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { createResponse } from '../../../test-utils/response';
import { log } from '../log';
import { resolveJSON } from './response';

describe('polling - mocked', () => {
  let triggerVal;
  let expectedArrayBuffer;

  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(async () => {
    triggerVal = [
      createResponse('https://example.com/', 'a'),
      createResponse('https://example.com/', 'a'),
      createResponse('https://example.com/', 'a'),
      createResponse('https://example.com/', 'b'),
      createResponse('https://example.com/', 'b'),
      createResponse('https://example.com/', 'c'),
      createResponse('https://example.com/', 'c')
    ];

    expectedArrayBuffer = await Promise.all(triggerVal.map(e => e.clone().arrayBuffer()));

    let counter = 0;
    vi.doMock('./request', importOriginal => ({
      request: () => source => source.pipe(map(() => triggerVal[counter++]))
    }));

    vi.spyOn(Response.prototype, 'arrayBuffer').mockImplementation(() => {
      return of(expectedArrayBuffer[counter - 1]);
    });
  });

  afterEach(() => {
    vi.doUnmock('./request');
  });

  afterAll(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  test('marble testing', async () => {
    const { polling } = await import('./polling');

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a------------', { a: 'https://example.com/' }).pipe(
        polling(2),
        concatMap(e => e.arrayBuffer())
      );

      const unsubA = '^------------!';
      expectObservable(stream, unsubA).toBe('a-----b---c--', {
        a: expectedArrayBuffer[0],
        b: expectedArrayBuffer[3],
        c: expectedArrayBuffer[5]
      });
    });
  });
});

describe('classic testing', () => {
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

  afterEach(() => {
    fetchMock.unmockGlobal();
  });

  test('auto polling', async () => {
    const { polling } = await import('./polling');
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
