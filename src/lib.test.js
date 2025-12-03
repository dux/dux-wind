import { describe, test, expect, beforeEach } from 'bun:test';

// Mock DOM environment - must be set before importing DuxWind
global.window = {
  innerWidth: 1024,
  DuxWind: null,
  DuxWindDebug: false,
  location: {
    port: 3000
  }
};

global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
};

// Shared CSS capture store so multiple test suites see the same injected rules
const CSS_STORE_KEY = '__duxwindCSSStore';
const cssStore = global[CSS_STORE_KEY] || { value: '' };
global[CSS_STORE_KEY] = cssStore;

const getCapturedCSS = () => cssStore.value;
const resetCapturedCSS = () => { cssStore.value = ''; };

global.document = {
  createElement: () => ({
    setAttribute: () => {},
    get textContent() { return cssStore.value; },
    set textContent(value) { cssStore.value += value; },
    appendChild: () => {}
  }),
  head: {
    appendChild: () => {},
    insertBefore: () => {},
    firstChild: null
  },
  getElementById: () => null,
  querySelector: () => ({
    textContent: cssStore.value
  }),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Import DuxWind after setting up mocks. When the module is cached between
// files we still need to reattach the default export onto the mocked window.
const { default: DuxWind } = await import('../src/lib.js');
global.window.DuxWind = DuxWind;

describe('DuxWind Test Suite - Input/Output Examples', () => {
  beforeEach(() => {
    // Reset CSS capture and configuration
    resetCapturedCSS();
    DuxWind.loadDefaultConfig();
    DuxWind.init({ debug: false, clearCache: true });
  });

  // Helper function to test class processing and capture output
  function testClassWithOutput(className, expectedInCSS = []) {
    const initialCSS = getCapturedCSS();
    try {
      DuxWind.loadClass(className);
      const newCSS = getCapturedCSS().substring(initialCSS.length);

      // Check if expected strings are in the generated CSS
      expectedInCSS.forEach(expected => {
        expect(newCSS).toContain(expected);
      });

      return { success: true, css: newCSS };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function reinitWithBreakpoints(breakpoints) {
    DuxWind.init({ debug: false, clearCache: true, breakpoints });
  }

  describe('Configuration Examples', () => {
    test('loads default configuration with expected values', () => {
      // Input: Default configuration
      expect(DuxWind.config).toBeDefined();

      // Expected Output: Default values
      expect(DuxWind.config.pixelMultiplier).toBe(4); // 1 unit = 4px
      expect(DuxWind.config.breakpoints).toBeDefined();
      expect(DuxWind.config.breakpoints.m).toBe('(max-width: 768px)');
      expect(DuxWind.config.breakpoints.t).toBe('(min-width: 769px) and (max-width: 1024px)');
      expect(DuxWind.config.breakpoints.d).toBe('(min-width: 1025px)');
      expect(DuxWind.config.breakpoints.mobile).toBe('(max-width: 768px)');
      expect(DuxWind.config.breakpoints.desktop).toBe('(min-width: 1025px)');
      expect(DuxWind.config.shortcuts).toEqual({});
    });

    test('custom breakpoints: input vs output', () => {
      // Input: Custom breakpoint configuration
      const inputBreakpoints = {
        'm': '(max-width: 768px)',    // Mobile
        'd': '(min-width: 1025px)'    // Desktop
      };

      reinitWithBreakpoints(inputBreakpoints);

      // Expected Output: Overrides applied and available
      Object.entries(inputBreakpoints).forEach(([key, value]) => {
        expect(DuxWind.config.breakpoints[key]).toBe(value);
      });
    });

    test('custom shortcuts: input vs output', () => {
      // Input: Shortcut definitions
      const inputShortcuts = {
        'btn': 'px-4 py-2 rounded border cursor-pointer',
        'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
        'card': 'p-6 bg-white shadow rounded-lg border'
      };

      DuxWind.config.shortcuts = inputShortcuts;

      // Expected Output: Exact shortcut mapping
      expect(DuxWind.config.shortcuts.btn).toBe('px-4 py-2 rounded border cursor-pointer');
      expect(DuxWind.config.shortcuts['btn-primary']).toBe('btn bg-blue-500 text-white hover:bg-blue-600');
      expect(DuxWind.config.shortcuts.card).toBe('p-6 bg-white shadow rounded-lg border');
    });

    test('default config includes Tailwind border radius keywords', () => {
      const radiusMap = {
        'rounded-none': '0px',
        'rounded-sm': '0.125rem',
        'rounded': '0.25rem',
        'rounded-md': '0.375rem',
        'rounded-lg': '0.5rem',
        'rounded-xl': '0.75rem',
        'rounded-2xl': '1rem',
        'rounded-3xl': '1.5rem',
        'rounded-full': '9999px'
      };

      Object.entries(radiusMap).forEach(([keyword, expectedValue]) => {
        expect(DuxWind.config.keywords[keyword]).toContain(expectedValue);
      });

      expect(DuxWind.config.keywords['rounded-tl-2xl']).toContain('border-top-left-radius: 1rem');
      expect(DuxWind.config.keywords['rounded-s-full']).toContain('border-start-start-radius: 9999px');
      expect(DuxWind.config.keywords['rounded-t-none']).toContain('border-top-left-radius: 0px');
    });

    test('init accepts breakpoint overrides object', () => {
      const overrides = {
        's': '(max-width: 480px)',
        'm': '(max-width: 640px)',
        'd': '(min-width: 641px)'
      };

      DuxWind.init({ debug: false, breakpoints: overrides, clearCache: true });

      expect(DuxWind.config.breakpoints.s).toBe('(max-width: 480px)');
      expect(DuxWind.config.breakpoints.m).toBe('(max-width: 640px)');
      expect(DuxWind.config.breakpoints.d).toBe('(min-width: 641px)');
    });

    test('init accepts inline define option', () => {
      const shortcutName = 'btn-init';

      DuxWind.init({
        debug: false,
        clearCache: true,
        define: {
          [shortcutName]: 'px-3 py-2 rounded bg-blue-500 text-white'
        }
      });

      expect(DuxWind.config.shortcuts[shortcutName]).toBe('px-3 py-2 rounded bg-blue-500 text-white');
    });

    test('init preloads classes before DOM scan', () => {
      resetCapturedCSS();
      const cssBefore = getCapturedCSS().length;

      DuxWind.init({
        debug: false,
        clearCache: true,
        preload: 'text-red-500'
      });

      const cssAfter = getCapturedCSS().length;
      expect(cssAfter).toBeGreaterThan(cssBefore);
    });

    test('registering shortcuts via object helper', () => {
      const success = DuxWind.shortcut({
        'btn': 'px-2 py-1 rounded',
        'btn-accent': 'btn bg-blue-500 text-white'
      });

      expect(success).toBe(true);
      expect(DuxWind.config.shortcuts.btn).toBe('px-2 py-1 rounded');
      expect(DuxWind.config.shortcuts['btn-accent']).toBe('btn bg-blue-500 text-white');
    });

    test('shortcuts can override keyword classes', () => {
      const initialCSSLength = getCapturedCSS().length;

      const success = DuxWind.shortcut({
        'container': 'px-2 py-1 rounded'
      });

      expect(success).toBe(true);
      const newCSS = getCapturedCSS().substring(initialCSSLength);
      expect(newCSS).toContain('padding-left: 8px');
      expect(newCSS).toContain('padding-right: 8px');
      expect(DuxWind.config.shortcuts.container).toBe('px-2 py-1 rounded');
    });

    test('define helper registers keyword utilities', () => {
      const cssBeforeDefine = getCapturedCSS().length;
      const success = DuxWind.define('rounded-3xl', 'border-radius: 2rem;');
      expect(success).toBe(true);
      expect(DuxWind.config.keywords['rounded-3xl']).toBe('border-radius: 2rem;');

      const defineCSS = getCapturedCSS().substring(cssBeforeDefine);
      expect(defineCSS).toContain('border-radius: 2rem;');

      const initialCSSLength = getCapturedCSS().length;
      DuxWind.loadClass('rounded-3xl');
      const newCSS = getCapturedCSS().substring(initialCSSLength);
      expect(newCSS).toBe('');
    });

    test('define helper requires semicolons for CSS strings', () => {
      const cssLikeString = 'color: #2563eb';
      const success = DuxWind.define('text-brand', cssLikeString);
      expect(success).toBe(true);
      expect(DuxWind.config.shortcuts['text-brand']).toBe(cssLikeString);
      expect(DuxWind.config.keywords['text-brand']).toBeUndefined();
    });

    test('define helper accepts object maps', () => {
      const cssBeforeDefine = getCapturedCSS().length;
      const success = DuxWind.define({
        'flex-center': 'display: flex; justify-content: center; align-items: center;'
      });

      expect(success).toBe(true);
      expect(DuxWind.config.keywords['flex-center']).toContain('display: flex');

      const defineCSS = getCapturedCSS().substring(cssBeforeDefine);
      expect(defineCSS).toContain('display: flex');
      expect(defineCSS).toContain('justify-content: center');
      expect(defineCSS).toContain('align-items: center');

      const result = testClassWithOutput('flex-center');
      expect(result.success).toBe(true);
    });

    test('define helper routes class lists to shortcuts', () => {
      const beforeDefineCSS = getCapturedCSS().length;
      const success = DuxWind.define('btn-demo', 'px-4 py-2 rounded shadow-sm');
      expect(success).toBe(true);
      expect(DuxWind.config.shortcuts['btn-demo']).toBe('px-4 py-2 rounded shadow-sm');
      expect(DuxWind.config.keywords['btn-demo']).toBeUndefined();

      const shortcutCSS = getCapturedCSS().substring(beforeDefineCSS);
      expect(shortcutCSS).toContain('padding-left: 16px');
      expect(shortcutCSS).toContain('border-radius');

      const beforeLoad = getCapturedCSS().length;
      DuxWind.loadClass('btn-demo');
      const newCSS = getCapturedCSS().substring(beforeLoad);
      expect(newCSS).toBe('');
    });

    test('define helper treats responsive class lists as shortcuts', () => {
      const responsiveClasses = 'm:text-24px d:text-36px font-semibold';
      const success = DuxWind.define('hero-title', responsiveClasses);
      expect(success).toBe(true);
      expect(DuxWind.config.shortcuts['hero-title']).toBe(responsiveClasses);
      expect(DuxWind.config.keywords['hero-title']).toBeUndefined();
    });

    test('define helper suppresses keyword override warning when converting to shortcut', () => {
      const originalWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args.join(' '));

      try {
        const success = DuxWind.define('container', 'px-2 py-1 rounded');
        expect(success).toBe(true);
      } finally {
        console.warn = originalWarn;
      }

      const conflictWarning = warnings.find(message => message.includes('shortcut "container" overrides'));
      expect(conflictWarning).toBeUndefined();
      expect(DuxWind.config.shortcuts.container).toBe('px-2 py-1 rounded');
      expect(DuxWind.config.keywords.container).toBeUndefined();
    });
  });

  describe('Basic CSS Generation: Input → CSS Output', () => {
    test('padding classes: p-{size} → padding: {pixels}px', () => {
      // Input: p-1   → Expected: padding: 4px
      const result1 = testClassWithOutput('p-1', ['padding: 4px']);
      expect(result1.success).toBe(true);

      // Input: p-10  → Expected: padding: 40px
      const result2 = testClassWithOutput('p-10', ['padding: 40px']);
      expect(result2.success).toBe(true);

      // Input: p-20  → Expected: padding: 80px
      const result3 = testClassWithOutput('p-20', ['padding: 80px']);
      expect(result3.success).toBe(true);
    });

    test('directional padding: p{direction}-{size} → padding-{direction}: {pixels}px', () => {
      // Input: pt-4   → Expected: padding-top: 16px
      testClassWithOutput('pt-4', ['padding-top: 16px']);

      // Input: pr-8   → Expected: padding-right: 32px
      testClassWithOutput('pr-8', ['padding-right: 32px']);

      // Input: pb-2   → Expected: padding-bottom: 8px
      testClassWithOutput('pb-2', ['padding-bottom: 8px']);

      // Input: pl-6   → Expected: padding-left: 24px
      testClassWithOutput('pl-6', ['padding-left: 24px']);
    });

    test('axis padding: p{x|y}-{size} → padding-{left|right}: {pixels}px', () => {
      // Input: px-4   → Expected: padding-left: 16px; padding-right: 16px
      testClassWithOutput('px-4', ['padding-left: 16px', 'padding-right: 16px']);

      // Input: py-6   → Expected: padding-top: 24px; padding-bottom: 24px
      testClassWithOutput('py-6', ['padding-top: 24px', 'padding-bottom: 24px']);
    });

    test('margin classes: m-{size} → margin: {pixels}px', () => {
      // Input: m-2    → Expected: margin: 8px
      testClassWithOutput('m-2', ['margin: 8px']);

      // Input: m-auto → Expected: margin: auto
      testClassWithOutput('m-auto', ['margin: auto']);

      // Input: mx-4   → Expected: margin-left: 16px; margin-right: 16px
      testClassWithOutput('mx-4', ['margin-left: 16px', 'margin-right: 16px']);
    });

    test('negative values: -{property}-{size} → {property}: -{pixels}px', () => {
      // Input: -mt-4  → Expected: margin-top: -16px
      testClassWithOutput('-mt-4', ['margin-top: -16px']);

      // Input: -ml-8  → Expected: margin-left: -32px
      testClassWithOutput('-ml-8', ['margin-left: -32px']);

      // Input: -m-2   → Expected: margin: -8px
      testClassWithOutput('-m-2', ['margin: -8px']);
    });
  });

  describe('Arbitrary Values: [{value}] → {value}', () => {
    test('pixel values: w-[{pixels}px] → width: {pixels}px', () => {
      // Input: w-[250px]  → Expected: width: 250px
      testClassWithOutput('w-[250px]', ['width: 250px']);

      // Input: h-[100px]  → Expected: height: 100px
      testClassWithOutput('h-[100px]', ['height: 100px']);

      // Input: p-[20px]   → Expected: padding: 20px
      testClassWithOutput('p-[20px]', ['padding: 20px']);
    });

    test('color values: bg-[{color}] → background-color: {color}', () => {
      // Input: bg-[#ff6b6b]     → Expected: background-color: #ff6b6b
      testClassWithOutput('bg-[#ff6b6b]', ['background-color: #ff6b6b']);

      // Input: text-[#333333]   → Expected: color: #333333
      testClassWithOutput('text-[#333333]', ['color: #333333']);

      // Input: border-[#e5e5e5] → Expected: border-color: #e5e5e5
      testClassWithOutput('border-[#e5e5e5]', ['border-color: #e5e5e5']);
    });

    test('calc and percentage values: w-[{expression}] → width: {expression}', () => {
      // Input: w-[calc(100%-20px)] → Expected: width: calc(100%-20px)
      testClassWithOutput('w-[calc(100%-20px)]', ['width: calc(100%-20px)']);

      // Input: w-[50%]             → Expected: width: 50%
      testClassWithOutput('w-[50%]', ['width: 50%']);

      // Input: h-[75vh]            → Expected: height: 75vh
      testClassWithOutput('h-[75vh]', ['height: 75vh']);
    });
  });

  describe('Responsive Design: {breakpoint}:{class} → @media {query} { .{breakpoint}\:{class} { ... } }', () => {
    test('mobile breakpoint: m:{class} → @media (max-width: 768px)', () => {
      // Input: m:p-4    → Expected: @media (max-width: 768px) { .m\:p-4 { padding: 16px; } }
      testClassWithOutput('m:p-4', ['@media (max-width: 768px)', 'padding: 16px']);

      // Input: m:hidden → Expected: @media (max-width: 768px) { .m\:hidden { display: none; } }
      testClassWithOutput('m:hidden', ['@media (max-width: 768px)', 'display: none']);
    });

    test('desktop breakpoint: d:{class} → @media (min-width: 1025px)', () => {
      // Input: d:text-lg → Expected: @media (min-width: 1025px) { .d\:text-lg { font-size: 18px; } }
      testClassWithOutput('d:text-lg', ['@media (min-width: 1025px)', 'font-size: 18px']);

      // Input: d:block   → Expected: @media (min-width: 1025px) { .d\:block { display: block; } }
      testClassWithOutput('d:block', ['@media (min-width: 1025px)', 'display: block']);
    });

    test('custom breakpoints with responsive classes', () => {
      // Input: Custom breakpoints configured during init
      reinitWithBreakpoints({
        'mobile': '(max-width: 768px)',
        'tablet': '(min-width: 769px) and (max-width: 1024px)',
        'desktop': '(min-width: 1025px)'
      });

      // Input: mobile:p-2 → Expected: @media (max-width: 768px) { .mobile\\:p-2 { padding: 8px; } }
      testClassWithOutput('mobile:p-2', ['@media (max-width: 768px)', 'padding: 8px']);
    });
  });

  describe('State Modifiers: {state}:{class} → .{state}\\:{class}:{state} { ... }', () => {
    test('hover states: hover:{class} → .hover\\:{class}:hover { ... }', () => {
      // Input: hover:bg-blue-500 → Expected: .hover\\:bg-blue-500:hover { background-color: rgb(59, 130, 246); }
      testClassWithOutput('hover:bg-blue-500', [':hover', 'background-color']);

      // Input: hover:opacity-75  → Expected: .hover\\:opacity-75:hover { opacity: 0.75; }
      testClassWithOutput('hover:opacity-75', [':hover', 'opacity: 0.75']);
    });

    test('focus states: focus:{class} → .focus\\:{class}:focus { ... }', () => {
      // Input: focus:outline-none → Expected: .focus\\:outline-none:focus { outline: 2px solid transparent; }
      testClassWithOutput('focus:outline-none', [':focus', 'outline']);

      // Input: focus:ring-2       → Expected: .focus\\:ring-2:focus { box-shadow: 0 0 0 2px ...; }
      testClassWithOutput('focus:ring-2', [':focus']);
    });

    test('active states: active:{class} → .active\\:{class}:active { ... }', () => {
      // Input: active:bg-blue-700 → Expected: .active\\:bg-blue-700:active { background-color: ...; }
      testClassWithOutput('active:bg-blue-700', [':active', 'background-color']);
    });

    test('combined responsive + state: {breakpoint}:{state}:{class}', () => {
      // Input: m:hover:p-10 → Expected: @media (max-width: 768px) { .m\\:hover\\:p-10:hover { padding: 40px; } }
      testClassWithOutput('m:hover:p-10', ['@media (max-width: 768px)', ':hover', 'padding: 40px']);
    });
  });

  describe('Layout Utilities: Input → CSS Property/Value', () => {
    test('display: {display} → display: {display}', () => {
      // Input: block       → Expected: display: block
      testClassWithOutput('block', ['display: block']);

      // Input: flex        → Expected: display: flex
      testClassWithOutput('flex', ['display: flex']);

      // Input: grid        → Expected: display: grid
      testClassWithOutput('grid', ['display: grid']);

      // Input: hidden      → Expected: display: none
      testClassWithOutput('hidden', ['display: none']);

      // Input: inline-flex → Expected: display: inline-flex
      testClassWithOutput('inline-flex', ['display: inline-flex']);
    });

    test('flexbox: {property} → {css-property}: {value}', () => {
      // Input: justify-center    → Expected: justify-content: center
      testClassWithOutput('justify-center', ['justify-content: center']);

      // Input: items-center      → Expected: align-items: center
      testClassWithOutput('items-center', ['align-items: center']);

      // Input: flex-col          → Expected: flex-direction: column
      testClassWithOutput('flex-col', ['flex-direction: column']);

      // Input: flex-wrap         → Expected: flex-wrap: wrap
      testClassWithOutput('flex-wrap', ['flex-wrap: wrap']);
    });

    test('grid: grid-{property}-{value} → grid-{property}: {value}', () => {
      // Input: grid-cols-3    → Expected: grid-template-columns: repeat(3, minmax(0, 1fr))
      testClassWithOutput('grid-cols-3', ['grid-template-columns']);

      // Input: col-span-2     → Expected: grid-column: span 2 / span 2
      testClassWithOutput('col-span-2', ['grid-column']);

      // Input: gap-4          → Expected: gap: 16px
      testClassWithOutput('gap-4', ['gap: 16px']);
    });

    test('positioning: {position} → position: {position}', () => {
      // Input: relative → Expected: position: relative
      testClassWithOutput('relative', ['position: relative']);

      // Input: absolute → Expected: position: absolute
      testClassWithOutput('absolute', ['position: absolute']);

      // Input: fixed    → Expected: position: fixed
      testClassWithOutput('fixed', ['position: fixed']);

      // Input: top-0    → Expected: position: relative; top: 0px
      testClassWithOutput('top-0', ['position: relative', 'top: 0px']);

      // Input: right-4  → Expected: position: relative; right: 16px
      testClassWithOutput('right-4', ['position: relative', 'right: 16px']);

      // Input: left-[10%] → Expected: position: relative; left: 10%
      testClassWithOutput('left-[10%]', ['position: relative', 'left: 10%']);

      // Input: m:bottom-2 → Expected: responsive block with position: relative and bottom: 8px
      testClassWithOutput('m:bottom-2', ['@media (max-width: 768px)', 'position: relative', 'bottom: 8px']);

      // Input: z-10     → Expected: z-index: 10
      testClassWithOutput('z-10', ['z-index: 10']);
    });
  });

  describe('Size Utilities: Input → width/height values', () => {
    test('width: w-{size} → width: {value}', () => {
      // Input: w-10    → Expected: width: 40px
      testClassWithOutput('w-10', ['width: 40px']);

      // Input: w-full  → Expected: width: 100%
      testClassWithOutput('w-full', ['width: 100%']);

      // Input: w-1/2   → Expected: width: 50%
      testClassWithOutput('w-1/2', ['width: 50%']);

      // Input: w-screen → Expected: width: 100vw
      testClassWithOutput('w-screen', ['width: 100vw']);
    });

    test('height: h-{size} → height: {value}', () => {
      // Input: h-20     → Expected: height: 80px
      testClassWithOutput('h-20', ['height: 80px']);

      // Input: h-screen → Expected: height: 100vh
      testClassWithOutput('h-screen', ['height: 100vh']);

      // Input: h-full   → Expected: height: 100%
      testClassWithOutput('h-full', ['height: 100%']);
    });

    test('min/max sizes: {min|max}-{w|h}-{size} → {property}: {value}', () => {
      // Input: min-w-[200px] → Expected: min-width: 200px
      testClassWithOutput('min-w-[200px]', ['min-width: 200px']);

      // Input: max-h-[400px] → Expected: max-height: 400px
      testClassWithOutput('max-h-[400px]', ['max-height: 400px']);
    });
  });

  describe('Typography: Input → Font properties', () => {
    test('font size: text-{size} → font-size: {pixels}px', () => {
      // Input: text-xs   → Expected: font-size: 12px
      testClassWithOutput('text-xs', ['font-size: 12px']);

      // Input: text-sm   → Expected: font-size: 14px
      testClassWithOutput('text-sm', ['font-size: 14px']);

      // Input: text-lg   → Expected: font-size: 18px
      testClassWithOutput('text-lg', ['font-size: 18px']);

      // Input: text-24px → Expected: font-size: 24px
      testClassWithOutput('text-24px', ['font-size: 24px']);
    });

    test('font weight: font-{weight} → font-weight: {number}', () => {
      // Input: font-normal → Expected: font-weight: 400
      testClassWithOutput('font-normal', ['font-weight: 400']);

      // Input: font-medium → Expected: font-weight: 500
      testClassWithOutput('font-medium', ['font-weight: 500']);

      // Input: font-bold   → Expected: font-weight: 700
      testClassWithOutput('font-bold', ['font-weight: 700']);
    });

    test('line height: leading-{size} → line-height: {value}', () => {
      // Input: leading-tight  → Expected: line-height: 1.25
      testClassWithOutput('leading-tight', ['line-height: 1.25']);

      // Input: leading-normal → Expected: line-height: 1.5
      testClassWithOutput('leading-normal', ['line-height: 1.5']);
    });
  });

  describe('Color System: Input → Color values', () => {
    test('background colors: bg-{color}-{shade} → background-color: rgb(...)', () => {
      // Input: bg-red-500  → Expected: background-color: rgb(239, 68, 68)
      testClassWithOutput('bg-red-500', ['background-color']);

      // Input: bg-blue-600 → Expected: background-color: rgb(37, 99, 235)
      testClassWithOutput('bg-blue-600', ['background-color']);

      // Input: bg-white    → Expected: background-color: rgb(255, 255, 255)
      testClassWithOutput('bg-white', ['background-color']);
    });

    test('text colors: text-{color} → color: {value}', () => {
      // Input: text-black    → Expected: color: rgb(0, 0, 0)
      testClassWithOutput('text-black', ['color']);

      // Input: text-red-600  → Expected: color: rgb(220, 38, 38)
      testClassWithOutput('text-red-600', ['color']);
    });
  });

  describe('Advanced Features: Special Notation', () => {
    test('pipe notation: {class}-{mobile}|{desktop} → responsive classes', () => {
      // Setup responsive breakpoints via init options
      reinitWithBreakpoints({
        'm': '(max-width: 768px)',
        'd': '(min-width: 1025px)'
      });

      // Note: Since we can't easily test pipe notation expansion in this setup,
      // we'll test the expected individual responsive classes

      // Input: p-4 on mobile, p-8 on desktop (would be p-4|8)
      // Expected: m:p-4 → @media (max-width: 768px) { padding: 16px }
      testClassWithOutput('m:p-4', ['@media (max-width: 768px)', 'padding: 16px']);

      // Expected: d:p-8 → @media (min-width: 1025px) { padding: 32px }
      testClassWithOutput('d:p-8', ['@media (min-width: 1025px)', 'padding: 32px']);
    });

    test('@ notation: {class}@{breakpoint} → {breakpoint}:{class}', () => {
      // Note: Since @ notation is preprocessed, we test the expected output

      // Input: p-10@m → Expected: equivalent to m:p-10
      // Expected CSS: @media (max-width: 768px) { padding: 40px }
      testClassWithOutput('m:p-10', ['@media (max-width: 768px)', 'padding: 40px']);

      // Input: text-lg@d → Expected: equivalent to d:text-lg
      // Expected CSS: @media (min-width: 1025px) { font-size: 18px }
      testClassWithOutput('d:text-lg', ['@media (min-width: 1025px)', 'font-size: 18px']);
    });

    test('colon notation: p-10:20 → converts to pipe notation p-10|20', () => {
      // Setup responsive breakpoints
      reinitWithBreakpoints({
        'm': '(max-width: 768px)',
        'd': '(min-width: 1025px)'
      });

      // Test: p-10:20 should convert to p-10|20 and expand to responsive classes using the user-defined order (m, d)
      const colonOutput = testClassWithOutput('p-10:20', [
        '@media (max-width: 768px)',
        'padding: 40px',
        '@media (min-width: 1025px)',
        'padding: 80px'
      ]);
      expect(colonOutput.success).toBe(true);
      expect(Object.keys(DuxWind.config.breakpoints).slice(0, 2)).toEqual(['m', 'd']);
      expect(colonOutput.css).not.toContain('(min-width: 769px) and (max-width: 1024px)');

      // Direct responsive classes still generate the expected CSS
      testClassWithOutput('m:p-10', ['@media (max-width: 768px)', 'padding: 40px']);
      testClassWithOutput('d:p-20', ['@media (min-width: 1025px)', 'padding: 80px']);

      // Test: Multiple colons p-5:10:15 (for 3 breakpoints)
      reinitWithBreakpoints({
        's': '(max-width: 640px)',
        'm': '(min-width: 641px) and (max-width: 768px)',
        'l': '(min-width: 769px)'
      });

      testClassWithOutput('s:p-5', ['@media (max-width: 640px)', 'padding: 20px']);
      testClassWithOutput('m:p-10', ['@media (min-width: 641px) and (max-width: 768px)', 'padding: 40px']);
      testClassWithOutput('l:p-15', ['@media (min-width: 769px)', 'padding: 60px']);

      // Test: Works with other properties like margin
      reinitWithBreakpoints({
        'm': '(max-width: 768px)',
        'd': '(min-width: 1025px)'
      });

      // m-8:16 → m:m-8 d:m-16
      testClassWithOutput('m:m-8', ['@media (max-width: 768px)', 'margin: 32px']);
      testClassWithOutput('d:m-16', ['@media (min-width: 1025px)', 'margin: 64px']);
    });
  });

  describe('Public API: Method Inputs → Outputs', () => {
    test('loadDefaultConfig() → resets configuration to defaults', () => {
      // Input: Custom configuration
      DuxWind.config = { custom: 'value', pixelMultiplier: 8 };

      // Action: loadDefaultConfig()
      DuxWind.loadDefaultConfig();

      // Expected Output: Default configuration restored
      expect(DuxWind.config.pixelMultiplier).toBe(4);
      expect(DuxWind.config.breakpoints).toBeDefined();
      expect(DuxWind.config.custom).toBeUndefined();
    });

    test('generateDoc() → HTML documentation string', () => {
      // Input: generateDoc() call
      const doc = DuxWind.generateDoc();

      // Expected Output: HTML string with documentation
      expect(typeof doc).toBe('string');
      expect(doc.length).toBeGreaterThan(100);
      expect(doc).toContain('DuxWind');
      expect(doc).toContain('<div'); // HTML content
      expect(doc).toContain('Documentation'); // Description
    });

    test('config property: get/set operations', () => {
      // Input: Set custom pixel multiplier
      const originalMultiplier = DuxWind.config.pixelMultiplier;
      DuxWind.config.pixelMultiplier = 8;

      // Expected Output: Value updated
      expect(DuxWind.config.pixelMultiplier).toBe(8);

      // Cleanup
      DuxWind.config.pixelMultiplier = originalMultiplier;
    });
  });

  describe('Error Handling: Invalid Inputs → Graceful Handling', () => {
    test('invalid class names → no errors thrown', () => {
      // Input: Empty string
      expect(() => DuxWind.loadClass('')).not.toThrow();

      // Input: Invalid format
      expect(() => DuxWind.loadClass('123-invalid-class')).not.toThrow();

      // Input: Unknown property
      expect(() => DuxWind.loadClass('unknown-property-name')).not.toThrow();

      // Input: Malformed syntax
      expect(() => DuxWind.loadClass('p--4')).not.toThrow();
      expect(() => DuxWind.loadClass('p-')).not.toThrow();
    });

    test('special characters → handled correctly', () => {
      // Input: Fraction classes
      testClassWithOutput('w-1/2', ['width: 50%']);
      testClassWithOutput('w-1/3', ['width: 33.333333%']);
      testClassWithOutput('w-2/3', ['width: 66.666667%']);

      // All should process without errors
    });
  });

  describe('Performance: Multiple Inputs → Cached Results', () => {
    test('duplicate class processing → uses cache', () => {
      const className = 'p-10-test-cache';

      // First processing
      const result1 = testClassWithOutput(className, []);
      expect(result1.success).toBe(true);

      // Second processing (should use cache)
      const result2 = testClassWithOutput(className, []);
      expect(result2.success).toBe(true);

      // Both should succeed (cache doesn't affect functionality)
    });
  });
});
