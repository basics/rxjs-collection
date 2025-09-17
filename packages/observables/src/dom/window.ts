import { fromEvent, merge, of, map, shareReplay } from 'rxjs';

export const connectionObservable = merge(
  of(null),
  fromEvent(global, 'online'),
  fromEvent(global, 'offline')
).pipe(
  map(() => navigator.onLine),
  shareReplay(1)
);
