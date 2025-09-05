import { concatWith, distinctUntilChanged, map, of, Subject } from 'rxjs';

import { calcReceivedStats } from './utils';

export default {
  create: () => {
    return new Subject().pipe(
      calcReceivedStats(),
      calcPercentageProgress(),
      concatWith(of(100)),
      distinctUntilChanged()
    );
  }
};

const calcPercentageProgress = () => {
  return source => source.pipe(map(({ length, total }) => Math.floor((length / total) * 100)));
};
