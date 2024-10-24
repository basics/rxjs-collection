import { map, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { networkRetry } from './retry';

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
      .pipe(map(() => ({ ok: !(++counter < 3) })))
      .pipe(networkRetry({ timeout: () => 1000 }));

    testScheduler.run(({ expectObservable }) => {
      expectObservable(mockObservable).toBe('2000ms (a|)', {
        a: { ok: true }
      });
    });
  });
});
