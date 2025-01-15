import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import TransferRate from './TransferRate';
import { KBIT } from './utils';

describe('TransferRate', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));

    vi.spyOn(global.Date, 'now').mockImplementation(() => testScheduler.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('calc transfer rate', async () => {
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

    const transferRate = TransferRate.create(KBIT);

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(transferRate).toBe('--a-b-c-d-e|', expectedVal);
      expectObservable(cold('--a-b-c-d-e|', triggerVal).pipe(tap(transferRate)));
    });
  });
});
