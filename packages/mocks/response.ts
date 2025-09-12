import { vi } from 'vitest';

import { mockAsync } from './async';

export const mockResponse = () => {
  return vi.fn((e, url) => ({
    url: url,
    clone: () => new Response(e),
    json: () => mockAsync(e),
    text: () => mockAsync(e),
    blob: () => mockAsync(e),
    arrayBuffer: () => mockAsync(e),
    ok: true
  }));
};
