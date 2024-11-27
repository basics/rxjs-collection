import { bgGreen } from 'ansi-colors';
import debug from 'debug';
import { connectable, finalize, Observable, Subject } from 'rxjs';

export const enableLog = tag => debug.enable(tag);

export const log = tag => {
  const logger = debug(tag);
  logger.log = global.console.log.bind(console);
  const error = debug(`${tag}:error`);

  if (debug.enabled(tag)) {
    return source => {
      return new Observable(observer => {
        return source.subscribe({
          next: val => {
            logger(val);
            observer.next(val);
          },
          error: err => {
            error(err);
            observer.error(err);
          },
          complete: () => {
            logger(bgGreen.bold('complete!'));
            observer.complete();
          }
        });
      });
    };
  }

  return source => source;
};

export const logResult = (tag, observable) => {
  return new Promise(done => {
    connectable(
      observable.pipe(
        log(tag),
        finalize(() => done())
      ),
      { connector: () => new Subject() }
    ).connect();
  });
};
