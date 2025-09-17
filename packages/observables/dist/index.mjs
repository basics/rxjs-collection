import { merge, of, fromEvent, map, shareReplay } from 'rxjs';

const connectionObservable = merge(
  of(null),
  fromEvent(window, "online"),
  fromEvent(window, "offline")
).pipe(
  map(() => navigator.onLine),
  shareReplay(1)
);

export { connectionObservable };
