# Responsive Design Documentation

## Overview

AgentClinic implements a **mobile-first responsive design** approach to ensure optimal user experience across all devices and screen sizes, from small mobile phones to large desktop monitors.

## Design Principles

1. **Mobile-First**: Start with mobile design, progressively enhance for larger screens
2. **Touch-Friendly**: All interactive elements are at least 44x44 pixels for easy touch interaction
3. **Flexible Layouts**: Use CSS Grid and Flexbox for fluid, adaptive layouts
4. **Scalable Typography**: Font sizes adjust based on viewport width
5. **Performance**: Minimal dependencies, fast load times on all devices
6. **Accessibility**: Semantic HTML, proper contrast ratios, readable fonts

## Breakpoints

AgentClinic uses the following CSS media query breakpoints:

### Mobile
- **Target**: 320px - 767px
- **Devices**: Phones (portrait and landscape), small tablets
- **Key Features**:
  - Single-column layouts
  - Full-width containers with padding
  - Stacked navigation and forms
  - Larger touch targets (44px minimum)
  - Simplified modals

**CSS Rule**: `@media (max-width: 767px)`

### Tablet
- **Target**: 768px - 1023px
- **Devices**: Tablets (portrait), large phones (landscape)
- **Key Features**:
  - Two-column layouts where appropriate
  - Wider spacing and padding
  - Optimized navigation
  - Flexible grids (2-3 columns)

**CSS Rule**: `@media (min-width: 768px) and (max-width: 1023px)`

### Desktop
- **Target**: 1024px and above
- **Devices**: Desktop monitors, large tablets (landscape)
- **Key Features**:
  - Multi-column layouts
  - Full feature visibility
  - Optimal spacing and typography
  - Maximum content width: 1280px

**CSS Rule**: `@media (min-width: 1024px)`

### Large Desktop
- **Target**: 1440px and above
- **Features**: Enhanced layouts, larger content areas

**CSS Rule**: `@media (min-width: 1440px)`

### Small Mobile
- **Target**: 320px - 480px
- **Devices**: Very small phones
- **Optimizations**: Aggressive space efficiency, simplified UI

**CSS Rule**: `@media (max-width: 480px)`

## Component Responsive Behavior

### Header
- **Desktop (1024px+)**: Horizontal flex layout, branded logo + navigation
- **Tablet (768px-1023px)**: Centered flex layout with wrapping navigation
- **Mobile (< 768px)**: Stacked layout, smaller logo (1.25rem), vertical nav
- **Small Mobile (< 480px)**: Minimal padding, single column nav buttons

### Navigation
- **Desktop**: Horizontal flex, grouped buttons
- **Mobile**: Vertical stack, full-width buttons for touch (44px height)
- **Small Mobile**: Buttons stack, max 44px width for keyboard access

### Footer
- **Desktop (1024px+)**: 3-column grid layout
- **Tablet (768px-1023px)**: 2-column grid
- **Mobile (< 768px)**: Single column, stacked sections
- **All**: Auto-fit grid with minimum 250px column width

### Cards & Content
- **Desktop**: Multiple columns (auto-fit with 300px minimum)
- **Tablet**: 2-column grid
- **Mobile**: Single column, full-width
- **All**: Padding adjusted: 2rem (desktop) → 1rem (mobile)

### Forms
- **Desktop**: Inline field layouts, side-by-side when appropriate
- **Mobile**: Full-width stacked fields
- **All**: Labels above inputs, minimum 44px input height

### Modals
- **Desktop**: 90% width, max 500px, centered
- **Mobile**: 95% width, full-height scroll if needed
- **Small Mobile (< 480px)**: Full-width, padding, reversed button order (Cancel first)

### Tabs
- **Desktop**: Horizontal tabs with full padding
- **Tablet**: Horizontal tabs with reduced padding
- **Mobile**: Tabs wrap and become smaller
- **Small Mobile (< 480px)**: Switch to vertical stack with left border indicator

### Grids
- **grid-2**: 300px min width (desktop) → 250px (tablet) → 1 column (mobile)
- **grid-3**: 250px min width (desktop) → 2 columns (tablet) → 1 column (mobile)
- **therapy-grid**: 300px min (desktop) → 250px (mobile)

## Typography Scaling

Font sizes scale based on viewport:

### Headings
```
h1: 2.25rem (desktop) → 1.875rem (mobile)
h2: 1.875rem (desktop) → 1.5rem (mobile)
h3: 1.5rem (desktop) → 1.25rem (mobile)
h4: 1.125rem (desktop) → 1rem (mobile)
```

### Body Text
- **Base**: Remains 1rem across all sizes
- **Small**: 0.875rem (labels, secondary text)
- **Extra Small**: 0.8rem (small mobile only)

