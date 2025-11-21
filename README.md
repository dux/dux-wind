# DuxWind

Real-time Tailwind-like CSS generator with shortcuts, responsive utilities, and modern features.

## Why DuxWind?

DuxWind was created to bridge the gap between Tailwind CSS's powerful utility-first philosophy and the need for rapid prototyping without build complexity. While Tailwind CSS excels in production environments, DuxWind focuses on developer velocity and simplicity.

**The Vision:** A utility-first CSS framework that works instantly in any environment - from CodePen experiments to production applications - without sacrificing the developer experience that makes Tailwind so beloved.

**Key Motivations:**
- **Zero-friction setup** - Drop in a single script tag and start building
- **No build step required** - Perfect for prototypes, learning, and environments where build tools aren't feasible
- **Enhanced syntax flexibility** - Support for both `p-12px` and `p-[12px]` notation for natural value input
- **Intuitive responsive syntax** - Choose between `m:`, `@m`, or pipe notation (`p-4|8`) based on your preference
- **Built-in shortcuts system** - Create reusable component classes without additional tooling
- **Complete solution** - CSS reset, utilities, and animations included out of the box

DuxWind maintains compatibility with Tailwind's core concepts while adding conveniences that make utility-first CSS more accessible to developers at every level.

## Features

- **🚀 Real-time CSS generation** - Styles are generated as you use classes
- **🎯 Near 100% Tailwind compatibility** - Drop-in replacement for most Tailwind classes
- **📱 Responsive utilities** - Multiple breakpoint syntaxes
- **⚡ Custom shortcuts** - Define reusable class combinations
- **🎨 Arbitrary values** - Use any CSS value with bracket notation
- **🔧 Configurable** - Customize properties, breakpoints, and keywords
- **🐛 Debug mode** - Track original classes during development
- **🌊 Pipe notation** - Compact responsive syntax
- **@ Alternative syntax** - Property-first breakpoint notation

## Quick Start

**Minimal Setup (Just Works!):**
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://dux.github.io/dux-wind/src/dux-wind.js"></script>
    <script>
        // Default configuration auto-loads - just initialize!
        DuxWind.init();
    </script>
</head>
<body>
    <div class="p-4 bg-blue-500 text-white rounded">
        Hello DuxWind! 100+ utilities ready to use.
    </div>
</body>
</html>
```

**With Custom Configuration:**
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://dux.github.io/dux-wind/src/dux-wind.js"></script>
    <script>
        // Optional: Override default breakpoints
        DuxWind.config.breakpoints = {
            's': '(max-width: 480px)',    // Small mobile
            'm': '(max-width: 768px)',    // Mobile
            't': '(max-width: 1024px)',   // Tablet
            'd': '(min-width: 1025px)'    // Desktop
        };

        // Optional: Add custom shortcuts
        DuxWind.shortcut('btn': 'px-4 py-2 rounded font-medium cursor-pointer');
        DuxWind.shortcut('btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600');
        DuxWind.shortcut('card': 'bg-white rounded border p-6 shadow-sm');

        DuxWind.init({ debug: true });
    </script>
</head>
<body>
    <div class="p-4 bg-blue-500 text-white rounded mb-4">
        Standard utilities work immediately
    </div>

    <button class="btn-primary">Custom button shortcut</button>

    <div class="card">
        <h2 class="text-lg font-bold mb-2">Card Component</h2>
        <p class="text-gray-600">Using custom shortcuts and responsive design</p>
    </div>
</body>
</html>
```

## Configuration

### Basic Setup

**Automatic Configuration Loading:**
DuxWind automatically loads a complete default configuration including:
- 100+ CSS properties (padding, margin, width, height, colors, etc.)
- 200+ keyword classes (flex, grid, rounded, shadows, animations, etc.)
- Mobile/desktop breakpoints
- All pseudo-class support (hover, focus, active, first, last, etc.)

