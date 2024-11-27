import { from, map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { enableLog, log, logResult } from './log';

describe('log', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).deep.equal(expected));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test('default', () => {
    const expectedVal = {
      a: 'content a',
      b: 'content b',
      c: 'content c'
    };

    const triggerVal = {
      a: () => expectedVal.a,
      b: () => expectedVal.b,
      c: () => expectedVal.c,
      d: () => {
        throw new Error('custom error');
      }
    };

    const expected = [
      '  operators:log:default content a',
      '  operators:log:default content b',
      '  operators:log:default content c'
    ];

    const actual = [];
    vi.spyOn(console, 'log').mockImplementation(v => {
      actual.push(stripAnsiCodes(v));
      return v;
    });

    enableLog('operators:log:default');
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const stream = cold('a-b-c-d|', triggerVal).pipe(
        map(v => v()),
        log('operators:log:default')
      );
      expectObservable(stream).toBe('a-b-c-#', expectedVal, new Error('custom error'));
      flush();
      expect(actual).deep.equal(expected);
    });
  });

  test('logResult', async () => {
    const actual = [];
    vi.spyOn(console, 'log').mockImplementation(v => {
      actual.push(stripAnsiCodes(v));
      return v;
    });

    const expectedVal = [
      '  operators:log:result content a',
      '  operators:log:result content b',
      '  operators:log:result content c',
      '  operators:log:result complete!'
    ];

    const triggerVal = ['content a', 'content b', 'content c'];

    enableLog('operators:log:result');
    await logResult('operators:log:result', from(triggerVal));
    expect(actual).deep.equal(expectedVal);
  });
});

const stripAnsiCodes = str => {
  return str.replace(
    // eslint-disable-next-line security/detect-unsafe-regex, no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
};
