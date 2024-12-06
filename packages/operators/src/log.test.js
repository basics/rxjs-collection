import { from, map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import stripAnsi from 'strip-ansi';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultLogger, enableLog, log, logResult } from './log';

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
      actual.push(replaceDateTimeISOString(stripAnsi(v)));
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

  test('logResult - defaultLogger', async () => {
    const actual = [];

    vi.spyOn(console, 'log').mockImplementation(v => {
      actual.push(replaceDateTimeISOString(stripAnsi(v)));
      return v;
    });

    const expectedVal = [
      "  operators:log:result [ 'content a', 'content b', 'content c' ]",
      '  operators:log:result complete!'
    ];

    const triggerVal = ['content a', 'content b', 'content c'];

    enableLog('operators:log:result');
    await logResult('operators:log:result', from(triggerVal), defaultLogger);
    expect(actual).deep.equal(expectedVal);
  });

  test('logResult - tableLogger', async () => {
    const actual = [];

    vi.spyOn(console, 'log').mockImplementation(v => {
      actual.push(replaceDateTimeISOString(stripAnsi(v)));
      return v;
    });

    const expectedVal = [
      `  operators:log:result +-------+-------------+\n| index |    text     |\n+-------+-------------+\n|     0 | 'content a' |\n|     1 | 'content b' |\n|     2 | 'content c' |\n+-------+-------------+\n`,
      '  operators:log:result complete!'
    ];

    const triggerVal = [{ text: 'content a' }, { text: 'content b' }, { text: 'content c' }];

    enableLog('operators:log:result');
    await logResult('operators:log:result', from(triggerVal));
    expect(actual).deep.equal(expectedVal);
  });
});

const replaceDateTimeISOString = str => {
  return str.replace(
    /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}Z/,
    ' '
  );
};
