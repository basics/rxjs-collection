import type { Observable } from 'rxjs';

import { delay, expand, of } from 'rxjs';

import { request } from '../request';
import { distinctUntilResponseChanged } from '../response';

export function polling(timeout = 1000) {
  return (source: Observable<Request>) =>
    source.pipe(
      request(),
      expand(resp => of(resp.url).pipe(delay(timeout), request())),
      distinctUntilResponseChanged()
    );
}
