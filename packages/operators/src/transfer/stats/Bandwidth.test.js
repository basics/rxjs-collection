import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Bandwidth from './Bandwidth';
import { KBIT } from './utils';

describe('Bandwidth', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));

    vi.spyOn(global.Date, 'now').mockImplementation(() => testScheduler.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('calc bandwidth', async () => {
    const time = Date.now();

    const triggerVal = {
      a: { value: new TextEncoder().encode('abcd'), total: 20, period: time },
      b: { value: new TextEncoder().encode('edgh'), total: 20, period: time },
      c: { value: new TextEncoder().encode('ijkl'), total: 20, period: time },
      d: { value: new TextEncoder().encode('mnop'), total: 20, period: time },
      e: { value: new TextEncoder().encode('qrst'), total: 20, period: time }
    };

    const expectedVal = {
      a: 15.625,
      b: 15.625,
      c: 15.625,
      d: 15.625,
      e: 15.625
    };

    const bandwidth = Bandwidth.create(KBIT);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(bandwidth)));
      expectObservable(bandwidth).toBe('--a-b-c-d-e|', expectedVal);
    });
  });

  test('bandwidth outage', async () => {
    const time = Date.now();

    const triggerVal = {
      a: { value: new TextEncoder().encode('abcd'), total: 20, period: time },
      b: { value: new TextEncoder().encode('edgh'), total: 20, period: time },
      c: { value: new TextEncoder().encode('ijkl'), total: 20, period: time },
      d: { value: new TextEncoder().encode('mnop'), total: 20, period: time },
      e: { value: new TextEncoder().encode('qrst'), total: 20, period: time }
    };

    const expectedVal = {
      a: 15.625,
      b: 0,
      c: 0.10364842454394693,
      d: 0.15495867768595042,
      e: 0.20593080724876442,
      f: 0.256568144499179
    };

    const bandwidth = Bandwidth.create(KBIT);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('--a 600ms b-c-d-e|', triggerVal).pipe(tap(bandwidth)));
      expectObservable(bandwidth).toBe('--a 499ms b 100ms c-d-e-f|', expectedVal);
    });
  });
});
