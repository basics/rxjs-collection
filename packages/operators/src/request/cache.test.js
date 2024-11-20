import fetchMock from 'fetch-mock';
import { defer, delay, map, of, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { cache } from './cache';
import { requestText } from './request';

describe('cache - mocked', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).deep.equal(expected);
  });

  beforeEach(() => {
    //
  });

  afterEach(() => {
    //
  });

  test('marble testing', () => {
    const initial = new Response('initial', { status: 200 });
    const updated = new Response('updated', { status: 200 });
    const orderedResponses = [initial, updated];

    testScheduler.run(({ cold, expectObservable }) => {
      const stream = cold('a-----------', {
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

  test('cache resetted after 100ms', async () => {
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

describe('cache', () => {
  beforeEach(() => {
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

  afterEach(() => {
    fetchMock.unmockGlobal();
  });

  test('cache resetted after 100ms', async () => {
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
