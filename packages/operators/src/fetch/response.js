import { shallowEqual } from 'fast-equals';
import { concatMap, distinctUntilChanged, map } from 'rxjs';

export const distinctUntilResponseChanged = () => {
  return source =>
    source.pipe(
      concatMap(async resp => [resp, await resp.clone().arrayBuffer()]),
      distinctUntilChanged(([, a], [, b]) => shallowEqual(new Uint8Array(a), new Uint8Array(b))),
      map(([resp]) => resp.clone())
    );
};
