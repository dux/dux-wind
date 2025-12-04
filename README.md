# PostWind

Real-time Tailwind-like CSS generator with shortcuts, responsive utilities, and modern features.

## Why PostWind?

PostWind was created to bridge the gap between Tailwind CSS's powerful utility-first philosophy and the need for rapid development.

**Key Motivations:**
- **Zero-friction setup** - Drop in a single script tag and start building
- **No build step required** - For 1ms - 5ms (miliseconds) penalty per page render, skip build step and build css in real-time
- **Enhanced syntax flexibility** - Support for both `p-12px` and `p-[12px]` notation for natural value input
- **Intuitive responsive syntax** - Use built-in `m:`/`t:`/`d:` (plus `mobile:`/`tablet:`/`desktop:`) prefixes, property-first `@m`, or compact pipe notation (`p-4|8`)
- **Built-in shortcuts system** - Create reusable component classes without additional tooling
- **Complete solution** - CSS reset, utilities, visibility, container queries and animations included out of the box

PostWind maintains full compatibility with Tailwind's core concepts while adding conveniences that make utility-first CSS more accessible to developers at every level—meaning existing Tailwind knowledge (and almost every class name) works out of the box.

### PostWind-only superpowers (vs. Tailwind)

- **Relative offset helpers (`top-4`, `right-6`, arbitrary offsets)** automatically inject `position: relative`, so badges, pills, and labels can “nudge” themselves without wrapping every element in a relative parent.
- **Inline container queries (`min-480:flex-row`, `max-640:grid-cols-1`)** give every component a built-in ResizeObserver that swaps layouts based on the element’s own width—no @container support or custom JS needed.
- **`scroll-x:<seconds>` marquee system** clones track children, injects bespoke keyframes, and loops content at any duration, providing hands-free ticker/feature-parade UI.
- **`visible:` viewport pseudo-class** ties scroll-triggered animations to utilities you already know (opacity, translate, scale, rotate) with auto cleanup once the element leaves the DOM.
- **JavaScript-defined shortcuts (`PostWind.define`)** elevate Tailwind-style component recipes into first-class citizens with zero build tooling—mix responsive, pipe notation, and pseudo variants inside reusable tokens like `btn`, `badge`, or `chip`.

### Compatible + better than stock Tailwind

- **Drop-in parity:** Core utilities, pseudo-classes, and responsive prefixes match Tailwind one-to-one—no mental remapping.
- **Precise container queries:** `min-` / `max-` inline rules let each component respond to its own width, powered by per-node ResizeObservers and automatic cleanup.
- **Visibility-powered motion:** The built-in `visible:` pseudo-class toggles transforms, opacity, or anything else as elements enter the viewport—no custom JS required.
- **Packed responsive rules:** Pipe (`p-10|20`) and property-first (`text-lg@m`) syntaxes compress three breakpoints into one class token for rapid authoring.
- **Shortcut composer:** Declare component primitives such as `btn`, `badge`, or `chip` directly in JavaScript using classes and register then as regular css definitions (faster and more readable then tailwind class sloop).

## Features

- **🚀 Real-time CSS generation** - Styles are generated as you use classes
- **🎯 100% Tailwind compatibility** - Drop-in replacement for the utility, pseudo, and responsive syntax you already know
- **📱 Responsive utilities** - Multiple breakpoint syntaxes
- **⚡ Custom shortcuts & overrides** - Use `PostWind.define()` to register shortcuts or keyword utilities inline
- **🎨 Arbitrary values** - Use any CSS value with bracket notation
- **🔧 Configurable** - Customize properties, breakpoints, and keywords
- **🐛 Debug mode** - Track original classes during development
- **🌊 Pipe notation** - Compact responsive syntax (`p-10|20` or `p-10:20`) that maps to your breakpoint order
- **@ Alternative syntax** - Property-first breakpoint notation (`text-lg@m text-xl@d` insted of `m:text-lg`)
- **👁️ Scroll animations** - Built-in `visible:` pseudo-class for viewport-triggered effects without extra JS
- **‼️ Priority modifiers** - Append `!` for `!important` or `!!` for scoped `html body` specificity boosts on any utility
- **📦 Inline container queries** - `min-`/`max-` classes toggle utilities by element width (per-node ResizeObserver for precise control)

## Quick Start

