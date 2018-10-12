import WindowDriver from './driver/window-driver.js';
import ExtensionBackgroundDriver from './driver/extension-background-driver.js';
import ExtensionTabDriver from './driver/extension-tab-driver.js';

const receiveMessage = plinko => message => {
  const {messageType, callId} = message;
  if (!messageType || !callId) {
    return;
  }

  if (messageType === 'request') {
    plinko.handleRequest(message);
    return;
  }

  if (messageType === 'response') {
    plinko.handleResponse(message);
  }
};

const Plinko = {
  init(driver, methods) {
    const plinko = Object.create(Plinko);

    driver.setupListener(receiveMessage(plinko));
    Object.assign(plinko, {
      driver,
      methods,
      pendingCalls: {}
    });

    return plinko;
  },

  call(method, ...args) {
    const rand = Math.random().toString(36).substring(2);
    const time = Date.now();

    const callId = `plinko-${method}-${rand}-${time}`;

    const promise = new Promise((resolve, reject) => {
      this.pendingCalls[callId] = {resolve, reject};
    });

    this.driver.sendMessage({
      messageType: 'request',
      callId,
      method,
      args
    });

    return promise;
  },

  closeRequest(callId, rejected, returnValue) {
    this.driver.sendMessage({
      messageType: 'response',
      callId,
      rejected,
      returnValue
    });
  },

  resolveRequest(callId, returnValue) {
    this.closeRequest(callId, false, returnValue);
  },

  rejectRequest(callId) {
    this.closeRequest(callId, true, null);
  },

  handleRequest(message) {
    const {callId, method, args} = message;

    if (typeof this.methods[method] !== 'function') {
      this.rejectRequest(callId);
      return;
    }

    const initialReturn = this.methods[method].apply(null, args);

    if (typeof initialReturn === 'function') {
      initialReturn(
        returnValue => this.resolveRequest(callId, returnValue),
        () => this.rejectRequest(callId)
      );
      return;
    }

    if (initialReturn instanceof Promise) {
      initialReturn.then(
        returnValue => this.resolveRequest(callId, returnValue),
        () => this.rejectRequest(callId)
      );
      return;
    }

    this.resolveRequest(callId, initialReturn);
  },

  handleResponse(message) {
    const {callId, rejected, returnValue} = message;

    if (!this.pendingCalls[callId]) {
      return;
    }

    const pendingCall = this.pendingCalls[callId];
    if (rejected) {
      pendingCall.reject();
      return;
    }

    pendingCall.resolve(returnValue);

    delete this.pendingCalls[callId];
  }
};

export default Plinko;
export {Plinko};
export const {WindowPlinko, ExtensionBackground, ExtensionTab} = {
  WindowPlinko: {
    init(methods, thisWindow, targetWindow, expectedOrigin) {
      const driver = WindowDriver.init(thisWindow, targetWindow, expectedOrigin);
      return Plinko.init(driver, methods);
    }
  },

  ExtensionBackgroundPlinko: {
    init(methods) {
      const driver = ExtensionBackgroundDriver.init();
      return Plinko.init(driver, methods);
    }
  },

  ExtensionTabPlinko: {
    init(methods, tabId) {
      const driver = ExtensionTabDriver.init(tabId);
      return Plinko.init(driver, methods);
    }
  }
};
