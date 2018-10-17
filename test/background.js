import {ExtensionBackgroundPlinko as Plinko} from '../src/main.js';

const now = Date.now();

const plinko = Plinko.init({
  status: (passed, failed) => {
    return new Promise(resolve => {
      chrome.tabs.query({active: true}, async ([tab]) => {
        const tabStatus = await plinko.call(tab.id, 'tab-status', now);
        resolve(tabStatus ? passed : failed);
      });
    });
  },

  'verify-token': token => {
    return now === token;
  }
});
