import { concatMap, map } from 'rxjs';

import { concurrentDownload } from './concurrentDownload';

export const lazyPagination = ({ createRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url, pager, concurrent }) => {
        return pager.pipe(
          map(options => createRoute(url, options)),
          concurrentDownload(concurrent)
        );
      })
    );
};
