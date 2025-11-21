// DuxWind Shortcuts - Shortcut Management and Expansion
import { CONFIG } from './config.js';
import { generateStyles } from './styler.js';
import { safeWrapper, escapeSelector } from './utils.js';

/**
 * Check if a class name is a shortcut
 * @param {string} className 
 * @returns {boolean}
 */
export function isShortcut(className) {
  return CONFIG.shortcuts && CONFIG.shortcuts[className];
}

/**
 * Get shortcut definition
 * @param {string} shortcutName 
 * @returns {string|null} Space-separated class list or null
 */
export function getShortcut(shortcutName) {
  return CONFIG.shortcuts?.[shortcutName] || null;
}

/**
 * Add or update a shortcut
 * @param {string} name 
 * @param {string} classes 
 * @returns {boolean} Success status
 */
export function addShortcut(name, classes) {
  if (CONFIG.keywords?.[name]) {
    console.error(`DuxWind: cant create shortcut "${name}" because it is already defined as a keyword class`);
    return false;
  }

  if (!CONFIG.shortcuts) {
    CONFIG.shortcuts = {};
  }

  CONFIG.shortcuts[name] = classes;
  return true;
}

/**
 * Expand a shortcut to its constituent classes recursively
 * @param {string} shortcutName 
 * @returns {string[]} Array of expanded class names
 */
export function expandShortcut(shortcutName) {
  if (!isShortcut(shortcutName)) {
    return [shortcutName]; // Not a shortcut, return as is
  }

  const shortcutClasses = getShortcut(shortcutName).split(/\s+/).filter(Boolean);
  const expandedClasses = [];

  function expandClasses(classes) {
    classes.forEach(className => {
      if (isShortcut(className)) {
        // Nested shortcut - expand it recursively
        const nestedClasses = getShortcut(className).split(/\s+/).filter(Boolean);
        expandClasses(nestedClasses);
      } else {
        // Regular class - add to expanded list if not already present
        if (!expandedClasses.includes(className)) {
          expandedClasses.push(className);
        }
      }
    });
  }

  expandClasses(shortcutClasses);
  return expandedClasses;
}

/**
 * Generate CSS for a shortcut by processing its constituent classes
 * @param {string} shortcutName 
 * @param {function} processClassFunction - Function to process individual classes (unused, kept for compatibility)
 * @returns {string[]} Array of CSS rules
 */
