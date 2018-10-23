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
    init(methods, expectedOrigin, plinkoOptions) {
      const driver = WindowDriver.init(expectedOrigin);
      return Plinko.init(driver, methods, plinkoOptions);
    }
  },

  ExtensionBackgroundPlinko: {
    init(methods, plinkoOptions) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_BACKGROUND);
      return Plinko.init(driver, methods, plinkoOptions);
    }
  },

  ExtensionContentPlinko: {
    init(methods, plinkoOptions) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_CONTENT);
      return Plinko.init(driver, methods, plinkoOptions);
    }
  },

  ExtensionPopupPlinko: {
    init(methods, plinkoOptions) {
      const driver = ExtensionDriver.init(ExtensionDriver.TYPE_POPUP);
      return Plinko.init(driver, methods, plinkoOptions);
    }
  }
};
