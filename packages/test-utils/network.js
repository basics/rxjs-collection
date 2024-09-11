export const setOnline = () => {
  updateOnLineStatus('online', true);
};

export const setOffline = () => {
  updateOnLineStatus('offline', false);
};

const updateOnLineStatus = (eventName, status) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: function () {
      return status;
    }
  });
  const e = new CustomEvent(eventName, { bubbles: true, cancelable: false });
  window.dispatchEvent(e);
};
