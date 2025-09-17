/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import chalk from 'chalk';
import debug from 'debug';
import { connectable, finalize, Observable, Subject, toArray } from 'rxjs';
import util from 'util';

interface Logger {
  // eslint-disable-next-line no-unused-vars
  default: (val: any) => void;
  // eslint-disable-next-line no-unused-vars
  error: (err: any) => void;
  complete: () => void;
}

export const enableLog = (tag: string) => debug.enable(tag);

function getAlignments(list: string[]) {
  return list.map(v => {
    switch (typeof v) {
      case 'number':
        return AlignmentEnum.RIGHT;
      case 'string':
        return AlignmentEnum.LEFT;
      default:
        return AlignmentEnum.LEFT;
    }
  });
}

export function defaultLogger(tag: string) {
  const logger = debug(tag);
  logger.log = global.console.log.bind(console);
  return {
    default: logger,
    error: debug(`${tag}:error`),
    complete: () => logger(chalk.white.bgGreen.bold('complete!'))
  };
}

function tableLogger(tag: string) {
  debug.formatters.t = data => {
    if (!data.length) return '';
    const table = new AsciiTable3();
    table.setHeading.apply(table, ['index', ...Object.keys(data[0])]);
    table.setAligns(getAlignments([0, ...(Object.values(data[0]) as any[])]));
    table.addRowMatrix(
      data.map((entry: any, index: number) => [
        index,
        ...Object.values(entry).map(item => util.inspect(item, { colors: true, depth: 0 }))
      ])
    );
    return table.toString();
  };

  const logger = debug(tag);
  logger.log = global.console.log.bind(console);

  return {
    default: (val: any) => logger('%t', val),
    error: debug(`${tag}:error`),
    complete: () => logger(chalk.bgGreen.bold('complete!'))
  };
}

export function log(tag: string, logger: Logger = defaultLogger(tag)) {
  if (debug.enabled(tag)) {
    return (source: Observable<any>) => {
      return new Observable(observer => {
        return source.subscribe({
          next: val => {
            logger.default(val);
            observer.next(val);
          },
          error: err => {
            logger.error(err);
            observer.error(err);
          },
          complete: () => {
            logger.complete();
            observer.complete();
          }
        });
      });
    };
  }

  return (source: Observable<any>) => source;
}

export function logResult(tag: string, observable: Observable<any>, logger = tableLogger) {
  return new Promise<void>(done => {
    connectable(
      observable.pipe(
        toArray(),
        log(tag, logger(tag)),
        finalize(() => done())
      ),
      { connector: () => new Subject() }
    ).connect();
  });
}
