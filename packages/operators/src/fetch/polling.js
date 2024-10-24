import { delay, expand, of } from 'rxjs';

import { log } from '../log';
import { download } from './download';
import { distinctUntilResponseChanged } from './response';

export const polling = (timeout = 1000) => {
  return source =>
    source.pipe(
      download(),
      expand(resp => of(resp.url).pipe(delay(timeout), download())),
      distinctUntilResponseChanged()
    );
};