**Minimal Setup (Just Works!):**
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/postwind@latest/dist/lib.min.js"></script>
    <script>
        // Default configuration auto-loads - just initialize!
        PostWind.init();
    </script>
</head>
<body>
    <div class="p-4 bg-blue-500 text-white rounded">
        Hello PostWind! 100+ utilities ready to use.
    </div>
</body>
</html>
```

**With Custom Configuration:**
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/postwind@latest/dist/lib.min.js"></script>
    <script>
        // PostWind ships with `m`/`t`/`d` (and mobile/tablet/desktop) breakpoints preloaded.
        // Override them via init if you need a different map.
        PostWind.init({
            debug: true,
            breakpoints: {
                'm': '(max-width: 768px)',    // Mobile
                't': '(max-width: 1024px)',   // Tablet
                'd': '(min-width: 1025px)'    // Desktop
            },

            // Optional: Define custom utilities or shortcuts right inside init
            define: {
            'text-brand': 'color: #2563eb; font-weight: 600',
            'btn': 'px-4 py-2 rounded font-medium cursor-pointer',
            'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600', // reuse defined btn
            'card': 'bg-white rounded border p-6 shadow-sm'
            },

            // Optional: Preload frequently used classes so their CSS exists before first render
            preload: `
                btn btn-primary card
                p-4 bg-blue-500 text-white rounded
            `
        });
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

> Prefer the minified bundle (`dist/lib.min.js`) in production. A readable build (`dist/lib.js`) ships alongside for debugging or embedding via module loaders.

## Configuration

### Basic Setup

**Automatic Configuration Loading:**
PostWind automatically loads a complete default configuration including:
- 100+ CSS properties (padding, margin, width, height, colors, etc.)
- 200+ keyword classes (flex, grid, rounded, shadows, animations, etc.)
- Mobile/desktop breakpoints
- All pseudo-class support (hover, focus, active, first, last, etc.)

```javascript
// ✅ Minimal setup - everything auto-loaded with CSS reset
PostWind.init();

// ✅ With options
PostWind.init({
    debug: true,        // Enable debug mode (auto-detects dev ports)
    reset: true,        // Apply CSS reset automatically (default: true)
    clearCache: true    // Clear processed classes cache (default: true)
});

// 🔧 Disable CSS reset if not wanted
PostWind.init({ reset: false });

// 🔧 Optional: Manual CSS reset
PostWind.resetCss();

// 🔄 Optional: Reset to default config (rarely needed)
PostWind.loadDefaultConfig();
```

`PostWind.init` also accepts inline helpers:

- `define`: object map, array of maps, or `[name, style]` tuples passed straight to `PostWind.define`
- `preload`: string or array of whitespace-delimited class lists processed immediately (same as calling `PostWind.preload` manually)

**What's Auto-Loaded:**
- **100+ CSS Properties:** `p-4` (padding), `m-8` (margin), `w-full` (width), `text-lg` (font-size), `bg-blue-500` (background), etc.
- **200+ Keyword Classes:** `flex`, `grid`, `rounded`, `shadow-lg`, `animate-spin`, `transition`, `cursor-pointer`, etc.
- **Responsive Breakpoints:** `m`/`t`/`d` plus friendly `mobile`/`tablet`/`desktop` aliases (override via `PostWind.init`)
- **All Pseudo-classes:** `hover:`, `focus:`, `active:`, `first:`, `last:`, `even:`, `odd:`, `disabled:`, `visible:`, etc.
- **Animations & Transitions:** `animate-spin`, `animate-pulse`, `duration-300`, `ease-in-out`
- **Layout Systems:** Flexbox, CSS Grid, positioning, spacing utilities

### Preloading Classes

Need key utilities available before the first DOM mutation? Call `PostWind.preload()` with a whitespace-delimited string (or array of strings) to expand every class and inject its CSS immediately:

```javascript
PostWind.preload(`
    btn btn-primary card
    p-4 bg-blue-500 text-white rounded hover:bg-blue-600
`);
```

- Runs entirely in JS—no elements required in the document yet
- Uses the same parser as runtime processing, so responsive prefixes, `@` notation, pipe syntax, shortcuts, and container queries all work
- Safe to invoke multiple times; already-processed classes are skipped via caching

Pair it with `PostWind.define()` to warm up custom shortcuts before they ever appear in the DOM.

Prefer to keep everything in one place? Pass the same string via `PostWind.init({ preload: '...' })` and combine with `define` to register and warm shortcuts in a single call.

### Custom Breakpoints

PostWind ships with pragmatic defaults tailored for rapid prototyping:

| Prefix | Media Query |
| ------ | ----------- |
| `m` (mobile) | `(max-width: 768px)` |
| `t` (tablet) | `(min-width: 769px) and (max-width: 1024px)` |
| `d` (desktop) | `(min-width: 1025px)` |

Override them any time during initialization:

```javascript
// Redefine breakpoints during initialization
PostWind.init({
    breakpoints: {
        'm': '(max-width: 768px)',    // Mobile
        'd': '(min-width: 769px)'     // Desktop
    }
});
```

> ℹ️ Breakpoints must be supplied via `PostWind.init({ breakpoints: { … } })`.

### Custom Utilities & Shortcuts (`PostWind.define`)

`PostWind.define(name, style)` lets you override keyword utilities or register shortcuts without mutating `PostWind.config` manually.

```javascript
// Keyword utility: pass a CSS string (needs ':' and ';')
PostWind.define('text-brand', 'color: #2563eb; font-weight: 600;');

