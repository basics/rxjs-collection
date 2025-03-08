import { map } from 'rxjs';

const asyncReplacer = [
  { validator: () => true, handler: () => source => source.pipe(map(value => value)) }
];

export const syncReplacer = [
  { validator: value => isURL(value), handler: value => value.toString() },
  { validator: value => isDate(value), handler: value => value.toISOString() },
  { validator: value => isBigInt(value), handler: value => `${value.toString()}n` },
  { validator: value => isRegExp(value), handler: value => value.toString() },
  { validator: value => isRegExp(value), handler: value => value.toString() },
  { validator: value => isSymbol(value), handler: value => symbolToString(value) },
  { validator: () => true, handler: value => value }
];

export const createSyncReplacer = (transforms = []) => [...transforms, ...syncReplacer];
export const createAsyncReplacer = (transforms = []) => [...transforms, ...asyncReplacer];

const isURL = value => value?.constructor === URL;
const isDate = value => value?.constructor === Date;
const isBigInt = value => value?.constructor === BigInt;
const isRegExp = value => value?.constructor === RegExp;
const isSymbol = value => value?.constructor === Symbol;

const symbolToString = value => `${(Symbol.keyFor(value) && 'g') || ''}${value.toString()}`;
