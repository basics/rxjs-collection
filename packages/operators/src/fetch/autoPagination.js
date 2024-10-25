import { concatMap, expand, filter, from, map } from 'rxjs';

import { request } from './request';

export const autoPagination = ({ resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url }) => {
        return from(resolveRoute(url)).pipe(
          request(),
          expand(resp =>
            from(resolveRoute(url, resp)).pipe(
              filter(url => !!url),
              request()
            )
          )
        );
      }),
      map(resp => resp.clone())
    );
};