```javascript
// ✅ Minimal setup - everything auto-loaded with CSS reset
DuxWind.init();

// ✅ With options
DuxWind.init({
    debug: true,        // Enable debug mode (auto-detects dev ports)
    reset: true,        // Apply CSS reset automatically (default: true)
    clearCache: true    // Clear processed classes cache (default: true)
});

// 🔧 Disable CSS reset if not wanted
DuxWind.init({ reset: false });

// 🔧 Optional: Manual CSS reset
DuxWind.resetCss();

// 🔄 Optional: Reset to default config (rarely needed)
DuxWind.loadDefaultConfig();
```

**What's Auto-Loaded:**
- **100+ CSS Properties:** `p-4` (padding), `m-8` (margin), `w-full` (width), `text-lg` (font-size), `bg-blue-500` (background), etc.
- **200+ Keyword Classes:** `flex`, `grid`, `rounded`, `shadow-lg`, `animate-spin`, `transition`, `cursor-pointer`, etc.
- **Responsive Breakpoints:** `m:` (mobile), `d:` (desktop)
- **All Pseudo-classes:** `hover:`, `focus:`, `active:`, `first:`, `last:`, `even:`, `odd:`, `disabled:`, etc.
- **Animations & Transitions:** `animate-spin`, `animate-pulse`, `duration-300`, `ease-in-out`
- **Layout Systems:** Flexbox, CSS Grid, positioning, spacing utilities

### Custom Breakpoints

```javascript
// Redefine breakpoints
DuxWind.config.breakpoints = {
    'm': '(max-width: 768px)',    // Mobile
    'd': '(min-width: 769px)'     // Desktop
};
```

### Custom Shortcuts

```javascript
DuxWind.config.shortcuts = {
    'btn': 'px-4 py-2 rounded font-medium transition-all duration-200 cursor-pointer border',
    'btn-primary': 'btn bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    'card': 'bg-white rounded-lg border p-6 shadow-sm',
    'container': 'max-w-1200px mx-auto px-4'
};
```

## Responsive Utilities

DuxWind supports multiple syntaxes for responsive design:

### Traditional Breakpoint Syntax
```html
<div class="m:text-16px d:text-24px">
    Small text on mobile, large on desktop
</div>
```

### @ Notation (Alternative)
```html
<div class="text-16px@m text-24px@d">
    Same as above, property-first syntax
</div>
```

### Pipe Notation (Compact)
```html
<div class="text-16|24px">
    Values for each breakpoint: mobile|desktop
</div>

<div class="p-4|8">
    Padding: 16px mobile, 32px desktop
</div>
```

## Arbitrary Values

Use any CSS value with bracket notation:

```html
<!-- Dimensions -->
<div class="w-[250px] h-[100px]">

<!-- Colors -->
<div class="bg-[#ff6b6b] text-[#ffffff]">

<!-- Complex values -->
<div class="w-[calc(100vh-4rem)]">

<!-- With breakpoints -->
<div class="w-[300px]@m w-[500px]@d">
```

## Built-in Utilities

### Spacing
```html
<!-- Padding -->
<div class="p-4 px-8 py-2">         <!-- All, horizontal, vertical -->
<div class="pt-4 pr-8 pb-2 pl-6">   <!-- Individual sides -->

<!-- Margin -->
<div class="m-4 mx-auto my-8">      <!-- Auto centering -->
<div class="-mt-4">                 <!-- Negative margins -->
```

### Layout
```html
<!-- Flexbox -->
<div class="flex justify-center items-center gap-4">
<div class="flex-col flex-wrap">

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
<div class="col-span-2 row-span-3">

<!-- Positioning -->
<div class="relative absolute fixed">
<div class="top-4 left-8 z-10">
```

### Typography
```html
<!-- Font -->
<div class="font-bold text-center">
<div class="text-lg leading-tight tracking-wide">

<!-- Colors -->
<div class="text-blue-500 text-white">
```

### Styling
```html
<!-- Background -->
<div class="bg-blue-500 bg-transparent">

<!-- Borders -->
<div class="border border-2 border-blue-500">
<div class="rounded rounded-lg">

<!-- Effects -->
<div class="shadow-sm opacity-50">
<div class="transition duration-300 ease-in-out">
```

