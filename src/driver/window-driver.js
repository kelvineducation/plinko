const WindowDriver = {
  init(expectedOrigin, thisWindow) {
    const driver = Object.create(WindowDriver);

    thisWindow = thisWindow || window;
    Object.assign(driver, {
      window: thisWindow,
      expectedOrigin: expectedOrigin || thisWindow.location.origin
    });

    return driver;
  },

  resolveTargets(targetFilter) {
    if (Array.isArray(targetFilter)) {
      return targetFilter;
    }

    return [targetFilter];
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
