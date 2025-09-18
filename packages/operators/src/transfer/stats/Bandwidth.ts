import type { Observable } from 'rxjs';

import { concat, delay, EMPTY, map, of, Subject, switchMap } from 'rxjs';

import type { TransferStats } from './types';
import type { ReceivedStats } from './utils';

import { calcReceivedStats, MBIT, SECOND } from './utils';

export default {
  create: (byteRatio = MBIT, timeRatio = SECOND) => {
    return new Subject<TransferStats>().pipe(
      calcReceivedStats(),
      calcBandwidth(byteRatio, timeRatio)
      //
    );
  }
};

function calcBandwidth(byteRatio: number, timeRatio: number) {
  return (source: Observable<ReceivedStats>) =>
    source.pipe(
      switchMap(stats => {
        const noBandwidth = stats.length === stats.total ? EMPTY : of(0).pipe(delay(500));
        return concat(calcTransmittableBytes(stats, byteRatio, timeRatio), noBandwidth);
      })
    );
}

const calcTransmittableBytes = (stats: ReceivedStats, byteRatio: number, timeRatio: number) => {
  return of(stats).pipe(map(({ length, time }) => (length / time) * byteRatio * timeRatio));
};
