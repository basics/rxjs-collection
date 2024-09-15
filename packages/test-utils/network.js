import { vi } from 'vitest';

const statusMap = new Map([
  [true, 'online'],
  [false, 'offline']
]);
let spy;

export const mockOnline = () => updateStatus(true);
export const mockOffline = () => updateStatus(false);
export const mockReset = () => {
  spy.mockRestore();
  updateEvent();
};

const updateStatus = status => {
  spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(status);
  updateEvent();
};

const updateEvent = () => {
  const e = new window.Event(statusMap.get(navigator.onLine), { bubbles: true, cancelable: false });
  window.dispatchEvent(e);
};
