// DuxWind Configuration
window.DuxWindConfig = {
  // Breakpoint prefixes and their media queries
  breakpoints: {
    'm': '(max-width: 767px)',     // mobile (includes tablet)
    'd': '(min-width: 768px)'      // desktop
  },
  
  // Pixel multiplier (1 unit = 4px, like Tailwind)
  pixelMultiplier: 4,
  
  // Property map - maps class prefixes to CSS properties
  properties: {
    // Spacing - Padding
    'p': 'padding',
    'pt': 'padding-top',
    'pr': 'padding-right',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'px': ['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'ps': 'padding-inline-start',
    'pe': 'padding-inline-end',
    
    // Spacing - Margin
    'm': 'margin',
    'mt': 'margin-top',
    'mr': 'margin-right',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'ms': 'margin-inline-start',
    'me': 'margin-inline-end',
    
    // Sizing
    'w': 'width',
    'h': 'height',
    'min-w': 'min-width',
    'min-h': 'min-height',
    'max-w': 'max-width',
    'max-h': 'max-height',
    'size': ['width', 'height'],
    
    // Typography
    'text': 'font-size',
    'leading': 'line-height',
    'tracking': 'letter-spacing',
    'indent': 'text-indent',
    
    
    // Flexbox & Grid
    'gap': 'gap',
    'gap-x': 'column-gap',
    'gap-y': 'row-gap',
    'space-x': 'margin-left',
    'space-y': 'margin-top',
    
    // Layout
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'inset': ['top', 'right', 'bottom', 'left'],
    'inset-x': ['left', 'right'],
    'inset-y': ['top', 'bottom'],
    'start': 'inset-inline-start',
    'end': 'inset-inline-end',
    
    // Borders
    'border': 'border-width',
    'border-t': 'border-top-width',
    'border-r': 'border-right-width',
    'border-b': 'border-bottom-width',
    'border-l': 'border-left-width',
    'border-x': ['border-left-width', 'border-right-width'],
    'border-y': ['border-top-width', 'border-bottom-width'],
    'border-s': 'border-inline-start-width',
    'border-e': 'border-inline-end-width',
    
    // Border Radius
    'rounded': 'border-radius',
    'rounded-t': ['border-top-left-radius', 'border-top-right-radius'],
    'rounded-r': ['border-top-right-radius', 'border-bottom-right-radius'],
    'rounded-b': ['border-bottom-right-radius', 'border-bottom-left-radius'],
    'rounded-l': ['border-top-left-radius', 'border-bottom-left-radius'],
    'rounded-tl': 'border-top-left-radius',
    'rounded-tr': 'border-top-right-radius',
    'rounded-br': 'border-bottom-right-radius',
    'rounded-bl': 'border-bottom-left-radius',
    'rounded-s': ['border-start-start-radius', 'border-start-end-radius'],
    'rounded-e': ['border-end-start-radius', 'border-end-end-radius'],
    'rounded-ss': 'border-start-start-radius',
    'rounded-se': 'border-start-end-radius',
    'rounded-ee': 'border-end-end-radius',
    'rounded-es': 'border-end-start-radius',
    
    // Effects
    'ring': 'box-shadow',
    'ring-offset': 'box-shadow',
    'shadow': 'box-shadow',
    'opacity': 'opacity',
    'blur': 'filter',
    'brightness': 'filter',
    'contrast': 'filter',
    'grayscale': 'filter',
    'hue-rotate': 'filter',
    'invert': 'filter',
    'saturate': 'filter',
    'sepia': 'filter',
    'backdrop-blur': 'backdrop-filter',
    'backdrop-brightness': 'backdrop-filter',
    'backdrop-contrast': 'backdrop-filter',
    'backdrop-grayscale': 'backdrop-filter',
    'backdrop-hue-rotate': 'backdrop-filter',
    'backdrop-invert': 'backdrop-filter',
    'backdrop-opacity': 'backdrop-filter',
    'backdrop-saturate': 'backdrop-filter',
    'backdrop-sepia': 'backdrop-filter',
    
    // Transform
    'scale': 'transform',
    'scale-x': 'transform',
    'scale-y': 'transform',
    'rotate': 'transform',
    'translate-x': 'transform',
    'translate-y': 'transform',
    'skew-x': 'transform',
    'skew-y': 'transform',
    
    // Transition & Animation
    'duration': 'transition-duration',
    'delay': 'transition-delay',
    
    // CSS Grid
    'grid-cols': 'grid-template-columns',
    'grid-rows': 'grid-template-rows',
    'col': 'grid-column',
    'col-span': 'grid-column',
    'col-start': 'grid-column-start',
    'col-end': 'grid-column-end',
    'row': 'grid-row',
    'row-span': 'grid-row',
    'row-start': 'grid-row-start',
    'row-end': 'grid-row-end',
    'gap': 'gap',
    'gap-x': 'column-gap',
    'gap-y': 'row-gap',
    
    // Animation & Transition
    'animate': 'animation',
    'duration': 'transition-duration',
    'delay': 'transition-delay',
    'ease': 'transition-timing-function',
    
    // Opacity
    'opacity': 'opacity',
    
    // Others
    'z': 'z-index',
    'order': 'order',
    'scroll-m': 'scroll-margin',
    'scroll-mt': 'scroll-margin-top',
    'scroll-mr': 'scroll-margin-right',
    'scroll-mb': 'scroll-margin-bottom',
    'scroll-ml': 'scroll-margin-left',
    'scroll-mx': ['scroll-margin-left', 'scroll-margin-right'],
    'scroll-my': ['scroll-margin-top', 'scroll-margin-bottom'],
    'scroll-p': 'scroll-padding',
    'scroll-pt': 'scroll-padding-top',
    'scroll-pr': 'scroll-padding-right',
    'scroll-pb': 'scroll-padding-bottom',
    'scroll-pl': 'scroll-padding-left',
    'scroll-px': ['scroll-padding-left', 'scroll-padding-right'],
    'scroll-py': ['scroll-padding-top', 'scroll-padding-bottom']
  },
  
  // Keyword classes that don't follow the property-value pattern
  keywords: {
    // Display
    'block': 'display: block',
    'inline-block': 'display: inline-block',
    'inline': 'display: inline',
    'flex': 'display: flex',
    'inline-flex': 'display: inline-flex',
    'grid': 'display: grid',
    'inline-grid': 'display: inline-grid',
    'hidden': 'display: none',
    'table': 'display: table',
    'table-cell': 'display: table-cell',
    'table-row': 'display: table-row',
    
    // Position
    'static': 'position: static',
    'fixed': 'position: fixed',
    'absolute': 'position: absolute',
    'relative': 'position: relative',
    'sticky': 'position: sticky',
    
    // Visibility
    'visible': 'visibility: visible',
    'invisible': 'visibility: hidden',
    
    // Flex direction
    'flex-row': 'flex-direction: row',
    'flex-row-reverse': 'flex-direction: row-reverse',
    'flex-col': 'flex-direction: column',
    'flex-col-reverse': 'flex-direction: column-reverse',
    
    // Flex wrap
    'flex-wrap': 'flex-wrap: wrap',
    'flex-wrap-reverse': 'flex-wrap: wrap-reverse',
    'flex-nowrap': 'flex-wrap: nowrap',
    
    // Justify content
    'justify-start': 'justify-content: flex-start',
    'justify-end': 'justify-content: flex-end',
    'justify-center': 'justify-content: center',
    'justify-between': 'justify-content: space-between',
    'justify-around': 'justify-content: space-around',
    'justify-evenly': 'justify-content: space-evenly',
    
    // Align items
    'items-start': 'align-items: flex-start',
    'items-end': 'align-items: flex-end',
    'items-center': 'align-items: center',
    'items-baseline': 'align-items: baseline',
    'items-stretch': 'align-items: stretch',
    
    // Align self
    'self-auto': 'align-self: auto',
    'self-start': 'align-self: flex-start',
    'self-end': 'align-self: flex-end',
    'self-center': 'align-self: center',
    'self-stretch': 'align-self: stretch',
    'self-baseline': 'align-self: baseline',
    
    // Overflow
    'overflow-auto': 'overflow: auto',
    'overflow-hidden': 'overflow: hidden',
    'overflow-visible': 'overflow: visible',
    'overflow-scroll': 'overflow: scroll',
    'overflow-x-auto': 'overflow-x: auto',
    'overflow-y-auto': 'overflow-y: auto',
    
    // Text alignment
    'text-left': 'text-align: left',
    'text-center': 'text-align: center',
    'text-right': 'text-align: right',
    'text-justify': 'text-align: justify',
    
    // Font weight
    'font-thin': 'font-weight: 100',
    'font-extralight': 'font-weight: 200',
    'font-light': 'font-weight: 300',
    'font-normal': 'font-weight: 400',
    'font-medium': 'font-weight: 500',
    'font-semibold': 'font-weight: 600',
    'font-bold': 'font-weight: 700',
    'font-extrabold': 'font-weight: 800',
    'font-black': 'font-weight: 900',
    
    // Text decoration
    'underline': 'text-decoration: underline',
    'line-through': 'text-decoration: line-through',
    'no-underline': 'text-decoration: none',
    
    // Text transform
    'uppercase': 'text-transform: uppercase',
    'lowercase': 'text-transform: lowercase',
    'capitalize': 'text-transform: capitalize',
    'normal-case': 'text-transform: none',
    
    // Pointer events
    'pointer-events-none': 'pointer-events: none',
    'pointer-events-auto': 'pointer-events: auto',
    
    // Cursor
    'cursor-auto': 'cursor: auto',
    'cursor-default': 'cursor: default',
    'cursor-pointer': 'cursor: pointer',
    'cursor-wait': 'cursor: wait',
    'cursor-text': 'cursor: text',
    'cursor-move': 'cursor: move',
    'cursor-not-allowed': 'cursor: not-allowed',
    
    // Select
    'select-none': 'user-select: none',
    'select-text': 'user-select: text',
    'select-all': 'user-select: all',
    'select-auto': 'user-select: auto',
    
    // Background colors
    'bg-blue-100': 'background-color: #dbeafe',
    'bg-blue-500': 'background-color: #3b82f6',
    'bg-blue-600': 'background-color: #2563eb',
    'bg-blue-700': 'background-color: #1d4ed8',
    'bg-blue-800': 'background-color: #1e40af',
    'bg-gray-100': 'background-color: #f3f4f6',
    'bg-red-100': 'background-color: #fee2e2',
    'bg-green-500': 'background-color: #10b981',
    'bg-yellow-500': 'background-color: #f59e0b',
    'bg-purple-500': 'background-color: #8b5cf6',
    'bg-white': 'background-color: #ffffff',
    
    // Text colors
    'text-white': 'color: #ffffff',
    'text-black': 'color: #000000',
    
    // Border colors
    'border': 'border-width: 1px; border-style: solid; border-color: #d1d5db',
    'border-blue-500': 'border-color: #3b82f6',
    
    // Ring utilities
    'ring-2': 'box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5)',
    
    // CSS Grid values
    'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr))',
    'grid-cols-2': 'grid-template-columns: repeat(2, minmax(0, 1fr))',
    'grid-cols-3': 'grid-template-columns: repeat(3, minmax(0, 1fr))',
    'grid-cols-4': 'grid-template-columns: repeat(4, minmax(0, 1fr))',
    'grid-cols-6': 'grid-template-columns: repeat(6, minmax(0, 1fr))',
    'grid-cols-12': 'grid-template-columns: repeat(12, minmax(0, 1fr))',
    'grid-rows-1': 'grid-template-rows: repeat(1, minmax(0, 1fr))',
    'grid-rows-2': 'grid-template-rows: repeat(2, minmax(0, 1fr))',
    'grid-rows-3': 'grid-template-rows: repeat(3, minmax(0, 1fr))',
    'col-span-1': 'grid-column: span 1 / span 1',
    'col-span-2': 'grid-column: span 2 / span 2',
    'col-span-3': 'grid-column: span 3 / span 3',
    'col-span-4': 'grid-column: span 4 / span 4',
    'col-span-6': 'grid-column: span 6 / span 6',
    'col-span-full': 'grid-column: 1 / -1',
    'row-span-1': 'grid-row: span 1 / span 1',
    'row-span-2': 'grid-row: span 2 / span 2',
    'row-span-3': 'grid-row: span 3 / span 3',
    'row-span-full': 'grid-row: 1 / -1',
    
    // Animations
    'animate-none': 'animation: none',
    'animate-spin': 'animation: spin 1s linear infinite',
    'animate-ping': 'animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    'animate-pulse': 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'animate-bounce': 'animation: bounce 1s infinite',
    
    // Transitions
    'transition': 'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
    'transition-none': 'transition-property: none',
    'transition-all': 'transition-property: all',
    'transition-colors': 'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke',
    'transition-opacity': 'transition-property: opacity',
    'transition-shadow': 'transition-property: box-shadow',
    'transition-transform': 'transition-property: transform',
    
    // Duration
    'duration-75': 'transition-duration: 75ms',
    'duration-100': 'transition-duration: 100ms',
    'duration-150': 'transition-duration: 150ms',
    'duration-200': 'transition-duration: 200ms',
    'duration-300': 'transition-duration: 300ms',
    'duration-500': 'transition-duration: 500ms',
    'duration-700': 'transition-duration: 700ms',
    'duration-1000': 'transition-duration: 1000ms',
    
    // Easing
    'ease-linear': 'transition-timing-function: linear',
    'ease-in': 'transition-timing-function: cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'transition-timing-function: cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Custom
    'box': 'border: 2px solid #aaa'
  },
  
  // Shortcut classes that expand to multiple classes
  shortcuts: {
    'btn': 'px-4 py-2 rounded cursor-pointer',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'card': 'box p-6 rounded bg-white',
    'center': 'flex items-center justify-center',
    'full-center': 'w-full h-full center'
  }
};

// Function to add custom properties
window.DuxWindConfig.addProperty = function(prefix, cssProperty) {
  this.properties[prefix] = cssProperty;
};

// Example of adding custom properties:
// DuxWindConfig.addProperty('fs', 'font-size');
// DuxWindConfig.addProperty('lh', 'line-height');