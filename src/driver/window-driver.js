const WindowDriver = {
  init(expectedOrigin, thisWindow) {
    const driver = Object.create(WindowDriver);

    thisWindow = thisWindow || window;
    Object.assign(driver, {
      window: thisWindow,
      expectedOrigin: expectedOrigin || thisWindow.location.origin,
      onMessageCallback: null,
    });

    return driver;
  },

  resolveTargets(targetFilter) {
    return targetFilter;
  },

  setupListener(receiveMessage) {
    this.onMessageCallback = event => {
      if (this.expectedOrigin !== '*' && this.expectedOrigin !== event.origin) {
        return;
      }

      receiveMessage(event.source, event.data);
    };

    this.window.addEventListener('message', this.onMessageCallback);
  },

  sendMessage(target, message) {
    target.postMessage(message, this.expectedOrigin);
  },

  dispose() {
    if (this.onMessageCallback) {
      this.window.removeEventListener('message', this.onMessageCallback);
    }
  },
};

export default WindowDriver;
