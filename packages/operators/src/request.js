import { concatMap, from, throwError } from 'rxjs';

import { cache } from './cache';
import { resolveBlob, resolveJSON, resolveText } from './response';
import { retryWhenRequestError } from './retry';
import { interceptTransfer } from './transfer/interceptTransfer';

export const request = ({ retry, cache: cacheOptions, stats } = {}) => {
  return source =>
    source.pipe(
      interceptTransfer(stats?.upload),
      tryRequest(),
      retryWhenRequestError(retry),
      interceptTransfer(stats?.download),
      cache(cacheOptions)
      //
    );
};

const tryRequest = () => source =>
  source.pipe(
    concatMap(req => {
      try {
        return from(fetch(req));
      } catch {
        return throwError(() => new Error('Failed to fetch: resource not valid'));
      }
    })
  );

export const requestJSON = options => {
  return source => source.pipe(request(options), resolveJSON());
};

export const requestText = options => {
  return source => source.pipe(request(options), resolveText());
};

export const requestBlob = options => {
  return source => source.pipe(request(options), resolveBlob());
};
