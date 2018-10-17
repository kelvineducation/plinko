import {ExtensionBackgroundPlinko as Plinko} from '../src/main.js';

const now = Date.now();

const plinko = Plinko.init({
  'status': (passed, failed) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({active: true}, async ([tab]) => {
        resolve(
          (await plinko.call(tab.id, 'tab-status', now))
          ? passed
          : failed
        );
      });
    });
  },

  'verify-token': token => {
    return now === token;
  }
});
