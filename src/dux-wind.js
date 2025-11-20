// Real-time Tailwind-like CSS generator
const DuxWind = (function() {
  // Get configuration from window.DuxWindConfig or use defaults
  const config = window.DuxWindConfig || {
    breakpoints: {
      'm': '(max-width: 640px)',
      't': '(max-width: 768px)',
      'd': '(min-width: 1024px)',
      'lg': '(min-width: 1280px)',
      'xl': '(min-width: 1536px)'
    },
    pixelMultiplier: 4,
    properties: {},
    keywords: {}
  };

  // Set to track processed classes
  const processedClasses = new Set();
  
  // Style element for injecting CSS
  let styleElement;

  // Expand shortcut classes recursively
  function expandShortcuts(classes, visited = new Set()) {
    const expanded = [];
    
    classes.forEach(className => {
      // Avoid infinite recursion
      if (visited.has(className)) {
        expanded.push(className);
        return;
      }
      
      if (config.shortcuts && config.shortcuts[className]) {
        visited.add(className);
        const shortcutClasses = config.shortcuts[className].split(/\s+/).filter(cls => cls.length > 0);
        const recursiveExpanded = expandShortcuts(shortcutClasses, visited);
        expanded.push(...recursiveExpanded);
        visited.delete(className);
      } else {
        expanded.push(className);
      }
    });
    
    return expanded;
  }

  // Expand arbitrary values (convert w-[200px] to w-200px)
  function expandArbitraryValues(classes) {
    return classes.map(className => {
      // Match pattern: property-[value]
      const match = className.match(/^([^:]*:)?([a-z-]+)-\[([^\]]+)\]$/);
      if (match) {
        const [, prefix = '', property, value] = match;
        // Convert w-[200px] to w-200px, bg-[#123] to bg-#123, etc.
        return `${prefix}${property}-${value}`;
      }
      return className;
    });
  }

  // Function to process an element's classes
  function processElement(element) {
    if (element.classList && element.classList.length > 0) {
      let classes = element.className.split(/\s+/).filter(cls => cls.length > 0);
      
      // First pass: expand arbitrary values
      const arbitraryExpanded = expandArbitraryValues(classes);
      let hasExpansions = arbitraryExpanded.length !== classes.length || !arbitraryExpanded.every((cls, i) => cls === classes[i]);
      
      // Second pass: expand shortcuts
      const shortcutExpanded = expandShortcuts(arbitraryExpanded);
      if (shortcutExpanded.length !== arbitraryExpanded.length || !shortcutExpanded.every((cls, i) => cls === arbitraryExpanded[i])) {
        hasExpansions = true;
      }
      
      // Third pass: expand all pipe notation
      const expandedClasses = [];
      
      shortcutExpanded.forEach(className => {
        if (className.includes('|')) {
          const expanded = expandPipeNotation(className);
          expandedClasses.push(...expanded);
          hasExpansions = true;
        } else {
          expandedClasses.push(className);
        }
      });
      
      // Update the element's class attribute if we expanded anything
      if (hasExpansions) {
        element.className = expandedClasses.join(' ');
      }
      
      // Fourth pass: process all classes (original + expanded)
      expandedClasses.forEach(className => {
        if (!processedClasses.has(className)) {
          processedClasses.add(className);
          add(className);
        }
      });
    }
  }
  
  // Expand pipe notation to breakpoint-specific classes
  function expandPipeNotation(className) {
    // Check for hover modifier first (e.g., "hover:p-10|20")
    let hoverPrefix = '';
    let actualClassName = className;
    
    if (className.startsWith('hover:')) {
      hoverPrefix = 'hover:';
      actualClassName = className.substring(6);
    }
    
    // Extract the base class and values (e.g., "p-10|20" -> base: "p", values: ["10", "20"])
    // Handle negative values too (e.g., "-m-10|20")
    const match = actualClassName.match(/^(-?)([a-z-]+)-(.+)$/);
    if (!match) {
      return [className];
    }
    
    const [, negative, base, valuesStr] = match;
    if (!valuesStr.includes('|')) {
      return [className];
    }
    
    const values = valuesStr.split('|');
    const breakpointKeys = Object.keys(config.breakpoints);
    
    // If values count doesn't match breakpoints count, return original
    if (values.length !== breakpointKeys.length) {
      return [className];
    }
    
    // Generate breakpoint-specific classes
    const expandedClasses = [];
    breakpointKeys.forEach((breakpoint, index) => {
      // Combine breakpoint, hover modifier if present, and property
      if (hoverPrefix) {
        expandedClasses.push(`${breakpoint}:${hoverPrefix}${negative}${base}-${values[index]}`);
      } else {
        expandedClasses.push(`${breakpoint}:${negative}${base}-${values[index]}`);
      }
    });
    
    return expandedClasses;
  }

  // Generate CSS rule with modifiers and breakpoints
  function generateCSSRule(className, cssProperty, cssValue, modifiers, breakpoint) {
    let selector = `.${className.replace(/:/g, '\\:').replace(/\./g, '\\.')}`;
    
    // Add pseudo-class modifiers
    modifiers.forEach(modifier => {
      if (modifier === 'focus-within') {
        selector += ':focus-within';
      } else if (modifier === 'focus-visible') {
        selector += ':focus-visible';
      } else {
        selector += ':' + modifier;
      }
    });
    
    let cssRule = '';
    if (cssProperty === 'KEYWORD') {
      // Handle keyword classes that already have CSS rule
      cssRule = `${selector} { ${cssValue} }`;
    } else if (Array.isArray(cssProperty)) {
      const declarations = cssProperty.map(prop => `${prop}: ${cssValue}`).join('; ');
      cssRule = `${selector} { ${declarations}; }`;
    } else {
      cssRule = `${selector} { ${cssProperty}: ${cssValue}; }`;
    }
    
    // Wrap in media query if needed
    if (breakpoint) {
      cssRule = `@media ${config.breakpoints[breakpoint]} { ${cssRule} }`;
    }
    
    return cssRule;
  }

  // Function to process all elements in a node tree
  function processNodeTree(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      processElement(node);
      // Process all child elements
      const children = node.querySelectorAll('[class]');
      children.forEach(processElement);
    }
  }

  // Parse class name and generate CSS rule
  function parseAndGenerateCSS(className) {
    // Check if class has modifiers (breakpoint or state like hover)
    const parts = className.split(':');
    let breakpoint = null;
    let modifiers = [];
    let actualClass = className;
    
    // All supported pseudo-states
    const pseudoStates = ['hover', 'focus', 'active', 'disabled', 'visited', 'focus-within', 'focus-visible'];
    
    // Parse modifiers from left to right
    let classIndex = 0;
    for (let i = 0; i < parts.length - 1; i++) {
      if (config.breakpoints[parts[i]]) {
        breakpoint = parts[i];
        classIndex = i + 1;
      } else if (pseudoStates.includes(parts[i])) {
        modifiers.push(parts[i]);
        classIndex = i + 1;
      } else {
        break;
      }
    }
    
    // The last part is the actual class
    actualClass = parts.slice(classIndex).join(':');
    
    // Try to parse numeric class (e.g., p-10, m-4px, -m-4, opacity-50, etc.)
    const numericMatch = actualClass.match(/^(-?)([a-z-]+)-(\d+)(px|%)?$/);
    if (numericMatch) {
      const [, negative, property, value, unit] = numericMatch;
      
      // Handle different units and special cases
      let cssValue;
      if (property === 'opacity') {
        // opacity-50 = 0.5, opacity-100 = 1
        cssValue = parseInt(value) / 100;
      } else if (unit === '%') {
        cssValue = `${parseInt(value) * (negative ? -1 : 1)}%`;
      } else if (unit === 'px') {
        cssValue = `${parseInt(value) * (negative ? -1 : 1)}px`;
      } else {
        // Default: multiply by pixelMultiplier
        cssValue = `${parseInt(value) * config.pixelMultiplier * (negative ? -1 : 1)}px`;
      }
      
      // Get CSS property from config
      const cssProperty = config.properties[property];
      if (!cssProperty) return null;
      
      return generateCSSRule(className, cssProperty, cssValue, modifiers, breakpoint);
    }
    
    // Try to parse arbitrary values (e.g., w-200px, bg-#123, etc.)
    const arbitraryMatch = actualClass.match(/^([a-z-]+)-(.+)$/);
    if (arbitraryMatch) {
      const [, property, value] = arbitraryMatch;
      const cssProperty = config.properties[property];
      
      if (cssProperty) {
        return generateCSSRule(className, cssProperty, value, modifiers, breakpoint);
      }
    }
    
    // Check for keyword classes (e.g., flex, hidden, block)
    if (config.keywords && config.keywords[actualClass]) {
      const rule = config.keywords[actualClass];
      return generateCSSRule(className, 'KEYWORD', rule, modifiers, breakpoint);
    }
    
    return null;
  }

  // Main add function
  function add(className) {
    const cssRule = parseAndGenerateCSS(className);
    if (cssRule) {
      injectCSS(cssRule);
    }
  }
  
  // Inject CSS into the document
  function injectCSS(css) {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute('data-duxwind', 'true');
      document.head.appendChild(styleElement);
      
      // Add keyframes for animations
      const keyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes pulse {
  50% { opacity: .5; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
`;
      styleElement.textContent = keyframes;
    }
    
    styleElement.textContent += css + '\n';
  }

  // Initialize - process existing elements
  function init() {
    // Process all existing elements with classes
    const elementsWithClasses = document.querySelectorAll('[class]');
    elementsWithClasses.forEach(processElement);

    // Set up MutationObserver to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Handle added nodes
        mutation.addedNodes.forEach(node => {
          processNodeTree(node);
        });

        // Handle class attribute changes
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          processElement(mutation.target);
        }
      });
    });

    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    console.log('DuxWind initialized - watching for class changes');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Generate documentation
  function generateDoc() {
    const doc = [];
    
    // Header
    doc.push('<div class="duxwind-doc">');
    doc.push('<h2>DuxWind CSS Generator Documentation</h2>');
    
    // Breakpoints
    doc.push('<h3>Breakpoints</h3>');
    doc.push('<table class="doc-table">');
    doc.push('<tr><th>Prefix</th><th>Media Query</th><th>Example</th></tr>');
    Object.entries(config.breakpoints).forEach(([key, value]) => {
      doc.push(`<tr><td><code>${key}:</code></td><td><code>${value}</code></td><td><code>${key}:p-4</code></td></tr>`);
    });
    doc.push('</table>');
    
    // Numeric Properties
    doc.push('<h3>Numeric Properties (multiply by 4px)</h3>');
    doc.push('<table class="doc-table">');
    doc.push('<tr><th>Class</th><th>CSS Property</th><th>Example</th><th>Result</th></tr>');
    Object.entries(config.properties).forEach(([key, value]) => {
      const cssProps = Array.isArray(value) ? value.join(', ') : value;
      const example = `${key}-4`;
      const result = Array.isArray(value) 
        ? value.map(v => `${v}: 16px`).join('; ')
        : `${value}: 16px`;
      doc.push(`<tr><td><code>${key}-[n]</code></td><td>${cssProps}</td><td><code>${example}</code></td><td><code>${result}</code></td></tr>`);
    });
    doc.push('</table>');
    
    // Keyword Classes
    doc.push('<h3>Keyword Classes</h3>');
    doc.push('<table class="doc-table">');
    doc.push('<tr><th>Class</th><th>CSS</th></tr>');
    Object.entries(config.keywords).forEach(([key, value]) => {
      doc.push(`<tr><td><code>${key}</code></td><td><code>${value}</code></td></tr>`);
    });
    doc.push('</table>');
    
    // Shortcuts
    if (config.shortcuts) {
      doc.push('<h3>Shortcut Classes</h3>');
      doc.push('<table class="doc-table">');
      doc.push('<tr><th>Shortcut</th><th>Expands To</th></tr>');
      Object.entries(config.shortcuts).forEach(([key, value]) => {
        doc.push(`<tr><td><code>${key}</code></td><td><code>${value}</code></td></tr>`);
      });
      doc.push('</table>');
    }
    
    // Special Features
    doc.push('<h3>Special Features</h3>');
    doc.push('<ul>');
    doc.push('<li><strong>Negative values:</strong> Use <code>-</code> prefix (e.g., <code>-mt-4</code> → <code>margin-top: -16px</code>)</li>');
    doc.push('<li><strong>Pixel values:</strong> Use <code>px</code> suffix (e.g., <code>p-20px</code> → <code>padding: 20px</code>)</li>');
    doc.push('<li><strong>Arbitrary values:</strong> Use <code>[value]</code> syntax (e.g., <code>w-[250px]</code>, <code>bg-[#ff6b6b]</code>)</li>');
    doc.push('<li><strong>Opacity utilities:</strong> <code>opacity-1</code> through <code>opacity-100</code> (e.g., <code>opacity-50</code> → <code>opacity: 0.5</code>)</li>');
    doc.push('<li><strong>CSS Grid:</strong> <code>grid</code>, <code>grid-cols-*</code>, <code>col-span-*</code>, <code>row-span-*</code></li>');
    doc.push('<li><strong>Animations:</strong> <code>animate-spin</code>, <code>animate-pulse</code>, <code>animate-bounce</code>, <code>animate-ping</code></li>');
    doc.push('<li><strong>Transitions:</strong> <code>transition</code>, <code>duration-*</code>, <code>ease-*</code> utilities</li>');
    doc.push('<li><strong>All pseudo-states:</strong> <code>hover:</code>, <code>focus:</code>, <code>active:</code>, <code>disabled:</code>, <code>visited:</code>, <code>focus-within:</code>, <code>focus-visible:</code></li>');
    doc.push('<li><strong>Shortcut classes:</strong> Predefined combinations (e.g., <code>btn-primary</code> → multiple classes)</li>');
    doc.push('<li><strong>Pipe notation:</strong> Use <code>|</code> for responsive (e.g., <code>p-10|20</code> → <code>m:p-10 d:p-20</code>)</li>');
    doc.push('<li><strong>Stackable modifiers:</strong> Combine states (e.g., <code>m:hover:focus:p-4</code>, <code>hover:p-4|8</code>)</li>');
    doc.push('<li><strong>Custom properties:</strong> <code>DuxWindConfig.addProperty(\'fs\', \'font-size\')</code></li>');
    doc.push('<li><strong>Custom shortcuts:</strong> <code>DuxWindConfig.shortcuts.myBtn = \'p-4 bg-red-500\'</code></li>');
    doc.push('</ul>');
    
    // Examples
    doc.push('<h3>Examples</h3>');
    doc.push('<pre class="doc-code">');
    doc.push('// Basic utilities');
    doc.push('&lt;div class="p-4"&gt;                    → padding: 16px;');
    doc.push('&lt;div class="opacity-50"&gt;             → opacity: 0.5;');
    doc.push('&lt;div class="flex gap-4"&gt;             → display: flex; gap: 16px;');
    doc.push('');
    doc.push('// Arbitrary values');
    doc.push('&lt;div class="w-[250px]"&gt;             → width: 250px;');
    doc.push('&lt;div class="bg-[#ff6b6b]"&gt;          → background-color: #ff6b6b;');
    doc.push('&lt;div class="h-[calc(100vh-4rem)]"&gt; → height: calc(100vh-4rem);');
    doc.push('');
    doc.push('// CSS Grid');
    doc.push('&lt;div class="grid grid-cols-3"&gt;     → CSS Grid with 3 columns');
    doc.push('&lt;div class="col-span-2"&gt;           → span 2 columns');
    doc.push('');
    doc.push('// Animations &amp; Transitions');
    doc.push('&lt;div class="animate-spin"&gt;          → spinning animation');
    doc.push('&lt;div class="transition duration-300"&gt; → smooth transitions');
    doc.push('');
    doc.push('// Pseudo-states');
    doc.push('&lt;button class="hover:bg-blue-600 focus:ring-2 active:scale-95"&gt;');
    doc.push('&lt;input class="focus:border-blue-500 disabled:opacity-50"&gt;');
    doc.push('');
    doc.push('// Responsive &amp; Shortcuts');
    doc.push('&lt;div class="p-10|20"&gt;               → mobile: 40px, desktop: 80px padding');
    doc.push('&lt;button class="btn-primary"&gt;        → expands to multiple utilities');
    doc.push('&lt;div class="m:hover:p-4 d:focus:p-8"&gt; → stacked responsive + pseudo-states');
    doc.push('</pre>');
    
    // CSS for documentation
    doc.push('<style>');
    doc.push('.duxwind-doc { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }');
    doc.push('.duxwind-doc h2 { color: #111; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5em; }');
    doc.push('.duxwind-doc h3 { color: #333; margin-top: 1.5em; }');
    doc.push('.doc-table { width: 100%; border-collapse: collapse; margin: 1em 0; }');
    doc.push('.doc-table th, .doc-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    doc.push('.doc-table th { background: #f5f5f5; font-weight: bold; }');
    doc.push('.doc-table tr:nth-child(even) { background: #f9f9f9; }');
    doc.push('.doc-table code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }');
    doc.push('.duxwind-doc code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace; }');
    doc.push('.doc-code { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }');
    doc.push('.duxwind-doc ul { margin: 1em 0; padding-left: 1.5em; }');
    doc.push('.duxwind-doc li { margin: 0.5em 0; }');
    doc.push('</style>');
    
    doc.push('</div>');
    
    return doc.join('\n');
  }

  // Public API
  return {
    add: add,
    generateDoc: generateDoc
  };
})();

// Expose DuxWind globally
window.DuxWind = DuxWind;