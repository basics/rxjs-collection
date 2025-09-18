import type { Observable } from 'rxjs';

import {
  concat,
  concatWith,
  delay,
  distinctUntilChanged,
  EMPTY,
  map,
  of,
  Subject,
  switchMap
} from 'rxjs';

import type { TransferStats } from './types';
import type { ReceivedStats } from './utils';

import { calcReceivedStats, MSECOND } from './utils';

export default {
  create: (timeRatio = MSECOND) => {
    return new Subject<TransferStats>().pipe(
      calcReceivedStats(),
      calcTimeEstimate(timeRatio),
      concatWith(of(0)),
      distinctUntilChanged()
    );
  }
};

function calcTimeEstimate(timeRatio: number) {
  return (source: Observable<ReceivedStats>) =>
    source.pipe(
      switchMap(stats => {
        const noEstimation = stats.length === stats.total ? EMPTY : of(Infinity).pipe(delay(500));
        return concat(calcEstimation(stats, timeRatio), noEstimation);
      })
    );
}

function calcEstimation(stats: ReceivedStats, timeRatio: number) {
  return of(stats).pipe(
    map(({ length, total, time }) => Math.ceil((total - length) * (time / length)) / timeRatio)
  );
}
