import { concatAll, concatMap, from, map, mergeMap, Observable, of, toArray } from 'rxjs';

import { createAsyncReplacer, createSyncReplacer } from './json/replacer.js';
import { createAsyncReviver, createSyncReviver } from './json/reviver.js';

const traverseInstructions = {
  [Object]: transforms => source =>
    source.pipe(
      map(Object.entries),
      traverse(transforms),
      map(Object.fromEntries)
      //
    ),
  [Array]: transforms => source =>
    source.pipe(
      concatAll(),
      traverse(transforms),
      toArray()
      //
    ),
  [Promise]: transforms => source =>
    source.pipe(
      concatMap(value => from(value)),
      traverse(transforms)
    ),
  [Observable]: transforms => source =>
    source.pipe(
      concatMap(value => value),
      traverse(transforms)
    ),
  [undefined]: () => source => source
};

export const serialize = (asyncTransforms, syncTransforms) => source =>
  source.pipe(
    traverse(createAsyncReplacer(asyncTransforms)),
    stringify(syncTransforms)
    //
  );

export const deserialize = (asyncTransforms, syncTransforms) => source =>
  source.pipe(
    parse(syncTransforms),
    traverse(createAsyncReviver(asyncTransforms))
    //
  );

export const stringify = syncTransforms => source =>
  source.pipe(toJSONString(createSyncReplacer(syncTransforms)));

export const parse = syncTransforms => source =>
  source.pipe(fromJSONString(createSyncReviver(syncTransforms)));

const traverse = transforms => source =>
  source.pipe(
    mergeMap(data => of(data).pipe(traverseInstructions[getInstructionKey(data)](transforms))),
    transform(transforms)
    //
  );

const getInstructionKey = ({ constructor }) =>
  constructor in traverseInstructions ? constructor : undefined;

const transform = transforms => source =>
  source.pipe(concatMap(data => of(data).pipe(findTransform(transforms, data).handler())));

const toJSONString = replacer => source =>
  source.pipe(map(data => JSON.stringify(data, (_k, v) => findTransform(replacer, v).handler(v))));

const fromJSONString = reviver => source =>
  source.pipe(map(data => JSON.parse(data, (_k, v) => findTransform(reviver, v).handler(v))));

const findTransform = (transforms, value) => transforms.find(({ validator }) => validator(value));
