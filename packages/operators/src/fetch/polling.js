import { delay, expand, of } from 'rxjs';

import { request } from './request';
import { distinctUntilResponseChanged } from './response';

export const polling = (timeout = 1000) => {
  return source =>
    source.pipe(
      request(),
      expand(resp => of(resp.url).pipe(delay(timeout), request())),
      distinctUntilResponseChanged()
    );
};
