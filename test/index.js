import {WindowPlinko} from '../src/main.js';

const plinko = WindowPlinko.init({
  'get-user-info': ({id, name}) => {
    return {
      gid: id,
      email: `${name}@example.org`
    };
  },

  'set-child-status': async () => {
    const iframe = document.getElementById('iframe');
    const childPlinko = plinko.target(iframe.contentWindow);

    let handledError = false;
    try {
      await childPlinko.call('undefined-method-error');
    } catch (e) {
      handledError = (e.message === "Unknown method 'undefined-method-error' called via Plinko.");
    }

    if (!handledError) {
      document.getElementById('title').textContent
        = 'Failed, undefined-method-error call did not result in an error being properly handled.';
      return;
    }

    const previousTitle = await childPlinko.call('set-title', 'Frame Done');
    if (previousTitle !== 'Frame Running') {
      document.getElementById('title').textContent = 'Failed, previous frame title does not mathc expected';
      return;
    }

    document.getElementById('title').textContent = 'Passed';
  }
});
