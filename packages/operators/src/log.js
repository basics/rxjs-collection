import { bgGreen } from 'ansi-colors';
import debug from 'debug';
import { connectable, finalize, Observable, Subject } from 'rxjs';

export const enableLog = tag => {
  debug.enable(tag);
};

export const log = tag => {
  var logger = debug(tag);
  logger.log = console.log.bind(console);
  var error = debug(`${tag}:error`);

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
            logger(bgGreen.bold('Complete!'));
            observer.complete();
          }
        });
      });
    };
  } else {
    return source => source;
  }
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
