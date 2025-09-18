import type { Observable, OperatorFunction } from 'rxjs';

import { merge, partition, share } from 'rxjs';

export const pipeWhen = <T>(
  // eslint-disable-next-line no-unused-vars
  condition: (value: T, index: number) => boolean,
  ...operators: OperatorFunction<T, T>[]
) => {
  const combinedOperators = operators.reduce(
    (acc, currentOp) => {
      return (source: Observable<T>) => source.pipe(acc, currentOp);
    },
    (source: Observable<T>) => source
  );

  return (source: Observable<T>): Observable<T> => {
    const [success, fail] = partition(source.pipe(share()), condition);
    return merge(success.pipe(combinedOperators), fail);
  };
};
