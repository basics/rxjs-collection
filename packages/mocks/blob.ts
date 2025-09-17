import { vi } from 'vitest';

import { mockAsync } from './async';

export const mockBlob = () => {
  return vi.fn(([e], type) => ({ text: () => mockAsync(new TextDecoder().decode(e)), type }));
};
