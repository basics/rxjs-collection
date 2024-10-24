import { concatAll, map, of } from 'rxjs';
import { beforeEach, describe, expect, test } from 'vitest';

import { autoPagination } from './autoPagination';
import { resolveJSON } from './resolve';

describe('auto pagination', function () {
  beforeEach(function () {
    //
  });

  test('auto pagination', async function () {
    return new Promise(done => {
      return of({ url: new URL('https://dummyjson.com/products') })
        .pipe(
          autoPagination({
            resolveRoute: async (url, resp) => {
              const data = (await resp?.json()) || { skip: -10, limit: 10 };

              if (!data.total || data.total > data.skip + data.limit) {
                const newUrl = new URL(`${url}`);
                newUrl.searchParams.set('skip', data.skip + data.limit);
                newUrl.searchParams.set('limit', data.limit);
                newUrl.searchParams.set('select', 'title,price');
                return newUrl;
              }
            }
          }),
          resolveJSON(),
          map(({ products }) => products),
          concatAll()
        )
        .subscribe({
          next: e => console.log(e),
          complete: () => {
            console.log('COMPLETE');
            done();
          }
        });
    });
  });
});
