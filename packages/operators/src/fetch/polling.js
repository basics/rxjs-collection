import { concatMap, delay as delayOperator, EMPTY, expand, of } from 'rxjs';

import { download } from './download';

export const polling = ({ validateResult, delay = 1000 }) => {
  return source =>
    source.pipe(
      concatMap(({ url }) => {
        return of(url).pipe(
          download(),
          expand(data => {
            if (validateResult(data)) {
              return of(url).pipe(delayOperator(delay), download());
            }
            return EMPTY;
          })
        );
      })
    );
};
