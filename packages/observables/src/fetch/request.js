import { fromFetch } from 'rxjs/fetch';

export const requestObservable = request => {
  return fromFetch(request);
};
