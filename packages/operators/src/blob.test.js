import { mockBlob } from '#mocks/blob.js';
import fs from 'node:fs';
import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('blob', () => {
  let testScheduler;

  beforeEach(() => {
    vi.spyOn(global, 'Blob').mockImplementation(mockBlob());
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('blob to text', async () => {
    const { blobToText } = await import('./blob.js');

    const expectedVal = {
      a: 'hello world',
      b: 'foo bar'
    };

    const triggerVal = {
      a: new Blob([new TextEncoder().encode(expectedVal.a)], 'text/plain'),
      b: new Blob([new TextEncoder().encode(expectedVal.b)], 'text/plain')
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b|', triggerVal).pipe(blobToText())).toBe('a-b|', expectedVal);
    });
  });

  test('blob to json', async () => {
    const { blobToJSON } = await import('./blob.js');

    const expectedVal = {
      a: { hello: 'world' },
      b: { foo: 'bar' }
    };

    const triggerVal = {
      a: new Blob([new TextEncoder().encode(JSON.stringify(expectedVal.a))], 'application/json'),
      b: new Blob([new TextEncoder().encode(JSON.stringify(expectedVal.b))], 'application/json')
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b|', triggerVal).pipe(blobToJSON())).toBe('a-b|', expectedVal);
    });
  });

  test('blob to xml', async () => {
    const { blobToXML } = await import('./blob.js');

    const expectedVal = {
      a: new DOMParser().parseFromString('<xml></xml>', 'text/xml'),
      b: new DOMParser().parseFromString('<xml><a></a></xml>', 'text/xml')
    };

    const triggerVal = {
      a: new Blob([new TextEncoder().encode('<xml></xml>')], 'text/xml'),
      b: new Blob([new TextEncoder().encode('<xml><a></a></xml>')], 'text/xml')
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b|', triggerVal).pipe(blobToXML())).toBe('a-b|', expectedVal);
    });
  });

  test('blob to url', async () => {
    vi.restoreAllMocks();

    const { blobToURL } = await import('./blob.js');

    const triggerVal = {
      a: new Blob([fs.readFileSync(`${__dirname}/../fixtures/videos/demo.mp4`)], 'video/mp4')
    };

    const expectedVal = {
      a: 'blob:nodedata:'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('a|', triggerVal).pipe(
          blobToURL(),
          map(v => v.replace(/([a-z0-9-]+)$/, ''))
        )
      ).toBe('a|', expectedVal);
    });
  });

  test('blob to (auto detect)', async () => {
    const { blobTo } = await import('./blob.js');

    const expectedVal = {
      a: 'hello world',
      b: { foo: 'bar' },
      c: new DOMParser().parseFromString('<xml><a></a></xml>', 'text/xml'),
      d: new Blob([new TextEncoder().encode('aha')], 'x-text/plain')
    };

    const triggerVal = {
      a: new Blob([new TextEncoder().encode('hello world')], 'text/plain'),
      b: new Blob([new TextEncoder().encode(JSON.stringify({ foo: 'bar' }))], 'application/json'),
      c: new Blob([new TextEncoder().encode('<xml><a></a></xml>')], 'text/xml'),
      d: expectedVal.d
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a-b-c-d|', triggerVal).pipe(blobTo())).toBe('a-b-c-d|', expectedVal);
    });
  });
});
