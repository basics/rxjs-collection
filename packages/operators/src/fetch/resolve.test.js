import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log';
import { resolveJSON, resolveText } from './resolve';

describe('resolver', function () {
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
});
