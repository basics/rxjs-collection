import { mockAsync } from '#mocks/async.js';
import { mockResponse } from '#mocks/response.js';
import { readFile } from 'node:fs/promises';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { test, describe, beforeEach, expect, vi, afterAll, beforeAll } from 'vitest';

import { log, logResult } from '../log.js';
import { resolveJSON } from './response.js';

describe('request', () => {
  let testScheduler;

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockImplementation(v => mockAsync(v()));

    global.Response = mockResponse();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('dynamic timeout', async () => {
    const { request } = await import('./request.js');

    const expectedVal = {
      a: new Error('NO CONNECTION'),
      b: { ok: false },
      c: { ok: true }
    };

    const triggerVal = [
      () => {
        throw expectedVal.a;
      },
      () => expectedVal.b,
      () => expectedVal.c
    ];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', { a: () => triggerVal.shift()() }).pipe(request());
      expectObservable(stream).toBe('5000ms c|', expectedVal);
    });
  });

  test('static timeout', async () => {
    const { request } = await import('./request.js');

    const expectedVal = {
      a: new Error('NO CONNECTION'),
      b: { ok: false },
      c: { ok: true }
    };

    const triggerVal = [
      () => {
        throw expectedVal.a;
      },
      () => expectedVal.b,
      () => expectedVal.c
    ];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', { a: () => triggerVal.shift()() }).pipe(
        request({ retry: { timeout: () => 5 } })
      );
      expectObservable(stream).toBe('----------c|', expectedVal);
    });
  });

  test('resolveJSON', async () => {
    const { requestJSON } = await import('./request.js');

    const expectedVal = {
      a: { hello: 'world' }
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(requestJSON());
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('resolveText', async () => {
    const { requestText } = await import('./request.js');

    const expectedVal = {
      a: 'hello world'
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(requestText());
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('resolveBlob', async () => {
    const { requestBlob } = await import('./request.js');

    const expectedVal = {
      a: new Blob(['a'], { type: 'text/plain' })
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    // TODO: correctly compare blob - currently successful test, while blob content is different
    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(requestBlob());
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });
});

/* v8 ignore start */
describe.skip('request - demo ', () => {
  test('sample - successfull upload', async () => {
    const { request } = await import('./request.js');

    const formData = new FormData();
    formData.set(
      'file',
      new File(
        [
          new Blob([await readFile('./packages/operators/fixtures/images/test_image.jpg')], {
            type: 'image/jpeg'
          })
        ],
        'test_image.jpg'
      )
    );

    const req = new Request(new URL('https://api.escuelajs.co/api/v1/files/upload'), {
      method: 'POST',
      body: formData
    });

    await logResult(
      'demo',
      of(req).pipe(log('request:upload'), request(), log('request:upload:response'), resolveJSON())
    );
  });
});
/* v8 ignore stop */
