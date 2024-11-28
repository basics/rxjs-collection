import { from } from 'rxjs';
import { describe, test } from 'vitest';

describe('playground stephan', () => {
  test('basics', () => {
    from([1, 2, 3]).subscribe(e => console.log(e));
  });
});
