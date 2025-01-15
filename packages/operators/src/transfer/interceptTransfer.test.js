import { mockBlob } from '#mocks/blob.js';
import { mockResponse } from '#mocks/response.js';
import fs from 'node:fs';
import { of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { interceptTransfer } from './interceptTransfer';

describe('intercept transfer', () => {
  let testScheduler;

  beforeAll(() => {
    vi.spyOn(global, 'Blob').mockImplementation(mockBlob());
    vi.spyOn(global, 'Response').mockImplementation(mockResponse());
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  test('intercept response', async () => {
    const blob = new Blob(
      [fs.readFileSync(`${__dirname}/../../fixtures/videos/demo.mp4`)],
      'video/mp4'
    );

    const intercept = new Subject();

    const triggerVal = {
      a: new Response(blob, { status: 200 })
    };

    // testScheduler.run(({ cold, expectObservable }) => {
    //   expectObservable(bypass).toBe('a');
    //   expectObservable(cold('a|', triggerVal).pipe(interceptTransfer([bypass])));
    // });
  });
});
