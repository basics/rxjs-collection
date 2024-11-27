import { mockResponse } from '#mocks/response.js';
import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { cache } from './cache';
import { log } from './log';

describe('cache', () => {
  let testScheduler;

  beforeAll(async () => {
    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', () => {
    const expectedVal = {
      a: new Response('initial'),
      b: new Response('updated')
    };

    const triggerVal = [expectedVal.a, expectedVal.b];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a', { a: () => triggerVal.shift() }).pipe(
        map(fn => fn()),
        log('operators:cache:default:input'),
        cache({ ttl: 2 }),
        log('operators:cache:default:output')
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
