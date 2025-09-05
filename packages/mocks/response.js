import { vi } from 'vitest';

import { mockAsync } from './async';

export const mockResponse = () => {
  return vi.fn((e, url, headers = new Map()) => ({
    url: url,
    clone: () => new Response(e),
    json: () => mockAsync(e),
    text: () => mockAsync(e),
    blob: () => mockAsync(e),
    arrayBuffer: () => mockAsync(e),
    ok: true,
    headers,
    body: {
      getReader: () => {
        const slices = createSlices(e);
        return {
          read: () => {
            if (slices.length) {
              return mockAsync({ done: false, value: slices.shift() });
            }
            return mockAsync({ done: true });
          }
        };
      }
    }
  }));
};

const createSlices = (buffer, num = 5) => {
  const size = Math.floor(buffer.length / num);
  const slices = [];
  for (let i = 0; i < buffer.length; i += size) {
    slices.push(buffer.slice(i, i + size));
  }
  return slices;
};