## Touch Target Sizing

All interactive elements follow WCAG 2.5.5 guidelines:

- **Minimum size**: 44x44 CSS pixels
- **Applied to**:
  - Buttons (all states)
  - Form inputs
  - Tab buttons
  - Filter buttons
  - Navigation links
  - Clickable cards

## Spacing & Padding

Responsive padding ensures readability and usability:

```
Desktop:  2rem horizontal padding
Tablet:   1.5rem horizontal padding
Mobile:   1rem horizontal padding
Small Mobile: 0.75rem horizontal padding
```

## Images & Media

- **Responsive**: Use `max-width: 100%` on all images
- **Containers**: Never allow horizontal overflow
- **Picture Element**: Used for art direction where needed
- **SVG**: Scales perfectly, no resolution issues

## Viewport Meta Tag

All pages include the critical viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

This ensures:
- Device width is respected
- No automatic zoom out
- Proper 1:1 CSS pixel ratio

## Testing Devices

Responsive design tested on:

### Mobile Phones
- iPhone 12/13/14 (390px - 430px wide)
- iPhone SE (375px)
- Samsung Galaxy S21 (360px)
- Google Pixel 6 (412px)
- Landscape modes

### Tablets
- iPad (768px)
- iPad Pro (1024px - 1366px)
- Samsung Galaxy Tab (600px - 1024px)

### Desktops
- 1024px minimum
- 1280px typical
- 1440px+ large screens

## Performance Considerations

Responsive design optimizations:

1. **Mobile-first CSS**: Smaller base styles, add features with media queries
2. **No overflow**: Content never requires horizontal scroll
3. **Flexible grids**: Use CSS Grid/Flexbox, no pixel-perfect layouts
4. **Scalable units**: Relative units (rem, %) for better scalability
5. **Lazy loading**: Images load on demand (future enhancement)
6. **Minimal assets**: Single CSS file, no duplicate resources

## Accessibility Features

Beyond responsive design:

- **Semantic HTML**: Proper heading hierarchy, nav elements
- **Color Contrast**: WCAG AA standard (4.5:1 for text)
- **Focus States**: Visible keyboard navigation
- **Form Labels**: Associated with inputs (not placeholder-only)
- **ARIA Attributes**: Used for dynamic content
- **Readable Fonts**: System fonts, 1.6 line-height

## Future Enhancements

Responsive design roadmap:

1. **Print Styles**: Optimize for printing (headers/footers hidden)
2. **Dark Mode**: Support prefers-color-scheme
3. **High Density**: Optimize for Retina/2x displays
4. **Landscape Optimizations**: Better UX in landscape mode
5. **Orientation Lock**: Detect and optimize for orientation changes
6. **Picture Element**: Art direction for different device contexts

## Browser Support

Responsive design supports:

- **Mobile Browsers**:
  - iOS Safari 12+
  - Chrome Android 60+
  - Firefox Mobile 55+
  - Samsung Internet 8+

- **Desktop Browsers**:
  - Chrome 60+
  - Firefox 55+
  - Safari 11+
  - Edge 79+

## Testing Responsive Design

### Browser Developer Tools
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test various device presets
4. Test custom viewport sizes
5. Test orientation changes
6. Test zoom levels
```

### Mobile Device Testing
```
1. Install on actual devices
2. Test touch interactions
3. Test form submission
4. Test modal interactions
5. Test navigation flows
6. Test in both orientations
```

### Automated Testing
Future implementation with:
- Percy visual testing
- LightHouse CI for performance
- Axe-core for accessibility

## CSS Variables for Responsive Design

Key CSS variables used:

```css
--primary-color: #667eea
--gray-50: #f9fafb          /* Light backgrounds *)
--radius: 0.5rem            /* Consistent border-radius *)
--shadow-md: 0 4px 6px ...  /* Consistent shadows *)
```

All responsive styles use these variables for consistency and maintainability.

## Common Responsive Patterns

### 1. Stack on Mobile, Grid on Desktop
```css
.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
```

### 2. Hide/Show Elements
```css
.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
```

### 3. Touch Target Sizing
```css
button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}
```

### 4. Responsive Typography
```css
h1 {
  font-size: 2.25rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.875rem;
  }
}
```

## Debugging Tips

1. **Chrome DevTools**: Use device emulation
2. **Responsive Viewer**: Test multiple sizes simultaneously
3. **Screenshot Testing**: Capture at each breakpoint
4. **Real Device Testing**: Always test on actual devices
5. **Network Throttling**: Test slow connections on mobile

## Resources

- [MDN Web Docs: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Can I Use](https://caniuse.com/) - Browser compatibility