## Shortcuts

Define reusable combinations:

```html
<!-- Define shortcuts -->
<script>
DuxWind.config.shortcuts = {
    'btn': 'px-4 py-2 rounded font-medium transition-all duration-200 cursor-pointer border',
    'btn-primary': 'btn bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    'card': 'bg-white rounded-lg border p-6 shadow-sm'
};
</script>

<!-- Use shortcuts -->
<button class="btn-primary">Click me</button>
<div class="card">Card content</div>
```

## Animations & Transitions

```html
<!-- Animations -->
<div class="animate-spin">      <!-- Spinning -->
<div class="animate-pulse">     <!-- Pulsing -->
<div class="animate-bounce">    <!-- Bouncing -->

<!-- Transitions -->
<div class="transition duration-300 ease-in-out">
<div class="hover:bg-blue-600 active:bg-blue-700">
```

## Interactive States

```html
<!-- Hover effects -->
<button class="bg-blue-500 hover:bg-blue-600">

<!-- Focus states -->
<input class="border focus:border-blue-500 focus:ring-2">

<!-- Active states -->
<button class="active:scale-95">

<!-- Combined states -->
<button class="hover:bg-blue-600 active:bg-blue-700 focus:ring-2">

<!-- Responsive + states -->
<button class="hover:bg-blue-600@d">  <!-- Hover only on desktop -->
```

## Debug Mode

Debug mode helps track class expansions:

```javascript
// Enable debug (auto-enabled for development ports > 2000)
DuxWind.init({ debug: true });
```

```html
<!-- With debug enabled -->
<div class="btn-primary" data-dw-class="btn-primary">
    <!-- Expands to actual utility classes -->
    <!-- data-dw-class preserves original for debugging -->
</div>
```

## Configuration Options

### Properties
Add custom CSS property mappings:

```javascript
DuxWind.config.properties = {
    'fs': 'font-size',           // fs-16 -> font-size: 64px
    'bg': 'background-color',    // bg-red -> background-color: red
    'w': 'width',               // w-10 -> width: 40px
};
```

### Keywords
Define keyword classes:

```javascript
DuxWind.config.keywords = {
    'flex': 'display: flex',
    'hidden': 'display: none',
    'text-center': 'text-align: center'
};
```

### Pixel Multiplier
Customize the default pixel multiplication:

```javascript
DuxWind.config.pixelMultiplier = 4;  // p-4 = 16px (4 * 4)
```

## API Reference

### Methods

```javascript
// Core methods
DuxWind.init(options)           // Initialize with options
DuxWind.loadClass(className)    // Process a single class
DuxWind.resetCss()             // Apply modern CSS reset
DuxWind.loadDefaultConfig()    // Reset to default config (auto-loaded)
DuxWind.generateDoc()          // Generate documentation HTML

// Init options
{
    debug: boolean,      // Enable debug mode (default: auto-detect)
    reset: boolean,      // Apply CSS reset automatically (default: true)
    clearCache: boolean  // Clear processed classes (default: true)
}
```

### Global Configuration

```javascript
DuxWind.config = {
    breakpoints: {
        'm': '(max-width: 768px)',
        'd': '(min-width: 769px)'
    },
    pixelMultiplier: 4,
    properties: { /* ... */ },
    keywords: { /* ... */ },
    shortcuts: { /* ... */ }
};
```

## Examples

### Spacing & Sizing
```html
<!-- Padding & Margin System (1 unit = 4px by default) -->
<div class="p-4 m-8">Basic padding & margin</div>
<div class="px-6 py-3">Horizontal & vertical spacing</div>
<div class="pt-2 pr-4 pb-6 pl-8">Individual sides</div>
<div class="ps-4 pe-8">Logical properties (RTL support)</div>
<div class="-mt-4 -ml-6">Negative margins</div>

<!-- Width & Height -->
<div class="w-full h-screen">Full width, viewport height</div>
<div class="w-1/2 h-32">Fractional width, fixed height</div>
<div class="min-w-0 max-w-xs">Min/max width constraints</div>
<div class="size-10">Square (width = height)</div>
<div class="w-fit h-auto">Content-based sizing</div>
```

