'use strict';

const rxjs = require('rxjs');

const connectionObservable = rxjs.merge(
  rxjs.of(null),
  rxjs.fromEvent(window, "online"),
  rxjs.fromEvent(window, "offline")
).pipe(
  rxjs.map(() => navigator.onLine),
  rxjs.shareReplay(1)
);

exports.connectionObservable = connectionObservable;
