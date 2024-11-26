import { ReplaySubject, share, timer } from 'rxjs';

export const cache = ({ ttl = 0 } = {}) => {
  return source =>
    source.pipe(
      share({
        connector: () => new ReplaySubject(),
        resetOnComplete: () => timer(ttl),
        resetOnRefCountZero: () => timer(ttl)
      })
    );
};
