import { concatMap, expand, filter, from, map } from 'rxjs';

import { download } from './download';

export const autoPagination = ({ resolveRoute }) => {
  return source =>
    source.pipe(
      concatMap(({ url }) => {
        return from(resolveRoute(url)).pipe(
          download(),
          expand(resp =>
            from(resolveRoute(url, resp)).pipe(
              filter(url => !!url),
              download()
            )
          )
        );
      }),
      map(resp => resp.clone())
    );
};