### Typography System
```html
<!-- Font Sizes (xs, sm, base, lg, xl, 2xl through 9xl) -->
<p class="text-xs">Extra small text (12px)</p>
<p class="text-sm">Small text (14px)</p>
<p class="text-base">Base text (16px)</p>
<p class="text-lg">Large text (18px)</p>
<p class="text-4xl">Very large heading (36px)</p>

<!-- Font Weights (100-900) -->
<p class="font-thin">Thin weight (100)</p>
<p class="font-normal">Normal weight (400)</p>
<p class="font-semibold">Semibold weight (600)</p>
<p class="font-black">Black weight (900)</p>

<!-- Font Families & Text Styling -->
<p class="font-sans">Sans-serif font</p>
<p class="font-serif">Serif font</p>
<p class="font-mono">Monospace font</p>
<p class="italic underline">Italic with underline</p>
<p class="uppercase tracking-wider">UPPERCASE WITH SPACING</p>

<!-- Line Height & Letter Spacing -->
<p class="leading-tight">Tight line height</p>
<p class="leading-relaxed tracking-wide">Relaxed with wide tracking</p>
```

### Color System
```html
<!-- Background Colors (50-900 shades) -->
<div class="bg-gray-50">Very light gray</div>
<div class="bg-blue-500">Primary blue</div>
<div class="bg-red-600">Darker red</div>
<div class="bg-green-900">Very dark green</div>

<!-- Text Colors -->
<p class="text-gray-700">Dark gray text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-transparent">Transparent text</p>
<p class="text-current">Current color</p>

<!-- Border Colors -->
<div class="border border-gray-300">Light border</div>
<div class="border-2 border-blue-500">Thick blue border</div>
```

### Layout & Positioning
```html
<!-- Display Types -->
<div class="block">Block element</div>
<div class="inline-block">Inline block</div>
<div class="hidden">Hidden element</div>
<div class="flex">Flex container</div>
<div class="grid">Grid container</div>

<!-- Positioning -->
<div class="relative">
    Relative positioned
    <div class="absolute top-2 right-4">Absolutely positioned child</div>
</div>
<div class="fixed bottom-4 right-4 z-50">Fixed notification</div>
<div class="sticky top-0">Sticky header</div>

<!-- Overflow -->
<div class="overflow-hidden">Hidden overflow</div>
<div class="overflow-x-auto overflow-y-hidden">Horizontal scroll only</div>
```

### Flexbox & Grid
```html
<!-- Flexbox Layout -->
<div class="flex justify-between items-center">
    <div>Left content</div>
    <div>Right content</div>
</div>
<div class="flex flex-col gap-4">
    <div class="flex-1">Flexible item</div>
    <div class="flex-none">Fixed item</div>
</div>

<!-- Grid Layout -->
<div class="grid grid-cols-3 grid-rows-2 gap-4">
    <div class="col-span-2">Spans 2 columns</div>
    <div class="row-span-2">Spans 2 rows</div>
    <div class="col-start-2 col-end-4">Positioned span</div>
</div>
<div class="grid auto-cols-max auto-rows-min">
    <div class="col-auto">Auto-placed</div>
</div>
```

### Borders & Effects
```html
<!-- Border Radius -->
<div class="rounded">Small radius (4px)</div>
<div class="rounded-lg">Large radius (8px)</div>
<div class="rounded-full">Circular</div>
<div class="rounded-t-lg rounded-b-none">Top radius only</div>

<!-- Shadows -->
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-inner">Inner shadow</div>

<!-- Ring Effects -->
<div class="ring-2 ring-blue-500">Blue ring</div>
<div class="ring-4 ring-red-500 ring-offset-2">Ring with offset</div>

<!-- Opacity -->
<div class="opacity-25">25% opacity</div>
<div class="opacity-75">75% opacity</div>
```

