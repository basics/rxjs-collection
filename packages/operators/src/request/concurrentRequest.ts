import type { Observable } from 'rxjs';

import { mergeMap, of } from 'rxjs';

import { request } from '../request';

export function concurrentRequest(concurrent = 1) {
  return (source: Observable<Request>) =>
    source.pipe(mergeMap(url => of(url).pipe(request()), concurrent));
}
