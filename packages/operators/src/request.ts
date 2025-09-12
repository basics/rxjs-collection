import { concatMap, from, Observable, throwError } from 'rxjs';

import { cache, CacheOptions } from './cache';
import { resolveBlob, resolveJSON, resolveText } from './response';
import { retryWhenRequestError, RetryWhenRequestErrorOptions } from './retry';

export interface RequestOptions {
  retry?: RetryWhenRequestErrorOptions;
  cache?: CacheOptions;
}
export function request({ retry, cache: cacheOptions }: RequestOptions = {}) {
  return (source: Observable<Request>) =>
    source.pipe(
      concatMap(req => {
        try {
          return from(fetch(req));
        } catch {
          return throwError(() => new Error('Failed to fetch: resource not valid'));
        }
      }),
      retryWhenRequestError(retry),
      cache(cacheOptions)
    );
}

export function requestJSON(options?: RequestOptions) {
  return source => source.pipe(request(options), resolveJSON());
}

export function requestText(options?: RequestOptions) {
  return source => source.pipe(request(options), resolveText());
}

export function requestBlob(options?: RequestOptions) {
  return source => source.pipe(request(options), resolveBlob());
}
