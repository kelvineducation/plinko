import {ExtensionBackgroundPlinko as Plinko} from '../src/main.js';

const Background = {
  init() {
    const bg = Object.create(Background);

    bg.token = Date.now();
    bg.plinko = Plinko.init(Background, {thisArg: bg});

    return bg;
  },

  status(passed, failed) {
    return new Promise(resolve => {
      chrome.tabs.query({active: true}, async ([tab]) => {
        const tabStatus = await this.plinko.call(tab.id, 'tab-status', this.token);
        resolve(tabStatus ? passed : failed);
      });
    });
  },

  'verify-token'(token) {
    return this.token === token;
  }
};

Background.init();
