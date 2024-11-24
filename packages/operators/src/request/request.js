import { concatMap, from, throwError } from 'rxjs';

import { resolveBlob, resolveJSON, resolveText } from './response';
import { networkRetry } from './retry';

export const request = options => {
  return source =>
    source.pipe(
      concatMap(req => {
        try {
          return from(fetch(req));
        } catch {
          return throwError(() => new Error('Failed to fetch: resource not valid'));
        }
      }),
      networkRetry(options)
    );
};

export const requestJSON = options => {
  return source => source.pipe(request(options), resolveJSON());
};

export const requestText = options => {
  return source => source.pipe(request(options), resolveText());
};

export const requestBlob = options => {
  return source => source.pipe(request(options), resolveBlob());
};
