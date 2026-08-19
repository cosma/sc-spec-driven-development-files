/**
 * Footer Component
 * Reusable multi-column footer with navigation links and copyright
 */

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
