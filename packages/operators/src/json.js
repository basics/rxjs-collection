import { concatAll, concatMap, from, map, Observable, of, toArray } from 'rxjs';

import { createAsyncReplacer, createSyncReplacer } from './json/replacer.js';
import { createAsyncReviver, createSyncReviver } from './json/reviver.js';

export const serialize = (asyncTransforms, syncTransforms) => source =>
  source.pipe(
    traverse(createAsyncReplacer(asyncTransforms)),
    toJSONString(createSyncReplacer(syncTransforms))
    //
  );

export const deserialize = (asyncTransforms, syncTransforms) => source =>
  source.pipe(
    fromJSONString(createSyncReviver(syncTransforms)),
    traverse(createAsyncReviver(asyncTransforms))
    //
  );

const traverse = transforms => source =>
  source.pipe(
    concatMap(data => of(data).pipe(getOperator(data)(transforms))),
    transform(transforms)
    //
  );

const getOperator = data => traverseInstructions[data.constructor] || (() => source => source);

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
    )
};

const transform = transforms => source =>
  source.pipe(concatMap(data => of(data).pipe(findTransform(transforms, data).handler())));

const toJSONString = replacer => source =>
  source.pipe(map(data => JSON.stringify(data, (_k, v) => findTransform(replacer, v).handler(v))));

const fromJSONString = reviver => source =>
  source.pipe(map(data => JSON.parse(data, (_k, v) => findTransform(reviver, v).handler(v))));

const findTransform = (transforms, value) => transforms.find(({ validator }) => validator(value));
