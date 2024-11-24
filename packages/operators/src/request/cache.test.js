import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { cache } from './cache';

describe('cache', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  test('default', () => {
    const initial = new Response('initial', { status: 200 });
    const updated = new Response('updated', { status: 200 });
    const orderedResponses = [initial, updated];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a', {
        a: () => orderedResponses.shift()
      }).pipe(
        map(fn => fn()),
        cache(2)
      );

      const unsubA = '-^!';
      expectObservable(stream, unsubA).toBe('-a', { a: initial }, new Error());

      const unsubB = '----^!';
      expectObservable(stream, unsubB).toBe('----a', { a: initial }, new Error());

      const unsubC = '---------^--!';
      expectObservable(stream, unsubC).toBe('---------a', { a: updated }, new Error());
    });
  });
});
