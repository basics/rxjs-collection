import { Observable, ReplaySubject, share, timer } from 'rxjs';

export interface CacheOptions {
  ttl: number;
}

export function cache<T>({ ttl }: CacheOptions = { ttl: 0 }) {
  return (source: Observable<T>) =>
    source.pipe(
      share({
        connector: () => new ReplaySubject(),
        resetOnComplete: () => timer(ttl),
        resetOnRefCountZero: () => timer(ttl)
      })
    );
}
