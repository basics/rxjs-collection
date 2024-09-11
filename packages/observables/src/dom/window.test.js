import { connectionObservable } from './window.js';
import { setOffline, setOnline } from '../../../test-utils/network.js';

describe('DOM: window', function () {
  it('receive online event', function () {
    connectionObservable.subscribe(e => expect(e).to.be.true);
    setOnline();
  });

  it('receive offline event', function () {
    setOffline();
    connectionObservable.subscribe(e => expect(e).to.be.false);
  });
});
