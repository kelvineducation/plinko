import {WindowPlinko} from '../src/main.js';

const iframe = document.getElementById('iframe');

const plinko = WindowPlinko.init({
  'get-user-info': ({id, name}) => {
    return {
      gid: id,
      email: `${name}@example.org`
    };
  },

  'set-child-status': async status => {
    const previousTitle = await plinko.call('set-title', 'Frame Done');
    if (previousTitle !== 'Frame Running') {
      document.getElementById('title').textContent = 'Failed';
      return;
    }

    document.getElementById('title').textContent = 'Passed';
  }
}, window, iframe.contentWindow);
