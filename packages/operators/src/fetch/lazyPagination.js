import { concatMap, map } from 'rxjs';

import { concurrentDownload } from './concurrentDownload';

export const lazyPagination = ({ resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url, pager, concurrent }) => {
        return pager.pipe(
          map(options => resolveRoute(url, options)),
          concurrentDownload(concurrent)
        );
      })
    );
};