export const generateShortcutCSS = safeWrapper(function(shortcutName, processClassFunction) {
  if (!shortcutName || typeof shortcutName !== 'string') {
    return [];
  }
  
  if (!isShortcut(shortcutName)) {
    return [];
  }

  const expandedClasses = expandShortcut(shortcutName);
  
  // Use styler's generateStyles for all the heavy lifting
  const allRules = generateStyles(expandedClasses.join(' '));

  // Replace selectors with shortcut name while preserving pseudo-states and media queries
  const shortcutSelector = escapeSelector(shortcutName);
  const shortcutRules = allRules.map(rule => {
    // For each rule, replace the first class selector with the shortcut selector
    // while preserving everything else (pseudo-states, media queries, etc.)
    
    // Media query rule: @media ... { .class-name:pseudo { ... } }
    if (rule.startsWith('@media')) {
      return rule.replace(
        /(\@media[^{]+\{\s*)\.([^:\s]+)(:[^{]*)?(\s*\{[^}]+\}\s*\})/,
        `$1.${shortcutSelector}$3$4`
      );
    }
    
    // Regular rule: .class-name:pseudo { ... }
    // Simple replacement: find the selector up to space or { and replace it
    const selectorEndIndex = rule.indexOf(' ');
    if (selectorEndIndex !== -1) {
      // Find the pseudo-state part (everything after the last unescaped colon)
      const selectorPart = rule.substring(0, selectorEndIndex);
      const restPart = rule.substring(selectorEndIndex);
      
      // Look for unescaped colon in selector (marks pseudo-state)
      const lastColonIndex = selectorPart.lastIndexOf(':');
      if (lastColonIndex > 0 && selectorPart[lastColonIndex - 1] !== '\\') {
        // Has pseudo-state
        const pseudoState = selectorPart.substring(lastColonIndex);
        return `.${shortcutSelector}${pseudoState}${restPart}`;
      } else {
        // No pseudo-state
        return `.${shortcutSelector}${restPart}`;
      }
    }
    
    // Fallback: just replace the class name part
    return rule.replace(/^\.[\w\-\\:\/]+/, `.${shortcutSelector}`);
  });

  return shortcutRules;
}, 'generateShortcutCSS');

// Set default value for error cases
generateShortcutCSS.defaultValue = [];

/**
 * Get all shortcuts with their definitions
 * @returns {object} All shortcuts
 */
export function getAllShortcuts() {
  return { ...CONFIG.shortcuts } || {};
}

/**
 * Remove a shortcut
 * @param {string} name 
 * @returns {boolean} Success status
 */
export function removeShortcut(name) {
  if (CONFIG.shortcuts && CONFIG.shortcuts[name]) {
    delete CONFIG.shortcuts[name];
    return true;
  }
  return false;
}

/**
 * Clear all shortcuts
 */
export function clearShortcuts() {
  CONFIG.shortcuts = {};
}

/**
 * Generate CSS for shortcut from class names (converts class names to .shortcut CSS)
 * @param {string} classNames - Space-separated class names
 * @returns {string} CSS with .shortcut selector
 */
export function generateShortcutCSSFromClasses(classNames) {
  // Use existing generateStyles to get CSS rules
  const cssRules = generateStyles(classNames);
  
  if (cssRules.length === 0) {
    return '/* No CSS generated for the provided class names */';
  }

  // Replace all class selectors with .shortcut
  const shortcutRules = cssRules.map(rule => {
    // Replace any CSS class selector with .shortcut while preserving pseudo-states
    // This handles both regular and media query rules
    return rule.replace(/\.[\w\-\\:\/]+(\:[a-z\-]+(?:\([^)]*\))?)?/g, (match) => {
      // Check if match has a real pseudo-state (unescaped colon at the end)
      const lastColonIndex = match.lastIndexOf(':');
      if (lastColonIndex > 0 && match[lastColonIndex - 1] !== '\\') {
        // Has pseudo-state
        const pseudoState = match.substring(lastColonIndex);
        return `.shortcut${pseudoState}`;
      } else {
        // No pseudo-state
        return '.shortcut';
      }
    });
  });

  return shortcutRules.join('\n');
}

/**
 * Check if shortcuts have circular dependencies
 * @param {string} shortcutName 
 * @param {Set} visited - Internal tracking of visited shortcuts
 * @returns {boolean} True if circular dependency detected
 */
export function hasCircularDependency(shortcutName, visited = new Set()) {
  if (visited.has(shortcutName)) {
    return true; // Circular dependency detected
  }

  if (!isShortcut(shortcutName)) {
    return false; // Not a shortcut, no dependency
  }

  visited.add(shortcutName);
  const shortcutClasses = getShortcut(shortcutName).split(/\s+/).filter(Boolean);

  for (const className of shortcutClasses) {
    if (isShortcut(className) && hasCircularDependency(className, new Set(visited))) {
      return true;
    }
  }

  return false;
}

/**
 * Validate shortcut definition
 * @param {string} name 
 * @param {string} classes 
 * @returns {object} Validation result with success and error properties
 */
export function validateShortcut(name, classes) {
  // Check for empty name or classes
  if (!name || !classes) {
    return { success: false, error: 'Name and classes are required' };
  }

  // Check if name conflicts with keywords
  if (CONFIG.keywords?.[name]) {
    return { success: false, error: `Name "${name}" conflicts with existing keyword` };
  }

  // Check for circular dependencies (simulate adding the shortcut)
  const originalShortcut = CONFIG.shortcuts?.[name];
  if (!CONFIG.shortcuts) CONFIG.shortcuts = {};
  CONFIG.shortcuts[name] = classes;

  const hasCircular = hasCircularDependency(name);
  
  // Restore original state
  if (originalShortcut) {
    CONFIG.shortcuts[name] = originalShortcut;
  } else {
    delete CONFIG.shortcuts[name];
  }

  if (hasCircular) {
    return { success: false, error: 'Circular dependency detected' };
  }

  return { success: true };
}


