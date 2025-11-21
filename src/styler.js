// DuxWind Styler - CSS Generation Engine
import { CONFIG, CONSTANTS } from './config.js';
import { isShortcut, generateShortcutCSS } from './shortcuts.js';
import { memoize, safeWrapper, escapeSelector } from './utils.js';

/**
 * Main styler function that takes a class attribute string and returns CSS rules
 * @param {string} classAttribute - Full class attribute like "p-10|20 bg-blue-500 hover:text-white"
 * @returns {string[]} Array of CSS rules
 */
export const generateStyles = safeWrapper(function(classAttribute) {
  if (!classAttribute || typeof classAttribute !== 'string') {
    return [];
  }

  const cssRules = [];
  const classes = classAttribute.trim().split(/\s+/).filter(Boolean);
  
  for (const className of classes) {
    const rules = processClass(className);
    cssRules.push(...rules);
  }
  
  return cssRules;
}, 'generateStyles');

// Set default value for error cases
generateStyles.defaultValue = [];

/**
 * Expand/prepare a single class name for usage
 * Handles all transformations: [] removal, @ notation, pipe notation expansion, etc.
 * @param {string} className - Raw class name like "p-[10px]", "p-10@m", "p-10|20"
 * @returns {string[]} Array of expanded/cleaned class names ready for processing
 */
export function expandClass(className) {
  if (!className || typeof className !== 'string') {
    return [];
  }

  // Step 1: Clean bracket syntax: w-[200px] → w-200px, bg-[#ff0000] → bg-ff0000
  let cleanClass = cleanClassName(className);

  // Step 2: Handle @ notation: p-10@m → m:p-10
  cleanClass = handleAtNotation(cleanClass);

  // Step 3: Pre-filter colon notation to pipe notation: p-10:20 → p-10|20
  cleanClass = normalizeColonToPipe(cleanClass);

  // Step 4: Expand pipe notation: p-10|20 → [m:p-10, d:p-20]
  if (cleanClass.includes('|')) {
    return expandPipeNotation(cleanClass);
  }

  // Step 5: Return single cleaned class
  return [cleanClass];
}

/**
 * Process a single class and return CSS rules
 * @param {string} className - Single class like "p-10|20" or "hover:bg-blue-500"
 * @returns {string[]} Array of CSS rules for this class
 */
export function processClass(className) {
  // Handle shortcuts first
  if (isShortcut(className)) {
    return generateShortcutCSS(className, processClass);
  }
  
  // Use expandClass to handle all transformations
  const expandedClasses = expandClass(className);
  const cssRules = [];
  
  expandedClasses.forEach(expandedClass => {
    // Generate CSS for each expanded class
    const cssRule = generateCSSRule(expandedClass);
    if (cssRule) {
      cssRules.push(cssRule);
    }
  });
  
  return cssRules;
}

// Helper functions for expandClass

/**
 * Clean class name - handle bracket syntax
 * @param {string} className 
 * @returns {string}
 */
function cleanClassName(className) {
  // Simple rule: only auto-convert number+unit values like p-12px, w-50vh, etc.
  // Everything else must already have brackets to be valid
  
  // If already has brackets, keep as-is
  if (className.includes('[') && className.includes(']')) {
    return className;
  }
  
  // Convert number followed by any string: property-NUMBER+STRING → property-[NUMBER+STRING]
  // Matches: 12px, 50vh, 100%, 45deg, 300ms, etc.
  return className.replace(/^([^-]+)-(\d+[a-zA-Z%]+)$/, '$1-[$2]');
}

/**
 * Handle @ notation: p-10@m → m:p-10
 * @param {string} className 
 * @returns {string}
 */
function handleAtNotation(className) {
  return className.replace(/^([^@]+)@([a-z]+)$/, '$2:$1');
}

/**
 * Normalize colon notation to pipe notation for numeric patterns
 * @param {string} className 
 * @returns {string}
 */
function normalizeColonToPipe(className) {
  // Convert p-10:20 → p-10|20 (but preserve hover:, focus:, etc.)
  return className.replace(/^([a-z-]+-\d+)(:\d+)+$/g, (match) => {
    return match.replace(/:/g, '|');
  });
}

/**
 * Extract modifier prefix from class name
 * @param {string} className 
 * @returns {object}
 */
function extractModifierPrefix(className) {
  const pseudoStates = CONSTANTS.SUPPORTED_PSEUDO_STATES;
  
  for (const pseudo of pseudoStates) {
    const prefix = `${pseudo}:`;
    if (className.startsWith(prefix)) {
      return {
        prefix,
        baseClass: className.substring(prefix.length)
      };
    }
  }
  
  return { prefix: '', baseClass: className };
}

/**
 * Parse class pattern for pipe notation
 * @param {string} className 
 * @returns {object|null}
 */
