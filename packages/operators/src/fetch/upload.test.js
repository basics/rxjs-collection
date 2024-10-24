import fetchMock from 'fetch-mock';
import { readFile } from 'node:fs/promises';
import { of } from 'rxjs';
import { afterEach, test, describe, beforeEach, expect } from 'vitest';

import { log } from '../log.js';
import { resolveJSON } from './resolve.js';
import { upload } from './upload.js';

describe('request observable with default operators', function () {
  beforeEach(function () {
    //
  });

  afterEach(function () {
    //
  });

  test('successfull request', async () => {
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
        .pipe(upload(), log(false), resolveJSON(), log(false))
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
