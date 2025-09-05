export const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};

const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }

  // const reader = stream.getReader();
  // try {
  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) {
  //       break;
  //     }
  //     yield value;
  //   }
  // } finally {
  //   await reader.cancel();
  // }
};

const streamChunk = function* (chunk, chunkSize) {
  // let len = chunk.byteLength;
  // if (!chunkSize || len < chunkSize) {
  yield chunk;
  return;
  // }

  // let pos = 0;
  // let end;
  // while (pos < len) {
  //   end = pos + chunkSize;
  //   yield chunk.slice(pos, end);
  //   pos = end;
  // }
};