function parseClassPattern(className) {
  const match = className.match(/^(-?)([a-z-]+)-(.+)$/);
  if (!match) return null;
  
  const [, negative, base, valuesStr] = match;
  if (!valuesStr.includes('|')) return null;
  
  const cleanValues = valuesStr.replace(/\[([^\]]+)\]/g, '$1');
  const values = cleanValues.split('|');
  
  return { negative, base, values };
}

/**
 * Expand pipe notation like "p-10|20" to responsive classes
 * @param {string} className 
 * @returns {string[]} Array of expanded class names
 */
function expandPipeNotation(className) {
  // Extract modifier prefix (hover:, focus:, etc.)
  const { prefix, baseClass } = extractModifierPrefix(className);
  
  const parsed = parseClassPattern(baseClass);
  if (!parsed) return [className];
  
  const { negative, base, values } = parsed;
  const breakpoints = Object.keys(CONFIG.breakpoints);
  
  if (values.length !== breakpoints.length) {
    return [className];
  }
  
  return breakpoints.map((breakpoint, index) => {
    const classValue = `${negative}${base}-${values[index]}`;
    const fullClass = prefix ? `${prefix}${classValue}` : classValue;
    return `${breakpoint}:${fullClass}`;
  });
}

/**
 * Generate CSS rule for a single class
 * @param {string} className 
 * @returns {string|null} CSS rule or null
 */
// Memoized CSS rule generation for performance
const generateCSSRule = memoize(function(className) {
  const parsed = parseClassModifiers(className);
  const { actualClass, breakpoint, modifiers } = parsed;
  
  // Try keyword classes first
  const keywordCSS = tryParseKeyword(actualClass, className, modifiers, breakpoint);
  if (keywordCSS) return keywordCSS;
  
  // Try numeric classes (including fractions)
  const numericCSS = tryParseNumeric(actualClass, className, modifiers, breakpoint);
  if (numericCSS) return numericCSS;
  
  // Try arbitrary values
  const arbitraryCSS = tryParseArbitrary(actualClass, className, modifiers, breakpoint);
  if (arbitraryCSS) return arbitraryCSS;
  
  return null;
});

/**
 * Parse class modifiers (breakpoints and pseudo-states)
 * @param {string} className 
 * @returns {object} Parsed modifiers
 */
// Memoized class modifier parsing for performance
const parseClassModifiers = memoize(function(className) {
  const parts = className.split(':');
  const pseudoStates = CONSTANTS.SUPPORTED_PSEUDO_STATES;
  
  let breakpoint = null;
  let modifiers = [];
  let classIndex = 0;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (CONFIG.breakpoints[parts[i]]) {
      breakpoint = parts[i];
      classIndex = i + 1;
    } else if (pseudoStates.includes(parts[i])) {
      modifiers.push(parts[i]);
      classIndex = i + 1;
    } else {
      break;
    }
  }
  
  const actualClass = parts.slice(classIndex).join(':');
  return { actualClass, breakpoint, modifiers };
});

/**
 * Try to parse as keyword class
 * @param {string} actualClass 
 * @param {string} className 
 * @param {string[]} modifiers 
 * @param {string|null} breakpoint 
 * @returns {string|null}
 */
function tryParseKeyword(actualClass, className, modifiers, breakpoint) {
  if (CONFIG.keywords && CONFIG.keywords[actualClass]) {
    return buildCSSRule(className, 'KEYWORD', CONFIG.keywords[actualClass], modifiers, breakpoint);
  }
  return null;
}

/**
 * Try to parse as numeric class (including fractions)
 * @param {string} actualClass 
 * @param {string} className 
 * @param {string[]} modifiers 
 * @param {string|null} breakpoint 
 * @returns {string|null}
 */
