import { mergeMap, of } from 'rxjs';

import { request } from './request';

export const concurrentDownload = (concurrent = 1) => {
  return source => source.pipe(mergeMap(url => of(url).pipe(request()), concurrent));
};
