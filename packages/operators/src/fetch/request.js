import { concatMap } from 'rxjs';

import { resolveBlob, resolveJSON, resolveText } from './response';
import { networkRetry } from './retry';

export const request = () => {
  return source =>
    source.pipe(
      concatMap(req => fetch(req)),
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
