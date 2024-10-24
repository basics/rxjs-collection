import { concatAll, map, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, test } from 'vitest';

import { lazyPagination } from './lazyPagination';
import { resolveJSON } from './resolve';

describe('lazy pagination operator', function () {
  beforeEach(function () {
    //
  });

  test('successfull lazy pagination', async function () {
    const pager = new Subject();

    return new Promise(done => {
      of({ url: new URL('https://dummyjson.com/products'), pager, concurrent: 4 })
        .pipe(
          lazyPagination({
            createRoute: (url, { value, limit = 10 }) => {
              const newUrl = new URL(`${url}`);
              newUrl.searchParams.set('skip', value * limit);
              newUrl.searchParams.set('limit', limit);
              newUrl.searchParams.set('select', 'title,price');
              return newUrl;
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

      pager.next({ value: 2 });
      pager.next({ value: 3 });
      pager.next({ value: 4 });
      pager.next({ value: 5 });
      pager.next({ value: 6 });
      pager.next({ value: 7 });
      pager.next({ value: 8 });
      pager.next({ value: 9 });
      pager.complete();
    });
  });
});
