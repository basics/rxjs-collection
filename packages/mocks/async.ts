import { of } from 'rxjs';

export function mockAsync<T>(v: T) {
  return of(v);
}
