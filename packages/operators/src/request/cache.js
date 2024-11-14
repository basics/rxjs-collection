import { ReplaySubject, share, tap, timer } from 'rxjs';

export const cache = ttl => {
  return source =>
    source.pipe(
      share({
        // TODO: check if a buffer size is neccessary
        connector: () => new ReplaySubject(),
        // resetOnError: false,
        resetOnComplete: () => timer(ttl),
        resetOnRefCountZero: false
      })
    );
};
