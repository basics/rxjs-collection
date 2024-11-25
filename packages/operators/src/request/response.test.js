import { mockResponse } from '#mocks/response';
import { concatMap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, test, describe, beforeEach, expect, vi, beforeAll } from 'vitest';

import { log } from '../log';
import { distinctUntilResponseChanged, resolveJSON, resolveText } from './response';

describe('response', () => {
  let testScheduler;

  beforeAll(() => {
    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).to.eql(expected));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('resolveJSON', () => {
    const expectedVal = {
      a: { hello: 'world' }
    };
    const triggerVal = {
      a: new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(resolveJSON());
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('resolveText', () => {
    const expectedVal = {
      a: 'hello world'
    };
    const triggerVal = {
      a: new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(resolveText());
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('filtered by response change', async () => {
    const expectedVal = {
      a: await new Blob(['a']).arrayBuffer(),
      b: await new Blob(['a']).arrayBuffer(),
      c: await new Blob(['b']).arrayBuffer(),
      d: await new Blob(['b']).arrayBuffer(),
      e: await new Blob(['c']).arrayBuffer(),
      f: await new Blob(['a']).arrayBuffer(),
      g: await new Blob(['a']).arrayBuffer(),
      h: await new Blob(['b']).arrayBuffer()
    };

    const triggerValues = {
      a: new Response(expectedVal.a, '/a'),
      b: new Response(expectedVal.b, '/b'),
      c: new Response(expectedVal.c, '/c'),
      d: new Response(expectedVal.d, '/d'),
      e: new Response(expectedVal.e, '/e'),
      f: new Response(expectedVal.f, '/f'),
      g: new Response(expectedVal.g, '/g'),
      h: new Response(expectedVal.h, '/h')
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-b-c-d-e-f-g-h-|', triggerValues).pipe(
          distinctUntilResponseChanged(),
          concatMap(resp => resp.arrayBuffer()),
          log('marble:result')
        )
      ).toBe('-a---c---e-f---h-|', expectedVal);
    });
  });
});
