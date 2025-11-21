#!/usr/bin/env node

import { generateStyles } from '../src/styler.js';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node bin/styler.js <class-names>');
  console.error('Example: node bin/styler.js "p-10|20 bg-blue-500 hover:text-white"');
  process.exit(1);
}

// Join all arguments to handle quoted and unquoted class lists
const classAttribute = args.join(' ');

try {
  // Generate CSS
  const cssRules = generateStyles(classAttribute);
  
  if (cssRules.length === 0) {
    console.log('/* No CSS generated for the given classes */');
  } else {
    // Output CSS rules
    cssRules.forEach(rule => {
      console.log(rule);
    });
  }
} catch (error) {
  console.error('Error generating CSS:', error.message);
  process.exit(1);
}