// Keyword utility: pass an object map
PostWind.define('card-body', {
    display: 'flex',
    gap: '1.5rem',
    'align-items': 'center'
});

// Multiple entries; strings without semicolons stay shortcuts automatically
PostWind.define({
    'btn': 'px-4 py-2 rounded font-medium transition duration-200 cursor-pointer border',
    'btn-primary': 'btn bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    'container': 'max-w-[1200px] mx-auto px-4'
});
```

- **Strings containing both `:` _and_ `;`** are treated as CSS declarations (keyword utilities).
- **Strings missing `;`** are treated as space-delimited class lists (shortcuts).
- **Objects** convert each key/value pair to `property: value`.
- **Tip:** When passing CSS as a string, end each declaration with a semicolon (or pass an object map) so PostWind can detect it as CSS.

> `PostWind.shortcut()` still works, but `PostWind.define()` covers both use cases through a single helper.

## Responsive Utilities

PostWind supports multiple syntaxes for responsive design:

### Traditional Breakpoint Syntax
```html
<div class="text-16px d:text-24px">
    Base text on mobile, large on desktop (`d:` prefix)
</div>
```

### @ Notation (Alternative)
```html
<div class="text-16px@m text-24px@d">
    Same as above, property-first syntax using `@m` / `@d`
</div>
```

### Pipe Notation (Compact)
```html
<div class="text-16|24px">
    Values follow your breakpoint order (defaults: `m|t|d`)
</div>

<div class="p-4|8">
    Padding: 16px mobile, 32px desktop
</div>
```

### Importance Suffixes (`!` / `!!`)

Need to bump priority without hunting for CSS overrides? Append `!` or `!!` directly to any recognized utility:

```html
<div class="m-4!">Force margin with !important</div>
<div class="d:w-40px!!">Desktop width with extra specificity</div>
<div class="w-40px|50px!">Pipe notation + !important per breakpoint</div>
```

- `!` adds `!important` to the generated declaration(s) (even for multi-property utilities like `px-4`).
- `!!` wraps the selector with `html body` for a specificity bump without resorting to `!important`.
- Works with responsive prefixes (`m:`, `d:`), pseudo-states (`hover:`, `focus:`), shortcuts, and container queries because the suffix is preserved through every expansion.

### Inline Container Queries (`min-XXX` / `max-XXX`)

Need container-style logic without waiting for browser support? Use inline classes that observe each element's rendered width and toggle utility classes accordingly.

```html
<div class="flex gap-4 max-360:flex-col min-361:flex-row">
    <div class="card flex-1">Primary content</div>
    <div class="card flex-1">Secondary content</div>
