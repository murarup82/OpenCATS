import { mount } from './mount';
import { decodeBootstrapFromElement } from './lib/bootstrap';

const root = document.getElementById('root');

if (root) {
  try {
    const bootstrap = decodeBootstrapFromElement(root);
    mount(root, bootstrap);
  } catch (error) {
    root.innerHTML =
      '<div class="modern-state modern-state--error">' +
      '<p>Unable to initialize modern UI bootstrap payload.</p>' +
      '<a class="modern-btn modern-btn--secondary" href="index.php?ui=legacy">Open Legacy UI</a>' +
      '</div>';
  }
}
