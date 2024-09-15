import { beforeEach, describe, expect, test } from 'vitest';
import { networkRetry } from './retry';
import { TestScheduler } from 'rxjs/testing';
import { map, of } from 'rxjs';

describe('request retry', function () {
  let testScheduler;

  beforeEach(function () {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  test('network retry', async function () {
    let counter = 0;

    const mockObservable = of(null)
      .pipe(
        map(() => {
          counter++;
          if (counter < 3) {
            return { ok: false };
          }
          return { ok: true };
        })
      )
      .pipe(networkRetry({ timeout: () => 1000 }));

    testScheduler.run(({ expectObservable }) => {
      expectObservable(mockObservable).toBe('2000ms (a|)', {
        a: { ok: true }
      });
    });
  });
});
