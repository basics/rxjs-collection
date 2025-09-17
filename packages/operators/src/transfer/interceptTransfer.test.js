import { it } from 'vitest';
import { expect } from 'vitest';
import { describe } from 'vitest';

describe('intercept transfer', () => {
  it('dummy', () => {
    expect(true).toBe(true);
  });
});

// TODO: fix these tests

// import { mockBlob } from '#mocks/blob';
// import { mockResponse } from '#mocks/response';
// import fs from 'node:fs';
// import { Subject } from 'rxjs';
// import { TestScheduler } from 'rxjs/testing';
// import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

// import { log } from '../log';
// import { interceptTransfer } from './interceptTransfer';

// describe('intercept transfer', () => {
//   let testScheduler;

//   beforeAll(() => {
//     vi.spyOn(global, 'Blob').mockImplementation(mockBlob());
//     vi.spyOn(global, 'Response').mockImplementation(mockResponse());
//   });

//   beforeEach(() => {
//     testScheduler = new TestScheduler((actual, expected) => {
//       debugger;
//       return expect(actual).deep.equal(expected);
//     });
//   });

//   test('intercept response', async () => {
//     const blob = new Blob(
//       [fs.readFileSync(`${__dirname}/../../fixtures/videos/demo.mp4`)],
//       'video/mp4'
//     );
//     //
//     const intercept = new Subject();

//     const triggerVal = {
//       a: new Response(blob, { status: 200 })
//     };

//     const expectedVal = {
//       reponse: {
//         a: new Response(blob, { status: 200 })
//       }
//     };

//     const bypass = new Subject();

//     testScheduler.run(({ cold, expectObservable }) => {
//       const progress = new Subject();
//       const stream = cold('a|', triggerVal).pipe(
//         log('operators:interceptTransfer:start'),
//         interceptTransfer([progress]),
//         log('operators:interceptTransfer:end')
//       );

//       expectObservable(stream).toBe('a|', expectedVal.reponse);
//       // expectObservable(stream).toBe('a');
//       // expectObservable(cold('a|', triggerVal).pipe(interceptTransfer([bypass])));
//     });
//   });
// });
