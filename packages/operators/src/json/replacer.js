import { map } from 'rxjs';

const asyncReplacer = [
  { validator: () => true, handler: () => source => source.pipe(map(value => value)) }
];

export const syncReplacer = [
  { validator: value => isURL(value), handler: value => value.toString() },
  { validator: value => isDate(value), handler: value => value.toISOString() },
  { validator: value => isBigInt(value), handler: value => `${value.toString()}n` },
  { validator: () => true, handler: value => value }
];

export const createSyncReplacer = (transforms = []) => [...transforms, ...syncReplacer];
export const createAsyncReplacer = (transforms = []) => [...transforms, ...asyncReplacer];

const isURL = value => value?.constructor === URL;
const isDate = value => value?.constructor === Date;
const isBigInt = value => value?.constructor === BigInt;
