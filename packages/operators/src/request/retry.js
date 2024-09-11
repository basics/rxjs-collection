import { catchError, combineLatest, delay, filter, map, retry, tap } from 'rxjs';
import { connectionObservable } from '../../../observables/src/dom/window.js';

const defaultTimeout = count => Math.min(60000, Math.pow(count, 2) * 1000);

export const networkRetry = ({ timeout = defaultTimeout, count } = {}) => {
  let counter = 0;
  return source => {
    return source.pipe(
      retry({
        count,
        delay: _error => {
          return combineLatest([connectionObservable]).pipe(
            map(values => values.every(v => v === true)),
            tap(valid => (counter = counter * valid)),
            filter(valid => valid),
            tap(() =>
              console.log(
                `retry: request - next: ${counter + 1} in ${timeout(counter + 1) || timeout}s`
              )
            ),
            delay(timeout(counter++) || timeout)
          );
        }
      }),
      catchError(e => console.error(e))
    );
  };
};
