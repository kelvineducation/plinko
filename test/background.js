import {ExtensionBackgroundPlinko as Plinko} from '../src/main.js';

const Background = {
  init() {
    const bg = Object.create(Background);

    bg.token = Date.now();
    bg.plinko = Plinko.init(Background, {thisArg: bg});

    return bg;
  },

  async status(passed, failed) {
    const tabCriteria = {};
    const method = {
      name: 'tab-status',
      timeout: 1000,
      timeoutCallback: resolve => resolve(true)
    };
    const statuses = await this.plinko.call(tabCriteria, method, this.token);
    const allSuccess = statuses.every(status => status);

    return allSuccess ? passed : failed;
  },

  'verify-token'(token) {
    return this.token === token;
  }
};

Background.init();