### Transforms & Filters
```html
<!-- Transforms -->
<div class="scale-110">Scaled up 10%</div>
<div class="rotate-45">Rotated 45 degrees</div>
<div class="translate-x-4 translate-y-2">Translated</div>
<div class="skew-x-12">Skewed horizontally</div>

<!-- Filters -->
<img class="blur-sm" src="image.jpg" alt="Blurred image">
<img class="brightness-150 contrast-125" src="image.jpg" alt="Enhanced image">
<img class="grayscale" src="image.jpg" alt="Grayscale image">
<img class="sepia saturate-150" src="image.jpg" alt="Vintage look">

<!-- Backdrop Filters -->
<div class="backdrop-blur-md backdrop-brightness-75">
    Blurred backdrop
</div>
```

### Interactive States
```html
<!-- Hover Effects -->
<button class="bg-blue-500 hover:bg-blue-600 hover:scale-105">
    Hover to change color & scale
</button>

<!-- Focus States -->
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
       placeholder="Focus me">

<!-- Multiple States Combined -->
<button class="bg-green-500 text-white px-4 py-2 rounded
               hover:bg-green-600 
               active:bg-green-700 
               focus:ring-4 focus:ring-green-200
               disabled:bg-gray-300 disabled:cursor-not-allowed">
    Multi-state button
</button>

<!-- Structural Pseudo-classes -->
<ul class="space-y-2">
    <li class="first:font-bold">First item (bold)</li>
    <li class="even:bg-gray-100">Even item (gray bg)</li>
    <li class="odd:bg-blue-50">Odd item (blue bg)</li>
    <li class="last:border-b-2">Last item (bottom border)</li>
</ul>
```

### Responsive Design (3 Methods)
```html
<!-- Method 1: Prefix Notation -->
<div class="text-sm m:text-base d:text-lg">
    Small → Base → Large
</div>

<!-- Method 2: @ Notation -->
<div class="text-sm@m text-lg@d">
    Alternative responsive syntax
</div>

<!-- Method 3: Pipe Notation (Most Compact) -->
<div class="text-sm|lg p-4|8 w-full|500px">
    Values for mobile|desktop
</div>

<!-- Complex Responsive Example -->
<div class="grid 
            grid-cols-1@m grid-cols-2@t grid-cols-4@d 
            gap-4@m gap-6@d 
            p-4|6|8">
    Responsive grid with gaps and padding
</div>
```

### Arbitrary Values
```html
<!-- Custom Dimensions -->
<div class="w-[347px] h-[123px]">Exact pixel dimensions</div>
<div class="w-[calc(100vw-2rem)] h-[50vh]">Calculated values</div>

<!-- Custom Colors -->
<div class="bg-[#ff6b6b] text-[#ffffff]">Hex colors</div>
<div class="bg-[rgb(255,107,107)]">RGB values</div>

<!-- Complex CSS Values -->
<div class="shadow-[0_4px_20px_rgba(0,0,0,0.25)]">Custom shadow</div>
<div class="transform-[rotate(15deg)_scale(1.1)]">Multiple transforms</div>

<!-- Responsive Arbitrary Values -->
<div class="w-[300px]@m w-[800px]@d">Responsive custom widths</div>
```

### Animations & Transitions
```html
<!-- Built-in Animations -->
<div class="animate-spin">Spinning loader</div>
<div class="animate-pulse">Pulsing skeleton</div>
<div class="animate-bounce">Bouncing element</div>
<div class="animate-ping">Pinging notification</div>

<!-- Transitions -->
<div class="transition-all duration-300 ease-in-out
            hover:transform hover:scale-110">
    Smooth animated hover
</div>

<!-- Custom Timing -->
<button class="bg-blue-500 
               transition-colors duration-150 ease-out
               hover:bg-blue-600">
    Quick color transition
</button>

<div class="transition-transform duration-700 ease-bounce
           hover:rotate-180">
    Slow bouncy rotation
</div>
```

