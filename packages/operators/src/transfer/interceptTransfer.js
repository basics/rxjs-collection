import { concatMap, from, map, of } from 'rxjs';

import { readBytes } from './utils';

export const interceptTransfer = (reworkers = [], chunkSize = 60 * 1024) => {
  return source =>
    source.pipe(
      concatMap(requestResponse => {
        if (reworkers.length) {
          return of(requestResponse).pipe(
            sourceToStream(),
            interceptStream(reworkers, chunkSize),
            streamToSource(requestResponse)
          );
        }
        return of(requestResponse);
      })
    );
};

const sourceToStream = () => {
  return source =>
    source.pipe(concatMap(reqResp => objectToStreamMap.get(reqResp.constructor)(reqResp)));
};

const streamToSource = reqResp => {
  return source =>
    source.pipe(concatMap(stream => streamToObjectMap.get(reqResp.constructor)(stream, reqResp)));
};

const interceptStream = (reworkers, chunkSize) => {
  return source =>
    source.pipe(
      map(({ stream, total }) => {
        return new ReadableStream(
          {
            time: 0,
            chunks: null,
            start: function () {
              this.time = Date.now();
              this.chunks = readBytes(stream, chunkSize);
            },
            pull: async function (controller) {
              const { done, value } = await this.chunks.next();
              try {
                if (done) {
                  return onStreamEnd(controller, reworkers);
                }
                await onStreamPull(controller, reworkers, value, total, this.time);
              } catch (err) {
                onStreamError(err);
                throw err;
              }
            },
            cancel: err => {
              onStreamError(err);
              return this.chunks.return();
            }
          },
          { highWaterMark: 2 }
        );
      })
    );
};

const objectToStreamMap = new Map([
  [Request, (...args) => convertRequestToStream(...args)],
  [Response, (...args) => convertResponseToStream(...args)]
]);

const convertRequestToStream = req => {
  return from(req.blob()).pipe(
    map(blob => ({
      stream: new req.constructor(req.url, { method: req.method, body: blob }).body,
      total: blob.size
    }))
  );
};

const convertResponseToStream = resp => {
  const enc = resp.headers.get('content-encoding');
  return of({ stream: resp.body, total: parseInt(resp.headers.get('content-length')) }).pipe(
    map(({ stream, total }) => ({
      stream: enc ? stream.pipeThrough(new CompressionStream(enc)) : stream,
      total
    }))
  );
};

const streamToObjectMap = new Map([
  [Request, (...args) => convertStreamToRequest(...args)],
  [Response, (...args) => convertStreamToResponse(...args)]
]);

const convertStreamToRequest = (stream, req) => {
  return of(new req.constructor(req, { body: stream, duplex: 'half' }));
};

const convertStreamToResponse = (stream, resp) => {
  const enc = resp.headers.get('content-encoding');
  return of(stream).pipe(
    map(s => new resp.constructor(enc ? s.pipeThrough(new DecompressionStream(enc)) : s, resp))
  );
};

const onStreamPull = async (controller, reworkers, value, total, period) => {
  controller.enqueue(new Uint8Array(value));
  reworkers.map(reworker => reworker.next({ value, total, period }));
};

const onStreamEnd = (controller, reworkers) => {
  controller.close();
  reworkers.map(reworker => reworker.complete());
  return;
};

const onStreamError = (reworkers, err) => {
  reworkers.map(reworker => reworker.error(err));
};
