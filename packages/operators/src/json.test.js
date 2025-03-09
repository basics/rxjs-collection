import { mockPromise } from '#mocks/Promise.js';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { lastValueFrom, map, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, test, vi } from 'vitest';

describe('json', () => {
  let testScheduler;

  beforeAll(() => {
    mockPromise();
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterEach(() => {
    //
  });

  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('boolean - serialize', async () => {
    const { serialize } = await import('./json');
    const triggerVal = { a: true, b: false };
    const expectedVal = { a: 'true', b: 'false' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('ab|', triggerVal).pipe(serialize())).toBe('ab|', expectedVal);
    });
  });

  test('boolean - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: 'true', b: 'false' };
    const expectedVal = { a: true, b: false };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('string - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: { string: 'hello world' } };
    const expectedVal = { a: '{"string":"hello world"}' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('string - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: '"hello world"' };
    const expectedVal = { a: 'hello world' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('number - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: 42, b: 4.2, c: BigInt(42n) };
    const expectedVal = { a: '42', b: '4.2', c: '"42n"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('abc|', triggerVal).pipe(serialize())).toBe('abc|', expectedVal);
    });
  });

  test('number - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: '42', b: '4.2', c: '"42n"' };
    const expectedVal = { a: 42, b: 4.2, c: BigInt(42n) };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('url - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: new URL('https://www.example.com/') };
    const expectedVal = { a: '"https://www.example.com/"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('url - deserialize', async () => {
    const { deserialize } = await import('./json');

    const expectedVal = { a: new URL('https://www.example.com/') };
    const triggerVal = { a: '"https://www.example.com/"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('date - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: new Date(2025, 2, 8, 14, 42, 27, 357) };
    const expectedVal = { a: '"2025-03-08T13:42:27.357Z"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('date - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: '"2025-03-08T13:42:27.357Z"' };
    const expectedVal = { a: new Date(2025, 2, 8, 14, 42, 27, 357) };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('regexp - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: /[\w?\s]+/gm };
    const expectedVal = { a: '"/[\\\\w?\\\\s]+/gm"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('regexp - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: '"/[\\\\w?\\\\s]+/gm"' };
    const expectedVal = { a: /[\w?\s]+/gm };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('symbol - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = { a: Symbol('foo'), b: Symbol.for('bar') };
    const expectedVal = { a: '"Symbol(foo)"', b: '"gSymbol(bar)"' };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('ab|', triggerVal).pipe(serialize())).toBe('ab|', expectedVal);
    });
  });

  test('symbol - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = { a: '"gSymbol(bar)"', b: '"Symbol(foo)"' };
    const expectedVal = { a: Symbol, b: Symbol };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold('ab|', triggerVal).pipe(
          deserialize(),
          map(value => value.constructor)
        )
      ).toBe('ab|', expectedVal);
    });
  });

  test('array - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = {
      a: [
        true,
        'hello world',
        42,
        4.2,
        BigInt(42),
        new URL('https://www.example.com/'),
        new Date(2025, 2, 8, 14, 42, 27, 357),
        /[\w?\s]+/gm,
        Symbol.for('bar')
      ]
    };
    const expectedVal = {
      a: '[true,"hello world",42,4.2,"42n","https://www.example.com/","2025-03-08T13:42:27.357Z","/[\\\\w?\\\\s]+/gm","gSymbol(bar)"]'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('array - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = {
      a: '[true,"hello world",42,4.2,"42n","https://www.example.com/","2025-03-08T13:42:27.357Z","/[\\\\w?\\\\s]+/gm","gSymbol(bar)"]'
    };

    const expectedVal = {
      a: [
        true,
        'hello world',
        42,
        4.2,
        BigInt(42),
        new URL('https://www.example.com/'),
        new Date(2025, 2, 8, 14, 42, 27, 357),
        /[\w?\s]+/gm,
        Symbol.for('bar')
      ]
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('object - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = {
      a: {
        boolean: true,
        string: 'hello world',
        integer: 42,
        float: 4.2,
        bigInt: BigInt(42),
        url: new URL('https://www.example.com/'),
        date: new Date(2025, 2, 8, 14, 42, 27, 357),
        regexp: /[\w?\s]+/gm,
        symbol: Symbol.for('bar')
      }
    };
    const expectedVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)"}'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('object - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)"}'
    };

    const expectedVal = {
      a: {
        boolean: true,
        string: 'hello world',
        integer: 42,
        float: 4.2,
        bigInt: BigInt(42),
        url: new URL('https://www.example.com/'),
        date: new Date(2025, 2, 8, 14, 42, 27, 357),
        regexp: /[\w?\s]+/gm,
        symbol: Symbol.for('bar')
      }
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  test('promise - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = {
      a: Promise.resolve({
        boolean: Promise.resolve(true),
        string: Promise.resolve('hello world'),
        integer: Promise.resolve(42),
        float: Promise.resolve(4.2),
        bigInt: Promise.resolve(BigInt(42)),
        url: Promise.resolve(new URL('https://www.example.com/')),
        date: Promise.resolve(new Date(2025, 2, 8, 14, 42, 27, 357)),
        regexp: Promise.resolve(/[\w?\s]+/gm),
        symbol: Promise.resolve(Symbol.for('bar'))
      })
    };

    const expectedVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)"}'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('observable - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = {
      a: of({
        boolean: of(true),
        string: of('hello world'),
        integer: of(42),
        float: of(4.2),
        bigInt: of(BigInt(42)),
        url: of(new URL('https://www.example.com/')),
        date: of(new Date(2025, 2, 8, 14, 42, 27, 357)),
        regexp: of(/[\w?\s]+/gm),
        symbol: of(Symbol.for('bar'))
      })
    };
    const expectedVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)"}'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('mixed - serialize', async () => {
    const { serialize } = await import('./json');

    const triggerVal = {
      a: {
        boolean: true,
        string: 'hello world',
        integer: 42,
        float: 4.2,
        bigInt: BigInt(42),
        url: new URL('https://www.example.com/'),
        date: new Date(2025, 2, 8, 14, 42, 27, 357),
        regexp: /[\w?\s]+/gm,
        symbol: Symbol.for('bar'),
        array: of([
          true,
          'hello world',
          42,
          4.2,
          BigInt(42),
          new URL('https://www.example.com/'),
          new Date(2025, 2, 8, 14, 42, 27, 357),
          /[\w?\s]+/gm,
          Symbol.for('bar')
        ]),
        observable: of('foo bar'),
        promise: Promise.resolve('test')
      }
    };
    const expectedVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)","array":[true,"hello world",42,4.2,"42n","https://www.example.com/","2025-03-08T13:42:27.357Z","/[\\\\w?\\\\s]+/gm","gSymbol(bar)"],"observable":"foo bar","promise":"test"}'
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(serialize())).toBe('a|', expectedVal);
    });
  });

  test('mixed - deserialize', async () => {
    const { deserialize } = await import('./json');

    const triggerVal = {
      a: '{"boolean":true,"string":"hello world","integer":42,"float":4.2,"bigInt":"42n","url":"https://www.example.com/","date":"2025-03-08T13:42:27.357Z","regexp":"/[\\\\w?\\\\s]+/gm","symbol":"gSymbol(bar)","array":[true,"hello world",42,4.2,"42n","https://www.example.com/","2025-03-08T13:42:27.357Z","/[\\\\w?\\\\s]+/gm","gSymbol(bar)"],"observable":"foo bar","promise":"test"}'
    };

    const expectedVal = {
      a: {
        boolean: true,
        string: 'hello world',
        integer: 42,
        float: 4.2,
        bigInt: BigInt(42),
        url: new URL('https://www.example.com/'),
        date: new Date(2025, 2, 8, 14, 42, 27, 357),
        regexp: /[\w?\s]+/gm,
        symbol: Symbol.for('bar'),
        array: [
          true,
          'hello world',
          42,
          4.2,
          BigInt(42),
          new URL('https://www.example.com/'),
          new Date(2025, 2, 8, 14, 42, 27, 357),
          /[\w?\s]+/gm,
          Symbol.for('bar')
        ],
        observable: 'foo bar',
        promise: 'test'
      }
    };

    testScheduler.run(({ cold, expectObservable }) => {
      expectObservable(cold('a|', triggerVal).pipe(deserialize())).toBe('a|', expectedVal);
    });
  });

  /* v8 ignore start */
  test.skip('default', async () => {
    const { serialize, deserialize } = await import('./json');

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
      image: new Promise(resolve =>
        setTimeout(
          () => resolve(readFile('./packages/operators/fixtures/images/test_image.jpg')),
          1000
        )
      ),
      text: Promise.resolve('hello world'),
      bigInt: BigInt(123),
      date: new Date(),
      url: new URL('https://example.com'),
      regexp: /\w/g,
      globalSymbol: Symbol.for('foo'),
      symbol: Symbol('bar'),
      array: [
        Promise.resolve('hello world'),
        BigInt(123),
        new Date(),
        new URL('https://example.com'),
        /\w/g,
        Symbol.for('foo'),
        Symbol('bar')
      ],
      nested: of({
        image: new Promise(resolve =>
          setTimeout(
            () => resolve(readFile('./packages/operators/fixtures/images/test_image.jpg')),
            1000
          )
        ),
        text: Promise.resolve('hello world'),
        bigInt: BigInt(123),
        date: new Date(),
        url: new URL('https://example.com'),
        regexp: Promise.resolve(new RegExp('\\w', 'g')),
        globalSymbol: Symbol.for('foo'),
        symbol: Symbol('bar')
      })
    });
    console.log('DATA', data);

    const serialized = await lastValueFrom(of(data).pipe(serialize(replacer)));
    // console.log('SERIALIZED', serialized);

    const deserialized = await lastValueFrom(of(serialized).pipe(deserialize(reviver)));
    console.log('DESERIALIZED', deserialized);

    console.log((await data).globalSymbol === deserialized.globalSymbol);
  });
  /* v8 ignore stop */
});
