/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OperatorFunction } from 'rxjs';

import { Observable, concatAll, concatMap, from, map, mergeMap, of, toArray } from 'rxjs';

import type { Transform, AsyncTransform } from './json/replacer';

import { createAsyncReplacer, createSyncReplacer } from './json/replacer';
import { createAsyncReviver, createSyncReviver } from './json/reviver';

type TransformInstructionHandler<V, R> = (transforms: Transform[], source?: Observable<V>) => R;

interface TraverseInstructions {
  [key: string | symbol | number]: TransformInstructionHandler<
    OperatorFunction<string | symbol | number, any>,
    any
  >;
}

const traverseInstructions: TraverseInstructions = {
  [Object.prototype.constructor.name]:
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    (transforms: Transform[]) => (source: Observable<{}>) =>
      source.pipe(
        map(Object.entries),

        traverse<[string, any][], [string, any][]>(transforms),
        map(Object.fromEntries)
      ),
  [Array.prototype.constructor.name]:
    (transforms: Transform[]) => (source: Observable<Transform[]>) =>
      source.pipe(concatAll(), traverse(transforms), toArray()),
  [Promise.prototype.constructor.name]:
    (transforms: Transform[]) => (source: Observable<Promise<any>>) =>
      source.pipe(
        concatMap(value => from(value)),
        traverse(transforms)
      ),
  [Observable.prototype.constructor.name]:
    (transforms: Transform[]) => (source: Observable<Observable<any>>) =>
      source.pipe(
        concatMap(value => value as Observable<any>),
        traverse(transforms)
      ),

  ['']: () => (source: any) => source
};

export function serialize<V extends Record<string, any> = Record<string, any>, R = string>(
  asyncTransforms: AsyncTransform<V, R>[] = [],
  syncTransforms: Transform[] = []
) {
  return (source: Observable<V>) =>
    source.pipe(
      traverse(createAsyncReplacer<V, R>(asyncTransforms)),
      stringify(syncTransforms)
      //
    );
}

// If generics are not the same, a different type may be required in each case.
export function deserialize<V extends string = string, R extends Record<string, any> = any>(
  asyncTransforms: AsyncTransform<V, R>[] = [],
  syncTransforms: Transform[] = []
) {
  return (source: Observable<V>) =>
    source.pipe(parse(syncTransforms), traverse<V, R>(createAsyncReviver(asyncTransforms)));
}

export const stringify =
  (syncTransforms: Transform[]) => (source: Observable<Record<string, any>>) =>
    source.pipe(toJSONString(createSyncReplacer(syncTransforms)));

export const parse = (syncTransforms: Transform[]) => (source: Observable<string>) =>
  source.pipe(fromJSONString(createSyncReviver(syncTransforms)));

export function traverse<V, R>(transforms: Transform[]): OperatorFunction<V, R> {
  return (source: Observable<V>) =>
    source.pipe(
      mergeMap(data => {
        const key = getInstructionKey(data);
        // eslint-disable-next-line security/detect-object-injection
        const handler = key && traverseInstructions[key];
        if (!handler) {
          return of(data);
        }
        return of(data).pipe(handler(transforms) as OperatorFunction<V, R>);
      }),
      transform(transforms)
    );
}

function getInstructionKey(data: any) {
  if (data === null || data === undefined) {
    return undefined;
  }
  const constructor = data.constructor;
  if (constructor) {
    const key = constructor.name;
    if (Object.prototype.hasOwnProperty.call(traverseInstructions, key)) {
      return key;
    }
  }
  return undefined;
}

function transform<V, R>(transforms: Transform[]): OperatorFunction<V, R> {
  return source =>
    source.pipe(
      concatMap(data => {
        return of(data).pipe(findTransform(transforms, data).handler() as OperatorFunction<V, R>);
      })
    );
}

const toJSONString = (replacer: Transform[]) => (source: Observable<Record<string, any>>) =>
  source.pipe(map(data => JSON.stringify(data, (_k, v) => findTransform(replacer, v).handler(v))));

const fromJSONString = (reviver: Transform[]) => (source: Observable<string>) =>
  source.pipe(map(data => JSON.parse(data, (_k, v) => findTransform(reviver, v).handler(v))));

interface FoundTransform<V, R = unknown> {
  validator: (value: V) => boolean;
  handler: (value?: V) => R;
}

export const findTransform = <V, R = unknown>(
  transforms: Transform[],
  value: V
): FoundTransform<V, R> => {
  const found = transforms.find(({ validator }) => validator(value));
  if (!found) {
    return { validator: () => true, handler: (val?: V) => val as unknown as R }; // Fallback
  }
  return found;
};
