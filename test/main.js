import test from 'tape';
import jsdom from 'jsdom';
import Plinko from '../src/main.js';

test('plinko can be instantiated', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  const plinko = Plinko.init(parentWindow, childWindow, '*', {});

  t.equals(Object.isPrototypeOf.call(Plinko, plinko), true);
});

test('plinko method in other window can be called', async t => {
  t.plan(2);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  Plinko.init(parentWindow, childWindow, '*', {
    getUser() {
      return {
        gid: 12345,
        email: 'matt@example.org'
      };
    }
  });
  const childPlinko = Plinko.init(childWindow, parentWindow, '*', {});

  const user = await childPlinko.call('getUser');
  t.equals(user.gid, 12345);
  t.equals(user.email, 'matt@example.org');
});

test('methods can call resolve asynchronously', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  Plinko.init(parentWindow, childWindow, '*', {
    whenYouAreReady(someValues) {
      return resolve => {
        resolve(someValues);
      };
    }
  });
  const childPlinko = Plinko.init(childWindow, parentWindow, '*', {});

  t.deepEquals(
    await childPlinko.call('whenYouAreReady', [1, 2, 3]),
    [1, 2, 3]
  );
});

test('methods can call reject asynchronously', t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  Plinko.init(parentWindow, childWindow, '*', {
    whenYouAreReady() {
      return (resolve, reject) => {
        reject();
      };
    }
  });
  const childPlinko = Plinko.init(childWindow, parentWindow, '*', {});

  childPlinko.call('whenYouAreReady', [1, 2, 3]).catch(() => {
    t.equals(true, true);
  });
});

test('methods can return promises', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  const parentPlinko = Plinko.init(parentWindow, childWindow, '*', {
    async pingPong(count) {
      if (count <= 0) {
        return 0;
      }

      return count + await parentPlinko.call('pingPong', count - 1);
    }
  });
  const childPlinko = Plinko.init(childWindow, parentWindow, '*', {
    async pingPong(count) {
      if (count <= 0) {
        return 0;
      }

      return (2 * count) + await childPlinko.call('pingPong', count - 1);
    }
  });

  const count = await childPlinko.call('pingPong', 5);
  // 5 + 4 * 2 + 3 + 2 * 2 + 1 = 31
  t.equals(21, count);
});

test('undefined method causes rejection', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  Plinko.init(parentWindow, childWindow, '*', {});
  const childPlinko = Plinko.init(childWindow, parentWindow, '*', {});

  childPlinko.call('whenYouAreReady', [1, 2, 3]).catch(() => {
    t.equals(true, true);
  });
});
