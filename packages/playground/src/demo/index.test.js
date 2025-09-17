import { delay, from } from 'rxjs';
import { describe, test } from 'vitest';

describe.skip('playground stephan', () => {
  test('basics', async () => {
    from([1, 2, 3, 4, 5, 6, 7, 8, 9])
      .pipe(delay(4000))
      .subscribe(e => {
        // eslint-disable-next-line no-console
        console.log(e);
        // s.unsubscribe();
      });
    await new Promise(done => setTimeout(done, 5000));
  });
});
