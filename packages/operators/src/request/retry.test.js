import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { networkRetry } from './retry';

describe('request retry', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).deep.equal(expected);
  });

  beforeEach(() => {
    //
  });

  afterEach(() => {
    //
  });

  test('classic testing', () => {
    //
  });

  test('marble testing', () => {
    const error = new Response('', { status: 500 });
    const success = new Response('a', { status: 200 });
    const orderedResponses = [error, error, success];

    testScheduler.run(({ cold, expectObservable }) => {
      // retry is repeating the sequence
      // if you define a delay, you have to add the delay to the subscribe multiple times (num retries)
      const stream = cold('a----------', {
        a: () => orderedResponses.shift()
      }).pipe(
        map(fn => fn()),
        networkRetry({ timeout: () => 5 })
      );

      const unsubA = '^----------!';
      expectObservable(stream, unsubA).toBe('----------a', { a: success }, new Error());
    });
  });
});
