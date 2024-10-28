import { concatAll, map, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, test } from 'vitest';

import { log } from '../log';
import { lazyPagination } from './lazyPagination';
import { resolveJSON } from './response';

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
            resolveRoute: (url, { value, limit = 10 }) => {
              const newUrl = new URL(`${url}`);
              newUrl.searchParams.set('skip', value * limit);
              newUrl.searchParams.set('limit', limit);
              newUrl.searchParams.set('select', 'title,price');
              return newUrl;
            }
          }),
          log(false),
          resolveJSON(),
          log(false),
          map(({ products }) => products),
          concatAll(),
          log(false)
        )
        .subscribe({
          next: e => console.log(e),
          complete: () => done()
        });

      pager.next({ value: 2 });
      pager.next({ value: 3 });
      pager.next({ value: 12 });
      pager.next({ value: 5 });
      pager.next({ value: 6 });
      pager.next({ value: 7 });
      pager.next({ value: 8 });
      pager.next({ value: 9 });
      pager.complete();
    });
  });
});
