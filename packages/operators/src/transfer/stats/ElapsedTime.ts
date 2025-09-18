import type { Observable } from 'rxjs';

import { map, Subject } from 'rxjs';

import type { TransferStats } from './types';
import type { ReceivedStats } from './utils';

import { calcReceivedStats, MSECOND } from './utils';

export default {
  create: (timeUnit = MSECOND) => {
    return new Subject<TransferStats>().pipe(calcReceivedStats(), calcElapsedTime(timeUnit));
  }
};

export function calcElapsedTime(timeRatio: number) {
  return (source: Observable<ReceivedStats>) => source.pipe(map(({ time }) => time / timeRatio));
}
