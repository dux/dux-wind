import { describe, test, expect, beforeEach } from 'bun:test';

class MockResizeObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(element) {
    this.element = element;
  }

  unobserve() {}
  disconnect() {}

  fire(width) {
    if (this.callback) {
      this.callback([{ target: this.element, contentRect: { width } }]);
    }
  }
}

global.ResizeObserver = MockResizeObserver;

import { splitContainerQueryClasses, updateContainerQueries, teardownContainerQueries } from './container-query.js';

beforeEach(() => {
  MockResizeObserver.instances = [];
});

function createTestElement() {
  const tokens = new Set();
  return {
    classList: {
      add(cls) { tokens.add(cls); },
      remove(cls) { tokens.delete(cls); },
      contains(cls) { return tokens.has(cls); }
    },
    __getClasses() {
      return Array.from(tokens);
    }
  };
}

describe('Container query helpers', () => {
  test('splitContainerQueryClasses isolates inline query tokens', () => {
    const { regularClasses, containerQueries } = splitContainerQueryClasses(['p-4', 'max-320:flex', 'text-lg']);

    expect(regularClasses).toEqual(['p-4', 'text-lg']);
    expect(containerQueries).toHaveLength(1);
    expect(containerQueries[0]).toMatchObject({
      token: 'max-320:flex',
      mode: 'max',
      threshold: 320,
      payload: 'flex'
    });
  });

  test('updateContainerQueries toggles payload class based on width', () => {
    const element = createTestElement();
    const queries = [{ token: 'max-320:flex', mode: 'max', threshold: 320, payload: 'flex' }];

    updateContainerQueries(element, queries);
    const observer = MockResizeObserver.instances.at(-1);
    expect(observer).toBeDefined();

    observer.fire(300);
    expect(element.__getClasses()).toContain('flex');

    observer.fire(400);
    expect(element.__getClasses()).not.toContain('flex');

    teardownContainerQueries(element);
  });
});
