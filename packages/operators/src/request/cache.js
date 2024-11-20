import { ReplaySubject, share, tap, timer } from 'rxjs';

export const cache = ttl => {
  return source =>
    source.pipe(
      share({
        connector: () => new ReplaySubject(),
        resetOnComplete: () => timer(ttl),
        resetOnRefCountZero: () => timer(ttl)
      })
    );
};
