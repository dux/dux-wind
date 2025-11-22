// Inline container query helpers
// Handles classes like "max-320:flex" or "min-480:text-lg"
import { safeWrapper } from './utils.js';

const CONTAINER_QUERY_PATTERN = /^(min|max)-(\d+)(px)?:\s*(.+)$/i;
const elementStates = new WeakMap();
let warnedNoObserver = false;

function supportsResizeObserver() {
  return typeof ResizeObserver !== 'undefined';
}

function parseContainerQueryToken(className) {
  if (!className || typeof className !== 'string') return null;
  const match = className.match(CONTAINER_QUERY_PATTERN);
  if (!match) return null;

  const mode = match[1].toLowerCase();
  const threshold = parseInt(match[2], 10);
  const payload = match[4]?.trim()?.split(/\s+/)[0];

  if (!threshold || !payload) {
    return null;
  }

  return {
    token: className,
    mode,
    threshold,
    payload
  };
}

export function splitContainerQueryClasses(classNames = []) {
  const regularClasses = [];
  const containerQueries = [];

  classNames.forEach(className => {
    const parsed = parseContainerQueryToken(className);
    if (parsed) {
      containerQueries.push(parsed);
    } else {
      regularClasses.push(className);
    }
  });

  return { regularClasses, containerQueries };
}

const evaluateElementQueries = safeWrapper(function(element, explicitWidth) {
  const state = elementStates.get(element);
  if (!state || !element?.classList) return;

  const width = typeof explicitWidth === 'number'
    ? explicitWidth
    : measureElementWidth(element);

  state.queries.forEach(query => {
    const shouldApply = query.mode === 'max'
      ? width <= query.threshold
      : width >= query.threshold;

    if (shouldApply && !query.active) {
      const alreadyHasClass = element.classList.contains(query.payload);
      if (!alreadyHasClass) {
        element.classList.add(query.payload);
        query.inserted = true;
      } else {
        query.inserted = false;
      }
      query.active = true;
    } else if (!shouldApply && query.active) {
      if (query.inserted) {
        element.classList.remove(query.payload);
      }
      query.active = false;
      query.inserted = false;
    }
  });
}, 'evaluateElementQueries');

function measureElementWidth(element) {
  if (!element) return 0;
  if (typeof element.getBoundingClientRect === 'function') {
    const rect = element.getBoundingClientRect();
    if (rect && typeof rect.width === 'number') {
      return rect.width;
    }
  }
  return element.offsetWidth || element.clientWidth || 0;
}

function createObserver(element) {
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const width = entry?.contentRect?.width;
      evaluateElementQueries(entry.target, typeof width === 'number' ? width : undefined);
    });
  });

  observer.observe(element);
  return observer;
}

export const updateContainerQueries = safeWrapper(function(element, queries = []) {
  if (!element || typeof element !== 'object') return;
  if (!element.classList) return;

  if (!supportsResizeObserver()) {
    if (!warnedNoObserver) {
      console.warn('DuxWind: "min-"/"max-" container classes require ResizeObserver.');
      warnedNoObserver = true;
    }
    return;
  }

  if (!queries.length) {
    teardownContainerQueries(element);
    return;
  }

  let state = elementStates.get(element);
  if (!state) {
    state = {
      observer: createObserver(element),
      queries: new Map()
    };
    elementStates.set(element, state);
  }

  const activeTokens = new Set(queries.map(q => q.token));

  queries.forEach(query => {
    const existing = state.queries.get(query.token);
    if (existing) {
      existing.mode = query.mode;
      existing.threshold = query.threshold;
      existing.payload = query.payload;
    } else {
      state.queries.set(query.token, {
        ...query,
        active: false,
        inserted: false
      });
    }
  });

  state.queries.forEach((storedQuery, token) => {
    if (!activeTokens.has(token)) {
      if (storedQuery.active && storedQuery.inserted) {
        element.classList.remove(storedQuery.payload);
      }
      state.queries.delete(token);
    }
  });

  evaluateElementQueries(element);
}, 'updateContainerQueries');

export const teardownContainerQueries = safeWrapper(function(element) {
  const state = elementStates.get(element);
  if (!state) return;

  state.queries.forEach(query => {
    if (query.active && query.inserted && element?.classList) {
      element.classList.remove(query.payload);
    }
  });

  if (state.observer) {
    try {
      state.observer.unobserve(element);
      state.observer.disconnect();
    } catch (error) {
      // Ignore observer errors during teardown
    }
  }

  elementStates.delete(element);
}, 'teardownContainerQueries');

export function cleanupContainerQueriesForTree(rootNode) {
  if (!rootNode) return;

  if (isElementNode(rootNode)) {
    teardownContainerQueries(rootNode);
  }

  const descendants = getDescendants(rootNode);
  if (descendants.length) {
    descendants.forEach(node => teardownContainerQueries(node));
  }
}

function isElementNode(node) {
  if (!node) return false;
  const ELEMENT_NODE = (typeof Node !== 'undefined') ? Node.ELEMENT_NODE : 1;
  return node.nodeType === ELEMENT_NODE;
}

function getDescendants(node) {
  if (typeof node.querySelectorAll === 'function') {
    return Array.from(node.querySelectorAll('*'));
  }

  // Fallback for fragments without querySelectorAll
  const nodes = [];
  if (node.childNodes) {
    node.childNodes.forEach(child => {
      if (isElementNode(child)) {
        nodes.push(child);
        nodes.push(...getDescendants(child));
      }
    });
  }
  return nodes;
}
``
