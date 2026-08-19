# AgentClinic Layout Components System

## Overview

AgentClinic uses a reusable component system for consistent layouts across all pages. This document describes how the layout components work and how to use them.

## Files

- **`styles.css`** - Shared CSS styles for all components and pages
- **`layout.js`** - JavaScript component library with header, footer, and utility functions

## CSS System

### Custom Properties (Variables)

The CSS uses CSS custom properties (variables) for consistent theming:

```css
--primary-color: #667eea
--primary-dark: #764ba2
--secondary-color: #3b82f6
--success-color: #10b981
--danger-color: #ef4444
--warning-color: #f59e0b
```

### Component Styles

#### Header Component (`.app-header`)
- Sticky navigation bar at top
- Contains branding and navigation links
- Responsive on mobile devices
- Supports authenticated and unauthenticated states

#### Main Content (`.app-main`)
- Centered container with max-width: 1280px
- Minimum height to push footer to bottom
- Consistent padding and spacing

#### Footer Component (`.app-footer`)
- Multi-column footer layout
- Links to home, account, resources, and support
- Copyright notice
- Responsive grid

### Component Classes

#### Cards
```html
<div class="card">
  <h3 class="card-title">Title</h3>
  <div class="card-text">Content</div>
</div>
```

#### Buttons
```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-danger">Danger</button>
```

#### Alerts
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-error">Error message</div>
<div class="alert alert-warning">Warning message</div>
```

#### Forms
```html
<div class="form-group">
  <label for="input">Label</label>
  <input type="text" id="input" />
</div>
```

#### Grids
```html
<div class="grid grid-2">
  <!-- 2-column grid, responsive -->
</div>

<div class="grid grid-3">
  <!-- 3-column grid, responsive -->
</div>
```

## JavaScript Components

### `layout.js` Functions

#### `initializeLayout(options)`
Main initialization function that sets up header, footer, and authentication state.

**Options:**
```javascript
{
  isAuthenticated: false,  // boolean
  userName: '',           // string
  page: '',              // string (for active nav highlighting)
  mainContent: ''        // string (HTML content)
}
```

**Usage:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initializeLayout({ 
    page: 'home',
    isAuthenticated: false 
  });
});
```

#### `createHeader(options)`
Creates the header element independently.

#### `createFooter()`
Creates the footer element independently.

#### `checkAuthStatus()`
Returns authentication state from localStorage.

**Returns:**
```javascript
{
  isAuthenticated: boolean,
  token: string,
  agentId: string,
  name: string
}
```

#### `requireAuth()`
Redirects to login if not authenticated.

#### Utility Components

**`createButton(text, className, onClick)`**
Creates a button element.

**`createCard(title, content, className)`**
Creates a card component.

**`createAlert(message, type)`**
Creates an alert (types: 'success', 'error', 'warning').

**`createFormGroup(labelText, inputType, inputId, placeholder)`**
Creates a form group with label and input.

## Usage Examples

### Basic Page Setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <script src="layout.js"></script>
  
  <main class="app-main">
    <!-- Page content here -->
  </main>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      initializeLayout({ 
        page: 'pagename',
        isAuthenticated: false 
      });
    });
  </script>
</body>
</html>
```

### Authenticated Page

```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const auth = checkAuthStatus();
    if (!auth.isAuthenticated) {
      window.location.href = 'login.html';
      return;
    }

    initializeLayout({
      isAuthenticated: true,
      userName: auth.name,
      page: 'dashboard'
    });
  });
</script>
```

### Creating Components Dynamically

```javascript
// Create a card
const card = createCard(
  'Therapy Title',
  '<p>Therapy description</p>',
  'therapy-card'
);
container.appendChild(card);

// Create a button
const button = createButton('Book Now', 'btn-primary', () => {
  console.log('Booking...');
});
container.appendChild(button);

// Create an alert
const alert = createAlert('Success!', 'success');
container.appendChild(alert);
```

## Responsive Design

All components are responsive using:
- CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(...))`
- Flexbox for alignment and spacing
- Media queries for mobile breakpoints (max-width: 768px)
- Relative units (rem, em) for scalability

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

Components include:
- Semantic HTML elements
- Proper label associations for form inputs
- ARIA attributes where needed
- Keyboard navigation support
- Color contrast compliance

## Customization

To customize colors, edit the CSS custom properties in `styles.css`:

```css
:root {
  --primary-color: #667eea;
  --primary-dark: #764ba2;
  /* ... other variables ... */
}
```

To customize spacing/sizing, edit the CSS values:

```css
--radius: 0.5rem;       /* Border radius */
--shadow-md: 0 4px...   /* Box shadows */
```

## Future Enhancements

- [ ] Dark mode support (prefers-color-scheme)
- [ ] Additional component variants
- [ ] Animation utilities
- [ ] Modal component helper
- [ ] Toast notification system
- [ ] Dropdown/menu components
- [ ] Table component with sorting
- [ ] Pagination component
