import { mockAsync } from '#mocks/async';
import { mockResponse } from '#mocks/response';
import { readFile } from 'node:fs/promises';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { test, describe, beforeEach, expect, vi, afterAll, beforeAll } from 'vitest';

import { log, logResult } from './log';
import { resolveJSON } from './response';
import Progress from './transfer/stats/Progress';

describe('request', () => {
  let testScheduler;

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockImplementation(v => mockAsync(v()));
    vi.spyOn(global, 'Response').mockImplementation(mockResponse());
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('dynamic timeout', async () => {
    const { request } = await import('./request');

    const expectedVal = {
      a: { status: 500, ok: false },
      b: new Error('NO CONNECTION'),
      c: { status: 200, ok: true }
    };

    const triggerVal = [
      () => expectedVal.a,
      () => {
        throw expectedVal.b;
      },
      () => expectedVal.c
    ];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', { a: () => triggerVal.shift()() }).pipe(
        log('operators:request:dynamicTimeout:request'),
        request(),
        log('operators:request:dynamicTimeout:response')
      );
      expectObservable(stream).toBe('5000ms c|', expectedVal);
    });
  });

  test('static timeout', async () => {
    const { request } = await import('./request');

    const expectedVal = {
      a: new Error('NO CONNECTION'),
      b: { status: 500, ok: false },
      c: { status: 200, ok: true }
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
        log('operators:request:staticTimeout:request'),
        request({ retryableStatuses: [500], retry: { timeout: () => 5 } }),
        log('operators:request:staticTimeout:response')
      );
      expectObservable(stream).toBe('----------c|', expectedVal);
    });
  });

  test('resolveJSON', async () => {
    const { requestJSON } = await import('./request');

    const expectedVal = {
      a: { hello: 'world' }
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(
        log('operators:request:resolveJSON:request'),
        requestJSON(),
        log('operators:request:resolveJSON:response')
      );
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('resolveText', async () => {
    const { requestText } = await import('./request');

    const expectedVal = {
      a: 'hello world'
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(
        log('operators:request:resolveText:request'),
        requestText(),
        log('operators:request:resolveText:response')
      );
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });

  test('resolveBlob', async () => {
    const { requestBlob } = await import('./request');

    const expectedVal = {
      a: new Blob(['a'], { type: 'text/plain' })
    };
    const triggerVal = {
      a: () => new Response(expectedVal.a)
    };

    // TODO: correctly compare blob - currently successful test, while blob content is different
    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a|', triggerVal).pipe(
        log('operators:request:resolveBlob:request'),
        requestBlob(),
        log('operators:request:resolveBlob:response')
      );
      expectObservable(stream).toBe('a|', expectedVal);
    });
  });
});

/* v8 ignore start */
describe('request - demo ', () => {
  beforeAll(async () => {
    // const nFetch = await import('node-fetch');
    // vi.spyOn(global, 'fetch').mockImplementation(nFetch.default);
    // vi.spyOn(global, 'Blob').mockImplementation(vi.fn((...arg) => new nFetch.Blob(...arg)));
    // vi.spyOn(global, 'File').mockImplementation(vi.fn((...arg) => new nFetch.File(...arg)));
    // vi.spyOn(global, 'FormData').mockImplementation(vi.fn((...arg) => new nFetch.FormData(...arg)));
    // vi.spyOn(global, 'Request').mockImplementation(vi.fn((...arg) => new nFetch.Request(...arg)));
    // vi.spyOn(global, 'Response').mockImplementation(vi.fn((...arg) => new nFetch.Response(...arg)));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('sample - successfull upload', async () => {
    const { request } = await import('./request');
    const blob = new Blob([await readFile('./packages/operators/fixtures/images/test_image.jpg')], {
      type: 'image/jpeg'
    });
    const file = new File([blob], 'test_image.jpg');
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request(new URL('https://api.escuelajs.co/api/v1/files/upload'), {
      method: 'POST',
      body: formData
    });

    const progressUpload = Progress.create();
    progressUpload.subscribe({
      next: e => console.log('UPLOAD', e),
      complete: () => console.log('complete')
    });

    const progressDownload = Progress.create();
    progressDownload.subscribe({
      next: e => console.log('DOWNLOAD', e),
      complete: () => console.log('complete')
    });

    await logResult(
      'demo',
      of(req).pipe(
        log('operators:request:upload'),
        request({ stats: { download: [progressDownload], upload: [progressUpload] } }),
        log('operators:request:upload:response'),
        resolveJSON()
        // tap(async e => console.log('TAGAUIUI', await e.text()))
      )
    );
  });
});

