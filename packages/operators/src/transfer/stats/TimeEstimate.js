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

import { calcReceivedStats, MSECOND } from './utils';

export default {
  create: (timeRatio = MSECOND) => {
    return new Subject().pipe(
      calcReceivedStats(),
      calcTimeEstimate(timeRatio),
      concatWith(of(0)),
      distinctUntilChanged()
    );
  }
};

const calcTimeEstimate = timeRatio => {
  return source =>
    source.pipe(
      switchMap(stats => {
        let noEstimation = stats.length === stats.total ? EMPTY : of(Infinity).pipe(delay(500));
        return concat(calcEstimation(stats, timeRatio), noEstimation);
      })
    );
};

const calcEstimation = (stats, timeRatio) => {
  return of(stats).pipe(
    map(({ length, total, time }) => Math.ceil((total - length) * (time / length)) / timeRatio)
  );
};
