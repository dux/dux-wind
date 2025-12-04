// PostWind Shortcuts - Shortcut Management and Expansion
import { CONFIG } from './config.js';
import { generateStyles } from './styler.js';
import { safeWrapper, escapeSelector } from './utils.js';

export const CLASS_NAME_PATTERN = /^[\w-]+$/;

function resolveShortcutEntry(name) {
  if (!CONFIG.shortcuts || !name) {
    return null;
  }

  const trimmed = typeof name === 'string' ? name.trim() : name;
  if (!trimmed) {
    return null;
  }

  if (CONFIG.shortcuts[trimmed]) {
    return CONFIG.shortcuts[trimmed];
  }

  if (typeof trimmed === 'string' && CLASS_NAME_PATTERN.test(trimmed)) {
    return CONFIG.shortcuts[`.${trimmed}`] || null;
  }

  return null;
}

/**
 * Check if a class name is a shortcut
 * @param {string} className
 * @returns {boolean}
 */
export function isShortcut(className) {
  return Boolean(resolveShortcutEntry(className));
}

/**
 * Get shortcut definition
 * @param {string} shortcutName
 * @returns {string|null} Space-separated class list or null
 */
export function getShortcut(shortcutName) {
  return resolveShortcutEntry(shortcutName);
}

/**
 * Add or update a shortcut
 * @param {string} name
 * @param {string} classes
 * @returns {boolean} Success status
 */
export function addShortcut(name, classes) {
  if (!CONFIG.shortcuts) {
    CONFIG.shortcuts = {};
  }
  if (CONFIG.keywords?.[name]) {
    console.warn(`PostWind: shortcut "${name}" overrides existing keyword class`);
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

  const expandedClasses = [];
  const seenClasses = new Set();
  const queue = getShortcut(shortcutName).split(/\s+/).filter(Boolean);

  while (queue.length > 0) {
    const className = queue.shift();
    if (isShortcut(className)) {
      // Nested shortcut - expand it recursively (depth-first order)
      const nestedClasses = getShortcut(className).split(/\s+/).filter(Boolean);
      queue.unshift(...nestedClasses);
    } else {
      // Regular class - add to expanded list if not already present
      if (!seenClasses.has(className)) {
        seenClasses.add(className);
        expandedClasses.push(className);
      }
    }
  }

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
  const allRules = generateStyles(expandedClasses.join(' '));
  const parsedRules = allRules
    .map(parseShortcutRule)
    .filter(Boolean);

  const trimmedShortcutName = shortcutName.trim();
  if (!trimmedShortcutName) {
    return [];
  }

  const isClassShortcut = CLASS_NAME_PATTERN.test(trimmedShortcutName);
  const baseSelector = isClassShortcut
    ? `.${escapeSelector(trimmedShortcutName)}`
    : trimmedShortcutName;

  const nestedCSS = buildNestedShortcutCSS(baseSelector, parsedRules);

  return nestedCSS ? [nestedCSS] : [];
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

  const parsedRules = cssRules
    .map(parseShortcutRule)
    .filter(Boolean);

  const nestedCSS = buildNestedShortcutCSS(`.${escapeSelector('shortcut')}`, parsedRules);
  return nestedCSS || '/* No CSS generated for the provided class names */';
}

function parseShortcutRule(rule) {
  if (!rule || typeof rule !== 'string') {
    return null;
  }

  return parseRuleRecursive(rule.trim(), []);
}

function parseRuleRecursive(rule, atRules) {
  if (!rule) return null;
  const trimmed = rule.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('@')) {
    const atRuleBlock = extractAtRuleBlock(trimmed);
    if (!atRuleBlock) return null;
    return parseRuleRecursive(atRuleBlock.content, [...atRules, atRuleBlock.atRule]);
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const selectorPart = trimmed.slice(0, firstBrace).trim();
  const declarationPart = trimmed.slice(firstBrace + 1, lastBrace).trim();

  const normalizedSelector = normalizeSelectorForShortcut(selectorPart);
  if (!normalizedSelector.startsWith('.')) {
    return null;
  }

  const suffix = extractSelectorSuffix(normalizedSelector);
  const declarations = splitDeclarations(declarationPart);

  return {
    atRules,
    suffix,
    declarations
  };
}

function normalizeSelectorForShortcut(selector) {
  if (!selector) {
    return '';
  }

  const trimmed = selector.trim();
  if (trimmed.startsWith('.')) {
    return trimmed;
  }

  const firstClassIndex = trimmed.indexOf('.');
  if (firstClassIndex === -1) {
    return trimmed;
  }

  return trimmed.slice(firstClassIndex);
}

function extractAtRuleBlock(rule) {
  const firstBrace = rule.indexOf('{');
  if (firstBrace === -1) {
    return null;
  }

  const atRule = rule.slice(0, firstBrace).trim();
  let depth = 0;
  for (let i = firstBrace; i < rule.length; i++) {
    const char = rule[i];
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        const content = rule.slice(firstBrace + 1, i).trim();
        const remainder = rule.slice(i + 1).trim();
        return {
          atRule,
          content: remainder ? `${content} ${remainder}`.trim() : content
        };
      }
    }
  }

  return null;
}

function extractSelectorSuffix(selector) {
  const trimmed = selector.trim();
  if (!trimmed) return '';

  let splitIndex = trimmed.length;
  for (let i = 1; i < trimmed.length; i++) {
    const char = trimmed[i];
    if ((char === ':' || char === '.') && trimmed[i - 1] !== '\\') {
      splitIndex = i;
      break;
    }
  }

  return trimmed.slice(splitIndex);
}

function splitDeclarations(block) {
  if (!block) return [];

  return block
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => (part.endsWith(';') ? part : `${part};`));
}

function buildNestedShortcutCSS(baseSelector, parsedRules) {
  if (!parsedRules.length) {
    return null;
  }

  const rootBucket = createBucket();
  parsedRules.forEach(rule => {
    addRuleToBucket(rootBucket, rule, 0);
  });

  const body = renderBucket(rootBucket, 1);
  if (!body.trim()) {
    return null;
  }

  return `${baseSelector} {\n${body}}`;
}

function createBucket() {
  return {
    declarations: [],
    modifiers: new Map(),
    atRules: new Map()
  };
}

function addRuleToBucket(bucket, rule, depth) {
  if (depth < rule.atRules.length) {
    const atRule = rule.atRules[depth];
    if (!bucket.atRules.has(atRule)) {
      bucket.atRules.set(atRule, createBucket());
    }
    addRuleToBucket(bucket.atRules.get(atRule), rule, depth + 1);
    return;
  }

  if (rule.suffix) {
    if (!bucket.modifiers.has(rule.suffix)) {
      bucket.modifiers.set(rule.suffix, []);
    }
    bucket.modifiers.get(rule.suffix).push(...rule.declarations);
  } else {
    bucket.declarations.push(...rule.declarations);
  }
}

function renderBucket(bucket, level) {
  const indent = '  '.repeat(level);
  const segments = [];

  bucket.declarations.forEach(line => {
    segments.push(`${indent}${line}\n`);
  });

  for (const [suffix, lines] of bucket.modifiers) {
    segments.push(`${indent}&${suffix} {\n`);
    lines.forEach(line => {
      segments.push(`${indent}  ${line}\n`);
    });
    segments.push(`${indent}}\n`);
  }

  for (const [atRule, childBucket] of bucket.atRules) {
    segments.push(`${indent}${atRule} {\n`);
    segments.push(renderBucket(childBucket, level + 1));
    segments.push(`${indent}}\n`);
  }

  return segments.join('');
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


