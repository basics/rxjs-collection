import { vi } from 'vitest';

import { mockAsync } from './async';

export const mockReadableStream = () => {
  return vi.fn(([e], type) => ({ text: () => mockAsync(new TextDecoder().decode(e)), type }));
};
