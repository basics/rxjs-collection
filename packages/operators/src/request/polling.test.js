import { mockAsync } from '#mocks/async';
import { mockResponse } from '#mocks/response';
import { concatMap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { log } from '../log';

describe('polling', () => {
  let testScheduler;

  beforeAll(async () => {
    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).to.eql(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', async () => {
    const { polling } = await import('./polling');

    const expectedVal = {
      a: await new Blob(['a']).arrayBuffer(),
      b: await new Blob(['a']).arrayBuffer(),
      c: await new Blob(['a']).arrayBuffer(),
      d: await new Blob(['b']).arrayBuffer(),
      e: await new Blob(['b']).arrayBuffer(),
      f: await new Blob(['c']).arrayBuffer(),
      g: await new Blob(['c']).arrayBuffer()
    };

    const triggerVal = [
      new Response(expectedVal.a),
      new Response(expectedVal.b),
      new Response(expectedVal.c),
      new Response(expectedVal.d),
      new Response(expectedVal.e),
      new Response(expectedVal.f),
      new Response(expectedVal.g)
    ];

    vi.spyOn(global, 'fetch').mockImplementation(() => mockAsync(triggerVal.shift()));

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a------------', { a: 'a' }).pipe(
        log('operators:request:polling:input'),
        polling(2),
        concatMap(e => e.arrayBuffer()),
        log('operators:request:polling:output')
      );

      const unsubA = '^------------!';
      expectObservable(stream, unsubA).toBe('a-----d---f--', expectedVal);
    });
  });
});
