import { fromFetch } from 'rxjs/fetch';

export const requestObservable = request => {
  return fromFetch(request)
    .pipe
    // add operators for default behaviour
    ();
};
