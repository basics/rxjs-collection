import { concatAll, delay, from, map, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { mockAsync } from '../../../mock/async';
import { mockResponse } from '../../../mock/response';
import { log, logResult } from '../log';
import { resolveJSON } from './response';

describe('auto pagination', () => {
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
    const { autoPagination } = await import('./autoPagination');

    const expectedVal = {
      a: { value: 'a', next: 'b' },
      b: { value: 'b', next: 'c' },
      c: { value: 'c', next: 'd' },
      d: { value: 'd', next: 'e' },
      e: { value: 'e', next: null }
    };

    const triggerVal = {
      a: { t: 2, v: new Response(expectedVal.a) },
      b: { t: 5, v: new Response(expectedVal.b) },
      c: { t: 3, v: new Response(expectedVal.c) },
      d: { t: 1, v: new Response(expectedVal.d) },
      e: { t: 4, v: new Response(expectedVal.e) }
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-------------------', { a: 'a' }).pipe(
          autoPagination({
            resolveRoute: (url, resp) => {
              if (resp) {
                return from(resp.json()).pipe(map(({ next }) => triggerVal[String(next)]));
              }
              return of(triggerVal[String(url)]);
            }
          }),
          resolveJSON(),
          log('marble:result')
        )
      ).toBe('---a----b--cd---e----', expectedVal);
    });
  });
});

describe('auto pagination - demo', () => {
  test('sample', async () => {
    const { autoPagination } = await import('./autoPagination');

    await logResult(
      'demo',
      of(new URL('https://dummyjson.com/products')).pipe(
        autoPagination({
          resolveRoute: (url, resp) => {
            return from(resp?.json() || of({ skip: -10, limit: 10 })).pipe(
              map(data => {
                if (!data.total || data.total > data.skip + data.limit) {
                  const newUrl = new URL(`${url}`);
                  newUrl.searchParams.set('skip', data.skip + data.limit);
                  newUrl.searchParams.set('limit', data.limit);
                  newUrl.searchParams.set('select', 'title,price');
                  return newUrl;
                }
              })
            );
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
  });
});
