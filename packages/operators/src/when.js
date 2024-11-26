import { merge, partition, share } from 'rxjs';

export const pipeWhen = (condition, ...operators) => {
  return source => {
    const [success, fail] = partition(source.pipe(share()), condition);
    return merge(success.pipe(...operators), fail);
  };
};
