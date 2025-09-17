/* eslint-disable @typescript-eslint/no-explicit-any */
import { concatMap, map, Observable } from 'rxjs';

import { concurrentRequest } from './concurrentRequest';

export function lazyPagination({
  pager,
  concurrent,
  resolveRoute
}: {
  pager: Observable<any>;
  concurrent: number;
  // eslint-disable-next-line no-unused-vars
  resolveRoute: (req: Request, options: any) => Request;
}) {
  return (source: Observable<Request>) =>
    source.pipe(
      concatMap(req => {
        return pager.pipe(
          map(options => resolveRoute(req, options)),
          concurrentRequest(concurrent)
        );
      })
    );
}
