const ExtensionBackgroundDriver = {
  init() {
    const driver = Object.create(ExtensionBackgroundDriver);

    Object.assign(driver, {
      browser: chrome || browser
    });

    return driver;
  },

  setupListener(receiveMessage) {
    this.browser.runtime.onMessage.addListener(receiveMessage);
  },

  sendMessage(message) {
    this.browser.runtime.sendMessage(message);
  }
};

export default ExtensionBackgroundDriver;
