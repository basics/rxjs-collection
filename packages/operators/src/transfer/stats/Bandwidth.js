import { concat, delay, EMPTY, map, of, Subject, switchMap } from 'rxjs';

import { calcReceivedStats, MBIT, SECOND } from './utils';

export default {
  create: (byteRatio = MBIT, timeRatio = SECOND) => {
    return new Subject().pipe(
      calcReceivedStats(),
      calcBandwidth(byteRatio, timeRatio)
      //
    );
  }
};

const calcBandwidth = (byteRatio, timeRatio) => {
  return source =>
    source.pipe(
      switchMap(stats => {
        let noBandwidth = stats.value === stats.total ? EMPTY : of(0).pipe(delay(500));
        return concat(calcTransmittableBytes(stats, byteRatio, timeRatio), noBandwidth);
      })
    );
};

const calcTransmittableBytes = (stats, byteRatio, timeRatio) => {
  return of(stats).pipe(map(({ value, period }) => (value / period) * byteRatio * timeRatio));
};
