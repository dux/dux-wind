import { describe, test, expect } from 'bun:test';

// Mock config
const mockConfig = {
  breakpoints: {
    'm': '(max-width: 767px)',
    'd': '(min-width: 768px)'
  },
  pixelMultiplier: 4,
  propertyMap: {
    'p': 'padding',
    'pt': 'padding-top',
    'pr': 'padding-right',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'px': ['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'm': 'margin',
    'mt': 'margin-top',
    'mr': 'margin-right',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom']
  },
  keywordClasses: {
    'flex': 'display: flex',
    'hidden': 'display: none',
    'block': 'display: block'
  }
};

// Test the pipe notation expansion logic
function expandPipeNotation(className, config) {
  const match = className.match(/^(-?)([a-z-]+)-(.+)$/);
  if (!match) return [className];
  
  const [, negative, base, valuesStr] = match;
  if (!valuesStr.includes('|')) return [className];
  
  const values = valuesStr.split('|');
  const breakpointKeys = Object.keys(config.breakpoints);
  
  if (values.length !== breakpointKeys.length) return [className];
  
  const expandedClasses = [];
  breakpointKeys.forEach((breakpoint, index) => {
    expandedClasses.push(`${breakpoint}:${negative}${base}-${values[index]}`);
  });
  
  return expandedClasses;
}

// Test CSS generation logic
function parseAndGenerateCSS(className, config) {
  const parts = className.split(':');
  let breakpoint = null;
  let actualClass = className;
  
  if (parts.length === 2 && config.breakpoints[parts[0]]) {
    breakpoint = parts[0];
    actualClass = parts[1];
  }
  
  // Try numeric match
  const numericMatch = actualClass.match(/^(-?)([a-z-]+)-(\d+)(px)?$/);
  if (numericMatch) {
    const [, negative, property, value, unit] = numericMatch;
    const pixelValue = unit === 'px' 
      ? parseInt(value) * (negative ? -1 : 1)
      : parseInt(value) * config.pixelMultiplier * (negative ? -1 : 1);
    
    const cssProperty = config.propertyMap[property];
    if (!cssProperty) return null;
    
    let cssRule = '';
    const selector = `.${className.replace(/:/g, '\\:')}`;
    
    if (Array.isArray(cssProperty)) {
      const declarations = cssProperty.map(prop => `${prop}: ${pixelValue}px`).join('; ');
      cssRule = `${selector} { ${declarations}; }`;
    } else {
      cssRule = `${selector} { ${cssProperty}: ${pixelValue}px; }`;
    }
    
    if (breakpoint) {
      cssRule = `@media ${config.breakpoints[breakpoint]} { ${cssRule} }`;
    }
    
    return cssRule;
  }
  
  // Check keyword classes
  if (config.keywordClasses && config.keywordClasses[actualClass]) {
    const rule = config.keywordClasses[actualClass];
    let cssRule = `.${className.replace(/:/g, '\\:')} { ${rule} }`;
    
    if (breakpoint) {
      cssRule = `@media ${config.breakpoints[breakpoint]} { ${cssRule} }`;
    }
    
    return cssRule;
  }
  
  return null;
}

describe('Twind Core Functions', () => {
  describe('expandPipeNotation', () => {
    test('expands simple pipe notation', () => {
      const result = expandPipeNotation('p-10|20', mockConfig);
      expect(result).toEqual(['m:p-10', 'd:p-20']);
    });

    test('expands negative pipe notation', () => {
      const result = expandPipeNotation('-mt-4|8', mockConfig);
      expect(result).toEqual(['m:-mt-4', 'd:-mt-8']);
    });

    test('returns original if no pipe', () => {
      const result = expandPipeNotation('p-10', mockConfig);
      expect(result).toEqual(['p-10']);
    });

    test('returns original if wrong number of values', () => {
      const result = expandPipeNotation('p-10|20|30', mockConfig);
      expect(result).toEqual(['p-10|20|30']);
    });

    test('handles complex property names', () => {
      const result = expandPipeNotation('gap-x-2|4', mockConfig);
      expect(result).toEqual(['m:gap-x-2', 'd:gap-x-4']);
    });
  });

  describe('parseAndGenerateCSS', () => {
    test('generates CSS for simple padding', () => {
      const result = parseAndGenerateCSS('p-10', mockConfig);
      expect(result).toBe('.p-10 { padding: 40px; }');
    });

    test('generates CSS for negative margin', () => {
      const result = parseAndGenerateCSS('-mt-4', mockConfig);
      expect(result).toBe('.-mt-4 { margin-top: -16px; }');
    });

    test('generates CSS for pixel values', () => {
      const result = parseAndGenerateCSS('p-20px', mockConfig);
      expect(result).toBe('.p-20px { padding: 20px; }');
    });

    test('generates CSS for array properties', () => {
      const result = parseAndGenerateCSS('px-4', mockConfig);
      expect(result).toBe('.px-4 { padding-left: 16px; padding-right: 16px; }');
    });

    test('generates CSS for keyword classes', () => {
      const result = parseAndGenerateCSS('flex', mockConfig);
      expect(result).toBe('.flex { display: flex }');
    });

    test('generates CSS with media query for responsive classes', () => {
      const result = parseAndGenerateCSS('m:p-10', mockConfig);
      expect(result).toBe('@media (max-width: 767px) { .m\\:p-10 { padding: 40px; } }');
    });

    test('returns null for unknown properties', () => {
      const result = parseAndGenerateCSS('unknown-10', mockConfig);
      expect(result).toBe(null);
    });
  });
});