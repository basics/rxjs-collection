import { concatMap, map } from 'rxjs';

import { concurrentRequest } from './concurrentRequest';

export const lazyPagination = ({ resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url, pager, concurrent }) => {
        return pager.pipe(
          map(options => resolveRoute(url, options)),
          concurrentRequest(concurrent)
        );
      })
    );
};
