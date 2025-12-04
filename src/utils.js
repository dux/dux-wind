// PostWind Utilities - Shared constants and utility functions
import { CONSTANTS } from './config.js';


/**
 * Memoization cache for performance optimization
 */
const memoCaches = new Set();
const CACHE_SIZE_LIMIT = 1000;

/**
 * Simple memoization function with cache size limit
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Optional key generation function
 * @returns {Function} Memoized function
 */
export function memoize(fn, keyFn) {
  const cache = new Map();
  memoCaches.add(cache);

  return function(...args) {
    const key = keyFn ? keyFn(...args) : args.join('|');

    if (cache.has(key)) {
      return cache.get(key);
    }

    // Clear cache if it gets too large
    if (cache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Clear memoization cache
 */
export function clearMemoCache() {
  memoCaches.forEach(cache => cache.clear());
}


/**
 * Escape class name for CSS selector
 * @param {string} className
 * @returns {string}
 */
export function escapeSelector(className) {
  return className.replace(/[:.!/[\]]/g, '\\$&');
}


/**
 * Safe error wrapper for functions
 * @param {Function} fn
 * @param {string} context
 * @returns {Function}
 */
export function safeWrapper(fn, context = 'unknown') {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.warn(`PostWind: Error in ${context}:`, error);
      if (typeof fn.defaultValue !== 'undefined') {
        return fn.defaultValue;
      }
      return null;
    }
  };
}

/**
 * Debounce function for performance
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
