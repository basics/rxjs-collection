import { first } from 'rxjs';
import { connectionObservable } from './window.js';
import { mockOffline, mockOnline } from '../../../test-utils/network.js';

describe('DOM: window', function () {
  it('receive online event', function () {
    mockOnline();
    connectionObservable.pipe(first()).subscribe(e => expect(e).to.be.true);
  });

  it('receive offline event', function () {
    mockOffline();
    connectionObservable.pipe(first()).subscribe(e => expect(e).to.be.false);
  });
});
