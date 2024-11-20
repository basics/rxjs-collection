import { concatAll, concatMap, delay, from, map, of, tap, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { log, logResult } from '../log';
import { resolveJSON } from './response';

describe('concurrent request - mocked', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(() => {
    vi.doMock('./request', importOriginal => ({
      request: () => source => source.pipe(concatMap(({ v, t }) => of(v).pipe(delay(t))))
    }));
  });

  afterEach(() => {
    vi.doUnmock('./request');
  });

  afterAll(function () {
    vi.resetModules();
  });

  test('classic testing', async () => {
    const { concurrentRequest } = await import('./concurrentRequest');

    const triggerVal = [
      { t: 20, v: 'a' },
      { t: 50, v: 'b' },
      { t: 10, v: 'c' },
      { t: 30, v: 'd' },
      { t: 40, v: 'e' }
    ];
    const sortedVal = [...triggerVal].sort((a, b) => a.t - b.t).map(({ v }) => v);

    await new Promise((done, error) => {
      from(triggerVal)
        .pipe(concurrentRequest(triggerVal.length), toArray())
        .subscribe({
          next: e => expect(e).toStrictEqual(sortedVal),
          complete: () => done(),
          error: e => error(e)
        });
    });
  });

  test('marble testing', async () => {
    const { concurrentRequest } = await import('./concurrentRequest');

    const triggerVal = {
      a: { t: 2, v: 'a' },
      b: { t: 5, v: 'b' },
      c: { t: 1, v: 'c' },
      d: { t: 3, v: 'd' },
      e: { t: 4, v: 'e' }
    };
    const expectedVal = Object.fromEntries(Object.entries(triggerVal).map(([k, { v }]) => [k, v]));

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-b-(cd)-e----', triggerVal).pipe(concurrentRequest(Object.keys(triggerVal).length))
      ).toBe('---a--c-(bd)--e', expectedVal);
    });
  });
});

describe('concurrent request - demo', () => {
  test('sample testing', async () => {
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