</div>
```

**Key details:**
- Syntax follows `max-<pixels>:<class>` or `min-<pixels>:<class>` (px units only; omit `-w-`).
- The payload must be a single class token (e.g., `flex-col`, `gap-4`, `d:text-lg`).
- PostWind attaches a `ResizeObserver` per element, adds the payload class while the condition is true, and removes it once the condition flips or the node leaves the DOM.
- If `ResizeObserver` is unavailable, PostWind logs a warning and simply ignores the inline container classes (your layout still renders normally).

This approach gives you container-query ergonomics directly in markup, perfect for cards, dashboard widgets, or any component that rearranges itself based on its own width rather than the viewport.

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

#### Relative offset helpers (`top-*`, `bottom-*`, `left-*`, `right-*`)

Directional offset utilities now auto-inject `position: relative` so you only write the offset you care about (and they inherit responsive prefixes or pipe notation like any other class).

```html
<div class="flex flex-wrap gap-4 items-start">
    <span class="px-3 py-1 rounded bg-indigo-100 text-indigo-800 top-3">
        top-3 → position: relative; top: 12px;
    </span>
    <span class="px-3 py-1 rounded bg-rose-100 text-rose-800 right-4">
        right-4 → position: relative; right: 16px;
    </span>
    <span class="px-3 py-1 rounded bg-emerald-100 text-emerald-800 left-[10px]">
        left-[10px] → position: relative; left: 10px;
    </span>
</div>
<div class="mt-4 p-3 bg-gray-50 border rounded">
    <code class="block text-sm">
        m:bottom-2 d:top-0
        top-3px bottom-1/2 left-[2rem]
    </code>
    <p class="text-xs text-gray-600 mt-2">
        Responsive prefixes (`m:`/`d:`), fractional/pipe values, and bracket syntax all work—each generated rule includes the offset plus `position: relative`.
    </p>
</div>
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
PostWind.define({
    'btn': 'px-4 py-2 rounded font-medium transition-all duration-200 cursor-pointer border',
    'btn-primary': 'btn bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    'card': 'bg-white rounded-lg border p-6 shadow-sm'
});
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

## Scroll-Triggered Animations (visible:)

PostWind includes a powerful `visible:` pseudo-class that triggers animations when elements enter the viewport:

```html
<!-- Fade in when visible -->
<div class="visible:opacity-100 opacity-0 transition-all duration-700">
    I fade in when scrolled into view!
</div>

<!-- Slide up and fade -->
<div class="visible:translate-y-0 visible:opacity-100 translate-y-8 opacity-0 transition-all duration-700">
    I slide up smoothly when visible!
</div>

<!-- Scale and rotate -->
<div class="visible:scale-100 visible:rotate-0 scale-50 rotate-180 opacity-0 transition-all duration-1000">
    Complex transformations on scroll!
</div>

<!-- Directional slides -->
<div class="visible:translate-x-0 -translate-x-full opacity-0 transition-all duration-700">
    Slide from left
</div>
<div class="visible:translate-x-0 translate-x-full opacity-0 transition-all duration-700">
    Slide from right
</div>

<!-- Staggered animations with delays -->
<div class="grid grid-cols-3 gap-4">
    <div class="visible:opacity-100 opacity-0 transition-all duration-500 delay-100">Item 1</div>
    <div class="visible:opacity-100 opacity-0 transition-all duration-500 delay-200">Item 2</div>
    <div class="visible:opacity-100 opacity-0 transition-all duration-500 delay-300">Item 3</div>
</div>
```

### How visible: works

- **Intersection Observer**: Uses native browser API for performance
- **70% threshold**: Triggers when 70% of element is visible
- **Bidirectional**: Animations reverse when scrolling back up
- **No JavaScript needed**: Just add classes, PostWind handles the rest
- **Combines with any utility**: Works with transforms, opacity, colors, etc.

## Debug Mode

Debug mode helps track class expansions:

```javascript
// Enable debug (auto-enabled for development ports > 2000)
PostWind.init({ debug: true });
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
PostWind.config.properties = {
    'fs': 'font-size',           // fs-16 -> font-size: 64px
    'bg': 'background-color',    // bg-red -> background-color: red
    'w': 'width',               // w-10 -> width: 40px
};
```

### Keywords
Define keyword classes (or override built-ins) via `PostWind.define` or by mutating the config directly:

```javascript
// Quick helper
PostWind.define('rounded-3xl', 'border-radius: 1.5rem;');

// Batch definitions
PostWind.define({
    'flex': 'display: flex;',
    'hidden': 'display: none;',
    'text-center': 'text-align: center;'
});

// Direct config access is still available
PostWind.config.keywords['btn'] = 'px-4 py-2 rounded border';

// Tip: pass a class list (no ":") to auto-create a shortcut
PostWind.define('btn', 'px-4 py-2 rounded shadow-sm');
```

