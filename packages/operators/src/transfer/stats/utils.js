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
        (acc, { bytes, total, time }) => {
          return {
            length: acc.length + bytes.byteLength,
            total,
            time: Date.now() - time
          };
        },
        { length: 0, total: 0, time: 0 }
      )
    );
};
