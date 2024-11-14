import { map, of, tap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterEach, test, describe, beforeEach, expect, vi } from 'vitest';

import { log } from '../log';
import { distinctUntilResponseChanged, resolveJSON, resolveText } from './response';

describe('response', function () {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).to.eql(expected);
  });

  beforeEach(function () {
    //
  });

  afterEach(function () {
    vi.restoreAllMocks();
  });

  test('resolve json', () => {
    return new Promise(done => {
      of(new Response(JSON.stringify({ hello: 'world' })))
        .pipe(resolveJSON(), log(false))
        .subscribe({
          next: e => expect(e).includes({ hello: 'world' }),
          complete: () => done()
        });
    });
  });

  test('resolve text', () => {
    return new Promise(done => {
      of(new Response('hello world'))
        .pipe(resolveText(), log(false))
        .subscribe({
          next: e => expect(e).toBe('hello world'),
          complete: () => done()
        });
    });
  });

  test('emit only changed responses', () => {
    const triggerValues = [
      new Response('a'),
      new Response('a'),
      new Response('b'),
      new Response('b'),
      new Response('c'),
      new Response('a'),
      new Response('a'),
      new Response('b')
    ];
    const expectedValues = ['a', 'b', 'c', 'a', 'b'];

    return new Promise(done => {
      of(...triggerValues)
        .pipe(distinctUntilResponseChanged(), log(false), resolveText(), log(false))
        .subscribe({
          next: e => expect(e).toBe(expectedValues.shift()),
          complete: () => done()
        });
    });
  });

  test('marble testing', async () => {
    const triggerValues = {
      a: createResponse('a', 'a'),
      b: createResponse('b', 'a'),
      c: createResponse('c', 'b'),
      d: createResponse('d', 'b'),
      e: createResponse('e', 'c'),
      f: createResponse('f', 'a'),
      g: createResponse('g', 'a'),
      h: createResponse('h', 'b')
    };

    const expectedValues = Object.fromEntries(
      await Promise.all(
        Object.entries(triggerValues).map(async ([key, resp]) => {
          return [`/${key}`, await resp.clone().arrayBuffer()];
        })
      )
    );

    vi.spyOn(Response.prototype, 'arrayBuffer').mockImplementation(function (e) {
      return [expectedValues[this.url]];
    });

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('-a-b-c-d-e-f-g-h-', triggerValues).pipe(
          distinctUntilResponseChanged(),
          map(resp => resp.arrayBuffer())
        )
      ).toBe('-a---c---e-f---h-', {
        a: triggerValues.a.arrayBuffer(),
        c: triggerValues.c.arrayBuffer(),
        e: triggerValues.e.arrayBuffer(),
        f: triggerValues.f.arrayBuffer(),
        h: triggerValues.h.arrayBuffer()
      });
    });
  });
});

const createResponse = (key, value) => {
  const resp = new Response(value);
  Object.defineProperty(resp, 'url', { value: `/${key}` });
  return resp;
};
