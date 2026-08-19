/**
 * AgentClinic Layout Components
 * Provides reusable header, main, and footer components
 */

// Header Component
function createHeader(options = {}) {
  const { isAuthenticated = false, userName = '', page = '' } = options;

  const navLinks = isAuthenticated
    ? `
      <a href="dashboard.html" ${page === 'dashboard' ? 'class="active"' : ''}>Dashboard</a>
      <span class="text-gray-600">${userName}</span>
      <button id="logoutBtn" class="btn-danger">Sign Out</button>
    `
    : `
      <a href="index.html" ${page === 'home' ? 'class="active"' : ''}>Home</a>
      <a href="login.html" ${page === 'login' ? 'class="active"' : ''}>Sign In</a>
      <a href="register.html" ${page === 'register' ? 'class="active"' : ''} class="btn-secondary">Register</a>
    `;

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="header-content">
      <a href="index.html" class="header-brand">AgentClinic</a>
      <nav class="header-nav">
        ${navLinks}
      </nav>
    </div>
  `;

  return header;
}

// Main Content Wrapper
function createMain(content = '') {
  const main = document.createElement('main');
  main.className = 'app-main';
  if (content) {
    main.innerHTML = content;
  }
  return main;
}

// Footer Component
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-section">
        <h3>Product</h3>
        <a href="index.html">Home</a>
        <a href="index.html#therapies">Therapies</a>
        <a href="index.html#about">About</a>
      </div>
      <div class="footer-section">
        <h3>Account</h3>
        <a href="login.html">Sign In</a>
        <a href="register.html">Register</a>
        <a href="dashboard.html">Dashboard</a>
      </div>
      <div class="footer-section">
        <h3>Resources</h3>
        <a href="index.html#about">How It Works</a>
        <a href="API_DOCS.md" target="_blank">API Docs</a>
        <a href="README.md" target="_blank">Guide</a>
      </div>
      <div class="footer-section">
        <h3>Support</h3>
        <p>Email: support@agentclinic.local</p>
        <p>Status: <span style="color: #10b981;">Operational</span></p>
      </div>
    </div>
    <div class="footer-copyright">
      <p>&copy; 2026 AgentClinic. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms</a></p>
    </div>
  `;

  return footer;
}

// Layout wrapper function - combines all components
function initializeLayout(options = {}) {
  const {
    isAuthenticated = false,
    userName = '',
    page = '',
    mainContent = ''
  } = options;

  // Create and insert header
  const header = createHeader({ isAuthenticated, userName, page });
  document.body.insertBefore(header, document.body.firstChild);

  // Find or create main element
  let main = document.querySelector('main');
  if (!main) {
    main = createMain(mainContent);
    // Insert after header
    const headerElement = document.querySelector('.app-header');
    if (headerElement) {
      headerElement.insertAdjacentElement('afterend', main);
    } else {
      document.body.appendChild(main);
    }
  }

  // Create and append footer
  const footer = createFooter();
  document.body.appendChild(footer);

  // Setup logout if authenticated
  if (isAuthenticated) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('agentId');
        localStorage.removeItem('name');
        window.location.href = 'index.html';
      });
    }
  }
}

// Check authentication status and return user info
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const agentId = localStorage.getItem('agentId');
  const name = localStorage.getItem('name');

  return {
    isAuthenticated: !!token,
    token,
    agentId,
    name
  };
}

// Redirect to login if not authenticated
function requireAuth() {
  const { isAuthenticated } = checkAuthStatus();
  if (!isAuthenticated) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Create a button element
function createButton(text, className = '', onClick = null) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className || 'btn-primary';
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  return button;
}

// Create a card element
function createCard(title, content, className = '') {
  const card = document.createElement('div');
  card.className = `card ${className}`;
  card.innerHTML = `
    <h3 class="card-title">${title}</h3>
    <div class="card-text">${content}</div>
  `;
  return card;
}

// Create an alert element
function createAlert(message, type = 'error') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  return alert;
}

// Create a form group
function createFormGroup(labelText, inputType = 'text', inputId = '', placeholder = '') {
  const group = document.createElement('div');
  group.className = 'form-group';

  if (labelText) {
    const label = document.createElement('label');
    label.setAttribute('for', inputId);
    label.textContent = labelText;
    group.appendChild(label);
  }

  const input = document.createElement('input');
  input.type = inputType;
  input.id = inputId;
  input.placeholder = placeholder;
  if (inputType === 'password') {
    input.required = true;
  }
  group.appendChild(input);

  return group;
}