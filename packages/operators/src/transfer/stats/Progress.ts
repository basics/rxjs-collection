import { concatWith, distinctUntilChanged, map, Observable, of, Subject } from 'rxjs';

import type { TransferStats } from './types';

import { calcReceivedStats, ReceivedStats } from './utils';

export default {
  create: () => {
    return new Subject<TransferStats>().pipe(
      calcReceivedStats(),
      calcPercentageProgress(),
      concatWith(of(100)),
      distinctUntilChanged()
    );
  }
};

function calcPercentageProgress() {
  return (source: Observable<ReceivedStats>) =>
    source.pipe(map(({ length, total }) => Math.floor((length / total) * 100)));
}
