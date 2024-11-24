import { concatAll, delay, map, of, Subject, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { mockAsync } from '../../../mock/async';
import { mockResponse } from '../../../mock/response';
import { log, logResult } from '../log';
import { resolveJSON } from './response';

describe('lazy pagination', () => {
  let testScheduler;

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockImplementation(({ v, t }) => mockAsync(v).pipe(delay(t)));

    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).to.eql(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', async () => {
    const { lazyPagination } = await import('./lazyPagination');

    const pager = new Subject();

    const triggerVal = {
      a: () => pager.next({ value: 'a' }),
      b: () => pager.next({ value: 'b' }),
      c: () => pager.next({ value: 'c' }),
      d: () => pager.next({ value: 'd' }),
      e: () => pager.next({ value: 'e' })
    };

    const expectedVal = {
      a: { value: '1' },
      b: { value: '2' },
      c: { value: '3' },
      d: { value: '4' },
      e: { value: '5' }
    };

    const responseVal = {
      a: { t: 2, v: new Response(expectedVal.a) },
      b: { t: 5, v: new Response(expectedVal.b) },
      c: { t: 3, v: new Response(expectedVal.c) },
      d: { t: 1, v: new Response(expectedVal.d) },
      e: { t: 4, v: new Response(expectedVal.e) }
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        of('https://example.com').pipe(
          lazyPagination({
            pager,
            concurrent: 5,
            resolveRoute: (url, { value }) => responseVal[String(value)]
          }),
          resolveJSON()
        )
      ).toBe('--daceb--------', expectedVal);
      expectObservable(cold('-(abcde)--------', triggerVal).pipe(tap(fn => fn())));
    });
  });
});

/* v8 ignore start */
describe.skip('lazy pagination - demo', () => {
  test('sample', async () => {
    const { lazyPagination } = await import('./lazyPagination');

    const pager = new Subject();

    const result = logResult(
      'demo',
      of(new URL('https://dummyjson.com/products')).pipe(
        lazyPagination({
          pager,
          concurrent: 4,
          resolveRoute: (url, { value, limit = 10 }) => {
            const newUrl = new URL(`${url}`);
            newUrl.searchParams.set('skip', value * limit);
            newUrl.searchParams.set('limit', limit);
            newUrl.searchParams.set('select', 'title,price');
            return newUrl;
          }
        }),
        log('demo:response'),
        resolveJSON(),
        log('demo:response:json'),
        map(({ products }) => products),
        log('demo:response:result'),
        concatAll()
      )
    );

    pager.next({ value: 2 });
    pager.next({ value: 3 });
    pager.next({ value: 12 });
    pager.next({ value: 5 });
    pager.next({ value: 6 });
    pager.next({ value: 7 });
    pager.next({ value: 8 });
    pager.next({ value: 9 });
    pager.complete();

    await result;
  });
});
/* v8 ignore stop */
