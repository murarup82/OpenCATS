import { mount } from './mount';
import { decodeBootstrapFromElement } from './lib/bootstrap';

const root = document.getElementById('root');

if (root) {
  const bootstrap = decodeBootstrapFromElement(root);
  mount(root, bootstrap);
}

