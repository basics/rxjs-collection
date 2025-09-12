import { connectionObservable } from '#observables/dom/window';
import debug from 'debug';
import { combineLatest, concatMap, delay, filter, map, Observable, retry, tap, throwError } from 'rxjs';

import { pipeWhen } from './when';

export function defaultTimeout(count) {
  return Math.min(60000, Math.pow(count, 2) * 1000);
}

export interface RetryWhenRequestErrorOptions {
  retryableStatuses?: number[];
  timeout?: (count: number) => number;
  count?: number;
}

export function retryWhenRequestError({ retryableStatuses, timeout = defaultTimeout, count }: RetryWhenRequestErrorOptions = {}) {
  let counter = 0;

  return (source: Observable<Response>) => {
    return source.pipe(
      pipeWhen(
        resp => retryableStatuses?.includes(resp.status) || !resp.ok,
        concatMap(() => throwError(() => new Error('invalid request')))
      ),
      retry({ count, delay: () => determineDelayWhenOnline(timeout, ++counter) })
    );
  };
}

const determineDelayWhenOnline = (timeout: (counter: number) => number, counter: number) => {
  return combineLatest([connectionObservable])
    .pipe(
      // all defined observables have to be valid
      map(values => values.every(v => v === true)),
      // reset counter if one observable is invalid
      tap(valid => (counter = counter * Number(valid))),
      // continue only if all observables are valid
      filter(valid => valid),
      tap({
        next: () => {
          const logger = debug('retry');
          logger(`request - next: ${counter} in ${timeout(counter)}ms`);
        }
      })
    )
    .pipe(delay(timeout(counter)));
};
