import { mergeMap, of, tap } from 'rxjs';

import { request } from './request';

export const concurrentRequest = (concurrent = 1) => {
  return source => source.pipe(mergeMap(url => of(url).pipe(request()), concurrent));
};
