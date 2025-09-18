import { fromEvent, merge, of, map, shareReplay } from 'rxjs';

export const connectionObservable = merge(
  of(null),
  fromEvent(globalThis, 'online'),
  fromEvent(globalThis, 'offline')
).pipe(
  map(() => navigator.onLine),
  shareReplay(1)
);
