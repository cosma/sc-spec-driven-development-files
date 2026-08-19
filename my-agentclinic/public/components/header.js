/**
 * Header Component
 * Reusable navigation header with branding and authentication-aware nav
 */

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
