/* eslint-disable no-unused-vars */
import type { MockInstance } from 'vitest';

import { vi } from 'vitest';

export enum NetworkStatus {
  Online = 'online',
  Offline = 'offline'
}

const statusMap = new Map([
  [true, NetworkStatus.Online],
  [false, NetworkStatus.Offline]
]);
let spy: MockInstance;

export const mockOnline = () => updateStatus(true);
export const mockOffline = () => updateStatus(false);
export const mockReset = () => {
  spy.mockRestore();
  updateEvent();
};

const updateStatus = (status: boolean) => {
  spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(status);
  updateEvent();
};

const updateEvent = () => {
  const e = new window.Event(statusMap.get(navigator.onLine) ?? NetworkStatus.Offline, {
    bubbles: true,
    cancelable: false
  });
  window.dispatchEvent(e);
};
