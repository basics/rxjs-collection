import { Observable } from 'rxjs';

export const log = (active = true) => {
  return source => {
    if (active) {
      return new Observable(observer => {
        return source.subscribe(
          val => {
            console.log(val);
            observer.next(val);
          },
          err => {
            console.error(err);
            observer.error(err);
          },
          () => {
            console.log('%ccomplete', 'color: green');
            observer.complete();
          }
        );
      });
    } else {
      return source;
    }
  };
};
