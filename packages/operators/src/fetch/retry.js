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
            // all defined observables have to be valid
            map(values => values.every(v => v === true)),
            // reset counter if one observable is invalid
            tap(valid => (counter = counter * valid)),
            // continue only if all observables are valid
            filter(valid => valid),
            tap(() => console.log(`retry: request - next: ${counter} in ${timeout(counter)}s`)),
            delay(timeout(counter++) || timeout)
          );
        }
      }),
      catchError(e => console.error(e))
    );
  };
};
