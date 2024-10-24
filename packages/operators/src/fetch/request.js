import { concatMap } from 'rxjs';

import { networkRetry } from './retry';

export const request = () => {
  return source =>
    source.pipe(
      concatMap(req => fetch(req)),
      networkRetry()
    );
};
