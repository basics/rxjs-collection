import { concatAll, concatMap, delay, map, of, Subject, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { log } from '../log';

describe('lazy pagination - mocked', function () {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(function () {
    vi.doMock('./request', importOriginal => ({
      request: () => source => source.pipe(concatMap(({ v, t }) => of(v).pipe(delay(t))))
    }));
  });

  afterEach(() => {
    vi.doUnmock('./request');
  });

  test('classic testing', () => {
    //
  });

  test('marble testing', async () => {
    const { lazyPagination } = await import('./lazyPagination');

    const pager = new Subject();

    const triggerValues = {
      a: () => pager.next({ value: 'a' }),
      b: () => pager.next({ value: 'b' }),
      c: () => pager.next({ value: 'c' }),
      d: () => pager.next({ value: 'd' }),
      e: () => pager.next({ value: 'e' })
    };

    const responseValues = {
      a: { t: 2, v: { value: 'a' } },
      b: { t: 5, v: { value: 'b' } },
      c: { t: 3, v: { value: 'c' } },
      d: { t: 1, v: { value: 'd' } },
      e: { t: 4, v: { value: 'e' } }
    };

    const expectedValues = Object.fromEntries(
      Object.entries(responseValues).map(([key, v]) => [key, v.v])
    );

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        of({ url: 'https://example.com' }).pipe(
          lazyPagination({
            pager,
            concurrent: 5,
            resolveRoute: (url, { value }) => responseValues[String(value)]
          })
        )
      ).toBe('--daceb--------', expectedValues);
      expectObservable(cold('-(abcde)--------', triggerValues).pipe(tap(fn => fn())));
    });
  });
});

describe.skip('lazy pagination - demo', function () {
  beforeAll(function () {
    vi.resetModules();
  });

  test('sample testing', async function () {
    const { lazyPagination } = await import('./lazyPagination');
    const { resolveJSON } = await import('./response');
    const pager = new Subject();

    return new Promise(done => {
      of({ url: new URL('https://dummyjson.com/products') })
        .pipe(
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
          log(false),
          resolveJSON(),
          log(false),
          map(({ products }) => products),
          concatAll(),
          log(false)
        )
        .subscribe({
          next: e => console.log(e),
          complete: () => done()
        });

      pager.next({ value: 2 });
      pager.next({ value: 3 });
      pager.next({ value: 12 });
      pager.next({ value: 5 });
      pager.next({ value: 6 });
      pager.next({ value: 7 });
      pager.next({ value: 8 });
      pager.next({ value: 9 });
      pager.complete();
    });
  });
});
