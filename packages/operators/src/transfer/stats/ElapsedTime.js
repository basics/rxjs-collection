import { map, Subject } from 'rxjs';

import { calcReceivedStats, MSECOND } from './utils';

export default {
  create: (timeUnit = MSECOND) => {
    return new Subject().pipe(calcReceivedStats(), calcElapsedTime(timeUnit));
  }
};

const calcElapsedTime = timeRatio => {
  return source => source.pipe(map(({ time }) => time / timeRatio));
};
