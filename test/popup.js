import {ExtensionPopupPlinko as Plinko} from '../src/main.js';

(async () => {
  const plinko = Plinko.init();

  const backgroundPlinko = plinko.target('background');

  const status = backgroundPlinko.call('status', 'Passed', 'Failed');
  document.getElementById('title').textContent = await status;
})();
