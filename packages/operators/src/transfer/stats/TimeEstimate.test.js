import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import TimeEstimate from './TimeEstimate';
import { SECOND } from './utils';

describe('TimeEstimate', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));

    vi.spyOn(global.Date, 'now').mockImplementation(() => testScheduler.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('time estimation - millisecond', async () => {
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

    const timeEstimate = TimeEstimate.create();

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(timeEstimate)));
      expectObservable(timeEstimate).toBe('--a-b-c-d-e|', expectedVal);
    });
  });

  test('time estimation - second', async () => {
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

    const timeEstimateSecond = TimeEstimate.create(SECOND);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(timeEstimateSecond)));
      expectObservable(timeEstimateSecond).toBe('--a-b-c-d-e|', expectedVal);
    });
  });

  test('time estimation - outage', async () => {
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
      b: Infinity,
      c: 0.905,
      d: 0.404,
      e: 0.152,
      f: 0
    };

    const timeEstimateSecond = TimeEstimate.create(SECOND);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('--a 600ms b-c-d-e|', triggerVal).pipe(tap(timeEstimateSecond)));
      expectObservable(timeEstimateSecond).toBe('--a 499ms b 100ms c-d-e-f|', expectedVal);
    });
  });
});
