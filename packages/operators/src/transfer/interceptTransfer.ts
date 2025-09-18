/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable } from 'rxjs';

import { concatMap, from, map, of } from 'rxjs';

import type { TransferSubject } from './stats/types';

import { readBytes } from './utils';

declare global {
  interface RequestInit {
    duplex?: 'half' | 'full';
  }
}

export const interceptTransfer = (operators: TransferSubject[] = [], chunkSize = 60 * 1024) => {
  return (source: Observable<Request | Response>) =>
    source.pipe(
      concatMap(requestResponse => {
        if (operators.length) {
          return of(requestResponse).pipe(
            sourceToStream(),
            interceptStream(operators, chunkSize),
            streamToSource(requestResponse)
          );
        }
        return of(requestResponse);
      })
    );
};

const sourceToStream = () => {
  return (source: Observable<Request | Response>) =>
    source.pipe(
      concatMap(reqResp => {
        return objectToStreamMap.get(reqResp.constructor as typeof Request | typeof Response)!(
          reqResp
        );
      })
    );
};

const streamToSource = (reqResp: Request | Response) => {
  return (source: Observable<ReadableStream>) =>
    source.pipe(
      concatMap(stream =>
        streamToObjectMap.get(reqResp.constructor as typeof Request | typeof Response)!(
          stream,
          reqResp
        )
      )
    );
};

const interceptStream = (operators: TransferSubject[], chunkSize: number) => {
  return (source: Observable<{ stream: ReadableStream | null; total: number }>) =>
    source.pipe(
      map(({ stream, total }) => {
        let time = 0;
        let chunks: AsyncGenerator<Uint8Array, any, any> | null = null;
        return new ReadableStream(
          {
            start: function () {
              time = Date.now();
              chunks = readBytes(stream!, chunkSize);
            },
            pull: async function (controller) {
              const { done, value } = await chunks!.next();
              try {
                if (done) {
                  return onStreamEnd(controller, operators);
                }
                await onStreamPull(controller, operators, value, total, time);
              } catch (err: unknown) {
                onStreamError(operators, err as Error);
                throw err;
              }
            },
            cancel: async err => {
              onStreamError(operators, err);
              await chunks!.return(undefined);
            }
          },
          { highWaterMark: 2 }
        );
      })
    );
};

const objectToStreamMap = new Map<
  any,
  (resp: any) => Observable<{
    stream: ReadableStream | null;
    total: any;
  }>
>([
  [Request, (req: Request) => convertRequestToStream(req)],
  [Response, (resp: Response) => convertResponseToStream(resp)]
]);

const convertRequestToStream = (req: Request) => {
  return from(req.blob()).pipe(
    map(blob => ({
      stream: new (req.constructor as typeof Request | typeof Response)(req.url, {
        method: req.method,
        body: blob
      }).body,
      total: blob.size
    }))
  );
};

const convertResponseToStream = (resp: Response) => {
  const enc = resp.headers.get('content-encoding') as CompressionFormat;
  return of({ stream: resp.body, total: parseInt(resp.headers.get('content-length') ?? '0') }).pipe(
    map(({ stream, total }) => ({
      stream: enc
        ? (stream || new ReadableStream()).pipeThrough(new CompressionStream(enc))
        : stream,
      total
    }))
  );
};

const streamToObjectMap = new Map<
  typeof Request | typeof Response,
  (stream: ReadableStream, req: any) => Observable<any>
>([
  [Request, (...args) => convertStreamToRequest(...args)],
  [Response, (...args) => convertStreamToResponse(...args)]
]);

const convertStreamToRequest = (stream: ReadableStream, req: Request) => {
  return of(new (req.constructor as typeof Request)(req, { body: stream, duplex: 'half' }));
};

const convertStreamToResponse = (stream: ReadableStream, resp: Response) => {
  const enc = resp.headers.get('content-encoding') as CompressionFormat;
  return of(stream).pipe(
    map(
      s =>
        new (resp.constructor as typeof Response)(
          enc ? s.pipeThrough(new DecompressionStream(enc)) : s,
          resp
        )
    )
  );
};

const onStreamPull = async (
  controller: ReadableStreamDefaultController,
  operators: TransferSubject[],
  bytes: Uint8Array,
  total: number,
  time: number
) => {
  controller.enqueue(new Uint8Array(bytes));
  operators.forEach(operator => operator.next({ bytes, total, time }));
};

const onStreamEnd = (controller: ReadableStreamDefaultController, operators: TransferSubject[]) => {
  controller.close();
  operators.forEach(operator => operator.complete());
  return;
};

const onStreamError = (operators: TransferSubject[], err: Error) => {
  operators.forEach(operator => operator.error(err));
};
