import { map, Observable, Subject } from 'rxjs';

import { TransferStats } from './types';
import { calcReceivedStats, MSECOND, ReceivedStats } from './utils';

export default {
  create: (timeUnit = MSECOND) => {
    return new Subject<TransferStats>().pipe(calcReceivedStats(), calcElapsedTime(timeUnit));
  }
};

export function calcElapsedTime(timeRatio: number) {
  return (source: Observable<ReceivedStats>) => source.pipe(map(({ time }) => time / timeRatio));
}
