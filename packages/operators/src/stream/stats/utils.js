import { scan } from 'rxjs';

export const BYTE = 1;
export const BIT = BYTE * 8;
export const KBYTE = BYTE / 1024;
export const KBIT = KBYTE * 8;
export const MBYTE = KBYTE / 1024;
export const MBIT = MBYTE * 8;

export const MSECOND = 1;
export const SECOND = MSECOND * 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;

export const calcReceivedStats = () => {
  return source =>
    source.pipe(
      scan(
        (acc, { value, total, period }) => ({
          value: acc.value + value.byteLength,
          total,
          period: Date.now() - period
        }),
        { value: 0, total: 0, period: 0 }
      )
    );
};
