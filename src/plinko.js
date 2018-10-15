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

const callId = (method, args) => {
  const rand = Math.random().toString(36).substring(2);
  const time = Date.now();

  return `plinko-${method}-${rand}-${time}`;
};

const Plinko = {
  init(driver, methods, options) {
    const plinko = Object.create(Plinko);

    options = Object.assign(
      {
        callId
      },
      options
    );

    driver.setupListener(receiveMessage(plinko));
    Object.assign(plinko, {
      driver,
      methods,
      options,
      pendingCalls: {}
    });

    return plinko;
  },

  call(method, ...args) {
    const callId = this.options.callId(method);
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
