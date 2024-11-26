import { bgGreen } from 'ansi-colors';
import debug from 'debug';
import { connectable, finalize, Subject, tap } from 'rxjs';

import { pipeWhen } from './when';

export const enableLog = tag => {
  debug.enable(tag);
};

export const log = tag => {
  const logger = debug(tag);
  logger.log = global.console.log.bind(console);
  const error = debug(`${tag}:error`);

  return source =>
    source.pipe(
      pipeWhen(
        () => debug.enabled(tag),
        tap({
          subscribe: () => logger('subscribed'),
          unsubscribe: () => logger('unsubscribed'),
          finalize: () => logger('finalize'),
          next: val => logger(val),
          error: err => error(err),
          complete: () => logger(bgGreen.bold('complete!'))
        })
      )
    );
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

// export const log = tag => {
//   var logger = debug(tag);
//   logger.log = global.console.log.bind(console);
//   var error = debug(`${tag}:error`);

//   if (debug.enabled(tag)) {
//     return source =>
//       new Observable(observer => {
//         source.subscribe({
//           subscribe: () => logger('subscribed'),
//           unsubscribe: () => logger('unsubscribed'),
//           finalize: () => logger('finalize'),
//           next: val => {
//             logger(val);
//             observer.next(val);
//           },
//           error: err => {
//             error(err);
//             observer.error(err);
//           },
//           complete: () => {
//             logger(bgGreen.bold('complete!'));
//             observer.complete();
//           }
//         });
//       });
//   }
//   return source => source;
// };
