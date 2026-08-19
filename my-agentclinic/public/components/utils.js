/**
 * Component Utilities
 * Helper functions for creating UI components and managing state
 */

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
