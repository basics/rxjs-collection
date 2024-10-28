import { concatAll, map, of } from 'rxjs';

import { log } from '../log';
import { concurrentRequest } from './concurrentRequest';
import { resolveJSON } from './response';

await new Promise(done => {
  of(
    new URL('https://dummyjson.com/products?limit=10&skip=0&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=10&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=20&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=30&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=40&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=50&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=60&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=70&select=title,price'),
    new URL('https://dummyjson.com/products?limit=10&skip=80&select=title,price')
  )
    .pipe(
      concurrentRequest(4),
      log(false),
      resolveJSON(),
      log(false),
      map(({ products }) => products),
      concatAll()
    )
    .subscribe({
      next: e => console.log(e),
      complete: () => done()
    });
});
