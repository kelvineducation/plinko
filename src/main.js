import Plinko from './plinko.js';
import WindowDriver from './driver/window-driver.js';
import ExtensionBackgroundDriver from './driver/extension-background-driver.js';
import ExtensionTabDriver from './driver/extension-tab-driver.js';

export default Plinko;
export {Plinko};
export const {WindowPlinko, ExtensionBackground, ExtensionTab} = {
  WindowPlinko: {
    init(methods, thisWindow, expectedOrigin) {
      const driver = WindowDriver.init(thisWindow, expectedOrigin);
      return Plinko.init(driver, methods);
    }
  },

  ExtensionBackgroundPlinko: {
    init(methods) {
      const driver = ExtensionBackgroundDriver.init();
      return Plinko.init(driver, methods);
    }
  },

  ExtensionTabPlinko: {
    init(methods, tabId) {
      const driver = ExtensionTabDriver.init(tabId);
      return Plinko.init(driver, methods);
    }
  }
};
