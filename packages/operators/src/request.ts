import { concatMap, from, Observable, throwError } from 'rxjs';

import { cache, CacheOptions } from './cache';
import { resolveBlob, resolveJSON, resolveText } from './response';
import { retryWhenRequestError, RetryWhenRequestErrorOptions } from './retry';
import { interceptTransfer } from './transfer/interceptTransfer';
import { TransferSubject } from './transfer/stats/types';

export interface RequestOptions {
  retry?: RetryWhenRequestErrorOptions;
  cache?: CacheOptions;
  stats?: {
    upload?: TransferSubject[];
    download?: TransferSubject[];
  };
}

export const request = ({ retry, cache: cacheOptions, stats }: RequestOptions = {}) => {
  return (source: Observable<Request | Response>) =>
    source.pipe(
      interceptTransfer(stats?.upload),
      tryRequest(),
      retryWhenRequestError(retry),
      interceptTransfer(stats?.download),
      cache(cacheOptions)
      //
    );
};

const tryRequest = () => (source: Observable<Request>) =>
  source.pipe(
    concatMap(req => {
      try {
        return from(fetch(req));
      } catch {
        return throwError(() => new Error('Failed to fetch: resource not valid'));
      }
    })
  );

export const requestJSON = (options?: RequestOptions) => {
  return (source: Observable<Request | Response>) => source.pipe(request(options), resolveJSON());
};

export const requestText = (options?: RequestOptions) => {
  return (source: Observable<Request | Response>) => source.pipe(request(options), resolveText());
};

export const requestBlob = (options?: RequestOptions) => {
  return (source: Observable<Request | Response>) => source.pipe(request(options), resolveBlob());
};
