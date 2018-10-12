const ExtensionTabDriver = {
  init(tabId) {
    const driver = Object.create(ExtensionTabDriver);

    Object.assign(driver, {
      browser: chrome || browser,
      tabId
    });

    return driver;
  },

  setupListener(receiveMessage) {
    this.browser.runtime.onMessage.addListener((message, sender) => {
      if (sender.tab.id !== this.tabId) {
        return;
      }

      receiveMessage(message);
    });
  },

  sendMessage(message) {
    this.browser.tabs.sendMessage(this.tabId, message);
  }
};

export default ExtensionTabDriver;
