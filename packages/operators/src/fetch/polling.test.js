import { concatAll, map, of } from 'rxjs';
import { beforeEach, describe, expect, test } from 'vitest';

import { polling } from './polling';

describe('polling', function () {
  beforeEach(function () {
    //
  });

  test('auto polling', async function () {
    return new Promise(done => {
      of({ url: new URL('https://dummyjson.com/products') })
        .pipe(
          polling({
            validateResult: data => {
              return data.total > data.skip + data.limit;
            }
          })
          // map(({ data: { products } }) => products),
          // concatAll()
        )
        .subscribe({
          next: e => console.log('aha'),
          complete: () => done()
        });
    });
  });
});
