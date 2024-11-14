import { concatAll, concatMap, delay, from, map, of, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { log } from '../log';
import { resolveJSON } from './response';

describe('auto pagination - mocked', function () {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(function () {
    vi.doMock('./request', importOriginal => ({
      request: () => source => source.pipe(concatMap(({ v, t }) => of(v).pipe(delay(t))))
    }));

    Object.prototype.clone = vi.fn();
    vi.spyOn(Object.prototype, 'clone').mockImplementation(function (e) {
      return { ...JSON.parse(JSON.stringify(this)) };
    });
  });

  afterEach(() => {
    vi.doUnmock('./request');
  });

  test('classic testing', async () => {
    const { autoPagination } = await import('./autoPagination');

    const triggerValues = {
      a: { t: 2, v: { value: 'a', next: 1 } },
      b: { t: 5, v: { value: 'b', next: 2 } },
      c: { t: 3, v: { value: 'c', next: 3 } },
      d: { t: 1, v: { value: 'd', next: 4 } },
      e: { t: 4, v: { value: 'e', next: null } }
    };

    const expectedVal = Array.from(Object.entries(triggerValues)).map(([k, { v }]) => v);

    const triggerVal = Object.values(triggerValues);
    await new Promise((done, error) => {
      of(triggerVal[0])
        .pipe(
          autoPagination({
            resolveRoute: (conf, resp) =>
              ((!resp || resp.next) && [triggerVal[resp?.next || 0]]) || []
          }),
          toArray()
        )
        .subscribe({
          next: e => expect(e).toStrictEqual(expectedVal),
          complete: () => done(),
          error: () => error()
        });
    });
  });

  test.skip('marble testing', async () => {
    const { autoPagination } = await import('./autoPagination');

    const triggerVal = {
      a: { t: 2, v: { value: 'a', next: 'b' } },
      b: { t: 5, v: { value: 'b', next: 'c' } },
      c: { t: 3, v: { value: 'c', next: 'd' } },
      d: { t: 1, v: { value: 'd', next: 'e' } },
      e: { t: 4, v: { value: 'e', next: null } }
    };

    const expectedVal = Object.fromEntries(
      Array.from(Object.entries(triggerVal)).map(([k, { v }]) => [k, v])
    );

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-------------------', triggerVal).pipe(
          autoPagination({
            resolveRoute: (conf, resp) =>
              ((!resp || resp.next) && [triggerVal[resp?.next || 'a']]) || []
          })
        )
      ).toBe('---a----b--cd---e----', expectedVal);
    });
  });
});

describe.skip('auto pagination - demo', function () {
  beforeEach(function () {
    vi.resetModules();
  });

  test('sample testing', async function () {
    const { autoPagination } = await import('./autoPagination');

    return new Promise(done => {
      return of(new URL('https://dummyjson.com/products'))
        .pipe(
          autoPagination({
            resolveRoute: async (url, resp) => {
              const data = (await resp?.json()) || { skip: -10, limit: 10 };

              if (!data.total || data.total > data.skip + data.limit) {
                const newUrl = new URL(`${url}`);
                newUrl.searchParams.set('skip', data.skip + data.limit);
                newUrl.searchParams.set('limit', data.limit);
                newUrl.searchParams.set('select', 'title,price');
                return newUrl;
              }
            }
          }),
          log(false),
          resolveJSON(),
          log(false),
          map(({ products }) => products),
          concatAll()
        )
        .subscribe({
          next: e => console.log(e),
          complete: () => done()
        });
    });
  });
});
