import fetchMock from 'fetch-mock';
import { defer, delay, from, interval, map, mapTo, of, tap, throttleTime } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { cache } from './cache';
import { requestText } from './request';

describe('cache - mocked', function () {
  beforeEach(function () {
    //
  });

  afterEach(function () {
    //
  });

  test.skip('cache resetted after 100ms', async function () {
    let counter = 0;
    const a = of(counter).pipe(
      tap(e => console.log('U', e)),
      cache(5)
    );

    defer(() => a)
      .pipe(delay(2))
      .subscribe(e => console.log(e));
    defer(() => a)
      .pipe(delay(2))
      .subscribe(e => console.log(e));

    await new Promise(done => setTimeout(done), 500);

    defer(() => a)
      .pipe(delay(100))
      .subscribe(e => console.log(e));

    await new Promise(done => setTimeout(done), 1000);
  });
});

describe('cache', function () {
  beforeEach(function () {
    let counter = 0;
    fetchMock.mockGlobal().get(
      'https://httpbin.org/my-url-fast',
      () =>
        new Response(++counter, {
          status: 200,
          headers: { 'Content-type': 'plain/text' }
        }),
      { delay: 0, repeat: 2 }
    );
  });

  afterEach(function () {
    fetchMock.unmockGlobal();
  });

  test('cache resetted after 100ms', async function () {
    const a = of('https://httpbin.org/my-url-fast').pipe(
      requestText(),
      tap(() => console.log('CHECK')),
      cache(1000)
    );
    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('1'),
        complete: () => done()
      });
    });

    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('1'),
        complete: () => done()
      });
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await new Promise(done => {
      a.subscribe({
        next: e => expect(e).toBe('2'),
        complete: () => done()
      });
    });
  });
});
