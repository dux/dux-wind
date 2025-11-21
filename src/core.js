// DuxWind - Real-time CSS Generator Core
import { CONFIG, createDefaultConfig } from './config.js';
import { processClass, expandClass } from './styler.js';
import { addShortcut } from './shortcuts.js';
import { debounce, safeWrapper } from './utils.js';
import { generateDoc } from './gen-doc.js';

// State management - use CONFIG singleton
const processedClasses = new Set();
let styleElement = null;
let debugMode = false;
let bodyClassMode = false;
let currentBodyClass = null;
let resizeObserver = null;

// Configuration access
export function getConfig() {
  return CONFIG;
}

export function setConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
}

// Element processing - let styler handle all expansion and CSS generation
const processElement = safeWrapper(function(element) {
  if (!element.classList?.length) return;

  const originalClasses = Array.from(element.classList);
  
  // Check if this element has classes that need DOM expansion (pipe notation or @ notation)
  const needsDOMExpansion = originalClasses.some(cls => cls.includes('|') || cls.includes('@'));
  
  if (needsDOMExpansion) {
    // Let styler expand classes, then update DOM
    const expandedClasses = [];
    originalClasses.forEach(className => {
      if (className.includes('|') || className.includes('@')) {
        // Use styler's expandClass to get expanded classes
        const expanded = expandClass(className);
        expandedClasses.push(...expanded);
      } else {
        expandedClasses.push(className);
      }
    });

    // Update the DOM with expanded classes
    element.className = expandedClasses.join(' ');
    
    // Set debug attribute to track original classes
    if (debugMode) {
      element.setAttribute('data-dw-original-classes', originalClasses.join(' '));
    }

    // Process CSS for all expanded classes
    expandedClasses.forEach(className => {
      processClassForCSS(className);
    });
  } else {
    // No expansion needed, just process CSS for existing classes
    originalClasses.forEach(className => {
      processClassForCSS(className);
    });
  }
}, 'processElement');


const processClassForCSS = safeWrapper(function(className) {
  if (processedClasses.has(className)) return;
  processedClasses.add(className);

  // Use styler to generate CSS rules
  const cssRules = processClass(className);
  cssRules.forEach(rule => {
    if (rule) {
      injectCSS(rule);
    }
  });
}, 'processClassForCSS');

function processNodeTree(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  processElement(node);

  const elementsWithClasses = node.querySelectorAll('[class]');
  elementsWithClasses.forEach(processElement);
}

// CSS injection - immediate for reliability
function injectCSS(css) {
  ensureStyleElement();
  styleElement.textContent += css + '\n';
}

function ensureStyleElement() {
  if (styleElement) return;

  styleElement = document.createElement('style');
  styleElement.setAttribute('data-duxwind', 'true');
  document.head.appendChild(styleElement);

  styleElement.textContent = getAnimationKeyframes();
}

function getAnimationKeyframes() {
  return `@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes pulse {
  50% { opacity: 0.5; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
`;
}

// Initialization
export function init(options = {}) {
  // Check if DOM is ready
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    // DOM is not ready, defer execution
    document.addEventListener('DOMContentLoaded', () => {
      init(options);
    });
    return;
  }

  const settings = parseInitOptions(options);
  debugMode = settings.debug;

  if (typeof window !== 'undefined') {
    window.DuxWindDebug = debugMode;
  }

  if (settings.clearCache) {
    processedClasses.clear();
  }

  if (settings.reset) {
    resetCSS();
  }

  const elementsWithClasses = document.querySelectorAll('[class]');
  elementsWithClasses.forEach(processElement);

  setupMutationObserver();
  
  if (settings.body) {
    setupBodyClassManagement();
  }
}

function parseInitOptions(options) {
  return {
    debug: options.debug !== undefined ? options.debug : (typeof window !== 'undefined' && window.location.port > 2000),
    reset: options.reset !== undefined ? options.reset : false,
    body: options.body !== undefined ? options.body : false,
    clearCache: true,
    ...options
  };
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        processNodeTree(node);
      });

      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        processElement(mutation.target);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

export function resetCSS() {
  const resetRules = `*,*::before,*::after{box-sizing:border-box}
*{margin:0}
html,body{height:100%}
body{line-height:1.5;-webkit-font-smoothing:antialiased}
img,picture,video,canvas,svg{display:block;max-width:100%}
input,button,textarea,select{font:inherit}
p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word}
#root,#__next{isolation:isolate}
ul,ol{list-style:none;padding:0}
a{color:inherit;text-decoration:none}
button{background:none;border:none;cursor:pointer}
table{border-collapse:collapse;border-spacing:0}
fieldset{border:none;padding:0}
legend{padding:0}
textarea{resize:vertical}
details summary{cursor:pointer}
:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
@media (prefers-color-scheme:dark){:root{color-scheme:dark}}`;

  let resetElement = document.querySelector('[data-duxwind-reset]');
  if (!resetElement) {
    resetElement = document.createElement('style');
    resetElement.setAttribute('data-duxwind-reset', 'true');
    document.head.insertBefore(resetElement, document.head.firstChild);
  }

  resetElement.textContent = resetRules;
}

export function loadClass(className) {
  processClassForCSS(className);
}

export function shortcut(name, classes) {
  return addShortcut(name, classes);
}

// Body class management
function setupBodyClassManagement() {
  bodyClassMode = true;
  
  // Set initial body class
  updateBodyClass();
  
  // Create debounced update function using utils
  const debouncedUpdate = debounce(updateBodyClass, 100);
  
  // Setup resize observer
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(document.body);
  } else {
    // Fallback to resize event
    window.addEventListener('resize', debouncedUpdate);
  }
}

function updateBodyClass() {
  if (!bodyClassMode || typeof window === 'undefined') return;
  
  const currentBreakpoint = getCurrentBreakpoint();
  const friendlyName = mapBreakpointToFriendlyName(currentBreakpoint);
  
  if (debugMode) {
    console.log('DuxWind: Breakpoint check - current:', currentBreakpoint, 'friendly:', friendlyName, 'width:', window.innerWidth);
  }
  
  if (currentBodyClass !== friendlyName) {
    // Remove old body class
    if (currentBodyClass) {
      document.body.classList.remove(currentBodyClass);
    }
    
    // Add new body class
    if (friendlyName) {
      document.body.classList.add(friendlyName);
    }
    
    currentBodyClass = friendlyName;
  }
}

function getCurrentBreakpoint() {
  const breakpoints = CONFIG.breakpoints;
  const width = window.innerWidth;
  
  // Check each breakpoint
  for (const [breakpointName, mediaQuery] of Object.entries(breakpoints)) {
    if (window.matchMedia(mediaQuery).matches) {
      return breakpointName;
    }
  }
  
  // Default fallback based on width if no media query matches
  // This handles the case where viewport doesn't match any breakpoint
  if (width <= 768) {
    return 'm';
  } else {
    return 'd';
  }
}

function mapBreakpointToFriendlyName(breakpointName) {
  if (!breakpointName) return null;
  
  const mapping = {
    'm': 'mobile',
    'd': 'desktop', 
    't': 'tablet'
  };
  
  return mapping[breakpointName] || breakpointName;
}

export { CONFIG };

// Auto-setup global when in browser
if (typeof window !== 'undefined') {
  const DuxWind = {
    init,
    resetCSS,
    loadClass,
    shortcut,
    getConfig,
    setConfig,
    generateDoc,
    get config() { return getConfig(); },
    set config(newConfig) { setConfig(newConfig); },
    // Debug access
    get processedClasses() { return processedClasses; }
  };

  window.DuxWind = DuxWind;
}
