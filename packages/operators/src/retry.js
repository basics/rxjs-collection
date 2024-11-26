import { connectionObservable } from '#observables/dom/window.js';
import { debug } from 'debug';
import { combineLatest, concatMap, delay, filter, map, retry, tap, throwError } from 'rxjs';

import { pipeWhen } from './when';

const defaultTimeout = count => Math.min(60000, Math.pow(count, 2) * 1000);

export const retryWhenRequestError = ({
  retryableStatuses,
  timeout = defaultTimeout,
  count
} = {}) => {
  let counter = 0;

  return source => {
    return source.pipe(
      pipeWhen(
        resp => (retryableStatuses && retryableStatuses.includes(resp.status)) || !resp.ok,
        concatMap(() => throwError(() => new Error('invalid request')))
      ),
      retry({ count, delay: () => determineDelayWhenOnline(timeout, ++counter) })
    );
  };
};

const determineDelayWhenOnline = (timeout, counter) => {
  return combineLatest([connectionObservable])
    .pipe(
      // all defined observables have to be valid
      map(values => values.every(v => v === true)),
      // reset counter if one observable is invalid
      tap(valid => (counter = counter * valid)),
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