### Advanced Component Examples
```html
<!-- Card Component with All Features -->
<div class="bg-white rounded-xl shadow-lg hover:shadow-xl 
           transition-all duration-300 border border-gray-200
           p-6 max-w-sm mx-auto transform hover:-translate-y-1">
    <img class="w-full h-48 object-cover rounded-lg mb-4" 
         src="image.jpg" alt="Card image">
    <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
    <p class="text-gray-600 leading-relaxed mb-4">
        Description with proper typography and spacing.
    </p>
    <div class="flex justify-between items-center">
        <span class="text-2xl font-bold text-blue-600">$29.99</span>
        <button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                       text-white px-4 py-2 rounded-lg font-medium
                       transition-colors duration-200
                       focus:ring-4 focus:ring-blue-200">
            Buy Now
        </button>
    </div>
</div>

<!-- Navigation Bar -->
<nav class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex justify-between items-center max-w-6xl mx-auto">
        <div class="flex items-center gap-8">
            <img class="h-8 w-auto" src="logo.svg" alt="Logo">
            <div class="hidden d:flex gap-6">
                <a class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                   href="#">Home</a>
                <a class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                   href="#">Products</a>
                <a class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                   href="#">About</a>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <button class="bg-blue-500 hover:bg-blue-600 text-white 
                           px-4 py-2 rounded-lg font-medium transition-colors">
                Sign Up
            </button>
        </div>
    </div>
</nav>

<!-- Form Example -->
<form class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Form</h2>
    
    <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Name</label>
        <input type="text" 
               class="w-full px-4 py-2 border border-gray-300 rounded-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      transition-all duration-200"
               placeholder="Your name">
    </div>
    
    <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Email</label>
        <input type="email" 
               class="w-full px-4 py-2 border border-gray-300 rounded-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                      invalid:border-red-500 invalid:ring-red-200
                      transition-all duration-200"
               placeholder="your@email.com">
    </div>
    
    <div class="mb-6">
        <label class="block text-gray-700 font-semibold mb-2">Message</label>
        <textarea rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         resize-vertical transition-all duration-200"
                  placeholder="Your message"></textarea>
    </div>
    
    <button type="submit" 
            class="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                   text-white font-semibold py-3 rounded-lg
                   transition-colors duration-200
                   focus:ring-4 focus:ring-blue-200">
        Send Message
    </button>
</form>
```

### Custom Shortcut System
```javascript
// Complete button and component system
DuxWind.config.shortcuts = {
    // Base components
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer border focus:ring-4',
    'card': 'bg-white rounded-lg border border-gray-200 shadow-sm p-6',
    'container': 'max-w-[1200px] mx-auto px-4@m px-6@d',
    
    // Button variants
    'btn-primary': 'btn bg-blue-500 text-white border-blue-500 hover:bg-blue-600 focus:ring-blue-200',
    'btn-secondary': 'btn bg-gray-500 text-white border-gray-500 hover:bg-gray-600 focus:ring-gray-200',
    'btn-outline': 'btn bg-transparent text-blue-500 border-blue-500 hover:bg-blue-50 focus:ring-blue-200',
    'btn-ghost': 'btn bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-200',
    
    // Button sizes
    'btn-sm': 'px-3 py-1.5 text-sm',
    'btn-lg': 'px-6 py-3 text-lg',
    'btn-xl': 'px-8 py-4 text-xl',
    
    // Typography
    'h1': 'text-3xl@m text-5xl@d font-bold leading-tight text-gray-900',
    'h2': 'text-2xl@m text-3xl@d font-semibold leading-tight text-gray-900',
    'h3': 'text-xl@m text-2xl@d font-semibold leading-tight text-gray-800',
    'body': 'text-base leading-relaxed text-gray-700',
    'caption': 'text-sm text-gray-600',
    
    // Layout
    'section': 'py-16@m py-24@d',
    'grid-auto': 'grid grid-cols-1@m grid-cols-2@t grid-cols-3@d gap-6',
    
    // Form elements
    'input': 'px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200',
    'input-error': 'border-red-500 focus:border-red-500 focus:ring-red-200',
    
    // Status indicators
    'badge': 'px-2 py-1 text-xs font-semibold rounded-full',
    'badge-success': 'badge bg-green-100 text-green-800',
    'badge-warning': 'badge bg-yellow-100 text-yellow-800',
    'badge-error': 'badge bg-red-100 text-red-800',
    'badge-info': 'badge bg-blue-100 text-blue-800'
};
```

