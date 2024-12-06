import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import chalk from 'chalk';
import debug from 'debug';
import { connectable, finalize, Observable, Subject, tap, toArray } from 'rxjs';
import util from 'util';

const getAlignments = list => {
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
};

export const defaultLogger = tag => {
  const logger = debug(tag);
  logger.log = global.console.log.bind(console);
  return {
    default: logger,
    error: debug(`${tag}:error`),
    complete: () => logger(chalk.white.bgGreen.bold('complete!'))
  };
};

const tableLogger = tag => {
  debug.formatters.t = data => {
    if (!data.length) return;
    const table = new AsciiTable3();
    table.setHeading.apply(table, ['index', ...Object.keys(data[0])]);
    table.setAligns(getAlignments([0, ...Object.values(data[0])]));
    table.addRowMatrix(
      data.map((entry, index) => [
        index,
        ...Object.values(entry).map(item => util.inspect(item, { colors: true, depth: 0 }))
      ])
    );
    return table.toString();
  };

  const logger = debug(tag);
  logger.log = global.console.log.bind(console);

  return {
    default: val => logger('%t', val),
    error: debug(`${tag}:error`),
    complete: () => logger(chalk.bgGreen.bold('complete!'))
  };
};

export const enableLog = tag => debug.enable(tag);

export const log = (tag, logger = defaultLogger(tag)) => {
  if (debug.enabled(tag)) {
    return source => {
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

  return source => source;
};

export const logResult = (tag, observable, logger = tableLogger) => {
  return new Promise(done => {
    connectable(
      observable.pipe(
        toArray(),
        log(tag, logger(tag)),
        finalize(() => done())
      ),
      { connector: () => new Subject() }
    ).connect();
  });
};
