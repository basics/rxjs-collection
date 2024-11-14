import { shallowEqual } from 'fast-equals';
import { combineLatest, concatMap, distinctUntilChanged, from, map, of } from 'rxjs';

export const resolve = (type = 'json') => {
  return source => source.pipe(concatMap(e => e[String(type)]()));
};

export const resolveJSON = () => {
  return resolve('json');
};

export const resolveText = () => {
  return resolve('text');
};

export const resolveBlob = () => {
  return resolve('blob');
};

export const distinctUntilResponseChanged = () => {
  return source =>
    source.pipe(
      concatMap(resp => combineLatest([of(resp), from(resp.clone().arrayBuffer())])),
      distinctUntilChanged(([, a], [, b]) => shallowEqual(new Uint8Array(a), new Uint8Array(b))),
      map(([resp]) => resp.clone())
    );
};
