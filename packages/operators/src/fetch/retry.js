import {
  catchError,
  combineLatest,
  concatMap,
  delay,
  filter,
  map,
  of,
  retry,
  tap,
  throwError
} from 'rxjs';

import { connectionObservable } from '../../../observables/src/dom/window.js';

const defaultTimeout = count => Math.min(60000, Math.pow(count, 2) * 1000);

export const networkRetry = ({ timeout = defaultTimeout, count } = {}) => {
  let counter = 0;

  return source => {
    return source.pipe(
      concatMap(resp => {
        if (!resp.ok) {
          return throwError(() => new Error('invalid request'));
        }
        return of(resp);
      }),
      retry({
        count,
        delay: () => {
          return combineLatest([connectionObservable]).pipe(
            map(values => values.every(v => v === true)),
            tap(valid => (counter = counter * valid)),
            filter(valid => valid),
            tap(() => {
              console.log(timeout(counter));
              console.log(
                `retry: request - next: ${counter + 1} in ${timeout(counter + 1) || timeout}s`
              );
            }),
            delay(timeout(counter++) || timeout)
          );
        }
      }),
      catchError(e => console.error(e))
    );
  };
};
