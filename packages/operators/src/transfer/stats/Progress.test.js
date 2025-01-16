import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import Progress from './Progress';

describe('Progress', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  test('calc progress', async () => {
    const triggerVal = {
      a: { value: new TextEncoder().encode('abc'), total: 26, period: 10 },
      b: { value: new TextEncoder().encode('def'), total: 26, period: 20 },
      c: { value: new TextEncoder().encode('ghi'), total: 26, period: 30 },
      d: { value: new TextEncoder().encode('jkl'), total: 26, period: 40 },
      e: { value: new TextEncoder().encode('mno'), total: 26, period: 50 },
      f: { value: new TextEncoder().encode('pqr'), total: 26, period: 60 },
      g: { value: new TextEncoder().encode('stu'), total: 26, period: 70 },
      h: { value: new TextEncoder().encode('vwx'), total: 26, period: 80 },
      i: { value: new TextEncoder().encode('yz'), total: 26, period: 90 }
    };

    const expectedVal = {
      a: 11,
      b: 23,
      c: 34,
      d: 46,
      e: 57,
      f: 69,
      g: 80,
      h: 92,
      i: 100
    };

    const progress = Progress.create();

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b-c-d-e-f-g-h-i|', triggerVal).pipe(tap(progress)));
      expectObservable(progress).toBe('a-b-c-d-e-f-g-h-i|', expectedVal);
    });
  });
});
