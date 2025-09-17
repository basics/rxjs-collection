'use strict';

const rxjs = require('rxjs');
const fastEquals = require('fast-equals');
const window = require('@rxjs-collection/observables/dom/window');
const debug = require('debug');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const debug__default = /*#__PURE__*/_interopDefaultCompat(debug);

function cache({ ttl } = { ttl: 0 }) {
  return (source) => source.pipe(
    rxjs.share({
      connector: () => new rxjs.ReplaySubject(),
      resetOnComplete: () => rxjs.timer(ttl),
      resetOnRefCountZero: () => rxjs.timer(ttl)
    })
  );
}

function resolve(type = "json") {
  return (source) => source.pipe(rxjs.concatMap((e) => rxjs.from(e[String(type)]())));
}
function resolveJSON() {
  return resolve("json");
}
const resolveText = () => {
  return resolve("text");
};
function resolveBlob() {
  return resolve("blob");
}
const distinctUntilResponseChanged = () => {
  return (source) => source.pipe(
    rxjs.concatMap((resp) => rxjs.combineLatest([rxjs.of(resp), rxjs.from(resp.clone().arrayBuffer())])),
    rxjs.distinctUntilChanged(([, a], [, b]) => fastEquals.shallowEqual(new Uint8Array(a), new Uint8Array(b))),
    rxjs.map(([resp]) => resp.clone())
  );
};

const pipeWhen = (condition, ...operators) => {
  const combinedOperators = operators.reduce(
    (acc, currentOp) => {
      return (source) => source.pipe(acc, currentOp);
    },
    (source) => source
  );
  return (source) => {
    const [success, fail] = rxjs.partition(source.pipe(rxjs.share()), condition);
    return rxjs.merge(success.pipe(combinedOperators), fail);
  };
};

function defaultTimeout(count) {
  return Math.min(6e4, Math.pow(count, 2) * 1e3);
}
function retryWhenRequestError({
  retryableStatuses,
  timeout = defaultTimeout,
  count
} = {}) {
  let counter = 0;
  return (source) => {
    return source.pipe(
      pipeWhen(
        (resp) => retryableStatuses?.includes(resp.status) || !resp.ok,
        rxjs.concatMap(() => rxjs.throwError(() => new Error("invalid request")))
      ),
      rxjs.retry({ count, delay: () => determineDelayWhenOnline(timeout, ++counter) })
    );
  };
}
const determineDelayWhenOnline = (timeout, counter) => {
  return rxjs.combineLatest([window.connectionObservable]).pipe(
    // all defined observables have to be valid
    rxjs.map((values) => values.every((v) => v === true)),
    // reset counter if one observable is invalid
    rxjs.tap((valid) => counter = counter * Number(valid)),
    // continue only if all observables are valid
    rxjs.filter((valid) => valid),
    rxjs.tap({
      next: () => {
        const logger = debug__default("retry");
        logger(`request - next: ${counter} in ${timeout(counter)}ms`);
      }
    })
  ).pipe(rxjs.delay(timeout(counter)));
};

const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  yield chunk;
  return;
};

