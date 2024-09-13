import { fromEvent, merge, of, map, shareReplay } from 'rxjs';

export const connectionObservable = merge(
  of(null),
  fromEvent(window, 'online'),
  fromEvent(window, 'offline')
).pipe(
  map(() => navigator.onLine),
  shareReplay(1)
);
