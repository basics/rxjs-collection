/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowEqual } from 'fast-equals';
import { combineLatest, concatMap, distinctUntilChanged, from, map, Observable, of } from 'rxjs';

export function resolve<T extends Record<string, any>>(type = 'json') {
  return (source: Observable<T>) => source.pipe(concatMap(e => from(e[String(type)]())));
}

export function resolveJSON<T extends Record<string, any>>() {
  return resolve<T>('json');
}

export const resolveText = () => {
  return resolve('text');
};

export function resolveBlob() {
  return resolve('blob');
}

export const distinctUntilResponseChanged = () => {
  return (source: Observable<Response>) =>
    source.pipe(
      concatMap(resp => combineLatest([of(resp), from(resp.clone().arrayBuffer())])),
      distinctUntilChanged(([, a], [, b]) => shallowEqual(new Uint8Array(a), new Uint8Array(b))),
      map(([resp]) => resp.clone())
    );
};