// TODO: fix these tests

// describe('test', () => {
//   test('progress on download', async () => {
//     const { request } = await import('./request');

//     const progress = Progress.create();
//     // progress.subscribe({ next: e => console.log('DOWNLOAD', e) });

//     const bandwidth = Bandwidth.create(MBYTE, SECOND);
//     // bandwidth.subscribe({ next: e => console.log('RATE', e) });

//     const timeEstimate = TimeEstimate.create(SECOND);
//     // timeEstimate.subscribe({ next: e => console.log('ESTIMATE', e) });

//     const elapsedTime = ElapsedTime.create(SECOND);
//     // elapsedTime.subscribe({ next: e => console.log('ELAPSED', e) });

//     const fileMap = {
//       VIDEO_170MB:
//         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
//       VIDEO_13MB:
//         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
//       SvgContentLengthValid: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/SVG_Logo.svg',
//       SvgContentLengthInvalid: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg'
//     };

//     const req = new Request(new URL(fileMap.VIDEO_13MB), {
//       method: 'GET'
//     });

//     const value = await lastValueFrom(
//       of(req).pipe(
//         request({ stats: { download: [progress, bandwidth, timeEstimate, elapsedTime] } }),
//         resolveBlob()
//         //
//       )
//     );
//     console.log('FINAL', value);
//     mkdirSync('.tmp', { recursive: true });
//     writeFileSync('.tmp/programming.mp4', global.Buffer.from(await value.arrayBuffer()));
//   });
// });

/* v8 ignore stop */

// describe('test', () => {
//   let testScheduler;

//   beforeAll(() => {
//     vi.spyOn(global, 'fetch').mockImplementation(v => mockAsync(v()));

//     global.Response = mockResponse();
//     global.Blob = mockBlob();
//   });

//   beforeEach(() => {
//     testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
//   });

//   afterAll(() => {
//     vi.restoreAllMocks();
//   });

//   test('huhu', async () => {
//     const { request, streamData } = await import('./request');
//     const { blobToJSON } = await import('./blob');

//     const expectedVal = {
//       request: {
//         a: { alphabet: 'The quick brown fox jumps over the lazy dog.' }
//       },
//       progress: {
//         a: { current: 11, total: 59 },
//         b: { current: 22, total: 59 },
//         c: { current: 33, total: 59 },
//         d: { current: 44, total: 59 },
//         e: { current: 55, total: 59 },
//         f: { current: 59, total: 59 }
//       }
//     };
//     const triggerVal = {
//       a: () => {
//         const buffer = new TextEncoder().encode(JSON.stringify(expectedVal.request.a));
//         console.log('HAA', buffer);
//         return new Response(
//           buffer,
//           '/a',
//           new Map([
//             ['content-type', 'text/plain'],
//             ['content-length', buffer.length]
//           ])
//         );
//       }
//     };

//     testScheduler.run(({ cold, expectObservable }) => {
//       const progress = new Subject();
//       const stream = cold('a|', triggerVal).pipe(
//         log('operators:request:resolveText:request'),
//         request(),
//         streamData(progress),
//         blobToJSON(),
//         log('operators:request:resolveText:response')
//       );
//       expectObservable(stream).toBe('a|', expectedVal.request);
//       expectObservable(progress).toBe('(abcdef|)', expectedVal.progress);
//     });
//   });
// });
