/* eslint-disable no-console */
import { resolveJSON } from '#operators/response';
import { of } from 'rxjs';

// #region type test

const response = new Response('{"test":2000}', {
  headers: { 'Content-Type': 'text/plain' }
});
console.log(response);

of(response)
  .pipe(resolveJSON<{ test: 2000 }>())
  .subscribe(data => {
    console.log(data.test);
  });

// #endregion
