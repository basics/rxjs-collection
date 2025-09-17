/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';

import { map } from 'rxjs';

const asyncReplacer: AsyncTransform<any, any>[] = [
  {
    validator: () => true,
    handler: () => source => source.pipe(map(value => value))
  }
];

export class Transform<V = any, R = any> {
  validator: (value: V) => boolean;
  handler: (value: V) => R;
  constructor(validator: (value: V) => boolean, handler: (value: V) => R) {
    this.validator = validator;
    this.handler = handler;
  }
}

export class AsyncTransform<V, R> {
  validator: (value: V) => boolean;
  handler: () => (source: Observable<V>) => Observable<R>;
  constructor(
    validator: (value: V) => boolean,
    handler: () => (source: Observable<V>) => Observable<R>
  ) {
    this.validator = validator;
    this.handler = handler;
  }
}

export const syncReplacer: Transform[] = [
  new Transform<URL, string>(
    (value: any) => isURL(value),
    (value: URL) => value.toString()
  ),
  new Transform(
    (value: any) => isDate(value),
    (value: Date) => value.toISOString()
  ),
  new Transform(
    (value: any) => isBigInt(value),
    (value: bigint) => `${value.toString()}n`
  ),
  new Transform(
    (value: any) => isRegExp(value),
    (value: RegExp) => value.toString()
  ),
  new Transform(
    (value: any) => isSymbol(value),
    (value: symbol) => symbolToString(value)
  ),
  new Transform(
    () => true,
    (value: any) => value
  )
];

export function createSyncReplacer<V = any, R = any>(transforms: Transform<V, R>[] = []) {
  return [...transforms, ...syncReplacer];
}

export function createAsyncReplacer<V = any, R = any>(transforms: AsyncTransform<V, R>[] = []) {
  return [...transforms, ...asyncReplacer];
}

const isURL = (value: any): value is URL => value?.constructor === URL;
const isDate = (value: any): value is Date => value?.constructor === Date;
const isBigInt = (value: any): value is bigint => value?.constructor === BigInt;
const isRegExp = (value: any): value is RegExp => value?.constructor === RegExp;
const isSymbol = (value: any): value is symbol => value?.constructor === Symbol;

const symbolToString = (value: symbol): string =>
  `${(Symbol.keyFor(value) && 'g') || ''}${value.toString()}`;
