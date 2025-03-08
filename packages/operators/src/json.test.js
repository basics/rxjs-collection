import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { from, lastValueFrom, map, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { deserialize, serialize } from './json';

describe('log', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', async () => {
    const replacer = [
      {
        validator: value => value?.constructor === Buffer,
        handler: () => source =>
          source.pipe(map(buffer => `data:image/jpeg;base64,${buffer.toString('base64')}`))
      }
    ];

    const reviver = [
      {
        validator: value => value.startsWith && value.startsWith('data:image/jpeg;base64,'),
        handler: () => source =>
          source.pipe(
            map(value => new Blob([Buffer.from(value, 'base64')], { type: 'image/jpeg' }))
          )
      }
    ];

    const data = Promise.resolve({
      text: Promise.resolve('hello world'),
      bigInt: BigInt(123),
      date: new Date(),
      url: new URL('https://example.com'),
      regexp: /\w/g,
      globalSymbol: Symbol.for('foo'),
      symbol: Symbol('bar'),
      image: readFile('./packages/operators/fixtures/images/test_image.jpg'),
      array: [
        Promise.resolve('hello world'),
        BigInt(123),
        new Date(),
        new URL('https://example.com'),
        /\w/g
      ],
      nested: Promise.resolve({
        text: Promise.resolve('hello world'),
        bigInt: BigInt(123),
        date: new Date(),
        url: new URL('https://example.com'),
        regexp: Promise.resolve(new RegExp('\\w', 'g')),
        image: from(readFile('./packages/operators/fixtures/images/test_image.jpg'))
      })
    });
    console.log('DATA', data);

    const serialized = await lastValueFrom(of(data).pipe(serialize(replacer)));
    // console.log('SERIALIZED', serialized);

    const deserialized = await lastValueFrom(of(serialized).pipe(deserialize(reviver)));
    console.log('DESERIALIZED', deserialized);

    console.log((await data).globalSymbol === deserialized.globalSymbol);
  });
});
