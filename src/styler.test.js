// Test file for styler.js - demonstrating standalone CSS generation
import { describe, test, expect } from 'bun:test';
import { generateStyles, processClass } from './styler.js';

describe('DuxWind Styler - Standalone CSS Generation', () => {
  
  test('Basic class generation: p-4 → padding: 16px', () => {
    const styles = generateStyles('p-4');
    expect(styles).toHaveLength(1);
    expect(styles[0]).toMatch(/padding:\s*16px/);
  });

  test('Pipe notation: p-10|20 → creates 2 responsive rules', () => {
    const styles = generateStyles('p-10|20');
    expect(styles).toHaveLength(2);
    
    // Should create mobile and desktop rules
    const mobileRule = styles.find(rule => rule.includes('max-width: 768px'));
    const desktopRule = styles.find(rule => rule.includes('min-width: 769px'));
    
    expect(mobileRule).toBeDefined();
    expect(desktopRule).toBeDefined();
    expect(mobileRule).toMatch(/padding:\s*40px/);
    expect(desktopRule).toMatch(/padding:\s*80px/);
  });

  test('Multiple classes: "p-4 bg-blue-500 hover:text-white" → generates 3 rules', () => {
    const styles = generateStyles('p-4 bg-blue-500 hover:text-white');
    expect(styles).toHaveLength(3);
    
    const paddingRule = styles.find(rule => rule.includes('padding'));
    const backgroundRule = styles.find(rule => rule.includes('background-color'));
    const hoverRule = styles.find(rule => rule.includes(':hover'));
    
    expect(paddingRule).toBeDefined();
    expect(backgroundRule).toBeDefined(); 
    expect(hoverRule).toBeDefined();
  });

  test('Fractional widths: w-1/2 → width: 50%', () => {
    const styles = generateStyles('w-1/2');
    expect(styles).toHaveLength(1);
    expect(styles[0]).toMatch(/width:\s*50%/);
  });

  test('@ notation: p-8@m → mobile-specific padding', () => {
    const styles = generateStyles('p-8@m');
    expect(styles).toHaveLength(1);
    expect(styles[0]).toMatch(/@media.*max-width:\s*768px/);
    expect(styles[0]).toMatch(/padding:\s*32px/);
  });

  test('Keyword classes: flex justify-center → display and justify-content', () => {
    const styles = generateStyles('flex justify-center');
    expect(styles).toHaveLength(2);
    
    const flexRule = styles.find(rule => rule.includes('display: flex'));
    const justifyRule = styles.find(rule => rule.includes('justify-content: center'));
    
    expect(flexRule).toBeDefined();
    expect(justifyRule).toBeDefined();
  });

  test('Single class processing: processClass function', () => {
    // Test single class with pipe notation
    const pipeResult = processClass('m-5|10');
    expect(pipeResult).toHaveLength(2);
    
    // Test hover state
    const hoverResult = processClass('hover:bg-red-500');
    expect(hoverResult).toHaveLength(1);
    expect(hoverResult[0]).toMatch(/:hover/);
  });

  test('Complex example: responsive shortcut with hover states', async () => {
    // First define a shortcut manually for testing
    const { CONFIG } = await import('./config.js');
    CONFIG.shortcuts = {
      'btn': 'px-4 py-2 rounded border cursor-pointer',
      'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600'
    };
    
    const styles = generateStyles('btn-primary');
    
    // Should generate multiple rules for the shortcut
    expect(styles.length).toBeGreaterThan(1);
    
    // Should include base and hover states
    const baseRule = styles.find(rule => rule.includes('.btn-primary') && !rule.includes(':hover'));
    const hoverRule = styles.find(rule => rule.includes('.btn-primary:hover'));
    
    expect(baseRule).toBeDefined();
    expect(hoverRule).toBeDefined();
  });

  test('Edge cases: empty and invalid inputs', () => {
    expect(generateStyles('')).toEqual([]);
    expect(generateStyles(' ')).toEqual([]);
    expect(generateStyles('invalid-unknown-class')).toEqual([]);
    expect(generateStyles(null)).toEqual([]);
    expect(generateStyles(undefined)).toEqual([]);
  });

  test('Performance test: generate 100 classes quickly', () => {
    const classAttribute = Array.from({ length: 100 }, (_, i) => `p-${i % 20}`).join(' ');
    
    const start = performance.now();
    const styles = generateStyles(classAttribute);
    const end = performance.now();
    
    expect(styles.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(100); // Should be very fast (under 100ms)
  });
});