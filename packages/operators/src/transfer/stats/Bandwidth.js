import { map, Subject } from 'rxjs';

import { calcReceivedStats, MBIT, SECOND } from './utils';

export default {
  create: (byteUnit = MBIT, timeUnit = SECOND) => {
    return new Subject().pipe(
      calcReceivedStats(),
      calcAverageByteLengthPerTimeUnit(timeUnit),
      calcTransferRate(byteUnit)
    );
  }
};

const calcAverageByteLengthPerTimeUnit = timeRatio => {
  return source => source.pipe(map(({ value, period }) => (value / period) * timeRatio));
};

const calcTransferRate = byteRatio => {
  return source => source.pipe(map(bytes => bytes * byteRatio));
};
