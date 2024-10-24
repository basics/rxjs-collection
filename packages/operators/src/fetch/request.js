import { concatMap } from 'rxjs';

import { log } from '../log';
import { networkRetry } from './retry';

export const request = () => {
  return source =>
    source.pipe(
      concatMap(req => fetch(req)),
      log(false),
      networkRetry()
    );
};
