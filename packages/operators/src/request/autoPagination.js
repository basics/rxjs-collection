import { concatMap, expand, filter, from, map } from 'rxjs';

import { request } from './request';

export const autoPagination = ({ resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(url => from(resolveRoute(url)).pipe(request(), getNext(resolveRoute, url))),
      map(resp => resp.clone())
    );
};

const getNext = (resolveRoute, url) => {
  return source =>
    source.pipe(
      expand(resp =>
        from(resolveRoute(url, resp)).pipe(
          filter(url => !!url),
          request()
        )
      )
    );
};
