import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { cache } from './cache';
import { log } from './log';

describe('cache', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  test('default', () => {
    const expectedVal = {
      a: new Response('initial', { status: 200 }),
      b: new Response('updated', { status: 200 })
    };

    const triggerVal = [expectedVal.a, expectedVal.b];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a', { a: () => triggerVal.shift() }).pipe(
        map(fn => fn()),
        log('operators:cache:default:input'),
        cache({ ttl: 2 })
        // log('operators:cache:default:output')
      );

      const unsubA = '-^!';
      expectObservable(stream, unsubA).toBe('-a', expectedVal, new Error());

      const unsubB = '----^!';
      expectObservable(stream, unsubB).toBe('----a', expectedVal, new Error());

      const unsubC = '---------^--!';
      expectObservable(stream, unsubC).toBe('---------b', expectedVal, new Error());
    });
  });
});