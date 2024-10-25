import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log';
import { distinctUntilResponseChanged, resolveJSON, resolveText } from './response';

describe('response', function () {
  beforeEach(function () {
    //
  });

  afterEach(function () {
    //
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
});
