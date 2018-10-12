import test from 'tape';
import jsdom from 'jsdom';
import {Plinko, WindowPlinko} from '../src/main.js';

test('plinko can be instantiated', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  const plinko = WindowPlinko.init({}, parentWindow, childWindow, '*');

  t.equals(Object.isPrototypeOf.call(Plinko, plinko), true);
});

test('plinko method in other window can be called', async t => {
  t.plan(2);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  WindowPlinko.init({
    getUser() {
      return {
        gid: 12345,
        email: 'matt@example.org'
      };
    }
  }, parentWindow, childWindow, '*');
  const childPlinko = WindowPlinko.init({}, childWindow, parentWindow, '*');

  try {
    const user = await childPlinko.call('getUser');
    t.equals(user.gid, 12345);
    t.equals(user.email, 'matt@example.org');
  } catch (exception) {
    console.error(exception, exception.stack);
    t.fail();
  }
});

test('methods can call resolve asynchronously', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  WindowPlinko.init({
    whenYouAreReady(someValues) {
      return resolve => {
        resolve(someValues);
      };
    }
  }, parentWindow, childWindow, '*');
  const childPlinko = WindowPlinko.init({}, childWindow, parentWindow, '*');

  try {
    t.deepEquals(
      await childPlinko.call('whenYouAreReady', [1, 2, 3]),
      [1, 2, 3]
    );
  } catch (exception) {
    console.error(exception, exception.stack);
  }
});

test('methods can call reject asynchronously', t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  WindowPlinko.init({
    whenYouAreReady() {
      return (resolve, reject) => {
        reject();
      };
    }
  }, parentWindow, childWindow, '*');
  const childPlinko = WindowPlinko.init({}, childWindow, parentWindow, '*');

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

  const parentPlinko = WindowPlinko.init({
    async pingPong(count) {
      if (count <= 0) {
        return 0;
      }

      return count + await parentPlinko.call('pingPong', count - 1);
    }
  }, parentWindow, childWindow, '*');
  const childPlinko = WindowPlinko.init({
    async pingPong(count) {
      if (count <= 0) {
        return 0;
      }

      return (2 * count) + await childPlinko.call('pingPong', count - 1);
    }
  }, childWindow, parentWindow, '*');

  try {
    const count = await childPlinko.call('pingPong', 5);
    // 5 + 4 * 2 + 3 + 2 * 2 + 1 = 31
    t.equals(21, count);
  } catch (exception) {
    console.error(exception, exception.stack);
  }
});

test('undefined method causes rejection', async t => {
  t.plan(1);

  const parentDocument = new jsdom.JSDOM();
  const childDocument = new jsdom.JSDOM();

  const parentWindow = parentDocument.window;
  const childWindow = childDocument.window;

  WindowPlinko.init({}, parentWindow, childWindow, '*');
  const childPlinko = WindowPlinko.init({}, childWindow, parentWindow, '*');

  childPlinko.call('whenYouAreReady', [1, 2, 3]).catch(() => {
    t.equals(true, true);
  });
});
