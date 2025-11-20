# DuxWind

A real-time Tailwind-like CSS generator with advanced features like pipe notation, shortcuts, and dynamic CSS injection.

## 🚀 Features

- **Pipe Notation**: `p-10|20` → responsive padding (mobile: 40px, desktop: 80px)
- **Arbitrary Values**: `w-[250px]`, `bg-[#ff6b6b]`, `h-[calc(100vh-4rem)]`
- **Shortcuts**: Define reusable component classes
- **All Pseudo-states**: `hover:`, `focus:`, `active:`, `disabled:`, `visited:`, etc.
- **CSS Grid**: Complete grid system with `grid-cols-*`, `col-span-*`
- **Animations**: `animate-spin`, `animate-pulse`, `animate-bounce`
- **Opacity**: `opacity-1` through `opacity-100`
- **Dynamic CSS**: Real-time CSS generation and injection

## 📱 Live Demo

**[View Demo on GitHub Pages →](https://dux.github.io/dux-wind/)**

## 🔧 Installation

```bash
npm install dux-wind
# or
bun install dux-wind
```

## 📖 Quick Start

```html
<script src="dux-wind-config.js"></script>
<script src="dux-wind.js"></script>

<!-- Use any utility classes -->
<div class="p-4 hover:p-8 bg-blue-500 animate-pulse">
  Hello DuxWind!
</div>

<!-- Pipe notation for responsive -->
<div class="p-10|20 m-4|8">
  Mobile: p-10 m-4, Desktop: p-20 m-8
</div>

<!-- Arbitrary values -->
<div class="w-[250px] bg-[#ff6b6b]">
  Custom dimensions and colors
</div>
```

## 🎨 Advanced Examples

### Stackable Modifiers
```html
<button class="m:hover:focus:p-4 d:active:p-8">
  Complex state combinations
</button>
```

### CSS Grid
```html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2">Span 2 columns</div>
  <div>Column 3</div>
</div>
```

### Custom Shortcuts
```javascript
DuxWindConfig.shortcuts.myButton = 'px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600';
```

## 🏗️ Development

```bash
# Clone the repo
git clone https://github.com/dux/dux-wind.git

# Install dependencies
bun install

# Start dev server
bun dev

# Run tests
bun test

# Build for production
bun run build
```

## 📚 Documentation

The demo page includes comprehensive documentation with all available utilities, examples, and configuration options.

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests.

## 📄 License

MIT © [Dux](https://github.com/dux)