const interceptTransfer = (operators = [], chunkSize = 60 * 1024) => {
  return (source) => source.pipe(
    rxjs.concatMap((requestResponse) => {
      if (operators.length) {
        return rxjs.of(requestResponse).pipe(
          sourceToStream(),
          interceptStream(operators),
          streamToSource(requestResponse)
        );
      }
      return rxjs.of(requestResponse);
    })
  );
};
const sourceToStream = () => {
  return (source) => source.pipe(
    rxjs.concatMap((reqResp) => {
      debugger;
      return objectToStreamMap.get(reqResp.constructor)(
        reqResp
      );
    })
  );
};
const streamToSource = (reqResp) => {
  return (source) => source.pipe(
    rxjs.concatMap(
      (stream) => streamToObjectMap.get(reqResp.constructor)(
        stream,
        reqResp
      )
    )
  );
};
const interceptStream = (operators, chunkSize) => {
  return (source) => source.pipe(
    rxjs.map(({ stream, total }) => {
      let time = 0;
      let chunks = null;
      return new ReadableStream(
        {
          start: function() {
            time = Date.now();
            chunks = readBytes(stream);
          },
          pull: async function(controller) {
            const { done, value } = await chunks.next();
            try {
              if (done) {
                return onStreamEnd(controller, operators);
              }
              await onStreamPull(controller, operators, value, total, time);
            } catch (err) {
              onStreamError(operators, err);
              throw err;
            }
          },
          cancel: async (err) => {
            onStreamError(operators, err);
            await chunks.return(void 0);
          }
        },
        { highWaterMark: 2 }
      );
    })
  );
};
const objectToStreamMap = /* @__PURE__ */ new Map([
  [Request, (req) => convertRequestToStream(req)],
  [Response, (resp) => convertResponseToStream(resp)]
]);
const convertRequestToStream = (req) => {
  return rxjs.from(req.blob()).pipe(
    rxjs.map((blob) => ({
      stream: new req.constructor(req.url, {
        method: req.method,
        body: blob
      }).body,
      total: blob.size
    }))
  );
};
const convertResponseToStream = (resp) => {
  const enc = resp.headers.get("content-encoding");
  return rxjs.of({ stream: resp.body, total: parseInt(resp.headers.get("content-length") ?? "0") }).pipe(
    rxjs.map(({ stream, total }) => ({
      stream: enc ? (stream || new ReadableStream()).pipeThrough(new CompressionStream(enc)) : stream,
      total
    }))
  );
};
const streamToObjectMap = /* @__PURE__ */ new Map([
  [Request, (...args) => convertStreamToRequest(...args)],
  [Response, (...args) => convertStreamToResponse(...args)]
]);
const convertStreamToRequest = (stream, req) => {
  return rxjs.of(new req.constructor(req, { body: stream, duplex: "half" }));
};
const convertStreamToResponse = (stream, resp) => {
  const enc = resp.headers.get("content-encoding");
  return rxjs.of(stream).pipe(
    rxjs.map(
      (s) => new resp.constructor(
        enc ? s.pipeThrough(new DecompressionStream(enc)) : s,
        resp
      )
    )
  );
};
const onStreamPull = async (controller, operators, bytes, total, time) => {
  controller.enqueue(new Uint8Array(bytes));
  operators.map((operator) => operator.next({ bytes, total, time }));
};
const onStreamEnd = (controller, operators) => {
  controller.close();
  operators.map((operator) => operator.complete());
  return;
};
const onStreamError = (operators, err) => {
  operators.map((operator) => operator.error(err));
};

const request = ({ retry, cache: cacheOptions, stats } = {}) => {
  return (source) => source.pipe(
    interceptTransfer(stats?.upload),
    tryRequest(),
    retryWhenRequestError(retry),
    interceptTransfer(stats?.download),
    cache(cacheOptions)
    //
  );
};
const tryRequest = () => (source) => source.pipe(
  rxjs.concatMap((req) => {
    try {
      return rxjs.from(fetch(req));
    } catch {
      return rxjs.throwError(() => new Error("Failed to fetch: resource not valid"));
    }
  })
);
const requestJSON = (options) => {
  return (source) => source.pipe(request(options), resolveJSON());
};
const requestText = (options) => {
  return (source) => source.pipe(request(options), resolveText());
};
const requestBlob = (options) => {
  return (source) => source.pipe(request(options), resolveBlob());
};

function autoPagination({ resolveRoute }) {
  return (source) => source.pipe(
    rxjs.concatMap(
      (req) => rxjs.from(resolveRoute(req)).pipe(
        rxjs.tap((t) => {
          console.log(t);
        }),
        request(),
        getNext(resolveRoute, req)
      )
    ),
    rxjs.map((resp) => resp.clone())
  );
}
function getNext(resolveRoute, reqResp) {
  return (source) => source.pipe(
    rxjs.expand(
      (resp) => rxjs.from(resolveRoute(reqResp, resp)).pipe(
        rxjs.filter((req) => !!req),
        request()
      )
    )
  );
}

function concurrentRequest(concurrent = 1) {
  return (source) => source.pipe(rxjs.mergeMap((url) => rxjs.of(url).pipe(request()), concurrent));
}

function lazyPagination({
  pager,
  concurrent,
  resolveRoute
}) {
  return (source) => source.pipe(
    rxjs.concatMap((req) => {
      return pager.pipe(
        rxjs.map((options) => resolveRoute(req, options)),
        concurrentRequest(concurrent)
      );
    })
  );
}

function polling(timeout = 1e3) {
  return (source) => source.pipe(
    request(),
    rxjs.expand((resp) => rxjs.of(resp.url).pipe(rxjs.delay(timeout), request())),
    distinctUntilResponseChanged()
  );
}

exports.autoPagination = autoPagination;
exports.cache = cache;
exports.concurrentRequest = concurrentRequest;
exports.distinctUntilResponseChanged = distinctUntilResponseChanged;
exports.lazyPagination = lazyPagination;
exports.polling = polling;
exports.request = request;
exports.requestBlob = requestBlob;
exports.requestJSON = requestJSON;
exports.requestText = requestText;
exports.resolve = resolve;
exports.resolveBlob = resolveBlob;
exports.resolveJSON = resolveJSON;
exports.resolveText = resolveText;
exports.retryWhenRequestError = retryWhenRequestError;
