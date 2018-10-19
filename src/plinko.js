const receiveMessage = plinko => (source, message) => {
  const {messageType, callId} = message;
  if (!messageType || !callId) {
    return;
  }

  if (messageType === 'request') {
    plinko.handleRequest({source, message});
    return;
  }

  if (messageType === 'response') {
    plinko.handleResponse(message);
  }
};

const callId = method => {
  const rand = Math.random().toString(36).substring(2);
  const time = Date.now();

  return `plinko-${method}-${rand}-${time}`;
};

const Plinko = {
  init(driver, methods, options) {
    const plinko = Object.create(Plinko);

    options = Object.assign(
      {
        callId,
        thisArg: null
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

  call(targetFilter, method, ...args) {
    const targets = this.driver.resolveTargets(targetFilter);

    const promises = [];
    for (const target of targets) {
      const callId = this.options.callId(method);
      const promise = new Promise((resolve, reject) => {
        this.pendingCalls[callId] = {resolve, reject};
      });

      this.driver.sendMessage(target, {
        messageType: 'request',
        callId,
        method,
        args
      });

      promises.push(promise);
    }

    if (!Array.isArray(targetFilter)) {
      return promises[0];
    }

    return Promise.all(promises);
  },

  target(target) {
    return {
      call: (method, ...args) => {
        return this.call(target, method, ...args);
      }
    };
  },

  closeRequest(request, rejected, returnValue) {
    const {source: target, message: {callId}} = request;

    if (returnValue instanceof Error) {
      returnValue = {
        objectType: 'error',
        message: returnValue.message,
        stack: returnValue.stack
      };
    }

    this.driver.sendMessage(target, {
      messageType: 'response',
      callId,
      rejected,
      returnValue
    });
  },

  resolveRequest(request, returnValue) {
    this.closeRequest(request, false, returnValue);
  },

  rejectRequest(request, returnValue) {
    this.closeRequest(request, true, returnValue);
  },

  handleRequest(request) {
    const {message: {method, args}} = request;

    if (typeof this.methods[method] !== 'function') {
      const error = new Error(`Unknown method '${method}' called via Plinko.`);
      this.rejectRequest(request, error);
      return;
    }

    const initialReturn = this.methods[method].apply(this.options.thisArg, args);

    if (typeof initialReturn === 'function') {
      initialReturn(
        returnValue => this.resolveRequest(request, returnValue),
        returnValue => this.rejectRequest(request, returnValue)
      );
      return;
    }

    if (initialReturn instanceof Promise) {
      initialReturn.then(
        returnValue => this.resolveRequest(request, returnValue),
        returnValue => this.rejectRequest(request, returnValue)
      );
      return;
    }

    this.resolveRequest(request, initialReturn);
  },

  handleResponse(message) {
    const {callId, rejected, returnValue} = message;

    if (!this.pendingCalls[callId]) {
      return;
    }

    const pendingCall = this.pendingCalls[callId];
    if (rejected) {
      pendingCall.reject(returnValue);
      return;
    }

    pendingCall.resolve(returnValue);

    delete this.pendingCalls[callId];
  }
};

export default Plinko;
