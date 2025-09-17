import { mergeMap, of, Observable } from 'rxjs';

import { request } from '../request';

export function concurrentRequest(concurrent = 1) {
  return (source: Observable<Request>) =>
    source.pipe(mergeMap(url => of(url).pipe(request()), concurrent));
}
