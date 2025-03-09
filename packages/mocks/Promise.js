import SyncPromise from 'sync-promise-js';
import { vi } from 'vitest';

export const mockPromise = () => vi.stubGlobal('Promise', SyncPromise);
