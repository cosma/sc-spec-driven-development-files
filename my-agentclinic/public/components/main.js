/**
 * Main Component
 * Reusable main content wrapper for page body content
 */

function createMain(content = '') {
  const main = document.createElement('main');
  main.className = 'app-main';
  if (content) {
    main.innerHTML = content;
  }
  return main;
}
