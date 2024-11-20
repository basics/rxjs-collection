import fetchMock from 'fetch-mock';
import { readFile } from 'node:fs/promises';
import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log.js';
import { request, requestJSON } from './request.js';
import { resolveJSON } from './response.js';

describe('request observable with default ', () => {
  test('successfull upload', async () => {
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

    return new Promise(done => {
      of(req)
        .pipe(request(), log(false), resolveJSON(), log(true))
        .subscribe({
          next: e => {
            expect(e)
              .deep.includes({ originalname: 'test_image.jpg' })
              .have.all.keys('filename', 'location');
          },
          complete: () => done()
        });
    });
  });
});

describe('request observable with default operators', () => {
  beforeEach(() => {
    let counter = 0;
    fetchMock.mockGlobal().get(
      'https://httpbin.org/my-url-fast',
      () => {
        return new Response(JSON.stringify({ hello: 'fast world' }), {
          status: ++counter > 2 ? 200 : 404,
          headers: { 'Content-type': 'application/json' }
        });
      },
      { delay: 0, repeat: 4 }
    );

    fetchMock.get(
      'https://awesome.mock/delayed-response',
      () => {
        return new Response(JSON.stringify({ hello: 'fast world' }), {
          status: 200,
          headers: { 'Content-type': 'application/json' }
        });
      },
      { delay: 1000 }
    );
  });

  afterEach(() => {
    fetchMock.unmockGlobal();
  });

  test('successfull request', () =>
    new Promise(done => {
      of('https://httpbin.org/my-url-fast')
        .pipe(request(), log(false))
        .subscribe({
          next: resp => expect(resp).deep.includes({ ok: true }),
          complete: () => done()
        });
    }));

  test('successfull request - indirect json resolve', () =>
    new Promise(done => {
      of('https://awesome.mock/delayed-response')
        .pipe(request(), log(false), resolveJSON(), log(false))
        .subscribe({
          next: data => expect(data).deep.equal({ hello: 'fast world' }),
          complete: () => done()
        });
    }));

  test('successfull request - direct json resolve', () =>
    new Promise(done => {
      of('https://awesome.mock/delayed-response')
        .pipe(requestJSON(), log(false))
        .subscribe({
          next: data => expect(data).deep.equal({ hello: 'fast world' }),
          complete: () => done()
        });
    }));
});
