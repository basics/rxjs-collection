import type { Observable } from 'rxjs';

import { shallowEqual } from 'fast-equals';
import { combineLatest, concatMap, distinctUntilChanged, from, map, of } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<R = any>(type: 'json' | 'text' | 'blob') {
  return (source: Observable<Response>) =>
    source.pipe(
      concatMap(e => {
        if (type === 'json') return from(e.json() as Promise<R>);
        if (type === 'text') return from(e.text() as Promise<R>);
        if (type === 'blob') return from(e.blob() as Promise<R>);
        throw new Error(`Unsupported type: ${type}`);
      })
    );
}

// Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveJSON<R = Record<string, any>>() {
  return resolve<R>('json');
}

export const resolveText = () => {
  return resolve<string>('text');
};

export function resolveBlob() {
  return resolve<Blob>('blob');
}

export const distinctUntilResponseChanged = () => {
  return (source: Observable<Response>) =>
    source.pipe(
      concatMap(resp => combineLatest([of(resp), from(resp.clone().arrayBuffer())])),
      distinctUntilChanged(([, a], [, b]) => shallowEqual(new Uint8Array(a), new Uint8Array(b))),
      map(([resp]) => resp.clone())
    );
};
