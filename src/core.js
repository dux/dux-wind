// DuxWind - Real-time CSS Generator Core
import { CONFIG, createDefaultConfig } from './config.js';
import { processClass, expandClass } from './styler.js';
import { addShortcut, isShortcut } from './shortcuts.js';
import { debounce, safeWrapper } from './utils.js';
import { splitContainerQueryClasses, updateContainerQueries, cleanupContainerQueriesForTree } from './container-query.js';
import { generateDoc } from './gen-doc.js';

// State management - use CONFIG singleton
const processedClasses = new Set();
let utilityStyleElement = null;
let shortcutStyleElement = null;
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
  const allClasses = processedClassString.split(/\s+/).filter(Boolean);
  const { regularClasses, containerQueries } = splitContainerQueryClasses(allClasses);

  regularClasses.forEach(className => {
    processClassForCSS(className);
  });

  if (containerQueries.length) {
    containerQueries.forEach(query => processClassForCSS(query.payload));
  }

  updateContainerQueries(element, containerQueries);

  // Check if any classes use visible: pseudo-state
  const hasVisiblePseudo = regularClasses.some(cls => cls.includes('visible:'));
  if (hasVisiblePseudo) {
    setupVisibilityObserver();
    elementsWithVisiblePseudo.set(element, regularClasses.filter(cls => cls.includes('visible:')));
    visibilityObserver.observe(element);
  }
}, 'processElement');


const processClassForCSS = safeWrapper(function(className) {
  if (processedClasses.has(className)) return;
  processedClasses.add(className);

  // Use styler to generate CSS rules
  const cssRules = processClass(className);
  const targetBucket = isShortcut(className) ? 'shortcut' : 'utility';
  cssRules.forEach(rule => {
    if (rule) {
      injectCSS(rule, targetBucket);
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
function injectCSS(css, target = 'utility') {
  if (!css) return;

  if (target === 'shortcut') {
    ensureShortcutStyleElement();
    shortcutStyleElement.textContent += css + '\n';
    return;
  }

  ensureUtilityStyleElement();
  utilityStyleElement.textContent += css + '\n';
}

function ensureUtilityStyleElement() {
  if (utilityStyleElement || typeof document === 'undefined') return;

  utilityStyleElement = document.getElementById('duxwind');
  if (!utilityStyleElement) {
    utilityStyleElement = document.createElement('style');
    utilityStyleElement.id = 'duxwind';
    document.head.appendChild(utilityStyleElement);
    utilityStyleElement.textContent = getAnimationKeyframes();
  }
}

function ensureShortcutStyleElement() {
  if (shortcutStyleElement || typeof document === 'undefined') return;

  shortcutStyleElement = document.getElementById('duxwind-shortcuts');
  if (!shortcutStyleElement) {
    shortcutStyleElement = document.createElement('style');
    shortcutStyleElement.id = 'duxwind-shortcuts';
    document.head.appendChild(shortcutStyleElement);
  }
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

  if (settings.breakpoints) {
    applyBreakpointOverrides(settings.breakpoints);
  }
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

function applyBreakpointOverrides(breakpointMap) {
  if (!isPlainObject(breakpointMap)) {
    console.warn('DuxWind: init breakpoints must be provided as an object map.');
    return;
  }

  const normalized = {};
  Object.entries(breakpointMap).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      normalized[key] = value.trim();
    } else {
      console.warn(`DuxWind: breakpoint "${key}" must be a non-empty string media query.`);
    }
  });

  if (!Object.keys(normalized).length) {
    return;
  }

  CONFIG.breakpoints = {
    ...CONFIG.breakpoints,
    ...normalized
  };
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        processNodeTree(node);
      });

      mutation.removedNodes.forEach(node => {
        cleanupContainerQueriesForTree(node);
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

function registerShortcut(shortcutName, shortcutClasses) {
  const existingDefinition = CONFIG.shortcuts?.[shortcutName];
  if (existingDefinition === shortcutClasses) {
    return true; // Nothing changed, skip reprocessing
  }

  const success = addShortcut(shortcutName, shortcutClasses);
  if (!success) {
    return false;
  }

  // Allow regenerated CSS for this class
  processedClasses.delete(shortcutName);

  // Immediately inject CSS for shortcuts that may already exist in the DOM
  if (typeof document !== 'undefined') {
    processClassForCSS(shortcutName);
  }

  return true;
}

export function shortcut(nameOrMap, classes) {
  if (nameOrMap && typeof nameOrMap === 'object' && !Array.isArray(nameOrMap)) {
    return Object.entries(nameOrMap).every(([shortcutName, shortcutClasses]) => {
      return registerShortcut(shortcutName, shortcutClasses);
    });
  }

  return registerShortcut(nameOrMap, classes);
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
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const matching = [];

    for (const [breakpointName, mediaQuery] of Object.entries(breakpoints)) {
      try {
        if (window.matchMedia(mediaQuery).matches) {
          matching.push([breakpointName, mediaQuery]);
        }
      } catch (error) {
        if (debugMode) {
          console.warn('DuxWind: invalid breakpoint media query', mediaQuery, error);
        }
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => getBreakpointWeight(b[1]) - getBreakpointWeight(a[1]));
      return matching[0][0];
    }
  }

  // Default fallback based on width if no media query matches
  if (width <= 768) {
    return 'm';
  }
  return 'd';
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

function getBreakpointWeight(mediaQuery) {
  if (!mediaQuery || typeof mediaQuery !== 'string') return 0;

  const minMatch = mediaQuery.match(/min-width\s*:\s*(\d+)px/i);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  const maxMatch = mediaQuery.match(/max-width\s*:\s*(\d+)px/i);
  if (maxMatch) {
    // Negative so min-widths always outrank max-widths when both match
    return -parseInt(maxMatch[1], 10);
  }

  return 0;
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
