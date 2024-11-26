import { merge, partition, share } from 'rxjs';

export const pipeWhen = (condition, fn) => source => {
  const [success, fail] = partition(source.pipe(share()), condition);
  return merge(fn(success), fail);
};
