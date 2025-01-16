import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import ElapsedTime from './ElapsedTime';
import { SECOND } from './utils';

describe('ElapsedTime', () => {
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
      a: { value: new TextEncoder().encode('abc'), total: 26, period: time },
      b: { value: new TextEncoder().encode('def'), total: 26, period: time },
      c: { value: new TextEncoder().encode('ghi'), total: 26, period: time },
      d: { value: new TextEncoder().encode('jkl'), total: 26, period: time },
      e: { value: new TextEncoder().encode('mno'), total: 26, period: time },
      f: { value: new TextEncoder().encode('pqr'), total: 26, period: time },
      g: { value: new TextEncoder().encode('stu'), total: 26, period: time },
      h: { value: new TextEncoder().encode('vwx'), total: 26, period: time },
      i: { value: new TextEncoder().encode('yz'), total: 26, period: time }
    };

    const expectedVal = {
      a: 0,
      b: 2,
      c: 4,
      d: 6,
      e: 8,
      f: 10,
      g: 12,
      h: 14,
      i: 16
    };

    const elapsedTime = ElapsedTime.create();

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b-c-d-e-f-g-h-i|', triggerVal).pipe(tap(elapsedTime)));
      expectObservable(elapsedTime).toBe('a-b-c-d-e-f-g-h-i|', expectedVal);
    });
  });

  test('calc estimate time - second', async () => {
    const time = Date.now();

    const triggerVal = {
      a: { value: new TextEncoder().encode('abc'), total: 26, period: time },
      b: { value: new TextEncoder().encode('def'), total: 26, period: time },
      c: { value: new TextEncoder().encode('ghi'), total: 26, period: time },
      d: { value: new TextEncoder().encode('jkl'), total: 26, period: time },
      e: { value: new TextEncoder().encode('mno'), total: 26, period: time },
      f: { value: new TextEncoder().encode('pqr'), total: 26, period: time },
      g: { value: new TextEncoder().encode('stu'), total: 26, period: time },
      h: { value: new TextEncoder().encode('vwx'), total: 26, period: time },
      i: { value: new TextEncoder().encode('yz'), total: 26, period: time }
    };

    const expectedVal = {
      a: 0.0,
      b: 0.002,
      c: 0.004,
      d: 0.006,
      e: 0.008,
      f: 0.01,
      g: 0.012,
      h: 0.014,
      i: 0.016
    };

    const elapsedTimeSecond = ElapsedTime.create(SECOND);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b-c-d-e-f-g-h-i|', triggerVal).pipe(tap(elapsedTimeSecond)));
      expectObservable(elapsedTimeSecond).toBe('a-b-c-d-e-f-g-h-i|', expectedVal);
    });
  });
});
