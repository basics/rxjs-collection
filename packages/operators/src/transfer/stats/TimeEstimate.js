import { concatWith, distinctUntilChanged, map, of, Subject } from 'rxjs';

import { calcReceivedStats, MSECOND } from './utils';

export default {
  create: (timeUnit = MSECOND) => {
    return new Subject().pipe(
      calcReceivedStats(),
      calcEstimatedTime(),
      convertEstimatedTimeTo(timeUnit),
      concatWith(of(0)),
      distinctUntilChanged()
    );
  }
};

const calcEstimatedTime = () => {
  return source =>
    source.pipe(map(({ value, total, period }) => Math.ceil((total - value) * (period / value))));
};

const convertEstimatedTimeTo = timeRatio => {
  return source => source.pipe(map(value => value / timeRatio));
};
