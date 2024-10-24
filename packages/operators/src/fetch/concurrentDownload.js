import { mergeMap, of } from 'rxjs';

import { download } from './download';

export const concurrentDownload = (concurrent = 1) => {
  return source => source.pipe(mergeMap(url => of(url).pipe(download()), concurrent));
};
