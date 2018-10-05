const Plinko = {
  init(thisWindow, targetWindow, expectedOrigin, methods) {
    const plinko = Object.create(Plinko);

    Object.assign(plinko, {
      window: thisWindow,
      targetWindow,
      expectedOrigin,
      methods
    });

    plinko.pendingCalls = {};

    thisWindow.addEventListener('message', plinko.listen());

    return plinko;
  },

  call(method, ...args) {
    const rand = Math.random().toString(36).substring(2);
    const time = Date.now();

    const callId = `plinko-${method}-${rand}-${time}`;

    const promise = new Promise((resolve, reject) => {
      this.pendingCalls[callId] = {resolve, reject};
    });

    this.targetWindow.postMessage(
      {
        messageType: 'request',
        callId,
        method,
        args
      },
      this.expectedOrigin
    );

    return promise;
  },

  closeRequest(callId, rejected, returnValue) {
    this.targetWindow.postMessage(
      {
        messageType: 'response',
        callId,
        rejected,
        returnValue
      },
      this.expectedOrigin
    );
  },

  resolveRequest(callId, returnValue) {
    this.closeRequest(callId, false, returnValue);
  },

  rejectRequest(callId) {
    this.closeRequest(callId, true, null);
  },

  handleRequest(event) {
    const {callId, method, args} = event.data;

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

  handleResponse(event) {
    const {callId, rejected, returnValue} = event.data;

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
  },

  listen() {
    return event => {
      if (this.expectedOrigin !== '*' && this.expectedOrigin !== event.origin) {
        return;
      }

      const {messageType, callId} = event.data;
      if (!messageType || !callId) {
        return;
      }

      if (messageType === 'request') {
        this.handleRequest(event);
        return;
      }

      if (messageType === 'response') {
        this.handleResponse(event);
      }
    };
  }
};

export default Plinko;
