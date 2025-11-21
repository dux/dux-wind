#!/usr/bin/env node

// DuxWind Shortcut Generator - Generate CSS for shortcut definitions
// Usage: node bin/shortcut.js "px-4 py-2 bg-blue-500 hover:bg-blue-600"

import { generateShortcutCSSFromClasses } from '../src/shortcuts.js';

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node bin/shortcut.js "class names"');
    console.log('Example: node bin/shortcut.js "px-4 py-2 bg-blue-500 hover:bg-blue-600"');
    process.exit(1);
  }

  const classNames = args.join(' ');
  
  try {
    const css = generateShortcutCSSFromClasses(classNames);
    console.log(css);
  } catch (error) {
    console.error('Error generating CSS:', error.message);
    process.exit(1);
  }
}

main();