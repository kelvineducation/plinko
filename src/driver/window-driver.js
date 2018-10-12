const WindowDriver = {
  init(thisWindow, targetWindow, expectedOrigin) {
    const driver = Object.create(WindowDriver);

    Object.assign(driver, {
      window: thisWindow,
      targetWindow,
      expectedOrigin
    });

    return driver;
  },

  setupListener(receiveMessage) {
    this.window.addEventListener('message', event => {
      if (this.expectedOrigin !== '*' && this.expectedOrigin !== event.origin) {
        return;
      }

      receiveMessage(event.data);
    });
  },

  sendMessage(message) {
    this.targetWindow.postMessage(message, this.expectedOrigin);
  }
};

export default WindowDriver;
