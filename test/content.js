import {ExtensionContentPlinko as Plinko} from '../src/main.js';

const plinko = Plinko.init({
  'tab-status': token => {
    const backgroundPlinko = plinko.target('background');

    return backgroundPlinko.call('verify-token', token);
  }
});
