import { concatMap, delay, of, tap, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { concurrentRequest } from './concurrentRequest';

describe('multi fetch33', function () {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(function () {
    vi.mock('./request.js', async importOriginal => {
      return {
        request: () => source => source.pipe(concatMap(({ v, t }) => of(v).pipe(delay(t))))
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('test', async () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => ({ v, t: Math.random() * 1000 }));
    const sortedResult = [...values].sort((a, b) => a.t - b.t).map(({ v }) => v);

    await new Promise(done => {
      of(...values)
        .pipe(concurrentRequest(values.length), toArray())
        .subscribe({ next: e => expect(e).to.eql(sortedResult), complete: () => done() });
    });
  });

  test('test2', async () => {
    const triggerValues = {
      a: { t: 2, v: 'a' },
      b: { t: 5, v: 'b' },
      c: { t: 0, v: 'c' },
      d: { t: 1, v: 'd' },
      e: { t: 1, v: 'd' }
    };
    const expectedValues = Object.fromEntries(
      Array.from(Object.entries(triggerValues)).map(([k, { v }]) => [k, v])
    );

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('-a-b-c-(de)', triggerValues).pipe(concurrentRequest(3), tap())).toBe(
        '---a-c--(bde)',
        expectedValues
      );
    });
  });
});
