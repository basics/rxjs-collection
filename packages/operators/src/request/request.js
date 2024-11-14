import { concatMap, throwError } from 'rxjs';

import { resolveBlob, resolveJSON, resolveText } from './response';
import { networkRetry } from './retry';

export const request = () => {
  return source =>
    source.pipe(
      concatMap(req => {
        try {
          return fetch(req);
        } catch {
          return throwError(() => new Error('Failed to fetch: resource not valid'));
        }
      }),
      networkRetry()
    );
};

export const requestJSON = () => {
  return source => source.pipe(request(), resolveJSON());
};

export const requestText = () => {
  return source => source.pipe(request(), resolveText());
};

export const requestBlob = () => {
  return source => source.pipe(request(), resolveBlob());
};
