import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import EstimateTime from './EstimateTime';
import { SECOND } from './utils';

describe('EstimateTime', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));

    vi.spyOn(global.Date, 'now').mockImplementation(() => testScheduler.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('calc estimate time - millisecond', async () => {
    const time = Date.now();

    const triggerVal = {
      a: { value: new TextEncoder().encode('abcd'), total: 20, period: time },
      b: { value: new TextEncoder().encode('edgh'), total: 20, period: time },
      c: { value: new TextEncoder().encode('ijkl'), total: 20, period: time },
      d: { value: new TextEncoder().encode('mnop'), total: 20, period: time },
      e: { value: new TextEncoder().encode('qrst'), total: 20, period: time }
    };

    const expectedVal = {
      a: 8,
      b: 6,
      c: 4,
      d: 2,
      e: 0
    };

    const estimateTime = EstimateTime.create();

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(estimateTime).toBe('--a-b-c-d-e|', expectedVal);
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(estimateTime)));
    });
  });

  test('calc estimate time - second', async () => {
    const time = Date.now();

    const triggerVal = {
      a: { value: new TextEncoder().encode('abcd'), total: 20, period: time },
      b: { value: new TextEncoder().encode('edgh'), total: 20, period: time },
      c: { value: new TextEncoder().encode('ijkl'), total: 20, period: time },
      d: { value: new TextEncoder().encode('mnop'), total: 20, period: time },
      e: { value: new TextEncoder().encode('qrst'), total: 20, period: time }
    };

    const expectedVal = {
      a: 0.008,
      b: 0.006,
      c: 0.004,
      d: 0.002,
      e: 0
    };

    const estimateTimeSecond = EstimateTime.create(SECOND);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(estimateTimeSecond).toBe('--a-b-c-d-e|', expectedVal);
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(estimateTimeSecond)));
    });
  });
});
