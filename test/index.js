import {WindowPlinko} from '../src/main.js';

const plinko = WindowPlinko.init({
  'get-user-info': ({id, name}) => {
    return {
      gid: id,
      email: `${name}@example.org`
    };
  },

  'set-child-status': async status => {
    const iframe = document.getElementById('iframe');
    const childPlinko = plinko.target(iframe.contentWindow);

    const previousTitle = await childPlinko.call('set-title', 'Frame Done');
    if (previousTitle !== 'Frame Running') {
      document.getElementById('title').textContent = 'Failed';
      return;
    }

    document.getElementById('title').textContent = 'Passed';
  }
});
