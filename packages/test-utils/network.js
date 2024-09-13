export const mockOnline = () => {
  updateOnLineStatus('online', true);
};

export const mockOffline = () => {
  updateOnLineStatus('offline', false);
};

const updateOnLineStatus = (eventName, status) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: function () {
      return status;
    }
  });

  const e = new window.Event(eventName, { bubbles: true, cancelable: false });
  window.dispatchEvent(e);
};