## DuxWind vs Tailwind CSS

### Philosophy & Architecture

**DuxWind**
- **Runtime CSS generation** - CSS is generated on-demand as classes are used
- **Zero build step** - Works directly in the browser without tooling
- **Dynamic processing** - Classes are expanded and transformed in real-time
- **Auto-configuration** - 100+ properties and 200+ keywords load automatically
- **Perfect optimization** - Only generates CSS for classes actually used

**Tailwind CSS**
- **Build-time generation** - CSS compiled during build process with PostCSS
- **Requires toolchain** - Needs Node.js, PostCSS, and configuration
- **Static compilation** - Classes are pre-generated and purged
- **Manual configuration** - Requires explicit setup and configuration files
- **Production optimized** - Designed for minimal production CSS output

### Core Features Comparison

| Feature Category | DuxWind | Tailwind CSS |
|-----------------|---------|--------------|
| **Spacing** (p-, m-, px-, etc.) | ✅ Full support | ✅ Full support |
| **Sizing** (w-, h-, min-, max-) | ✅ Full support | ✅ Full support |
| **Colors** (bg-, text-, border-) | ✅ Full palette | ✅ Full palette |
| **Typography** (text-, font-) | ✅ Complete | ✅ Complete |
| **Flexbox** | ✅ All utilities | ✅ All utilities |
| **Grid** | ✅ CSS Grid support | ✅ CSS Grid support |
| **Borders & Radius** | ✅ Full support | ✅ Full support |
| **Shadows** | ✅ Box shadows | ✅ Box & text shadows |
| **Responsive Design** | ✅ Breakpoints | ✅ Breakpoints |
| **Pseudo-classes** | ✅ hover, focus, etc. | ✅ All pseudo-classes |
| **Pseudo-elements** | ⚡ Partial | ✅ Full support |
| **Arbitrary Values** | ✅ [value] syntax | ✅ [value] syntax |
| **Negative Values** | ✅ -m-4, etc. | ✅ Full support |
| **Animations** | ✅ Basic set | ✅ Extended set |
| **Transforms** | ✅ Full support | ✅ Full support |
| **Filters** | ⚡ Basic support | ✅ Full support |
| **Backdrop Filters** | ⚡ Partial | ✅ Full support |

### Unique DuxWind Features

**1. Pipe Notation for Responsive Design**
```html
<!-- Compact responsive syntax: mobile|desktop -->
<div class="p-4|8 text-16|24px w-full|500px">
  <!-- Padding: 16px mobile, 32px desktop -->
  <!-- Font: 16px mobile, 24px desktop -->
  <!-- Width: 100% mobile, 500px desktop -->
</div>
```

**2. @ Notation (Alternative Responsive)**
```html
<!-- Property-first breakpoint syntax -->
<div class="p-4@m p-8@d bg-blue-500@m bg-green-500@d">
  <!-- Clear, readable responsive classes -->
</div>
```

**3. Runtime Configuration**
```javascript
// Change settings without rebuilding
DuxWind.config.pixelMultiplier = 5; // p-4 = 20px now
DuxWind.config.breakpoints.t = '(max-width: 1024px)'; // Add tablet

// Dynamic shortcut creation
DuxWind.shortcut('hero', 'text-4xl font-bold mb-8');
```

**4. CSS Override Intelligence**
```html
<!-- Explicit classes override shortcut classes -->
<button class="btn p-8">
  <!-- p-8 overrides any padding in 'btn' shortcut -->
</button>
```

**5. MutationObserver Integration**
- Automatically processes dynamically added elements
- Handles class changes in real-time
- Works seamlessly with SPAs and dynamic content