### Pixel Multiplier
Customize the default pixel multiplication:

```javascript
PostWind.config.pixelMultiplier = 4;  // p-4 = 16px (4 * 4)
```

## API Reference

### Methods

```javascript
// Core methods
PostWind.init(options)           // Initialize with options
PostWind.loadClass(className)    // Process a single class
PostWind.resetCss()             // Apply modern CSS reset
PostWind.loadDefaultConfig()    // Reset to default config (auto-loaded)
PostWind.generateDoc()          // Generate documentation HTML
PostWind.define(name, style)    // Add or override keyword utilities

// Init options
{
    debug: boolean,      // Enable debug mode (default: auto-detect)
    reset: boolean,      // Apply CSS reset automatically (default: true)
    clearCache: boolean  // Clear processed classes (default: true)
}
```

### Global Configuration

```javascript
PostWind.config = {
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
<div class="text-base m:text-lg d:text-xl">
    Base → mobile → desktop
</div>

<!-- Method 2: @ Notation -->
<div class="text-base@m text-xl@d">
    Alternative responsive syntax
</div>

<!-- Method 3: Pipe Notation (Most Compact) -->
<div class="text-base|lg p-4|8 w-full|500px">
    Values follow `m|t|d` order (or your custom map)
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
// (Example uses built-in `m`/`t`/`d` breakpoints)
PostWind.define({
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
});
```

## PostWind vs Tailwind CSS

### Philosophy & Architecture

**PostWind**
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

| Feature Category | PostWind | Tailwind CSS |
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
| **Relative offset helpers** | ✅ `top/right/bottom/left` auto-inject `position: relative` | ⚠️ Must wrap each element in `relative` manually |
| **Inline container queries** | ✅ `min-/max-` per-element rules via ResizeObserver | ⚠️ Requires new @container syntax + build tooling |
| **`scroll-x:<seconds>` marquee** | ✅ Runtime child cloning + keyframes, no CSS authoring | ❌ No built-in marquee utility |
| **`visible:` scroll animations** | ✅ Viewport-aware pseudo-class without JS | ⚠️ Needs JS + IntersectionObserver setup |
| **Shortcut composer (`PostWind.define`)** | ✅ Runtime class macros without build step | ⚠️ Requires plugins/config & rebuild |

### Unique PostWind Features

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
PostWind.config.pixelMultiplier = 5; // p-4 = 20px now

// Breakpoints must be provided during initialization
PostWind.init({
    breakpoints: {
        t: '(max-width: 1024px)'
    }
});

// Dynamic shortcut creation
PostWind.define('hero', 'text-4xl font-bold mb-8');
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
PostWind.init({ body: true });
// <body class="mobile"> or <body class="desktop">
```

**8. Scroll-Triggered Animations (visible:)**
```html
<!-- No JavaScript needed for scroll animations -->
<div class="visible:scale-100 visible:opacity-100 scale-75 opacity-0 transition-all duration-700">
  Animates when scrolled into view!
</div>

<!-- Complex reveal effects -->
<div class="visible:translate-y-0 visible:rotate-0 translate-y-8 -rotate-3 opacity-0 transition-all duration-1000">
  Slide, rotate, and fade in on scroll
</div>
```

**9. `scroll-x` Marquee System**
```html
<!-- Infinite scrolling marquee in 20 seconds -->
<div class="scroll-x:20 flex gap-4">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <!-- Automatically clones children and animates -->
</div>
```

**10. Relative Offset Helpers**
```html
<!-- Auto-injects position: relative -->
<div class="top-4 left-4">
  <!-- No need to add 'relative' class manually -->
  I'm nudged 16px from top-left!
</div>
```

**11. Inline Container Queries**
```html
<!-- Element-based responsive styles -->
<div class="min-400:flex max-400:hidden">
  <!-- Shows flex layout when THIS element is >400px wide -->
  <!-- Uses ResizeObserver automatically -->
</div>
```

## Browser Support

PostWind works in all modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties
- MutationObserver API
- IntersectionObserver API (for visible: pseudo-class)

## License

MIT License - feel free to use in personal and commercial projects.
