import { mockAsync } from '#mocks/async';
import { mockResponse } from '#mocks/response';
import { concatAll, delay, map, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { log, logResult } from '../log';
import { resolveJSON, resolveText } from '../response';

describe('concurrent request', () => {
  let testScheduler;

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockImplementation(({ v, t }) => mockAsync(v).pipe(delay(t)));

    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).to.eql(expected));
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  test('default', async () => {
    const { concurrentRequest } = await import('./concurrentRequest');

    const triggerVal = {
      a: { t: 2, v: new Response('a') },
      b: { t: 5, v: new Response('b') },
      c: { t: 1, v: new Response('c') },
      d: { t: 3, v: new Response('d') },
      e: { t: 4, v: new Response('e') }
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-b-(cd)-e|', triggerVal).pipe(
          log('operators:request:concurrent:input'),
          concurrentRequest(Object.keys(triggerVal).length),
          resolveText(),
          log('operators:request:concurrent:output')
        )
      ).toBe('---a--c-(bd)--(e|)');
    });
  });
});

/* v8 ignore start */
describe.skip('concurrent request - demo', () => {
  test('sample', async () => {
    const { concurrentRequest } = await import('./concurrentRequest');

    await logResult(
      'demo',
      of(
        new URL('https://dummyjson.com/products?limit=10&skip=0&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=10&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=20&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=30&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=40&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=50&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=60&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=70&select=title,price'),
        new URL('https://dummyjson.com/products?limit=10&skip=80&select=title,price')
      ).pipe(
        concurrentRequest(4),
        log('demo:response'),
        resolveJSON(),
        log('demo:response:json'),
        map(({ products }) => products),
        log('demo:response:result'),
        concatAll()
      )
    );
  });
});
/* v8 ignore stop */