function tryParseNumeric(actualClass, className, modifiers, breakpoint) {
  // Try fractional values first (w-1/2, h-3/4, etc.)
  const fractionMatch = actualClass.match(/^(-?)([a-z-]+)-(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const [, negative, property, numerator, denominator] = fractionMatch;
    const percentage = (parseInt(numerator) / parseInt(denominator) * 100).toFixed(6);
    const cssValue = negative ? `-${percentage}%` : `${percentage}%`;
    const cssProperty = CONFIG.props[property];
    
    if (!cssProperty) return null;
    return buildCSSRule(className, cssProperty, cssValue, modifiers, breakpoint);
  }
  
  // Try regular numeric values
  const match = actualClass.match(/^(-?)([a-z-]+)-(\d+)(px|%)?$/);
  if (!match) return null;
  
  const [, negative, property, value, unit] = match;
  let cssValue = calculateNumericValue(property, value, unit, negative);
  const cssProperty = CONFIG.props[property];
  
  if (!cssProperty) return null;
  
  // Special handling for transform functions with numeric values
  if (cssProperty === 'transform') {
    switch (property) {
      case 'scale':
        // For scale, use the raw value (scale-105 = scale(1.05))
        cssValue = `scale(${parseInt(value) / 100})`;
        break;
      case 'scale-x':
        cssValue = `scaleX(${parseInt(value) / 100})`;
        break;
      case 'scale-y':
        cssValue = `scaleY(${parseInt(value) / 100})`;
        break;
      case 'rotate':
        // For rotate, use degrees (rotate-180 = rotate(180deg))
        cssValue = `rotate(${parseInt(value)}deg)`;
        break;
      case 'translate-x':
        cssValue = `translateX(${cssValue})`;
        break;
      case 'translate-y':
        cssValue = `translateY(${cssValue})`;
        break;
      case 'skew-x':
        cssValue = `skewX(${parseInt(value)}deg)`;
        break;
      case 'skew-y':
        cssValue = `skewY(${parseInt(value)}deg)`;
        break;
    }
  }
  
  return buildCSSRule(className, cssProperty, cssValue, modifiers, breakpoint);
}

/**
 * Try to parse as arbitrary value class
 * @param {string} actualClass 
 * @param {string} className 
 * @param {string[]} modifiers 
 * @param {string|null} breakpoint 
 * @returns {string|null}
 */
function tryParseArbitrary(actualClass, className, modifiers, breakpoint) {
  const match = actualClass.match(/^([a-z-]+)-(.+)$/);
  if (!match) return null;
  
  const [, property, rawValue] = match;
  const cssProperty = CONFIG.props[property];
  
  if (!cssProperty) return null;
  
  // Extract value from brackets if present: [1.05] → 1.05, [#ff0000] → #ff0000
  const value = rawValue.startsWith('[') && rawValue.endsWith(']') 
    ? rawValue.slice(1, -1)  // Remove brackets
    : rawValue;
  
  // Special handling for transform functions
  let cssValue = value;
  if (cssProperty === 'transform') {
    // Transform functions need to be wrapped properly
    switch (property) {
      case 'scale':
        cssValue = `scale(${value})`;
        break;
      case 'scale-x':
        cssValue = `scaleX(${value})`;
        break;
      case 'scale-y':
        cssValue = `scaleY(${value})`;
        break;
      case 'rotate':
        cssValue = `rotate(${value})`;
        break;
      case 'translate-x':
        cssValue = `translateX(${value})`;
        break;
      case 'translate-y':
        cssValue = `translateY(${value})`;
        break;
      case 'skew-x':
        cssValue = `skewX(${value})`;
        break;
      case 'skew-y':
        cssValue = `skewY(${value})`;
        break;
      default:
        cssValue = value;
    }
  }
  
  return buildCSSRule(className, cssProperty, cssValue, modifiers, breakpoint);
}

/**
 * Calculate numeric value with units
 * @param {string} property 
 * @param {string} value 
 * @param {string} unit 
 * @param {boolean} negative 
 * @returns {string}
 */
function calculateNumericValue(property, value, unit, negative) {
  const numericValue = parseInt(value);
  const multiplier = negative ? -1 : 1;
  
  if (property === 'opacity') {
    return numericValue / 100;
  }
  if (unit === '%') {
    return `${numericValue * multiplier}%`;
  }
  if (unit === 'px') {
    return `${numericValue * multiplier}px`;
  }
  return `${numericValue * CONFIG.pixelMultiplier * multiplier}px`;
}

/**
 * Build final CSS rule
 * @param {string} className 
 * @param {string|string[]} cssProperty 
 * @param {string} cssValue 
 * @param {string[]} modifiers 
 * @param {string|null} breakpoint 
 * @returns {string}
 */
function buildCSSRule(className, cssProperty, cssValue, modifiers, breakpoint) {
  const selector = buildCSSSelector(className, modifiers);
  const rule = buildCSSDeclaration(selector, cssProperty, cssValue);
  
  return breakpoint 
    ? `@media ${CONFIG.breakpoints[breakpoint]} { ${rule} }`
    : rule;
}

/**
 * Build CSS selector with proper escaping
 * @param {string} className 
 * @param {string[]} modifiers 
 * @returns {string}
 */
function buildCSSSelector(className, modifiers) {
  let selector = `.${escapeSelector(className)}`;
  
  modifiers.forEach(modifier => {
    // Use constants for pseudo-selector mapping
    const pseudoSelector = CONSTANTS.PSEUDO_SELECTOR_MAPPING[modifier] || modifier;
    
    // Special handling for visible pseudo-state
    if (modifier === 'visible') {
      // For visible, we need to combine with .dw-visible class
      selector += pseudoSelector;
    } else {
      selector += `:${pseudoSelector}`;
    }
  });
  
  return selector;
}

/**
 * Build CSS declaration
 * @param {string} selector 
 * @param {string|string[]} cssProperty 
 * @param {string} cssValue 
 * @returns {string}
 */
function buildCSSDeclaration(selector, cssProperty, cssValue) {
  if (cssProperty === 'KEYWORD') {
    return `${selector} { ${cssValue} }`;
  }
  
  if (Array.isArray(cssProperty)) {
    const declarations = cssProperty.map(prop => `${prop}: ${cssValue}`).join('; ');
    return `${selector} { ${declarations}; }`;
  }
  
  return `${selector} { ${cssProperty}: ${cssValue}; }`;
}

