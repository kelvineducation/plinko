import {WindowPlinko} from '../src/main.js';

(async () => {
  const plinko = WindowPlinko.init({
    'set-title': title => {
      const header = document.getElementById('title');
      const previousTitle = header.textContent;

      header.textContent = title;

      return previousTitle;
    }
  });

  const checkUserInfo = userInfo => {
    if (!userInfo) {
      console.error(`userInfo returned was blank`);
      return false;
    }

    if (userInfo.gid !== 12345) {
      console.error(`gid returned was '${userInfo.gid} but expected '12345'.`);
      return false;
    }

    if (userInfo.email !== 'matt@example.org') {
      console.error(`email returned was '${userInfo.email} but expected 'matt@example.org'.`);
      return false;
    }

    return true;
  };

  const parentPlinko = plinko.target(window.parent);

  const userInfo = await parentPlinko.call(
    'get-user-info',
    {id: 12345, name: 'matt'}
  );
  const status = checkUserInfo(userInfo);
  parentPlinko.call('set-child-status', status);
})();
