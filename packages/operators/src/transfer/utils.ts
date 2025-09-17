export const readBytes = async function* (
  iterable: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
  chunkSize?: number
): AsyncGenerator<Uint8Array> {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};

const readStream = async function* (
  stream: AsyncIterable<Uint8Array> | Iterable<Uint8Array>
): AsyncGenerator<Uint8Array> {
  if (Symbol.asyncIterator in stream) {
    yield* stream as AsyncIterable<Uint8Array>;
    return;
  }

  // Falls du einen ReadableStream hast, kannst du das hier aktivieren
  // const reader = (stream as ReadableStream<Uint8Array>).getReader();
  // try {
  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) break;
  //     yield value;
  //   }
  // } finally {
  //   await reader.cancel();
  // }
};

const streamChunk = function* (chunk: Uint8Array, chunkSize?: number): Generator<Uint8Array> {
  // Falls kein chunkSize angegeben oder chunk kleiner als chunkSize
  if (!chunkSize || chunk.byteLength <= chunkSize) {
    yield chunk;
    return;
  }

  let pos = 0;
  while (pos < chunk.byteLength) {
    const end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
