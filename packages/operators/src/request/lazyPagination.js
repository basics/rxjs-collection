import { concatMap, map, tap } from 'rxjs';

import { concurrentRequest } from './concurrentRequest';

export const lazyPagination = ({ pager, concurrent, resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url }) => {
        return pager.pipe(
          map(options => resolveRoute(url, options)),
          concurrentRequest(concurrent)
        );
      })
    );
};
