import { ReplaySubject, share, timer } from 'rxjs';

export const cache = ttl => {
  return source =>
    source.pipe(
      share({
        // TODO: check if a buffer size is neccessary
        connector: () => new ReplaySubject(),
        resetOnComplete: () => timer(ttl)
      })
    );
};
