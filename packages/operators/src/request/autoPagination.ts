import { concatMap, expand, filter, from, map, Observable } from 'rxjs';

import { request } from '../request';

export type ResolveRoute = (url: string, response?: Response) => Observable<Request>;

export const autoPagination = ({ resolveRoute }: { resolveRoute: ResolveRoute }) => {
  return (source: Observable<string>) =>
    source.pipe(
      concatMap(url => from(resolveRoute(url)).pipe(request(), getNext(resolveRoute, url))),
      map(resp => resp.clone())
    );
};

const getNext = (resolveRoute: ResolveRoute, url: string) => {
  return (source: Observable<Response>) =>
    source.pipe(
      expand(resp =>
        from(resolveRoute(url, resp)).pipe(
          filter(url => !!url),
          request()
        )
      )
    );
};
