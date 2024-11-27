import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { log } from './log';
import { pipeWhen } from './when';

describe('when', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', () => {
    const triggerVal = {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    };

    const expectedVal = {
      a: 1,
      b: 4,
      c: 3,
      d: 16
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a-b-c-d|', triggerVal).pipe(
        log('operators:when:pipe:input'),
        pipeWhen(
          v => !(v % 2),
          map(v => v * v)
        ),
        log('operators:when:pipe:output')
      );
      expectObservable(stream).toBe('a-b-c-d|', expectedVal);
    });
  });
});
