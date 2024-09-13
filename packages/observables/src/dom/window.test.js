import { tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { connectionObservable } from './window.js';
import { mockOffline, mockOnline } from '../../../test-utils/network.js';
import { beforeEach, test, expect, describe } from 'vitest';

// HINT: https://betterprogramming.pub/rxjs-testing-write-unit-tests-for-observables-603af959e251
describe('DOM/window: network', function () {
  let testScheduler;

  beforeEach(function () {
    mockOnline();

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
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

  test('proof rerun online/offline detection', function () {
    const expectedValues = {
      a: true,
      b: false,
      c: true,
      d: false
    };

    const triggerValues = {
      a: () => mockOnline(),
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
