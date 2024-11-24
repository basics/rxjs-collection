import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, test, expect, describe, afterEach } from 'vitest';

import { mockOffline, mockOnline, mockReset } from '../../../mock/network.js';
import { connectionObservable } from './window.js';

// HINT: https://betterprogramming.pub/rxjs-testing-write-unit-tests-for-observables-603af959e251
describe('DOM/window: network', function () {
  let testScheduler;

  beforeEach(function () {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  afterEach(function () {
    mockReset();
  });

  test('online/offline detection', function () {
    const expectedValues = {
      a: true,
      b: false,
      c: true,
      d: false
    };

    const triggerValues = {
      // a: () => mockOnline(),
      b: () => mockOffline(),
      c: () => mockOnline(),
      d: () => mockOffline()
    };

    testScheduler.run(({ expectObservable, cold }) => {
      expectObservable(connectionObservable).toBe('a--b--c-----d', expectedValues);
      expectObservable(cold('---b--c-----d', triggerValues).pipe(tap(fn => fn())));
    });
  });

  test('proof reset by rerun online/offline detection', function () {
    const expectedValues = {
      a: true,
      b: false,
      c: true,
      d: false
    };

    const triggerValues = {
      // a: () => mockOnline(),
      b: () => mockOffline(),
      c: () => mockOnline(),
      d: () => mockOffline()
    };

    testScheduler.run(({ expectObservable, cold }) => {
      expectObservable(connectionObservable).toBe('a--b--c-----d', expectedValues);
      expectObservable(cold('---b--c-----d', triggerValues).pipe(tap(fn => fn())));
    });
  });
});
