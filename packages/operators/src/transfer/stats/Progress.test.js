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
      a: { bytes: new TextEncoder().encode('abc'), total: 26 },
      b: { bytes: new TextEncoder().encode('def'), total: 26 },
      c: { bytes: new TextEncoder().encode('ghi'), total: 26 },
      d: { bytes: new TextEncoder().encode('jkl'), total: 26 },
      e: { bytes: new TextEncoder().encode('mno'), total: 26 },
      f: { bytes: new TextEncoder().encode('pqr'), total: 26 },
      g: { bytes: new TextEncoder().encode('stu'), total: 26 },
      h: { bytes: new TextEncoder().encode('vwx'), total: 26 },
      i: { bytes: new TextEncoder().encode('yz'), total: 26 }
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
