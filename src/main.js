import Plinko from './plinko.js';
import WindowDriver from './driver/window-driver.js';
import ExtensionDriver from './driver/extension-driver.js';

export default Plinko;
export {Plinko};
export const {
  WindowPlinko,
  ExtensionBackgroundPlinko,
  ExtensionContentPlinko,
  ExtensionPopupPlinko
} = {
  WindowPlinko: {
    init(methods, expectedOrigin, thisWindow) {
      const driver = WindowDriver.init(expectedOrigin, thisWindow);
      return Plinko.init(driver, methods);
    }
  },

  ExtensionBackgroundPlinko: {
    init(methods) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_BACKGROUND);
      return Plinko.init(driver, methods);
    }
  },

  ExtensionContentPlinko: {
    init(methods) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_CONTENT);
      return Plinko.init(driver, methods);
    }
  },

  ExtensionPopupPlinko: {
    init(methods) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_POPUP);
      return Plinko.init(driver, methods);
    }
  }
};
