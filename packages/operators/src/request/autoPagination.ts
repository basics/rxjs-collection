import type { Observable } from 'rxjs';

import { concatMap, expand, filter, from, map, of, throwError } from 'rxjs';

import { request } from '../request';

export type ResolveRoute = (
  reqResp: Request | Response,
  response?: Response
) => Observable<Request | null>;

export function autoPagination({ resolveRoute }: { resolveRoute: ResolveRoute }) {
  return (source: Observable<Request | Response>) =>
    source.pipe(
      concatMap(req =>
        from(resolveRoute(req)).pipe(
          concatMap(req => {
            if (req === null) {
              return throwError(() => new Error('Request is empty!'));
            }
            return of(req);
          }),
          request(),
          getNext(resolveRoute, req)
        )
      ),
      map(resp => resp.clone())
    );
}

function getNext(resolveRoute: ResolveRoute, reqResp: Request | Response) {
  return (source: Observable<Response>) =>
    source.pipe(
      expand(resp =>
        from(resolveRoute(reqResp, resp)).pipe(
          filter(req => !!req),
          request()
        )
      )
    );
}
