import { share, timer, ReplaySubject, concatMap, from, combineLatest, of, distinctUntilChanged, map, merge, fromEvent, shareReplay, partition, throwError, retry, tap, filter, delay, expand, mergeMap } from 'rxjs';
import { shallowEqual } from 'fast-equals';
import debug from 'debug';

function cache({ ttl } = { ttl: 0 }) {
  return (source) => source.pipe(
    share({
      connector: () => new ReplaySubject(),
      resetOnComplete: () => timer(ttl),
      resetOnRefCountZero: () => timer(ttl)
    })
  );
}

function resolve(type = "json") {
  return (source) => source.pipe(concatMap((e) => from(e[String(type)]())));
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
    concatMap((resp) => combineLatest([of(resp), from(resp.clone().arrayBuffer())])),
    distinctUntilChanged(([, a], [, b]) => shallowEqual(new Uint8Array(a), new Uint8Array(b))),
    map(([resp]) => resp.clone())
  );
};

const connectionObservable = merge(
  of(null),
  fromEvent(window, "online"),
  fromEvent(window, "offline")
).pipe(
  map(() => navigator.onLine),
  shareReplay(1)
);

const pipeWhen = (condition, ...operators) => {
  const combinedOperators = operators.reduce(
    (acc, currentOp) => {
      return (source) => source.pipe(acc, currentOp);
    },
    (source) => source
  );
  return (source) => {
    const [success, fail] = partition(source.pipe(share()), condition);
    return merge(success.pipe(combinedOperators), fail);
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
        concatMap(() => throwError(() => new Error("invalid request")))
      ),
      retry({ count, delay: () => determineDelayWhenOnline(timeout, ++counter) })
    );
  };
}
const determineDelayWhenOnline = (timeout, counter) => {
  return combineLatest([connectionObservable]).pipe(
    // all defined observables have to be valid
    map((values) => values.every((v) => v === true)),
    // reset counter if one observable is invalid
    tap((valid) => counter = counter * Number(valid)),
    // continue only if all observables are valid
    filter((valid) => valid),
    tap({
      next: () => {
        const logger = debug("retry");
        logger(`request - next: ${counter} in ${timeout(counter)}ms`);
      }
    })
  ).pipe(delay(timeout(counter)));
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
    concatMap((requestResponse) => {
      if (operators.length) {
        return of(requestResponse).pipe(
          sourceToStream(),
          interceptStream(operators),
          streamToSource(requestResponse)
        );
      }
      return of(requestResponse);
    })
  );
};
const sourceToStream = () => {
  return (source) => source.pipe(
    concatMap((reqResp) => {
      return objectToStreamMap.get(reqResp.constructor)(
        reqResp
      );
    })
  );
};
const streamToSource = (reqResp) => {
  return (source) => source.pipe(
    concatMap(
      (stream) => streamToObjectMap.get(reqResp.constructor)(
        stream,
        reqResp
      )
    )
  );
};
const interceptStream = (operators, chunkSize) => {
  return (source) => source.pipe(
    map(({ stream, total }) => {
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
  return from(req.blob()).pipe(
    map((blob) => ({
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
  return of({ stream: resp.body, total: parseInt(resp.headers.get("content-length") ?? "0") }).pipe(
    map(({ stream, total }) => ({
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
  return of(new req.constructor(req, { body: stream, duplex: "half" }));
};
const convertStreamToResponse = (stream, resp) => {
  const enc = resp.headers.get("content-encoding");
  return of(stream).pipe(
    map(
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
  concatMap((req) => {
    try {
      return from(fetch(req));
    } catch {
      return throwError(() => new Error("Failed to fetch: resource not valid"));
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
    concatMap(
      (req) => from(resolveRoute(req)).pipe(
        tap((t) => {
          console.log(t);
        }),
        request(),
        getNext(resolveRoute, req)
      )
    ),
    map((resp) => resp.clone())
  );
}
function getNext(resolveRoute, reqResp) {
  return (source) => source.pipe(
    expand(
      (resp) => from(resolveRoute(reqResp, resp)).pipe(
        filter((req) => !!req),
        request()
      )
    )
  );
}

function concurrentRequest(concurrent = 1) {
  return (source) => source.pipe(mergeMap((url) => of(url).pipe(request()), concurrent));
}

function lazyPagination({
  pager,
  concurrent,
  resolveRoute
}) {
  return (source) => source.pipe(
    concatMap((req) => {
      return pager.pipe(
        map((options) => resolveRoute(req, options)),
        concurrentRequest(concurrent)
      );
    })
  );
}

function polling(timeout = 1e3) {
  return (source) => source.pipe(
    request(),
    expand((resp) => of(resp.url).pipe(delay(timeout), request())),
    distinctUntilResponseChanged()
  );
}

export { autoPagination, cache, concurrentRequest, distinctUntilResponseChanged, lazyPagination, polling, request, requestBlob, requestJSON, requestText, resolve, resolveBlob, resolveJSON, resolveText, retryWhenRequestError };
