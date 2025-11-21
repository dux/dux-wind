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
let visibilityObserver = null;
const elementsWithVisiblePseudo = new WeakMap();

// Configuration access
export function getConfig() {
  return CONFIG;
}

export function setConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
}

// Process entire class attribute string
function expandClassString(classString) {
  return classString
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(expandClass)  // This handles colon-to-pipe conversion and all expansions
    .join(' ');
}

// Element processing - process entire class attribute
const processElement = safeWrapper(function(element) {
  const originalClassString = element.getAttribute('class');
  if (!originalClassString || !originalClassString.trim()) return;

  const processedClassString = expandClassString(originalClassString);
  
  // Replace class attribute if it changed
  if (processedClassString !== originalClassString) {
    element.setAttribute('class', processedClassString);
    
    // Add debug info if enabled
    if (debugMode) {
      element.setAttribute('data-dw-original', originalClassString);
    }
  }
  
  // Generate CSS for all processed classes
  const processedClasses = processedClassString.split(/\s+/).filter(Boolean);
  processedClasses.forEach(className => {
    processClassForCSS(className);
  });
  
  // Check if any classes use visible: pseudo-state
  const hasVisiblePseudo = processedClasses.some(cls => cls.includes('visible:'));
  if (hasVisiblePseudo) {
    setupVisibilityObserver();
    elementsWithVisiblePseudo.set(element, processedClasses.filter(cls => cls.includes('visible:')));
    visibilityObserver.observe(element);
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
  
  // Setup visibility observer for existing elements with visible: pseudo
  const elementsWithVisible = document.querySelectorAll('[class*="visible:"]');
  if (elementsWithVisible.length > 0) {
    setupVisibilityObserver();
  }
}

function parseInitOptions(options) {
  return {
    debug: options.debug !== undefined ? options.debug : (typeof window !== 'undefined' && window.location.port > 2000),
    reset: options.reset !== undefined ? options.reset : true,
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

function setupVisibilityObserver() {
  if (visibilityObserver) return;
  
  visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      const visibleClasses = elementsWithVisiblePseudo.get(element);
      
      if (!visibleClasses) return;
      
      if (entry.isIntersecting) {
        // Element is visible - add the visible state
        element.classList.add('dw-visible');
      } else {
        // Element is not visible - remove the visible state
        element.classList.remove('dw-visible');
      }
    });
  }, {
    // Options for when to trigger
    threshold: 0.7, // Trigger when 70% visible
    rootMargin: '0px'
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
