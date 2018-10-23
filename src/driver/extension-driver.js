const sendRuntimeMessage = function (target, message) {
  this.browser.runtime.sendMessage({
    sourceScriptType: this.scriptType,
    targetScriptType: target,
    plinkoMessage: message
  });
};

const sendTabMessage = function (target, message) {
  this.browser.tabs.sendMessage(target, {
    sourceScriptType: this.scriptType,
    targetScriptType: this.TYPE_CONTENT,
    plinkoMessage: message
  });
};

const ExtensionDriver = {
  TYPE_BACKGROUND: 'background',
  TYPE_CONTENT: 'content',
  TYPE_POPUP: 'popup',

  init(scriptType) {
    const driver = Object.create(ExtensionDriver);

    Object.assign(driver, {
      browser: chrome || browser,
      scriptType
    });

    return driver;
  },

  async resolveTargets(targetFilter) {
    if (Array.isArray(targetFilter)) {
      return targetFilter;
    }

    if (typeof targetFilter !== 'object') {
      return targetFilter;
    }

    return new Promise(resolve => {
      const targets = [];
      this.browser.tabs.query(targetFilter, tabs => {
        for (const tab of tabs) {
          targets.push(tab.id);
        }

        resolve(targets);
      });
    });
  },

  setupListener(receiveMessage) {
    this.browser.runtime.onMessage.addListener((message, sender) => {
      if (this.scriptType !== message.targetScriptType) {
        return;
      }

      let source = message.sourceScriptType;
      if (source === this.TYPE_CONTENT) {
        source = sender.tab.id;
      }

      receiveMessage(source, message.plinkoMessage);
    });
  },

  sendMessage(target, message) {
    if (isNaN(target)) {
      sendRuntimeMessage.call(this, target, message);
      return;
    }

    sendTabMessage.call(this, target, message);
  }
};

export default ExtensionDriver;
