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
  init(thisWindow, targetWindow, expectedOrigin, methods) {
    const plinko = Object.create(Plinko);

    const driver = WindowDriver.init(thisWindow, targetWindow, expectedOrigin, methods);
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
