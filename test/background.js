import {ExtensionBackgroundPlinko as Plinko} from '../src/main.js';

const Background = {
  init() {
    const bg = Object.create(Background);

    bg.token = Date.now();
    bg.plinko = Plinko.init(Background, {thisArg: bg});

    return bg;
  },

  async status(passed, failed) {
    const tabCriteria = {active: true};
    const statuses = await this.plinko.call(tabCriteria, 'tab-status', this.token);
    const allSuccess = statuses.every(status => status);

    return allSuccess ? passed : failed;
  },

  'verify-token'(token) {
    return this.token === token;
  }
};

Background.init();