**6. Debug Mode with Tracking**
```html
<!-- Original classes preserved for debugging -->
<div class="btn-primary" data-dw-original-class="btn-primary">
```

**7. Body Class Viewport Detection**
```javascript
// Automatic viewport-based body classes
DuxWind.init({ body: true });
// <body class="mobile"> or <body class="desktop">
```

### Features Tailwind Has That DuxWind Doesn't

**Advanced Design System**
- Container queries (@container)
- Subgrid utilities
- Space-between utilities (space-x, space-y with child targeting)
- Divide utilities (borders between children)
- Ring utilities with offset
- Gradient color stops (from-*, via-*, to-*)
- Mix blend modes
- Background blend modes

**Extended Utilities**
- Font variant numeric
- Text decoration styles (wavy, double, etc.)
- Scroll behavior & snap utilities
- Touch action utilities
- Will-change utilities
- Full backdrop filter support
- Print variant (@media print)
- RTL/LTR modifiers

**Configuration & Tooling**
- IntelliSense/autocomplete support
- Plugin ecosystem
- Deep theme customization
- Variant ordering control
- Important modifier (!)
- CSS-in-JS extraction
- Component extraction (@apply)

### Performance Analysis

**DuxWind Performance**
```
Initial Load: ~20KB uncompressed JavaScript
Runtime: 0.1ms per unique class
Memory: Only processed classes cached
Best For: Development, prototypes, small-medium projects
```

**Tailwind Performance**
```
Dev CSS: 3-5MB uncompressed
Production CSS: 5-15KB (purged)
Runtime: No overhead (static CSS)
Best For: Production apps, large projects
```

### When to Use Each

**Use DuxWind when you need:**
- ✅ Zero build step workflow
- ✅ Instant prototyping
- ✅ Dynamic class generation
- ✅ Runtime configuration changes
- ✅ Working in CodePen/JSFiddle
- ✅ Teaching/learning environments
- ✅ Small to medium projects
- ✅ Browser-based tools

**Use Tailwind CSS when you need:**
- ✅ Production optimization
- ✅ IDE autocomplete support
- ✅ Large team collaboration
- ✅ Complex design systems
- ✅ Plugin ecosystem
- ✅ Advanced CSS features
- ✅ Enterprise applications
- ✅ Maximum performance

### Developer Experience

| Aspect | DuxWind | Tailwind CSS |
|--------|---------|--------------|
| **Setup Time** | < 1 minute | 5-15 minutes |
| **Learning Curve** | Minimal | Moderate |
| **Documentation** | Basic | Extensive |
| **Community** | Growing | Large |
| **Debugging** | Browser DevTools | Build tools + DevTools |
| **Hot Reload** | Instant | Build step required |
| **Config Changes** | Runtime | Requires rebuild |
| **Bundle Impact** | ~20KB JS | 5-15KB CSS (purged) |

### Migration & Compatibility

**Tailwind → DuxWind**
- Most utility classes work identically
- Replace `sm:`, `md:`, `lg:` with `m:`, `d:` (or configure breakpoints)
- Components using `@apply` need conversion to shortcuts
- Plugin-based utilities need manual implementation

**DuxWind → Tailwind**
- Standard utilities transfer directly
- Convert pipe notation: `p-4|8` → `p-4 md:p-8`
- Convert @ notation: `p-4@m` → `max-md:p-4`
- Runtime shortcuts become config components

### Conclusion

**DuxWind** excels at rapid development, prototyping, and scenarios where build tools are impractical. Its runtime generation and unique syntax features make it ideal for dynamic applications and learning environments.

**Tailwind CSS** remains the better choice for production applications requiring maximum optimization, extensive tooling support, and access to the full spectrum of modern CSS features.

Both frameworks share the utility-first philosophy but serve different use cases. DuxWind prioritizes developer velocity and simplicity, while Tailwind focuses on production optimization and comprehensive feature coverage.

## Browser Support

DuxWind works in all modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties
- MutationObserver API

## License

MIT License - feel free to use in personal and commercial projects.
