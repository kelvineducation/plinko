const WindowDriver = {
  init(thisWindow, expectedOrigin) {
    const driver = Object.create(WindowDriver);

    Object.assign(driver, {
      window: thisWindow || window,
      expectedOrigin: expectedOrigin || location.origin
    });

    return driver;
  },

  setupListener(receiveMessage) {
    this.window.addEventListener('message', event => {
      if (this.expectedOrigin !== '*' && this.expectedOrigin !== event.origin) {
        return;
      }

      receiveMessage(event.source, event.data);
    });
  },

  sendMessage(target, message) {
    target.postMessage(message, this.expectedOrigin);
  }
};

export default WindowDriver;
