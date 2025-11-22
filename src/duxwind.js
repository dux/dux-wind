// DuxWind - Real-time CSS Generator (Browser/UMD)
import { init, resetCSS, loadClass, shortcut, CONFIG, getConfig, setConfig } from './core.js';
import { createDefaultConfig } from './config.js';
import { generateDoc } from './gen-doc.js';

const DuxWind = {
  // Core methods
  init,
  resetCss: resetCSS,
  loadClass,
  shortcut,
  loadDefaultConfig: () => {
    // Clear all properties and reset to defaults
    Object.keys(CONFIG).forEach(key => delete CONFIG[key]);
    const defaultConfig = createDefaultConfig();
    Object.assign(CONFIG, defaultConfig);
  },
  generateDoc,
  
  // Configuration access
  get config() {
    return getConfig();
  },
  set config(newConfig) {
    setConfig(newConfig);
  }
};

// Global export for browser usage
if (typeof window !== 'undefined') {
  window.DuxWind = DuxWind;
}

// ES Module export
export default DuxWind;